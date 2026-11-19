# Prompt pack: Healthy Pretty photos and video loops

For ChatGPT (image), Grok, Sora or Veo. Tai generates the files. No people in any shot: the site never shows AI faces, hands or customers. The pharmacist photo (home page, "ThS. Dược sĩ" block) must be a real photo of the real pharmacist.

Look of every shot: the direction board in `docs/healthypretty_board_luxury-fresh_20261119.md`. Pale lime and off-white, brushed steel, glass, moss green `#3F4A17` on one small object at most.

Base style block (paste into each prompt where it says "base style"):

```
Product still life, 100mm macro or 50mm lens, on brushed steel and pale off-white stone (#F4F5F0). Soft daylight from one large window on the left; the right edge falls to a pale grey shadow. Lots of empty space. Neutral white balance, whites stay white. Colours: off-white, pale lime #E4EED7, muted olive grey, sea-glass blue #7A91A2 on glass only.
```

Negative list for every prompt:

```
no people, no faces, no hands, no text, no letters, no labels with words, no brand names, no logos, no watermark, no flowers petals scattered, no gold, no pink, no purple
```

Where files go: save as WebP, under 300 KB, in `public/media/`. That folder is not in git (media rule); keep the masters in the Google Drive folder for this project.

## Images

### HP-01: home hero, desktop and phone
Aspect ratio: 16:9 for desktop, plus a 4:5 crop for phone.

> Medium: 50mm lens product still life, base style. Scene: a shallow brushed-steel pharmacy tray on pale stone, early morning. Subject: in the tray, five unbranded skincare containers stand in a row by height: a frosted glass pump bottle, a clear dropper ampoule, a small white tube lying flat, a sea-glass blue jar with its lid off showing white cream, and a matte white sunscreen tube; one small moss green #3F4A17 ceramic dish holds the jar lid. Light: one large window on the left, soft shadows fall to the right. Composition: camera at 30 degrees above the tray, tray in the right two thirds, the left third is empty pale stone for the headline. Flaw: one faint water stain and fine scratches on the steel near the dropper. Colour: neutral white balance, whites stay white. Constraints: no people, no hands, no text, no letters, no labels with words, no brand names, no logos, no watermark; 16:9.

Text overlay (added in code): the hero headline "Đúng sản phẩm, đúng làn da". AI label needed: no on the website; yes if used in a Meta or TikTok ad.

### HP-02: need card "Da dầu & mụn"
Aspect ratio: 4:3.

> Medium: 100mm macro lens, base style. Scene: pale stone surface. Subject: a clear gel cleanser drop spread in a short swipe, with a few tiny air bubbles inside the gel, next to a frosted glass pump bottle with no label. Light: one window on the left, the gel edges catch a thin bright line. Composition: from above, swipe in the lower right corner, empty upper half. Flaw: a little dust on the stone beside the gel. Colour: neutral white balance, whites stay white. Constraints: no people, no hands, no text, no labels with words, no logos, no watermark; 4:3.

### HP-03: need card "Phục hồi da"
Aspect ratio: 4:3.

> Medium: 100mm macro lens, base style. Scene: brushed steel surface. Subject: a thick white cream with a single soft peak, scooped onto a small steel spatula that rests on the rim of an open sea-glass blue jar. Light: one window on the left, gentle shadow inside the jar. Composition: high angle, jar off-centre to the right, empty left half. Flaw: a small smudge of cream on the outside of the jar rim. Colour: neutral white balance, whites stay white. Constraints: no people, no hands, no text, no labels with words, no logos, no watermark; 4:3.

### HP-04: need card "Thâm sạm & dưỡng sáng"
Aspect ratio: 4:3.

> Medium: 100mm macro lens, base style. Scene: pale stone. Subject: a clear glass dropper ampoule lying on its side, one drop of pale straw-coloured serum on the stone in front of it. Light: low window light from the left, the drop throws a small bright caustic onto the stone. Composition: low angle, ampoule along the bottom third, wide empty space above. Flaw: a fingerprint smudge on the ampoule glass. Colour: neutral white balance, whites stay white. Constraints: no people, no hands, no text, no labels with words, no logos, no watermark; 4:3.

### HP-05: need card "Chống lão hóa"
Aspect ratio: 4:3.

> Medium: 50mm lens, base style. Scene: brushed steel tray. Subject: one amber glass bottle with a black dropper standing next to a folded white cotton cloth. Light: evening window light from the left, warm but neutral white balance, the right side falls to pale grey. Composition: straight-on at tray level, bottle at the right third. Flaw: the cloth is creased and has one frayed corner. Colour: neutral white balance, whites stay white. Constraints: no people, no hands, no text, no labels with words, no logos, no watermark; 4:3.

### HP-06: need card "Sau liệu trình"
Aspect ratio: 4:3.

> Medium: 100mm macro lens, base style. Scene: pale stone with a sheet of clear glass laid on it. Subject: a thin layer of translucent soothing gel spread on the glass, with a small white tube lying beside it, cap off. Light: one window on the left, the gel shows soft ripples. Composition: from above, tube diagonal from the lower left corner. Flaw: a fingerprint on the glass sheet at one edge of the gel. Colour: neutral white balance, whites stay white. Constraints: no people, no hands, no text, no labels with words, no logos, no watermark; 4:3.

### HP-07: need card "Tóc & cơ thể"
Aspect ratio: 4:3.

> Medium: 50mm lens, base style. Scene: a white tiled bathroom ledge in morning light. Subject: a tall unbranded pump bottle and a folded pale lime towel, with a few water drops on the tile. Light: frosted window on the left. Composition: eye level with the ledge, bottle at the left third, towel on the right. Flaw: condensation on the bottle, with one drop run down its side. Colour: neutral white balance, whites stay white. Constraints: no people, no hands, no text, no labels with words, no logos, no watermark; 4:3.

### HP-08: Zalo and consult block background
Aspect ratio: 16:10.

> Medium: 35mm lens, base style. Scene: a clean pharmacy counter of pale stone, a closed paper notebook and a steel pen on it, softly out of focus shelves of white bottles behind. Subject: the notebook and pen in sharp focus. Light: daylight from a shop window on the left. Composition: counter edge along the bottom, notebook at the right third, left half empty for text. Flaw: the notebook corner is worn and slightly creased. Colour: neutral white balance, whites stay white. Constraints: no people, no hands, no text, no letters on the notebook, no labels with words, no logos, no watermark; 16:10.

## Video loops

Short, silent, loopable. Export MP4 (H.264) and WebM, 6 to 8 seconds, under 2 MB, 1920x1080 and 1080x1350. Keep the files in Drive; do not commit them.

### V-01: hero loop (replaces HP-01 on fast connections)
- Shot 1 (0 to 4 s): locked-off camera on the HP-01 tray; daylight from the left drifts slowly across the steel as if a cloud passes.
- Shot 2 (4 to 7 s): same frame; one drop falls from the dropper ampoule into the moss green dish, small ripple.
- Medium: 50mm lens, fine grain, neutral white balance. Style: base style block.
- Loop: the last frame matches the first; the light returns to its start.
- Avoid: the negative list, no on-screen text, no camera shake.

### V-02: texture loop for the quiz result header
- Shot 1 (0 to 3 s): macro, top-down; a white cream peak slowly settles on brushed steel.
- Shot 2 (3 to 6 s): a clear gel drop spreads in a short line beside it.
- Medium: 100mm macro, neutral white balance. Style: base style block.
- Avoid: the negative list, no on-screen text.

## After generation

1. Make 2 to 4 images per prompt and pick one.
2. Zoom to 100% on edges and anything that touches a surface. Remove any letters the model added to bottles.
3. Check that shadows fall to the right in every shot, so the set reads as one shelf.
4. Fix a yellow tint before export.
5. Run the lint on this file after any edit: `python check_prompt.py docs/prompt-pack.md --blocks` (the script is in the tai-design skill).
