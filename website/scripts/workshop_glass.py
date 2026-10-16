"""Photo-derived frosted backdrops for collage padding in both film formats."""

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


def glass_background(image, size):
    """Fill the canvas with a soft enlargement of its own photographic content."""
    background = ImageOps.fit(image.convert("RGB"), tuple(size), method=Image.Resampling.LANCZOS)
    background = background.filter(ImageFilter.GaussianBlur(radius=min(size) * 0.04))
    background = ImageEnhance.Color(background).enhance(0.92)
    background = ImageEnhance.Brightness(background).enhance(0.78)
    # A very light cool veil gives the blur the soft glass finish of the reference.
    return Image.blend(background, Image.new("RGB", tuple(size), (218, 227, 235)), 0.035)
