"""Add the workshop opening, date titles and closing to the original recap film.

Requires Pillow, ffmpeg and ffprobe. The supplied collage sequence is retained.
Usage: python render-workshop-film.py --work-dir PATH --output PATH
       [--sequence PATH] [--serif PATH] [--sans PATH] [--publish-assets]
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

from workshop_film_closing import CLOSING_DISSOLVE, CLOSING_DURATION, render_closing_clip


WEBSITE = Path(__file__).resolve().parents[1]
PUBLIC = WEBSITE / "public"
GALLERY = PUBLIC / "workshop-gallery"
SOURCE = GALLERY / "originals" / "DENUCHANGE_Naxos_2026.mp4"
FILENAME = "DENUCHANGE_Naxos_2026_titled.mp4"
SIZE = (1920, 1080)
INTRO = 12.0
DISSOLVE = 0.8
DATE_DURATION = 2.5
# Incoming collage dates in the supplied film, at the middle of each dissolve.
DATES = [(5, 0.7), (6, 18.4), (7, 89.8), (8, 137.4), (9, 185.0)]
# Reuse the prepared assets from the workshop's dark press banner, preserving
# their coloured artwork, white lettering and existing transparency.
LOGOS = ["01_nkua_190_transparent.png", "02_laguna_coast_transparent.png",
         "03_iag_transparent.png", "04_denuchange_transparent.png",
         "05_virtual_trips_transparent.png"]
WHITE = (255, 255, 255, 255)
GOLD = (224, 202, 154, 255)
# Established workshop colours from website/src/index.css.
IAG_YELLOW = (241, 193, 0, 255)
IAG_BLUE = (30, 115, 190, 255)
EASE_ALPHA = "lut=a='255*pow(val/255,2)*(3-2*val/255)'"


def render_collage_montage(sequence: Path, work_dir: Path, duration: float) -> Path:
    """Rebuild the original pace from replacement collages and retain its audio.

    Holds refer directly to source JPEGs; only the one-second dissolves require
    new images. This keeps memory use independent of the number of collages and
    avoids decoding all 38 inputs concurrently in an ffmpeg filter graph.
    """
    collages = json.loads(sequence.read_text(encoding="utf-8"))["collages"]
    if len(collages) != 38:
        raise ValueError("The landscape replacement sequence must contain the original 38 collages")
    paths = [Path(item["path"]).resolve() for item in collages]
    frame_dir = work_dir / "montage-transitions"
    frame_dir.mkdir(parents=True, exist_ok=True)
    fps = 30
    total_frames = round(duration * fps)
    transition_frames = fps
    entries = []
    cursor = 0
    previous = Image.open(paths[0]).convert("RGB")
    print(f"Preparing glass montage with {len(paths)} collages", flush=True)
    for index in range(1, len(paths)):
        # The existing sequence advances every 5.95 seconds. Keep the date
        # cards at their approved times while centring each dissolve here.
        start = round((index * 5.95 - 0.5) * fps)
        if start > cursor:
            entries.append((paths[index - 1], start - cursor))
        incoming = Image.open(paths[index]).convert("RGB")
        if previous.size != SIZE or incoming.size != SIZE:
            raise ValueError("Landscape replacement collages must be 1920 by 1080 pixels")
        for offset in range(transition_frames):
            progress = (offset + 1) / transition_frames
            opacity = progress * progress * (3 - 2 * progress)
            frame_path = frame_dir / f"transition-{index:02d}-{offset:02d}.jpg"
            Image.blend(previous, incoming, opacity).save(frame_path, quality=95, subsampling=0)
            entries.append((frame_path.resolve(), 1))
        previous.close()
        previous = incoming
        cursor = start + transition_frames
        if index % 5 == 0:
            print(f"Prepared collage transitions {index}/{len(paths) - 1}", flush=True)
    previous.close()
    if cursor < total_frames:
        entries.append((paths[-1], total_frames - cursor))
    lines = ["ffconcat version 1.0"]
    for path, frames in entries:
        escaped = path.as_posix().replace("'", "'\\''")
        lines += [f"file '{escaped}'", "option framerate 30", f"duration {frames / fps:.9f}"]
    escaped = paths[-1].as_posix().replace("'", "'\\''")
    lines += [f"file '{escaped}'", "option framerate 30"]
    concat_path = work_dir / "montage.ffconcat"
    concat_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    output = work_dir / "glass-montage.mp4"
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "warning", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat_path), "-i", str(SOURCE),
        "-map", "0:v:0", "-map", "1:a:0", "-vf", "fps=30,setsar=1,format=yuv420p",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-threads", "6",
        "-c:a", "copy", "-frames:v", str(total_frames), "-t", str(duration), "-movflags", "+faststart",
        "-progress", "pipe:1", "-nostats", str(output),
    ]
    log_path = work_dir / "montage-render.log"
    with log_path.open("w", encoding="utf-8") as log:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=log, text=True, encoding="utf-8")
        last_report = -15
        for line in process.stdout:
            if line.startswith("out_time_us="):
                value = line.strip().split("=", 1)[1]
                if value.isdigit() and int(value) / 1_000_000 >= last_report + 15:
                    last_report = int(value) / 1_000_000
                    print(f"Encoded glass montage {last_report:.0f}/{duration:.0f} seconds", flush=True)
        if process.wait() != 0:
            raise RuntimeError(log_path.read_text(encoding="utf-8")[-8000:])
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--work-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--sequence", type=Path, help="Replacement landscape collage JSON in the original 38-item order")
    parser.add_argument("--serif", type=Path, default=Path("C:/Windows/Fonts/BASKVILL.TTF"))
    parser.add_argument("--sans", type=Path, default=Path("C:/Windows/Fonts/segoeui.ttf"))
    parser.add_argument("--publish-assets", action="store_true", help="Copy into public and update the gallery manifest")
    args = parser.parse_args()
    args.work_dir.mkdir(parents=True, exist_ok=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)

    def font(size: int, serif: bool = False):
        return ImageFont.truetype(str(args.serif if serif else args.sans), size)

    def lettering(draw, position, value, face, fill=WHITE):
        # All glyphs share a baseline, so commas and dashes retain their proper
        # vertical position even when letter spacing is applied.
        draw.text((position[0], position[1] + 2), value, font=face,
                  fill=(0, 0, 0, 190), anchor="ls", stroke_width=2,
                  stroke_fill=(0, 0, 0, 140))
        draw.text(position, value, font=face, fill=fill, anchor="ls",
                  stroke_width=1, stroke_fill=fill)

    def centered(draw, text, y, size, serif=False, fill=WHITE, tracking=0):
        face = font(size, serif)
        width = draw.textlength(text, font=face) + max(0, len(text) - 1) * tracking
        x = (SIZE[0] - width) / 2
        baseline = y - face.getbbox(text, anchor="ls")[1]
        if tracking:
            for letter in text:
                lettering(draw, (x, baseline), letter, face, fill)
                x += draw.textlength(letter, font=face) + tracking
        else:
            lettering(draw, (x, baseline), text, face, fill)

    def layer():
        return Image.new("RGBA", SIZE, (0, 0, 0, 0))

    hero = ImageOps.fit(Image.open(PUBLIC / "images" / "hero-naxos-aerial.jpeg").convert("RGB"), SIZE)
    # Keep the opening exposure steady from its first frame through both cards.
    hero = Image.blend(hero, Image.new("RGB", SIZE, "black"), 0.64)
    hero_path = args.work_dir / "hero.jpg"
    hero.save(hero_path, quality=97)
    title = layer()
    draw = ImageDraw.Draw(title)
    centered(draw, "IAG WORKING GROUP", 238, 27, tracking=5)
    centered(draw, "DENUCHANGE", 314, 132, serif=True, fill=IAG_YELLOW)
    subtitle_face = font(61, serif=True)
    superscript_face = font(34, serif=True)
    subtitle_runs = [("5", subtitle_face, 0), ("th", superscript_face, 24),
                     (" International Workshop", subtitle_face, 0)]
    subtitle_width = sum(draw.textlength(text, font=face) for text, face, _ in subtitle_runs)
    subtitle_x = (SIZE[0] - subtitle_width) / 2
    subtitle_baseline = 477 - subtitle_face.getbbox("5 International Workshop", anchor="ls")[1]
    for text, face, rise in subtitle_runs:
        lettering(draw, (subtitle_x, subtitle_baseline - rise), text, face)
        subtitle_x += draw.textlength(text, font=face)
    draw.line((862, 578, 1058, 578), fill=IAG_BLUE, width=4)
    centered(draw, "Denudation and Environmental Changes", 624, 39)
    centered(draw, "in Different Morphoclimatic Zones", 682, 39)
    centered(draw, "NAXOS, GREECE    5–9 OCTOBER 2026", 810, 26, fill=IAG_YELLOW, tracking=3)
    title_path = args.work_dir / "title.png"
    title.save(title_path)

    organisers = layer()
    draw = ImageDraw.Draw(organisers)
    centered(draw, "Organisers", 276, 82, serif=True)
    draw.line((862, 390, 1058, 390), fill=GOLD, width=2)
    for index, name in enumerate(LOGOS):
        logo = Image.open(PUBLIC / "images" / "organisers-dark" / name).convert("RGBA")
        logo_size = (295, 228) if name == "02_laguna_coast_transparent.png" else (246, 190)
        logo = ImageOps.contain(logo, logo_size)
        center = 312 + index * 324
        organisers.alpha_composite(logo, (center - logo.width // 2, 584 - logo.height // 2))
    organisers_path = args.work_dir / "organisers.png"
    organisers.save(organisers_path)

    date_paths = []
    for day, _ in DATES:
        date = layer()
        draw = ImageDraw.Draw(date)
        centered(draw, f"{day} October 2026", 464, 111, serif=True)
        draw.line((862, 625, 1058, 625), fill=GOLD, width=2)
        path = args.work_dir / f"date-{day}.png"
        date.save(path)
        date_paths.append(path)

    poster = args.work_dir / "denuchange-naxos-2026-titled.webp"
    Image.alpha_composite(hero.convert("RGBA"), title).convert("RGB").save(poster, quality=90)
    thumbnail = args.work_dir / "denuchange-naxos-2026-titled-thumbnail.webp"
    ImageOps.contain(Image.open(poster), (640, 360)).save(thumbnail, quality=85)

    probe = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(SOURCE)
    ], text=True))
    source_duration = float(probe["format"]["duration"])
    main_source = render_collage_montage(args.sequence, args.work_dir, source_duration) if args.sequence else SOURCE
    montage_duration = source_duration + INTRO - DISSOLVE
    duration = montage_duration + CLOSING_DURATION - CLOSING_DISSOLVE
    closing_path = render_closing_clip(SIZE, args.work_dir)
    command = ["ffmpeg", "-hide_banner", "-loglevel", "warning", "-y", "-filter_complex_threads", "2", "-i", str(main_source)]
    for path, length in [(hero_path, INTRO), (title_path, 6.0), (organisers_path, 5.2), *[(p, DATE_DURATION) for p in date_paths]]:
        command += ["-loop", "1", "-framerate", "30", "-t", str(length), "-i", str(path)]
    command += ["-i", str(closing_path)]
    graph = [
        "[0:v]fps=30,settb=AVTB,setpts=PTS-STARTPTS,setsar=1,format=yuv420p[main0]",
        "[1:v]fps=30,settb=AVTB,setpts=PTS-STARTPTS,setsar=1,format=yuv420p[hero]",
        f"[2:v]format=rgba,fade=t=out:st=4.7:d=1.3:alpha=1,{EASE_ALPHA}[title]",
        "[hero][title]overlay=eof_action=pass:repeatlast=0[intro0]",
        f"[3:v]format=rgba,fade=t=in:st=0:d=1.1:alpha=1,fade=t=out:st=4.05:d=1.15:alpha=1,{EASE_ALPHA},setpts=PTS+5.5/TB[org]",
        "[intro0][org]overlay=eof_action=pass:repeatlast=0:enable='between(t,5.5,10.7)',settb=AVTB[intro]",
    ]
    for index, (_, start) in enumerate(DATES):
        # The photo dims just before the lettering arrives and recovers just
        # after it leaves. Ease each opacity separately to avoid a single pulse.
        shade_start = 0 if index == 0 else start - 0.15
        shade_duration = start + DATE_DURATION + 0.1 - shade_start
        shade_entrance = "" if index == 0 else "fade=t=in:st=0:d=0.35:alpha=1,"
        graph += [
            f"color=c=black:s=1920x1080:r=30:d={shade_duration},format=rgba,{shade_entrance}fade=t=out:st={shade_duration - 0.6}:d=0.6:alpha=1,{EASE_ALPHA},colorchannelmixer=aa=0.64,setpts=PTS+{shade_start}/TB[shade{index}]",
            f"[main{index}][shade{index}]overlay=eof_action=pass:repeatlast=0:enable='between(t,{shade_start},{shade_start + shade_duration})'[focused{index}]",
            f"[{index + 4}:v]format=rgba,fade=t=in:st=0:d=0.45:alpha=1,fade=t=out:st={DATE_DURATION - 0.55}:d=0.55:alpha=1,{EASE_ALPHA},setpts=PTS+{start}/TB[date{index}]",
            f"[focused{index}][date{index}]overlay=eof_action=pass:repeatlast=0:enable='between(t,{start},{start + DATE_DURATION})'[main{index + 1}]",
        ]
    graph += [
        f"[intro][main5]xfade=transition=fade:duration={DISSOLVE}:offset={INTRO - DISSOLVE},format=yuv420p[montage]",
        "[9:v]fps=30,settb=AVTB,setpts=PTS-STARTPTS,setsar=1,format=yuv420p[closing]",
        f"[montage][closing]xfade=transition=fade:duration={CLOSING_DISSOLVE}:offset={montage_duration - CLOSING_DISSOLVE},format=yuv420p[v]",
        # Preserve the music's pitch and continuity through the opening,
        # collages and closing, with its final fade matching the picture.
        f"[0:a]asetpts=PTS-STARTPTS,atempo={source_duration / duration:.9f},apad,atrim=duration={duration},afade=t=in:st=0:d=0.8,afade=t=out:st={duration - 1.0}:d=1.0[a]",
    ]
    graph_path = args.work_dir / "film.ffgraph"
    graph_path.write_text(";\n".join(graph), encoding="utf-8")
    command += ["-filter_complex", ";".join(graph), "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-threads", "6",
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart",
                "-t", str(duration), "-progress", "pipe:1", "-nostats", str(args.output)]
    log_path = args.work_dir / "render.log"
    print(f"Rendering {duration:.2f} seconds to {args.output}", flush=True)
    with log_path.open("w", encoding="utf-8") as log:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=log, text=True, encoding="utf-8")
        last_report = -15
        for line in process.stdout:
            if line.startswith("out_time_us="):
                value = line.strip().split("=", 1)[1]
                if value.isdigit() and int(value) / 1_000_000 >= last_report + 15:
                    last_report = int(value) / 1_000_000
                    print(f"Encoded {last_report:.0f}/{duration:.0f} seconds", flush=True)
        if process.wait() != 0:
            raise RuntimeError(log_path.read_text(encoding="utf-8")[-8000:])

    if args.publish_assets:
        destination = GALLERY / "videos" / FILENAME
        destination.parent.mkdir(parents=True, exist_ok=True)
        if args.output.resolve() != destination.resolve():
            shutil.copyfile(args.output, destination)
        poster_destination = GALLERY / "display" / "overview" / poster.name
        thumb_destination = GALLERY / "thumbnails" / "overview" / poster.name
        poster_destination.parent.mkdir(parents=True, exist_ok=True)
        thumb_destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(poster, poster_destination)
        shutil.copyfile(thumbnail, thumb_destination)
        manifest = WEBSITE / "src" / "app" / "lib" / "workshop-gallery-data.ts"
        text = manifest.read_text(encoding="utf-8")
        pattern = r"(export const workshopGalleryOverview: GalleryMedia\[\] = )(\[.*?\])(;\s*export const workshopGalleryDays)"
        match = re.search(pattern, text, re.S)
        overview = json.loads(match.group(2))
        overview[0].update({
            "filename": FILENAME, "src": f"/workshop-gallery/videos/{FILENAME}",
            "original": f"/workshop-gallery/videos/{FILENAME}", "bytes": destination.stat().st_size,
            "poster": f"/workshop-gallery/display/overview/{poster.name}",
            "thumbnail": f"/workshop-gallery/thumbnails/overview/{poster.name}", "duration": round(duration, 2),
        })
        replacement = match.group(1) + json.dumps(overview, ensure_ascii=False, indent=2) + match.group(3)
        manifest.write_text(text[:match.start()] + replacement + text[match.end():], encoding="utf-8")
        print(f"Gallery playback, downloads and poster updated: {destination}", flush=True)
    print(f"Finished: {args.output}", flush=True)


if __name__ == "__main__":
    main()
