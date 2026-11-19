# Healthy Pretty: direction board (luxury, fresh)

Date: 2026-11-19. Job: shop site with a skin quiz for a pharmacist-led dermocosmetic store in HCMC.

## Frame

People cannot get the pharmacist's judgement on the old web store. So they compare prices on Shopee or leave. The site has to put that judgement on the page. The look should say "clean pharmacy shelf", not "beauty ad".

## References (patterns only, nothing copied)

| Source | What we take | What we leave |
|---|---|---|
| Garoa Skincare (Awwwards SOTD) | A full-bleed visual inside a rounded inset frame. A large centred serif headline with one italic phrase. A small pill button. | The warm brown palette, their photos and copy. |
| Surratt Beauty (Awwwards HM, e-commerce) | Product grid that sits next to the story, not three clicks away. | Black-and-white luxury tone. |
| MOOI clinic (Awwwards nominee) | Calm clinic tone, lots of air, small type for detail. | Clinic booking flow. |
| Cosmos "fresh clinical" board (10 images, measured) | Palette below. Motifs: glass ampoules, gel textures, sea-glass jars, water drops, petri dishes, a steel tray still life. | All images. They are reference only. |

## Measured palette (Cosmos board, 48 px renders)

`#E6E6E7` off-white 44%, `#B5B9A8` muted lime 19%, `#E4EED7` pale lime 14%, `#757864` olive grey 11%, `#7A91A2` sea-glass blue 5%, `#2B3528` deep green 4%, `#4A531E` moss 2%.

## New idea: the pharmacist's tray

The quiz result is not a product list. It is a tray, like the steel tray a pharmacist lays products on at the counter. Morning sits on one side and evening on the other. Each product sits in its slot in order of use, with a short note in the pharmacist's voice: why this one, when to use it. When two actives must not meet, the tray shows them in one slot with "tối này / tối sau". The tray is the brand moment. It shows up small in the hero and full size after the quiz.

## Tokens

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--bg` | `#F4F5F0` | Page | |
| `--surface` | `#E9EEE1` | Pale lime panels | |
| `--steel` | `#DFE1DC` → `#ECEDE9` | Tray gradient | |
| `--ink` | `#25301F` | Text | 12.6:1 on `--bg` |
| `--ink-2` | `#566050` | Secondary text | 6.0:1 on `--bg` |
| `--line` | `#C9CDBF` | Hairlines | |
| `--glass` | `#7A91A2` | Decoration only, never text | |
| `--accent` | `#3F4A17` moss | The one accent: primary buttons, the active quiz step | White text 9.5:1 |

Type: Cormorant Garamond 500 (roman and italic) for display, 44 to 96 px. Be Vietnam Pro 400/500/600 for text, 15 to 17 px. Both have the Vietnamese subset (checked on Google Fonts, 2026-11-19).

Shape: 28 px radius on frames, 18 px on cards, pills for buttons. Hairline borders, no heavy shadows. Motion: cards lift 2 px, photos zoom 1.03, tray items rise in with a 60 ms stagger. All motion off under `prefers-reduced-motion`.

Wordmark: "Healthy Pretty" set in Cormorant Garamond italic. No drawn logo.

## Never

No tracked-caps eyebrows, no purple gradient, no carousel, no card in a card, no row of three equal icon cards, no AI faces, no invented numbers. No claim past the product label.
