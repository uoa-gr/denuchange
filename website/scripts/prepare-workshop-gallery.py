"""Prepare the workshop gallery from its supplied archive, preserving originals.

Usage: python prepare-workshop-gallery.py path/to/DENUCHNAGE_NAXOS_2026.zip
       python prepare-workshop-gallery.py --sort-existing
Requires Pillow and ffmpeg/ffprobe on PATH. Generated assets belong in public;
the generated TypeScript manifest records the exact original download paths.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import re
import shutil
import subprocess
import unicodedata
import zipfile
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path, PurePosixPath
from urllib.parse import quote, unquote

from PIL import Image, ImageOps


WEBSITE = Path(__file__).resolve().parents[1]
PUBLIC = WEBSITE / "public" / "workshop-gallery"
MANIFEST = WEBSITE / "src" / "app" / "lib" / "workshop-gallery-data.ts"
BASE_URL = "/workshop-gallery"

DAY_TITLES = {
    0: "Arrival in Naxos",
    1: "Opening & scientific sessions",
    2: "Scientific sessions & hands-on labs",
    3: "Field trip: Aplomata to Flerio",
    4: "Field trip: Agios Prokopios to Pyrgaki",
}

# Prefixes are longest-first so Museum_VR, Laguna_Music and similar names
# retain the distinct grouping supplied in the original archive.
GROUPS = [
    ("Lab_Field_VR", "field-vr-lab", "Field & VR lab"),
    ("Lab_Field", "field-vr-lab", "Field & VR lab"),
    ("Lab_VR", "field-vr-lab", "Field & VR lab"),
    ("Laguna_Music", "laguna-music", "Laguna · music"),
    ("Museum_VR", "museum-vr", "Museum · VR"),
    ("Flerio_Kouros", "flerio-kouros", "Flerio & Kouros"),
    ("Agios_Prokopios", "agios-prokopios", "Agios Prokopios"),
    ("Session_01", "session-01", "Session 01"),
    ("Session_02", "session-02", "Session 02"),
    ("Session_03", "session-03", "Session 03"),
    ("Session_04", "session-04", "Session 04"),
    ("Openning", "opening", "Opening"),
    ("Opening", "opening", "Opening"),
    ("Arrival", "arrival", "Arrival"),
    ("Ferry", "ferry", "Ferry to Naxos"),
    ("Beach", "beach", "Beach"),
    ("Alley", "alley", "Around Naxos"),
    ("Bar", "bar", "Bar"),
    ("Yard", "yard", "Yard"),
    ("Marbles", "marbles", "Marbles"),
    ("Lunch", "lunch", "Lunch"),
    ("Laguna", "laguna", "Laguna"),
    ("Posters", "posters", "Poster presentations"),
    ("Kefalea", "kefalea", "Kefalea"),
    ("Aplomata", "aplomata", "Aplomata"),
    ("Apeiranthos", "apeiranthos", "Apeiranthos"),
    ("Museum", "museum", "Museum"),
    ("Faneromeni", "faneromeni", "Faneromeni"),
    ("Flerio", "flerio-kouros", "Flerio & Kouros"),
    ("Stelida", "stelida", "Stelida"),
    ("Alyko", "alyko", "Alyko"),
    ("Pyrgaki", "pyrgaki", "Pyrgaki"),
    ("Restaurant", "restaurant", "Restaurant"),
]

# Scheduled events follow the published agenda. Original capture times order
# unscheduled groups and actual field-trip stops; arrival is a summary collage.
GROUP_ORDER = {
    0: ["arrival", "ferry", "alley", "beach", "yard", "bar"],
    1: ["opening", "session-01", "lunch", "yard", "laguna", "laguna-music", "session-02", "marbles"],
    2: ["session-03", "session-04", "posters", "kefalea", "field-vr-lab"],
    3: ["apeiranthos", "museum", "museum-vr", "flerio-kouros", "faneromeni", "aplomata"],
    4: ["stelida", "agios-prokopios", "pyrgaki", "alyko", "restaurant"],
}

# Known talk order supplies a filename fallback when capture metadata is absent.
# Collage export dates never describe when their represented activity happened.
SPEAKER_ORDER = {
    "opening": ["Efstathopoulos", "Evelpidou", "Antonarakou", "Flerianos", "Lianos", "Dimopoulos", "Beylich", "Micu", "Zwoliński"],
    "session-01": ["Roussou", "Koyanagi", "Verga", "Święchowicz", "Santoro"],
    "session-02": ["Zwoliński", "Licata"],
    "session-03": ["Wittenberg", "Spyrou", "Frumkin", "Liaskos"],
    "session-04": ["Lynch", "Crouvi", "Verga", "Kostantinidou"],
}

# Naxos local time during the dated workshop (5–9 October 2026).
WORKSHOP_TIMEZONE = timezone(timedelta(hours=3))


def slug(value: str) -> str:
    ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")


def natural_key(value: str) -> list:
    return [int(part) if part.isdigit() else part.casefold() for part in re.split(r"(\d+)", value)]


def valid_capture_time(value: object, expected_date: str, subsecond: object = None) -> str | None:
    """Accept capture metadata only when its local date matches the day folder."""
    if isinstance(value, bytes):
        value = value.decode("utf-8", errors="replace")
    if not isinstance(value, str):
        return None
    text = value.strip().strip("\x00")
    text = re.sub(r"^(\d{4}):(\d{2}):(\d{2})", r"\1-\2-\3", text)
    try:
        captured = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None
    if captured.tzinfo is not None:
        captured = captured.astimezone(WORKSHOP_TIMEZONE).replace(tzinfo=None)
    if captured.date().isoformat() != expected_date:
        return None
    if subsecond is not None:
        digits = str(subsecond).strip().strip("\x00")
        if digits.isdigit():
            captured = captured.replace(microsecond=int((digits + "000000")[:6]))
    return captured.isoformat(timespec="microseconds" if captured.microsecond else "seconds")


def photo_capture_time(source: Path, expected_date: str) -> str | None:
    with Image.open(source) as image:
        exif = image.getexif()
        capture_ifd = exif.get_ifd(34665)
        for date_tag, subsecond_tag in [(36867, 37521), (36868, 37522)]:
            captured = valid_capture_time(
                capture_ifd.get(date_tag, exif.get(date_tag)), expected_date,
                capture_ifd.get(subsecond_tag, exif.get(subsecond_tag)),
            )
            if captured is not None:
                return captured
    return None


def video_capture_time(source: Path, expected_date: str, probe: dict | None = None) -> str | None:
    if probe is None:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format_tags:stream_tags", "-of", "json", str(source)],
            check=True, capture_output=True, text=True, encoding="utf-8",
        )
        probe = json.loads(result.stdout)
    tag_sets = [probe.get("format", {}).get("tags", {})]
    tag_sets.extend(stream.get("tags", {}) for stream in probe.get("streams", []))
    for tags in tag_sets:
        normalized = {key.casefold(): value for key, value in tags.items()}
        for key in ["com.apple.quicktime.creationdate", "creation_time", "date", "date-recorded"]:
            captured = valid_capture_time(normalized.get(key), expected_date)
            if captured is not None:
                return captured
    return None


def filename_sequence(filename: str) -> list:
    # The trailing date is the folder date, not a sequence number. Removing it
    # puts an unnumbered overview before numbered parts of the same activity.
    stem = re.sub(r"_20\d{6}$", "", Path(filename).stem)
    return natural_key(stem)


def speaker_rank(filename: str, group_id: str) -> int:
    tokens = set(Path(filename).stem.casefold().split("_"))
    speakers = SPEAKER_ORDER.get(group_id, [])
    return min((index for index, speaker in enumerate(speakers) if speaker.casefold() in tokens), default=len(speakers))


def sort_group_items(group: dict) -> None:
    group_id = group["id"]
    kind_order = {"photo": 0, "video": 1, "collage": 2}
    timed_photos = [item for item in group["items"] if item["kind"] == "photo" and item.get("capturedAt")]

    def item_key(item: dict) -> tuple:
        filename = item["filename"]
        if item["kind"] == "collage":
            tokens = set(Path(filename).stem.casefold().split("_"))
            speakers = SPEAKER_ORDER.get(group_id, [])
            represented = {speaker.casefold() for speaker in speakers} & tokens
            matched_times = [
                photo["capturedAt"] for photo in timed_photos
                if represented & set(Path(photo["filename"]).stem.casefold().split("_"))
            ]
            opening_overview = group_id == "opening" and not represented
            sequence = (0, "") if opening_overview else (1, min(matched_times)) if matched_times else (2, speaker_rank(filename, group_id))
            return kind_order["collage"], sequence, filename_sequence(filename), natural_key(filename)
        captured = item.get("capturedAt")
        sequence = (0, captured) if captured else (1, speaker_rank(filename, group_id))
        return kind_order[item["kind"]], sequence, filename_sequence(filename), natural_key(filename)

    group["items"].sort(key=item_key)


def write_manifest(overview: list, days: list) -> None:
    content = INTERFACES
    content += "export const workshopGalleryOverview: GalleryMedia[] = " + json.dumps(overview, ensure_ascii=False, indent=2) + ";\n\n"
    content += "export const workshopGalleryDays: GalleryDay[] = " + json.dumps(days, ensure_ascii=False, indent=2) + ";\n"
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(content, encoding="utf-8", newline="\n")


def sort_existing_manifest() -> None:
    """Sort existing metadata in place without changing assets or group order."""
    content = MANIFEST.read_text(encoding="utf-8")
    overview = json.loads(re.search(r"export const workshopGalleryOverview: GalleryMedia\[\] = (.*?);\s*export const", content, re.S).group(1))
    days = json.loads(re.search(r"export const workshopGalleryDays: GalleryDay\[\] = (.*);\s*$", content, re.S).group(1))
    counts = Counter()
    for day in days:
        for group in day["groups"]:
            for item in group["items"]:
                item.pop("capturedAt", None)
                if item["kind"] == "collage":
                    continue
                source = PUBLIC / Path(unquote(item["original"]).removeprefix(BASE_URL + "/"))
                captured = video_capture_time(source, day["date"]) if item["kind"] == "video" else photo_capture_time(source, day["date"])
                if captured is not None:
                    item["capturedAt"] = captured
                    counts[item["kind"]] += 1
                else:
                    counts[f"{item['kind']} filename fallback"] += 1
            sort_group_items(group)
    write_manifest(overview, days)
    print(f"Updated collection order from capture metadata and source sequences: {dict(counts)}", flush=True)


def item_title(stem: str, kind: str) -> str:
    stem = re.sub(r"_20\d{6}$", "", stem)
    stem = stem.replace("Openning", "Opening")
    stem = stem.replace("Lab_Field_VR", "Field & VR lab")
    stem = stem.replace("Lab_Field", "Field lab").replace("Lab_VR", "VR lab")
    stem = stem.replace("DENUCHANGE_Naxos", "DENUCHANGE · Naxos")
    words = stem.split("_")
    title = " · ".join(words)
    title = title.replace("Session · 01", "Session 01").replace("Session · 02", "Session 02")
    title = title.replace("Session · 03", "Session 03").replace("Session · 04", "Session 04")
    title = title.replace("Agios · Prokopios", "Agios Prokopios")
    title = title.replace("Flerio · Kouros", "Flerio & Kouros")
    title = title.replace("Posters", "Poster presentations")
    return f"{title} · collage" if kind == "collage" else title


def group_for(stem: str) -> tuple[str, str]:
    for prefix, group_id, title in GROUPS:
        if stem == prefix or stem.startswith(prefix + "_"):
            return group_id, title
    return slug(stem), stem.replace("_", " ")


def web_url(path: Path) -> str:
    return BASE_URL + "/" + quote(path.relative_to(PUBLIC).as_posix(), safe="/")


def prepare_photo(source: Path, display: Path, thumbnail: Path) -> tuple[int, int]:
    with Image.open(source) as raw:
        oriented = ImageOps.exif_transpose(raw)
        width, height = oriented.size
        image = oriented.convert("RGB")
        full = image.copy()
        full.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
        full.save(display, "WEBP", quality=86, method=4)
        image.thumbnail((800, 800), Image.Resampling.LANCZOS)
        image.save(thumbnail, "WEBP", quality=80, method=4)
    return width, height


def prepare_video(source: Path, poster: Path, thumbnail: Path, media_id: str, expected_date: str | None = None) -> dict:
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(source)],
        check=True, capture_output=True, text=True, encoding="utf-8",
    )
    probe = json.loads(result.stdout)
    video = next(stream for stream in probe["streams"] if stream.get("codec_type") == "video")
    audio = next((stream for stream in probe["streams"] if stream.get("codec_type") == "audio"), None)
    duration = float(probe.get("format", {}).get("duration", video.get("duration", 0)))
    playback = source
    if video.get("codec_name") != "h264" or (audio and audio.get("codec_name") not in {"aac", "mp3"}):
        playback = PUBLIC / "videos" / f"{media_id}.mp4"
        playback.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
             "-map", "0:v:0", "-map", "0:a?", "-c:v", "libx264", "-preset", "fast",
             "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
             "-movflags", "+faststart", str(playback)], check=True,
        )
    # Choose a frame a few seconds into the clip rather than the opening frame.
    seek = min(5, max(0, duration / 10))
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(seek),
         "-i", str(source), "-frames:v", "1", "-vf", "scale=2000:2000:force_original_aspect_ratio=decrease",
         "-c:v", "libwebp", "-quality", "86", str(poster)], check=True,
    )
    with Image.open(poster) as image:
        image.thumbnail((800, 800), Image.Resampling.LANCZOS)
        image.save(thumbnail, "WEBP", quality=80, method=4)
    print(f"Video prepared: {source.name} ({video.get('codec_name')}, {duration:.1f}s)", flush=True)
    data = {
        "src": web_url(playback), "poster": web_url(poster),
        "width": int(video["width"]), "height": int(video["height"]), "duration": round(duration, 2),
    }
    captured = video_capture_time(source, expected_date, probe) if expected_date else None
    if captured is not None:
        data["capturedAt"] = captured
    return data


def prepare_item(entry: tuple[str, Path, int]) -> tuple[int | None, tuple[str, str] | None, dict]:
    relative_name, original_path, size = entry
    relative = PurePosixPath(relative_name)
    day_match = re.search(r"^Day (\d+) - ", relative.parts[0])
    day = int(day_match.group(1)) if day_match else None
    kind = "video" if original_path.suffix.lower() == ".mp4" else "collage" if "collages" in [p.lower() for p in relative.parts] else "photo"
    path_slug = slug(relative.with_suffix("").as_posix())
    media_id = f"{path_slug}-{hashlib.sha1(relative_name.encode('utf-8')).hexdigest()[:7]}"
    folder = f"day-{day}" if day is not None else "overview"
    display = PUBLIC / "display" / folder / f"{media_id}.webp"
    thumbnail = PUBLIC / "thumbnails" / folder / f"{media_id}.webp"
    display.parent.mkdir(parents=True, exist_ok=True)
    thumbnail.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "id": media_id, "kind": kind,
        "title": "DENUCHANGE · Naxos 2026" if day is None else item_title(original_path.stem, kind),
        "filename": original_path.name,
        "src": web_url(display), "thumbnail": web_url(thumbnail),
        "original": web_url(original_path), "bytes": size,
    }
    expected_date = f"2026-10-{day+5:02}" if day is not None else None
    if kind == "video":
        data.update(prepare_video(original_path, display, thumbnail, media_id, expected_date))
    else:
        data["width"], data["height"] = prepare_photo(original_path, display, thumbnail)
        captured = photo_capture_time(original_path, expected_date) if kind == "photo" and expected_date else None
        if captured is not None:
            data["capturedAt"] = captured
    return day, group_for(original_path.stem) if day is not None else None, data


INTERFACES = '''// Generated by scripts/prepare-workshop-gallery.py from the supplied workshop archive.
// Original filenames and archive folders are preserved in download paths.

export interface GalleryMedia {
  id: string;
  kind: "photo" | "collage" | "video";
  title: string;
  filename: string;
  src: string;
  thumbnail: string;
  original: string;
  bytes: number;
  width: number;
  height: number;
  poster?: string;
  duration?: number;
  // Accepted capture time in workshop local time, only when it matches its day.
  capturedAt?: string;
}

export interface GalleryGroup {
  id: string;
  title: string;
  items: GalleryMedia[];
}

export interface GalleryDay {
  id: string;
  label: string;
  date: string;
  title: string;
  groups: GalleryGroup[];
}

'''


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, nargs="?")
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--sort-existing", action="store_true", help="Sort the existing manifest without generating assets")
    args = parser.parse_args()
    if args.sort_existing:
        sort_existing_manifest()
        return
    if args.archive is None:
        parser.error("an archive path is required unless --sort-existing is used")
    PUBLIC.mkdir(parents=True, exist_ok=True)
    entries = []
    with zipfile.ZipFile(args.archive) as archive:
        files = [entry for entry in archive.infolist() if not entry.is_dir() and Path(entry.filename).suffix.lower() in {".jpg", ".jpeg", ".png", ".mp4"}]
        print(f"Extracting {len(files)} original media files…", flush=True)
        for entry in files:
            parts = PurePosixPath(entry.filename).parts
            relative = PurePosixPath(*parts[1:])
            if any(part in {"..", "."} for part in relative.parts):
                raise ValueError(f"Unsafe archive path: {entry.filename}")
            destination = PUBLIC / "originals" / Path(*relative.parts)
            destination.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(entry) as input_file, destination.open("wb") as output_file:
                shutil.copyfileobj(input_file, output_file, length=1024 * 1024)
            entries.append((relative.as_posix(), destination, entry.file_size))
    print("Preparing responsive images and video posters…", flush=True)
    prepared = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = [executor.submit(prepare_item, entry) for entry in entries]
        for index, future in enumerate(concurrent.futures.as_completed(futures), start=1):
            prepared.append(future.result())
            if index % 20 == 0 or index == len(futures):
                print(f"Prepared {index}/{len(futures)} media files", flush=True)
    by_day = {}
    overview = []
    for day, group, media in prepared:
        if day is None:
            overview.append(media)
            continue
        group_id, group_title = group
        groups = by_day.setdefault(day, {})
        gallery_group = groups.setdefault(group_id, {"id": group_id, "title": group_title, "items": []})
        gallery_group["items"].append(media)
    days = []
    for day, groups in sorted(by_day.items()):
        order = GROUP_ORDER.get(day, [])
        ordered_groups = sorted(groups.values(), key=lambda group: order.index(group["id"]) if group["id"] in order else len(order))
        for group in ordered_groups:
            # Photos, videos and collages share their topic. Keep photos first,
            # then the short video and the prepared collage summaries.
            sort_group_items(group)
        days.append({"id": f"day-{day}", "label": f"Day {day}", "date": f"2026-10-{day+5:02}", "title": DAY_TITLES[day], "groups": ordered_groups})
    write_manifest(overview, days)
    counts = Counter(media["kind"] for _, _, media in prepared)
    print(f"Prepared {len(prepared)} media files: {dict(counts)}. Originals: {sum(entry[2] for entry in entries):,} bytes.", flush=True)
    print(f"Manifest written: {MANIFEST}", flush=True)


if __name__ == "__main__":
    main()
