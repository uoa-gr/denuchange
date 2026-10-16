"""Build a separate portrait photo archive without cropping source photographs.

Usage: python prepare-workshop-mobile-collages.py --work-dir PATH --zip PATH
Requires Pillow. Existing landscape media are retained. The sequence manifest is
consumed by render-workshop-mobile-film.py; only daily gallery entries are edited.
"""

from __future__ import annotations

import argparse
import functools
import json
import re
import unicodedata
import zipfile
from pathlib import Path
from urllib.parse import quote, unquote

from PIL import Image, ImageOps

from workshop_glass import glass_background


WEBSITE = Path(__file__).resolve().parents[1]
PUBLIC = WEBSITE / "public"
GALLERY = PUBLIC / "workshop-gallery"
MANIFEST = WEBSITE / "src/app/lib/workshop-gallery-data.ts"
WIDTH, HEIGHT = 1080, 1920
MARGIN, GUTTER = 24, 12
DAY_PATTERN = r"export const workshopGalleryDays: GalleryDay\[\] = (\[.*?\]);"


def slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def source_themes(days: list[dict]) -> list[dict]:
    """Follow the original film's activity sequence and retain photo order within it."""
    themes = []

    def add(day_no, group_id, old_collage, title, groups=None, pattern=None):
        day = days[day_no]
        photos = [
            item
            for group in day["groups"]
            if group["id"] in (groups or [group_id])
            for item in group["items"]
            if item["kind"] == "photo"
            and (pattern is None or re.search(pattern, item["filename"]))
        ]
        if not photos:
            raise ValueError(f"No source photos for {day['date']}: {old_collage}")
        themes.append(dict(day=day, groupId=group_id, oldCollage=old_collage,
                           title=title, photos=photos))

    add(0, "arrival", "Arrival_20261005.jpg", "Arrival in Naxos",
        groups=["ferry", "alley", "beach"])
    add(0, "yard", "Yard_20261005.jpg", "Yard")
    add(0, "bar", "Bar_20261005.jpg", "Bar")

    add(1, "opening", "Opening_20261006.jpg", "Opening", pattern=r"^Openning_\d+_")
    add(1, "opening", "Opening_Efstathopoulos_Evelpidou_Antonarakou_20261006.jpg",
        "Opening · Efstathopoulos, Evelpidou & Antonarakou",
        pattern=r"Efstathopoulos|Evelpidou|Antonarakou")
    add(1, "opening", "Opening_Flerianos_Lianos_Dimopoulos_20261006.jpg",
        "Opening · Flerianos, Lianos & Dimopoulos", pattern=r"Flerianos|Lianos|Dimopoulos")
    add(1, "opening", "Opening_Beylich_Micu_Zwoliński_20261006.jpg",
        "Opening · Beylich, Micu & Zwoliński", pattern=r"Beylich|Micu|Zwoliński")
    add(1, "session-01", "Session_01_Roussou_Koyanagi_Verga_20261006.jpg",
        "Session 01 · Roussou, Koyanagi & Verga", pattern=r"Roussou|Koyanagi|Verga")
    add(1, "session-01", "Session_01_Święchowicz_Santoro_20261006.jpg",
        "Session 01 · Święchowicz & Santoro", pattern=r"Święchowicz|Santoro")
    add(1, "lunch", "Lunch_20261006.jpg", "Lunch", groups=["lunch", "yard"])
    add(1, "laguna", "Laguna_20261006.jpg", "Laguna Coast", pattern=r"Laguna_0[1-5]_")
    add(1, "laguna-music", "Laguna_Music_20261006.jpg", "Laguna Coast · music")
    add(1, "laguna", "Laguna_06_20261006.jpg", "Laguna Coast", pattern=r"Laguna_06_")
    add(1, "session-02", "Session_02_Zwoliński_Licata_20261006.jpg", "Session 02")
    add(1, "marbles", "Marbles_Kaenel_20261006.jpg", "Marbles · Kaenel")

    add(2, "session-03", "Session_03_Wittenberg_Spyrou_20261007.jpg",
        "Session 03 · Wittenberg & Spyrou", pattern=r"Wittenberg|Spyrou|^Session_03_2026")
    add(2, "session-03", "Session_03_Frumkin_Liaskos_20261007.jpg",
        "Session 03 · Frumkin & Liaskos", pattern=r"Frumkin|Liaskos")
    add(2, "session-04", "Session_04_Lynch_Crouvi_20261007.jpg",
        "Session 04 · Lynch & Crouvi", pattern=r"Lynch|Crouvi")
    add(2, "session-04", "Session_04_Verga_Kostantinidou_20261007.jpg",
        "Session 04 · Verga & Kostantinidou", pattern=r"Verga|Kostantinidou")
    add(2, "posters", "Posters_20261007.jpg", "Poster presentations", pattern=r"Posters_0[1-5]_")
    add(2, "kefalea", "Kefalea_20261007.jpg", "Kefalea")
    add(2, "posters", "Posters_06_20261007.jpg", "Poster presentations", pattern=r"Posters_06_")
    add(2, "field-vr-lab", "Lab_Field_VR_20261007.jpg", "Field & VR lab")

    add(3, "apeiranthos", "Apeiranthos_20261008.jpg", "Apeiranthos", pattern=r"Apeiranthos_0[1-5]_")
    add(3, "museum", "Museum_20261008.jpg", "Museum")
    add(3, "museum-vr", "Museum_VR_20261008.jpg", "Museum · VR")
    add(3, "apeiranthos", "Apeiranthos_06_20261008.jpg", "Apeiranthos", pattern=r"Apeiranthos_06_")
    add(3, "flerio-kouros", "Flerio_Kouros_20261008.jpg", "Flerio & Kouros")
    add(3, "faneromeni", "Faneromeni_Wittenberg_20261008.jpg", "Faneromeni")
    add(3, "aplomata", "Aplomata_20261008.jpg", "Aplomata", pattern=r"Aplomata_0[12356]_")
    add(3, "aplomata", "Aplomata_04_20261008.jpg", "Aplomata", pattern=r"Aplomata_04_")

    add(4, "stelida", "Stelida_20261009.jpg", "Stelida")
    add(4, "agios-prokopios", "Agios_Prokopios_20261009.jpg", "Agios Prokopios")
    add(4, "pyrgaki", "Pyrgaki_01_20261009.jpg", "Pyrgaki")
    add(4, "alyko", "Alyko_20261009.jpg", "Alyko")
    add(4, "restaurant", "Restaurant_20261009.jpg", "Restaurant")

    # Input guards prevent a future source-manifest edit silently omitting photos.
    expected = {i["id"] for d in days for g in d["groups"] for i in g["items"] if i["kind"] == "photo"}
    selected = [p["id"] for theme in themes for p in theme["photos"]]
    if len(selected) != len(set(selected)) or set(selected) != expected:
        raise ValueError("Source theme mapping must include every original photo exactly once")
    return themes


def row_partitions(count: int):
    if count == 0:
        yield ()
    for first in (1, 2):
        if first <= count:
            for rest in row_partitions(count - first):
                yield (first,) + rest


def layout(photos: list[dict]) -> tuple[list[tuple[int, int, int, int]], float]:
    """Fit complete photos in balanced rows, using their exact aspect ratios."""
    ratios = [p["width"] / p["height"] for p in photos]
    usable_w, usable_h = WIDTH - 2 * MARGIN, HEIGHT - 2 * MARGIN
    best = None
    for partition in row_partitions(len(photos)):
        row_ratios, offset = [], 0
        for count in partition:
            row_ratios.append(ratios[offset:offset + count])
            offset += count
        caps = [(usable_w - GUTTER * (len(row) - 1)) / sum(row) for row in row_ratios]
        remaining = usable_h - GUTTER * (len(partition) - 1)
        heights = [0.0] * len(caps)
        pending = set(range(len(caps)))
        while pending:
            share = remaining / len(pending)
            capped = {i for i in pending if caps[i] <= share}
            if not capped:
                for i in pending:
                    heights[i] = share
                break
            for i in capped:
                heights[i] = caps[i]
                remaining -= caps[i]
            pending -= capped
        y = (HEIGHT - sum(heights) - GUTTER * (len(heights) - 1)) / 2
        rectangles = []
        for row, height in zip(row_ratios, heights):
            widths = [r * height for r in row]
            x = (WIDTH - sum(widths) - GUTTER * (len(row) - 1)) / 2
            for width in widths:
                rectangles.append((round(x), round(y), round(width), round(height)))
                x += width + GUTTER
            y += height + GUTTER
        areas = [w * h for _, _, w, h in rectangles]
        # Favour full, readable pages while avoiding one disproportionately tiny photo.
        fill = sum(areas) / (WIDTH * HEIGHT)
        score = fill + 0.08 * min(areas) / max(areas)
        if best is None or score > best[0]:
            best = score, rectangles, fill
    return best[1], best[2]


def pages_for(photos: list[dict]) -> list[list[dict]]:
    @functools.lru_cache(None)
    def choose(offset):
        if offset == len(photos):
            return 0.0, ()
        best = None
        for count in (2, 3, 4, 1):
            page = photos[offset:offset + count]
            if len(page) != count:
                continue
            if count == 4 and sum(p["width"] < p["height"] for p in page) < 3:
                continue
            _, fill = layout(page)
            future_cost, tail = choose(offset + count)
            cost = 0.65 + (1 - fill) * 0.5 + future_cost
            if count == 1 and len(photos) > 1:
                cost += 0.5
            if best is None or cost < best[0]:
                best = cost, (count,) + tail
        return best

    _, lengths = choose(0)
    pages, offset = [], 0
    for length in lengths:
        pages.append(photos[offset:offset + length])
        offset += length
    return pages


def write_collage(photos: list[dict], original: Path, display: Path, thumbnail: Path):
    rectangles, _ = layout(photos)
    sources, placements = [], []
    for photo, (x, y, width, height) in zip(photos, rectangles):
        path = PUBLIC / unquote(photo["original"]).lstrip("/")
        with Image.open(path) as opened:
            source = ImageOps.exif_transpose(opened).convert("RGB")
            resized = ImageOps.contain(source, (width, height), Image.Resampling.LANCZOS)
            sources.append(source)
            placements.append((resized, x + (width - resized.width) // 2,
                               y + (height - resized.height) // 2))

    if len(sources) == 1:
        backdrop_source = sources[0]
    else:
        # Compose the same photographs as the sharp layer. Fill vacant parts of
        # this temporary source with a photograph so dark padding cannot bleed
        # into the glass when the content is blurred and expanded to the frame.
        largest = max(range(len(placements)),
                      key=lambda i: placements[i][0].width * placements[i][0].height)
        backdrop_source = ImageOps.fit(sources[largest], (WIDTH, HEIGHT),
                                       method=Image.Resampling.LANCZOS)
        for resized, x, y in placements:
            backdrop_source.paste(resized, (x, y))
        bounds = (min(x for _, x, _ in placements),
                  min(y for _, _, y in placements),
                  max(x + image.width for image, x, _ in placements),
                  max(y + image.height for image, _, y in placements))
        backdrop_source = backdrop_source.crop(bounds)

    canvas = glass_background(backdrop_source, (WIDTH, HEIGHT))
    for resized, x, y in placements:
        canvas.paste(resized, (x, y))
    for path in (original, display, thumbnail):
        path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(original, "JPEG", quality=95, subsampling=0, optimize=True)
    canvas.save(display, "WEBP", quality=88, method=6)
    canvas.thumbnail((360, 640), Image.Resampling.LANCZOS)
    canvas.save(thumbnail, "WEBP", quality=84, method=6)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--work-dir", required=True, type=Path)
    parser.add_argument("--zip", required=True, type=Path, dest="zip_path")
    args = parser.parse_args()
    source = MANIFEST.read_text(encoding="utf-8")
    match = re.search(DAY_PATTERN, source, re.S)
    if not match:
        raise ValueError("Could not locate workshopGalleryDays in gallery manifest")
    days = json.loads(match.group(1))
    for day in days:
        for group in day["groups"]:
            group["items"] = [i for i in group["items"] if not i["id"].startswith("mobile-")]
    sequence, insertions = [], {}
    for theme in source_themes(days):
        day = theme["day"]
        pages = pages_for(theme["photos"])
        base = slug(Path(theme["oldCollage"]).stem)
        new_items = []
        for page_no, photos in enumerate(pages, 1):
            media_id = f"mobile-{base}-{page_no:02d}"
            filename = f"{base}_mobile_{page_no:02d}.jpg"
            stem = f"mobile/{{variant}}/{day['id']}/{media_id}"
            original = GALLERY / f"mobile/originals/{day['id']}/{filename}"
            display = GALLERY / f"{stem.format(variant='display')}.webp"
            thumbnail = GALLERY / f"{stem.format(variant='thumbnails')}.webp"
            write_collage(photos, original, display, thumbnail)
            title = f"{theme['title']} · Mobile (9:16)"
            if len(pages) > 1:
                title += f" · {page_no}/{len(pages)}"
            url = lambda p: "/" + quote(p.relative_to(PUBLIC).as_posix(), safe="/")
            new_items.append(dict(id=media_id, kind="collage", variant="mobile", title=title, filename=filename,
                                  src=url(display), thumbnail=url(thumbnail), original=url(original),
                                  bytes=original.stat().st_size, width=WIDTH, height=HEIGHT))
            sequence.append(dict(path=str(original.resolve()), filename=filename, day=day["date"],
                                 title=title, groupId=theme["groupId"],
                                 sourcePhotoIds=[p["id"] for p in photos]))
        key = day["id"], theme["groupId"], theme["oldCollage"]
        insertions[key] = new_items
        print(f"Prepared {day['date']} / {theme['title']}: {len(pages)} portrait page(s)", flush=True)

    for day in days:
        for group in day["groups"]:
            items = []
            for item in group["items"]:
                items.append(item)
                items.extend(insertions.pop((day["id"], group["id"], item["filename"]), []))
            for key in list(insertions):
                if key[:2] == (day["id"], group["id"]):
                    items.extend(insertions.pop(key))
            group["items"] = items

    # Re-read to preserve unrelated edits, including the separately managed videos.
    current = MANIFEST.read_text(encoding="utf-8")
    current_match = re.search(DAY_PATTERN, current, re.S)
    MANIFEST.write_text(current[:current_match.start(1)] + json.dumps(days, ensure_ascii=False, indent=2)
                        + current[current_match.end(1):], encoding="utf-8")
    args.work_dir.mkdir(parents=True, exist_ok=True)
    sequence_path = args.work_dir / "sequence.json"
    sequence_path.write_text(json.dumps(dict(width=WIDTH, height=HEIGHT, collages=sequence),
                                        ensure_ascii=False, indent=2), encoding="utf-8")
    args.zip_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.zip_path, "w", compression=zipfile.ZIP_STORED) as bundle:
        for item in sequence:
            bundle.write(item["path"], f"{item['day']}/{item['filename']}")
    print(f"Created {len(sequence)} portrait collages, sequence: {sequence_path}, ZIP: {args.zip_path}", flush=True)


if __name__ == "__main__":
    main()
