"""Shared closing photograph, acknowledgement and easing for both film formats."""

from functools import lru_cache
from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont, ImageOps

from workshop_glass import glass_background


CLOSING_DURATION = 5.8
CLOSING_DISSOLVE = 0.8
FPS = 30
PUBLIC = Path(__file__).resolve().parents[1] / "public"
GROUP_PHOTO = PUBLIC / "workshop-gallery" / "originals" / "Day 1 - 06 Oct" / "Laguna_06_20261006.jpg"
WHITE = (255, 255, 255, 255)
YELLOW = (241, 193, 0, 255)
BLUE = (30, 115, 190, 255)


def _ease(value):
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


@lru_cache(maxsize=2)
def _assets(size):
    with Image.open(GROUP_PHOTO) as source:
        photograph = ImageOps.exif_transpose(source).convert("RGB")
    black = Image.new("RGB", size, "black")
    backdrop = glass_background(photograph, size)
    # Preserve every person in the group photograph in both aspect ratios.
    photo = ImageOps.contain(photograph, size, method=Image.Resampling.LANCZOS)
    portrait = size[1] > size[0]
    photo = Image.blend(photo, Image.new("RGB", photo.size, "black"), 0.22 if portrait else 0.60)
    photo_top = 300 if portrait else (size[1] - photo.height) // 2
    backdrop.paste(photo, ((size[0] - photo.width) // 2, photo_top))

    lettering = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(lettering)

    def centered(value, top, font_size, colour=WHITE, serif=True):
        face = ImageFont.truetype("C:/Windows/Fonts/BASKVILL.TTF" if serif else "C:/Windows/Fonts/segoeui.ttf", font_size)
        baseline = top - face.getbbox(value, anchor="ls")[1]
        x = (size[0] - draw.textlength(value, font=face)) / 2
        draw.text((x, baseline + 2), value, font=face, anchor="ls", fill=(0, 0, 0, 175),
                  stroke_width=2, stroke_fill=(0, 0, 0, 130))
        draw.text((x, baseline), value, font=face, anchor="ls", fill=colour,
                  stroke_width=1, stroke_fill=colour)

    if portrait:
        centered("Our sincere thanks", 1240, 76, YELLOW)
        centered("to everyone who contributed", 1363, 49)
        centered("to the success of", 1442, 49)
        centered("the workshop.", 1521, 49)
        draw.line((458, 1650, 622, 1650), fill=BLUE, width=3)
    else:
        centered("Our sincere thanks", 366, 87, YELLOW)
        centered("to everyone who contributed", 510, 65)
        centered("to the success of the workshop.", 605, 65)
        draw.line((862, 740, 1058, 740), fill=BLUE, width=3)
    return backdrop, lettering, black


def closing_frame(size, t):
    """One RGB frame; the callers supply the dissolve from the preceding photo."""
    background, lettering, black = _assets(tuple(size))
    opacity = _ease((t - 0.30) / 0.75) * _ease((5.25 - t) / 0.70)
    if opacity > 0:
        overlay = lettering.copy()
        overlay.putalpha(lettering.getchannel("A").point(lambda value: round(value * opacity)))
        frame = Image.alpha_composite(background.convert("RGBA"), overlay).convert("RGB")
    else:
        frame = background
    fade = _ease((CLOSING_DURATION - 1 / FPS - t) / 1.0)
    return Image.blend(black, frame, fade) if fade < 1 else frame.copy()


def render_closing_clip(size, work_dir):
    """Prepare the silent closing segment used by the landscape FFmpeg graph."""
    work_dir = Path(work_dir).resolve()
    work_dir.mkdir(parents=True, exist_ok=True)
    output = work_dir / "closing.mp4"
    log_path = work_dir / "closing-render.log"
    command = ["ffmpeg", "-hide_banner", "-loglevel", "warning", "-y",
               "-f", "rawvideo", "-pixel_format", "rgb24", "-video_size", f"{size[0]}x{size[1]}",
               "-framerate", str(FPS), "-i", "pipe:0", "-an", "-vf", "setsar=1,format=yuv420p",
               "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-threads", "4", str(output)]
    print("Preparing the closing photograph and acknowledgement", flush=True)
    with log_path.open("w", encoding="utf-8") as log:
        process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=log)
        try:
            for frame in range(round(CLOSING_DURATION * FPS)):
                process.stdin.write(closing_frame(size, frame / FPS).tobytes())
        except BrokenPipeError:
            process.wait()
            raise RuntimeError(log_path.read_text(encoding="utf-8")[-4000:])
        finally:
            process.stdin.close()
        if process.wait() != 0:
            raise RuntimeError(log_path.read_text(encoding="utf-8")[-4000:])
    return output
