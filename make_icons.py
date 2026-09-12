from PIL import Image, ImageDraw

TEAL = (11, 93, 82, 255)      # #0B5D52
WHITE = (255, 255, 255, 255)


def draw_mark(draw, cx, cy, scale):
    """A simple 'index card with a captured check' mark, centered at (cx, cy)."""
    card_w, card_h = 0.62 * scale, 0.46 * scale
    x0, y0 = cx - card_w / 2, cy - card_h / 2
    x1, y1 = cx + card_w / 2, cy + card_h / 2
    corner = 0.05 * scale

    # the card
    draw.rounded_rectangle([x0, y0, x1, y1], radius=corner, fill=WHITE)

    # three lines of "notes" on the card
    line_x0 = x0 + 0.10 * scale
    line_x1_full = x1 - 0.10 * scale
    line_x1_short = x1 - 0.22 * scale
    line_h = 0.045 * scale
    gaps = [0.14, 0.22, 0.30]
    for i, g in enumerate(gaps):
        ly = y0 + g * scale
        lx1 = line_x1_short if i == len(gaps) - 1 else line_x1_full
        draw.rounded_rectangle([line_x0, ly, lx1, ly + line_h], radius=line_h / 2, fill=TEAL)

    # a small "captured" disc with a check, bottom-right of the card, slightly overlapping
    disc_r = 0.145 * scale
    disc_cx, disc_cy = x1 - disc_r * 0.6, y1 - disc_r * 0.6
    draw.ellipse(
        [disc_cx - disc_r, disc_cy - disc_r, disc_cx + disc_r, disc_cy + disc_r],
        fill=TEAL
    )
    # checkmark
    check_w = disc_r * 0.9
    p1 = (disc_cx - check_w * 0.5, disc_cy)
    p2 = (disc_cx - check_w * 0.12, disc_cy + check_w * 0.45)
    p3 = (disc_cx + check_w * 0.55, disc_cy - check_w * 0.4)
    line_width = max(2, int(scale * 0.03))
    draw.line([p1, p2], fill=WHITE, width=line_width)
    draw.line([p2, p3], fill=WHITE, width=line_width)


def make_icon(path, size, maskable=False):
    img = Image.new('RGBA', (size, size), TEAL)
    draw = ImageDraw.Draw(img)
    if maskable:
        # keep the mark inside the ~66% safe zone or an adaptive mask may crop it
        draw_mark(draw, size / 2, size / 2, size * 0.60)
    else:
        draw_mark(draw, size / 2, size / 2, size * 0.86)
    img.save(path)


make_icon('icons/icon-192.png', 192, maskable=False)
make_icon('icons/icon-512.png', 512, maskable=False)
make_icon('icons/icon-maskable-512.png', 512, maskable=True)
print('icons written')
