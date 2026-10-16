"""Render the separate 9:16 workshop film from prepared portrait collages.

python render-workshop-mobile-film.py --sequence PATH --work-dir PATH --output PATH
Add --publish-assets to register the mobile film alongside the landscape film.
"""

from __future__ import annotations

import argparse
from functools import lru_cache
import json
from pathlib import Path
import re
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFont, ImageOps

from workshop_film_closing import CLOSING_DURATION, CLOSING_DISSOLVE, closing_frame


WEBSITE = Path(__file__).resolve().parents[1]
PUBLIC = WEBSITE / "public"
GALLERY = PUBLIC / "workshop-gallery"
SOURCE = GALLERY / "originals" / "DENUCHANGE_Naxos_2026.mp4"
FILENAME = "DENUCHANGE_Naxos_2026_mobile.mp4"
SIZE = (1080, 1920)
FPS = 30
INTRO = 12.0
DISSOLVE = 0.8
DATE_DURATION = 2.5
WHITE = (255, 255, 255, 255)
YELLOW = (241, 193, 0, 255)
BLUE = (30, 115, 190, 255)
GOLD = (224, 202, 154, 255)
LOGOS = ["01_nkua_190_transparent.png", "02_laguna_coast_transparent.png",
         "03_iag_transparent.png", "04_denuchange_transparent.png",
         "05_virtual_trips_transparent.png"]


def ease(value):
    value = min(1.0, max(0.0, value))
    return value * value * (3 - 2 * value)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sequence", type=Path, required=True)
    parser.add_argument("--work-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--publish-assets", action="store_true")
    args = parser.parse_args()
    args.sequence = args.sequence.resolve()
    args.work_dir = args.work_dir.resolve()
    args.output = args.output.resolve()
    args.work_dir.mkdir(parents=True, exist_ok=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    frames_dir = args.work_dir / "frames"
    frames_dir.mkdir(exist_ok=True)
    collages = json.loads(args.sequence.read_text(encoding="utf-8"))["collages"]
    source_duration = float(json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(SOURCE)
    ], text=True))["format"]["duration"])
    montage_frames = round(source_duration * FPS)
    intro_overlap_frame = round((INTRO - DISSOLVE) * FPS)
    main_frames = montage_frames + intro_overlap_frame
    closing_overlap_frames = round(CLOSING_DISSOLVE * FPS)
    closing_start_frame = main_frames - closing_overlap_frames
    total_frames = closing_start_frame + round(CLOSING_DURATION * FPS)
    duration = total_frames / FPS
    # Retain the approved montage's pace, then dissolve into the closing card.
    starts = [round(index * montage_frames / len(collages)) for index in range(len(collages))]
    date_starts = []
    previous_day = None
    for index, collage in enumerate(collages):
        if collage["day"] != previous_day:
            date_starts.append((int(collage["day"][-2:]), starts[index] / FPS + (0.7 if index == 0 else 0.55)))
            previous_day = collage["day"]

    def font(size, serif=False):
        return ImageFont.truetype("C:/Windows/Fonts/BASKVILL.TTF" if serif else "C:/Windows/Fonts/segoeui.ttf", size)

    def lettering(draw, position, value, face, fill=WHITE):
        draw.text((position[0], position[1] + 2), value, font=face, fill=(0, 0, 0, 190),
                  anchor="ls", stroke_width=2, stroke_fill=(0, 0, 0, 140))
        draw.text(position, value, font=face, fill=fill, anchor="ls", stroke_width=1, stroke_fill=fill)

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

    hero = ImageOps.fit(Image.open(PUBLIC / "images" / "hero-naxos-aerial.jpeg").convert("RGB"), SIZE,
                        method=Image.Resampling.LANCZOS)
    black = Image.new("RGB", SIZE, "black")
    hero = Image.blend(hero, black, 0.64)
    title = layer()
    draw = ImageDraw.Draw(title)
    centered(draw, "IAG WORKING GROUP", 490, 28, tracking=5)
    centered(draw, "DENUCHANGE", 588, 105, serif=True, fill=YELLOW)
    subtitle_face = font(64, serif=True)
    superscript_face = font(36, serif=True)
    runs = [("5", subtitle_face, 0), ("th", superscript_face, 25),
            (" International", subtitle_face, 0)]
    x = (SIZE[0] - sum(draw.textlength(value, font=face) for value, face, _ in runs)) / 2
    baseline = 770 - subtitle_face.getbbox("5 International", anchor="ls")[1]
    for value, face, rise in runs:
        lettering(draw, (x, baseline - rise), value, face)
        x += draw.textlength(value, font=face)
    centered(draw, "Workshop", 853, 64, serif=True)
    draw.line((442, 970, 638, 970), fill=BLUE, width=4)
    centered(draw, "Denudation and", 1035, 43)
    centered(draw, "Environmental Changes", 1096, 43)
    centered(draw, "in Different", 1181, 43)
    centered(draw, "Morphoclimatic Zones", 1242, 43)
    centered(draw, "NAXOS, GREECE", 1390, 30, fill=YELLOW, tracking=4)
    centered(draw, "5–9 OCTOBER 2026", 1450, 30, fill=YELLOW, tracking=3)
    title.save(args.work_dir / "title.png")

    organisers = layer()
    draw = ImageDraw.Draw(organisers)
    centered(draw, "Organisers", 410, 82, serif=True)
    draw.line((442, 540, 638, 540), fill=GOLD, width=2)
    # The long wordmarks need width; the circular marks fit the lower pair.
    placements = [(300, 720, (380, 230)), (770, 720, (456, 276)),
                  (540, 1000, (370, 250)), (300, 1330, (310, 310)),
                  (770, 1330, (310, 310))]
    for name, (x, y, bounds) in zip(LOGOS, placements):
        logo = ImageOps.contain(Image.open(PUBLIC / "images" / "organisers-dark" / name).convert("RGBA"),
                                bounds, method=Image.Resampling.LANCZOS)
        organisers.alpha_composite(logo, (x - logo.width // 2, y - logo.height // 2))
    organisers.save(args.work_dir / "organisers.png")

    dates = {}
    for day, _ in date_starts:
        date = layer()
        draw = ImageDraw.Draw(date)
        centered(draw, f"{day} October", 820, 113, serif=True)
        centered(draw, "2026", 982, 64, serif=True)
        draw.line((442, 1112, 638, 1112), fill=GOLD, width=2)
        dates[day] = date

    def over(image, overlay, opacity):
        if opacity <= 0:
            return image
        if opacity >= 255:
            return Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")
        reduced = overlay.copy()
        reduced.putalpha(overlay.getchannel("A").point(lambda value: round(value * opacity / 255)))
        return Image.alpha_composite(image.convert("RGBA"), reduced).convert("RGB")

    @lru_cache(maxsize=3)
    def collage_image(index):
        with Image.open(collages[index]["path"]) as source:
            return source.convert("RGB")

    def montage_state(frame):
        index = min(len(collages) - 1, int(frame * len(collages) / montage_frames))
        while index + 1 < len(starts) and frame >= starts[index + 1]:
            index += 1
        while index > 0 and frame < starts[index]:
            index -= 1
        blend = round(255 * ease((frame - starts[index]) / (DISSOLVE * FPS))) if index else 255
        shade, date_day, alpha = 0, 0, 0
        t = frame / FPS
        for position, (day, start) in enumerate(date_starts):
            shade_start = 0 if position == 0 else start - 0.15
            shade_end = start + DATE_DURATION + 0.1
            if shade_start <= t < shade_end:
                entrance = 1 if position == 0 else ease((t - shade_start) / 0.35)
                shade = round(255 * 0.64 * entrance * ease((shade_end - t) / 0.6))
            if start <= t < start + DATE_DURATION:
                date_day = day
                alpha = round(255 * ease((t - start) / 0.45) * ease((start + DATE_DURATION - t) / 0.55))
        return index, blend, shade, date_day, alpha

    def montage_image(state):
        index, blend, shade, day, alpha = state
        image = collage_image(index)
        if index and blend < 255:
            image = Image.blend(collage_image(index - 1), image, blend / 255)
        if shade:
            image = Image.blend(image, black, shade / 255)
        if day:
            image = over(image, dates[day], alpha)
        return image

    def frame_state(frame):
        t = frame / FPS
        closing = frame - closing_start_frame if frame >= closing_start_frame else None
        if frame >= main_frames:
            return None, None, 255, closing, 255
        opening = None
        if t < INTRO:
            title_alpha = round(255 * ease((6.0 - t) / 1.3))
            org_alpha = round(255 * ease((t - 5.5) / 1.1) * ease((10.7 - t) / 1.15))
            opening = (title_alpha, org_alpha)
        montage = montage_state(frame - intro_overlap_frame) if frame >= intro_overlap_frame else None
        blend = round(255 * ease((frame - intro_overlap_frame) / (DISSOLVE * FPS))) if opening and montage else 255
        closing_blend = round(255 * ease(closing / closing_overlap_frames)) if closing is not None else 0
        return opening, montage, blend, closing, closing_blend

    def render_state(state):
        opening, montage, blend, closing, closing_blend = state
        ending = closing_frame(SIZE, closing / FPS) if closing is not None else None
        if closing_blend == 255:
            return ending
        intro_image = over(over(hero, title, opening[0]), organisers, opening[1]) if opening else None
        main_image = montage_image(montage) if montage else None
        if intro_image is not None and main_image is not None:
            image = Image.blend(intro_image, main_image, blend / 255)
        else:
            image = intro_image if intro_image is not None else main_image
        return Image.blend(image, ending, closing_blend / 255) if ending is not None else image

    poster = args.work_dir / "denuchange-naxos-2026-mobile.webp"
    over(hero, title, 255).save(poster, quality=92)
    thumbnail = args.work_dir / "denuchange-naxos-2026-mobile-thumbnail.webp"
    ImageOps.contain(over(hero, title, 255), (360, 640)).save(thumbnail, quality=88)
    print(f"Preparing portrait transitions for {len(collages)} collages, {duration:.2f} seconds", flush=True)
    timeline = []
    previous = None
    held_frames = 0
    image_path = None
    for frame in range(total_frames):
        state = frame_state(frame)
        if state == previous:
            held_frames += 1
            continue
        if image_path is not None:
            timeline.append((image_path, held_frames))
        image_path = frames_dir / f"frame-{len(timeline):05d}.jpg"
        render_state(state).save(image_path, quality=96, subsampling=0)
        held_frames = 1
        previous = state
        if len(timeline) % 250 == 0:
            print(f"Prepared through {frame / FPS:.0f}/{duration:.0f} seconds", flush=True)
    timeline.append((image_path, held_frames))
    concat = args.work_dir / "frames.ffconcat"
    lines = ["ffconcat version 1.0"]
    for path, length in timeline:
        escaped = path.as_posix().replace("'", "'\\''")
        lines += [f"file '{escaped}'", "option framerate 30", f"duration {length / FPS:.9f}"]
    escaped = timeline[-1][0].as_posix().replace("'", "'\\''")
    lines += [f"file '{escaped}'", "option framerate 30"]
    concat.write_text("\n".join(lines) + "\n", encoding="utf-8")
    command = ["ffmpeg", "-hide_banner", "-loglevel", "warning", "-y",
               "-f", "concat", "-safe", "0", "-i", str(concat), "-i", str(SOURCE),
               "-map", "0:v:0", "-map", "1:a:0", "-vf", "fps=30,setsar=1,format=yuv420p",
               "-af", f"asetpts=PTS-STARTPTS,atempo={source_duration / duration:.9f},apad,atrim=duration={duration},afade=t=in:st=0:d=0.8,afade=t=out:st={duration - 1.0}:d=1.0",
               "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-threads", "6",
               "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart",
               "-t", str(duration), "-progress", "pipe:1", "-nostats", str(args.output)]
    log_path = args.work_dir / "render.log"
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
        mobile_id = "denuchange-naxos-2026-mobile"
        overview = [item for item in overview if item["id"] != mobile_id]
        overview.append({"id": mobile_id, "kind": "video", "variant": "mobile", "title": "DENUCHANGE · Naxos 2026 · Mobile (9:16)",
                         "filename": FILENAME, "src": f"/workshop-gallery/videos/{FILENAME}",
                         "original": f"/workshop-gallery/videos/{FILENAME}", "bytes": destination.stat().st_size,
                         "poster": f"/workshop-gallery/display/overview/{poster.name}",
                         "thumbnail": f"/workshop-gallery/thumbnails/overview/{poster.name}",
                         "width": SIZE[0], "height": SIZE[1], "duration": round(duration, 2)})
        replacement = match.group(1) + json.dumps(overview, ensure_ascii=False, indent=2) + match.group(3)
        manifest.write_text(text[:match.start()] + replacement + text[match.end():], encoding="utf-8")
        print("Added the mobile film to the local gallery", flush=True)
    print(f"Finished: {args.output}", flush=True)


if __name__ == "__main__":
    main()
