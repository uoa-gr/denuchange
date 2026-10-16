"""Replace the original collage canvas with photo-derived frosted glass.

The supplied archive stays intact. New gallery derivatives preserve the original
photo arrangements and a separate 1920x1080 sequence feeds the landscape film.
"""

from __future__ import annotations

import argparse
import json
import re
import zipfile
from pathlib import Path
from urllib.parse import quote

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

from workshop_glass import glass_background


WEBSITE = Path(__file__).resolve().parents[1]
PUBLIC = WEBSITE / "public"
GALLERY = PUBLIC / "workshop-gallery"
MANIFEST = WEBSITE / "src/app/lib/workshop-gallery-data.ts"
DAY_PATTERN = r"export const workshopGalleryDays: GalleryDay\[\] = (\[.*?\]);"
VIDEO_SIZE = (1920, 1080)


def padding_mask(source: Image.Image) -> Image.Image:
    """Select only the known navy canvas connected to the outer image edge.

    Each supplied collage has an uninterrupted narrow outer margin. Sampling it
    per row identifies the canvas colour; a brightness-adjusted match also picks
    up its baked-in drop shadows in the gutters. Flood fill excludes matching
    dark pixels inside photographs, rather than replacing dark colours globally.
    A two-pixel cleanup removes JPEG-contaminated canvas at the photo edges.
    """
    pixels = np.asarray(source, dtype=np.int16)
    border = np.concatenate((pixels[:, :8], pixels[:, -8:]), axis=1)
    expected = np.median(border, axis=1).astype(np.float32)[:, None, :]
    # The original photo shadows darken the same navy canvas. Matching only
    # absolute RGB values leaves these shadows behind as black-looking frames.
    # Project onto the known canvas colour so its shaded variants remain canvas;
    # the texture and edge-connectivity constraints below still protect photos.
    brightness = np.sum(pixels * expected, axis=2, keepdims=True) / np.maximum(
        np.sum(expected * expected, axis=2, keepdims=True), 1
    )
    shaded_canvas = expected * np.clip(brightness, 0.15, 1.10)
    near_canvas = np.max(np.abs(pixels - shaded_canvas), axis=2) <= 6
    # Only locally flat navy pixels can be canvas. Detailed photographic edges
    # therefore stop the connected fill even when their average colour is dark.
    small = source.filter(ImageFilter.MaxFilter(3))
    large = source.filter(ImageFilter.MinFilter(3))
    spread = np.asarray(small, dtype=np.int16) - np.asarray(large, dtype=np.int16)
    near_canvas &= np.max(spread, axis=2) <= 10
    # fromarray can share a read-only NumPy buffer. floodfill then silently
    # leaves the image unchanged, so give it an explicitly writable copy.
    connected = Image.fromarray((near_canvas * 255).astype(np.uint8), "L").copy()
    width, height = connected.size
    edges = (
        ((x, y) for y in (0, height - 1) for x in range(width)),
        ((x, y) for x in (0, width - 1) for y in range(1, height - 1)),
    )
    for edge in edges:
        for seed in edge:
            # Already filled components have value 128; photograph pixels are
            # zero. Seed every remaining edge component, not just one corner.
            if connected.getpixel(seed) == 255:
                ImageDraw.floodfill(connected, seed, 128, thresh=0)
    selected = np.asarray(connected) == 128
    if not np.any(selected):
        raise ValueError(
            "No edge-connected navy canvas was selected; refusing to export "
            "an unchanged collage as a glass-background version."
        )
    mask = Image.fromarray((selected * 255).astype(np.uint8), "L")
    # On the supplied 3000px-wide collages, two edge pixels contain JPEG colour
    # bleed and fail the flatness/colour test. Absorb only that narrow fringe,
    # keeping the photograph interiors sharp and the original layout intact.
    fringe = max(1, round(source.width * 2 / 3000))
    return mask.filter(ImageFilter.MaxFilter(fringe * 2 + 1)).filter(
        ImageFilter.GaussianBlur(0.65)
    )


def write_collage(source_path: Path, original: Path, display: Path,
                  thumbnail: Path, video_frame: Path) -> tuple[int, int]:
    with Image.open(source_path) as opened:
        source = ImageOps.exif_transpose(opened).convert("RGB")
    mask = padding_mask(source)
    background = glass_background(source, source.size)
    native = Image.composite(background, source, mask)
    for path in (original, display, thumbnail, video_frame):
        path.parent.mkdir(parents=True, exist_ok=True)
    native.save(original, "JPEG", quality=95, subsampling=0, optimize=True)
    image = native.copy()
    image.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
    image.save(display, "WEBP", quality=88, method=6)
    image.thumbnail((640, 640), Image.Resampling.LANCZOS)
    image.save(thumbnail, "WEBP", quality=84, method=6)

    # Keep the complete sharp collage. The backdrop fills its internal gutters
    # and any letterbox/pillarbox area with one continuous photographic blur.
    video = glass_background(source, VIDEO_SIZE)
    foreground = source.convert("RGBA")
    foreground.putalpha(ImageOps.invert(mask))
    fitted = ImageOps.contain(foreground, VIDEO_SIZE, Image.Resampling.LANCZOS)
    position = ((VIDEO_SIZE[0] - fitted.width) // 2,
                (VIDEO_SIZE[1] - fitted.height) // 2)
    video.paste(fitted, position, fitted)
    video.save(video_frame, "JPEG", quality=95, subsampling=0, optimize=True)
    return source.size


def url(path: Path) -> str:
    return "/" + quote(path.relative_to(PUBLIC).as_posix(), safe="/")


def publish_metadata(records: list[dict]) -> None:
    # Read at publication time to preserve independent mobile/video changes.
    source = MANIFEST.read_text(encoding="utf-8")
    match = re.search(DAY_PATTERN, source, re.S)
    days = json.loads(match.group(1))
    replacements = {record["id"]: record for record in records}
    for day in days:
        for group in day["groups"]:
            for item in group["items"]:
                if item["kind"] != "collage" or item.get("variant") == "mobile":
                    continue
                record = replacements.get(item["id"])
                if record:
                    for key in ("src", "thumbnail", "original", "bytes", "width", "height"):
                        item[key] = record[key]
    replacement = json.dumps(days, ensure_ascii=False, indent=2)
    MANIFEST.write_text(source[:match.start(1)] + replacement + source[match.end(1):],
                        encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--work-dir", type=Path, required=True)
    parser.add_argument("--source-map", type=Path)
    parser.add_argument("--zip", type=Path, dest="zip_path")
    parser.add_argument("--publish-assets", action="store_true")
    parser.add_argument("--metadata-only", action="store_true")
    parser.add_argument("--resume", action="store_true",
                        help="Reuse finished assets after an interrupted generation")
    args = parser.parse_args()
    args.work_dir.mkdir(parents=True, exist_ok=True)
    metadata_file = args.work_dir / "gallery-metadata.json"
    if args.metadata_only:
        publish_metadata(json.loads(metadata_file.read_text(encoding="utf-8")))
        print("Published landscape collage metadata", flush=True)
        return
    if not args.source_map or not args.zip_path:
        parser.error("generation requires --source-map and --zip")

    source = MANIFEST.read_text(encoding="utf-8")
    days = json.loads(re.search(DAY_PATTERN, source, re.S).group(1))
    entries = {
        item["filename"]: (day, item)
        for day in days for group in day["groups"] for item in group["items"]
        if item["kind"] == "collage" and item.get("variant") != "mobile"
    }
    # Always return to the supplied archive, including after a previous publish.
    originals = {
        path.name: path for path in (GALLERY / "originals").rglob("*.jpg")
        if path.parent.name.casefold() == "collages"
    }
    source_map = json.loads(args.source_map.read_text(encoding="utf-8-sig"))
    sequence, records, zip_members = [], [], []
    for day_sequence in source_map["days"]:
        for filename in day_sequence["collage_order"]:
            day, item = entries[filename]
            original = GALLERY / "glass/originals" / day["id"] / filename
            display = GALLERY / "glass/display" / day["id"] / (item["id"] + ".webp")
            thumbnail = GALLERY / "glass/thumbnails" / day["id"] / (item["id"] + ".webp")
            frame = args.work_dir / "frames" / f"{len(sequence) + 1:02d}_{Path(filename).stem}.jpg"
            if args.resume and all(path.exists() for path in (original, display, thumbnail, frame)):
                width, height = item["width"], item["height"]
            else:
                width, height = write_collage(originals[filename], original, display,
                                              thumbnail, frame)
            sequence.append(dict(path=str(frame.resolve()), filename=filename,
                                 day=day_sequence["date"],
                                 sourcePath=str(originals[filename].resolve())))
            records.append(dict(id=item["id"], original=url(original), src=url(display),
                                thumbnail=url(thumbnail), bytes=original.stat().st_size,
                                width=width, height=height))
            zip_members.append((original, f"{day_sequence['date']}/{filename}"))
            print(f"Prepared {len(sequence):02d}: {filename}", flush=True)

    (args.work_dir / "sequence.json").write_text(
        json.dumps(dict(width=VIDEO_SIZE[0], height=VIDEO_SIZE[1], collages=sequence),
                   ensure_ascii=False, indent=2), encoding="utf-8")
    metadata_file.write_text(json.dumps(records, ensure_ascii=False, indent=2),
                             encoding="utf-8")
    args.zip_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.zip_path, "w", compression=zipfile.ZIP_STORED) as archive:
        for path, name in zip_members:
            archive.write(path, name)
    if args.publish_assets:
        publish_metadata(records)
    print(f"Created {len(sequence)} glass collages and landscape sequence", flush=True)


if __name__ == "__main__":
    main()
