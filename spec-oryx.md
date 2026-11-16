# Samur · "Oryx" editorial species page

## 0. Brief
Build three stacked full-viewport sections of a species page for **Samur**, a Saudi safari brand, for travellers deciding whether a desert safari is worth a week of their life. Plain HTML, CSS and vanilla JS; no framework, no build step.
Aesthetic: quiet nature magazine. Warm cream paper, deep brown-plum Didone capitals, small rust caps labels, documentary photography.
Signature idea: the hero title ORYX rises letter by letter *behind* a cut-out oryx whose horns overlap the lower third of the letters; on the first scroll the photo blurs and melts into the paper.
Fidelity: build exactly as specified; add nothing not listed here.

## 1. Stack & files
`samur-site/index.html` (inline CSS and JS) + `samur-site/assets/` (five images). Google Fonts only. Icons: inline SVG.

## 2. Fonts
| Role | Family | Weights/style | Used on |
|---|---|---|---|
| Display | Bodoni Moda (variable) | 500, `font-variation-settings:"opsz" 11`, uppercase | hero title, statement, facts title, wordmark |
| Labels/body | Inter | 400 / 500 / 600 | labels (600 10.5px .2em caps), body 13.4px, nav |
Load: `https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500&family=Inter:wght@400;500;600&display=swap`. Fallback: `"Bodoni 72", Didot, Georgia, serif` / `system-ui, sans-serif`.

## 3. Colour tokens
```css
:root{
  --paper:#ECE3D1; --paper-2:#E6DCC8; --ink:#43282A;
  --body:rgba(67,40,42,.72); --rust:#A86438; --line:rgba(67,40,42,.16);
}
html,body{background:var(--paper);color:var(--ink)}
```
Grain: fixed SVG fractal noise (baseFrequency .9, 4 octaves, 200px tile), `mix-blend-mode:multiply`, opacity .38, z 100, pointer-events none.

## 4. Assets
| Slot | File | Size | Fit & focal point |
|---|---|---|---|
| hero photo | `assets/hero.jpg` | 2720×1536 (ratio 2688:1520 ≈ 1.7684) | object-fit cover; oryx lower-centre-left, dunes mid, hazy sky top third |
| oryx cut-out | `assets/cutout.webp` (`cutout.png` fallback) | 829×779, alpha | in the photo's frame: left 21.95%, top 32.75%, width 30.48% |
| pill 1 | `assets/pill-herd.jpg` | 1600² | herd under a ghaf tree |
| pill 2 | `assets/pill-sunset.jpg` | 1600² | mother and calf at sunset |
| portrait | `assets/portrait.jpg` | 1664×2496 (2:3) | oryx head in profile, horns up |

## 5. Hero (100svh)
- Stage: `width:max(100vw, 176.84svh); aspect-ratio:2688/1520; container-type:inline-size`, centred, `overflow:hidden` on the section. Layers: photo (z1) → title block (z2) → cut-out (z3) → paper gradient (z4) → pill (z3, under the gradient) → nav (z6).
- Title block: `top:21%`, centred. Eyebrow "ORYX LEUCORYX" (label style, .66cqw, paper colour at 92%). Title "ORYX" 10.4cqw, line-height .8, tracking .01em, ink.
- Nav: left two-line menu icon + MENU; centre "Samur" Bodoni 19px over "SAUDI SAFARI" 7.5px .32em; right search icon + SEARCH. All ink at 100 on the hazy sky; label style 10.5px .2em.
- Map pill: bottom centre 5.5%, cream pill `padding 9px 16px 9px 9px`, radius 999px, round rust pin icon 26px, "SEE ON MAP" label, arrow.
- Load: photo scale 1.06→1 over 2.2s `cubic-bezier(.22,1,.36,1)`; eyebrow and nav fade down 12px over .9s at .25s; ORYX letters rise .18em out of blur 10px, 1.1s, `delay = .45 + i×.095s`; pill rises at 1.05s.
- Scroll (p = scrollY / vh, clamped): stage `translateY(scrollY×.32)`; gradient height `34% + 66%×min(1,p/.6)`, opacity `min(1,p/.6)`; photo and cut-out `blur(6px×min(1,p/.6))`.

## 6. Statement (100svh, centred)
Label rust "THE ORYX IN ARABIA". Three lines Bodoni `clamp(40px,7.2vw,132px)`, line-height 1.06: "BACK ● FROM / EXTINCTION ● IN / THE WILD", each ● a .86em round photo pill inline (pill-herd, pill-sunset). Emblem below: 66px rust double ring with an oryx head. Reveal at 35% visible: letters from `translateY(.55em) rotate(4deg)`, .9s, `delay = i×26ms` in reading order; pills from scale 0 with overshoot `cubic-bezier(.34,1.56,.64,1)` 1s, image scale 1.5→1 1.4s; emblem from `rotate(-90deg) scale(.6)` 1.1s.

## 7. Quick facts (100svh)
1180px column, hairline on top, grid `1.12fr 1.12fr .96fr`, gap 56px, padding 48px 0.
- Left: rust label "ORYX"; "QUICK / FACTS / ABOUT / ORYX" Bodoni `clamp(34px,4.25vw,66px)` line-height .96; 84px play badge (48 radial ticks, rotating 16s linear, play triangle); caption "7 MINUTES".
- Middle: 13.4px/1.65 paragraph (body ink 72%); facts table with hairlines, label ink / value rust right-aligned: Habitat · Gravel plains and sand desert; Scientific name · Oryx leucoryx; Shoulder height · About 1 metre; IUCN status · Vulnerable.
- Right: portrait frame 2:3, image parallax ±7% of frame height across the viewport.
- Reveal: title letters as statement, 30ms; paragraph then table rise 22px (`delay .25 + i×.12s`); rows fade `delay .55 + i×.1s`; portrait `clip-path: inset(100% 0 0 0)→inset(0)` 1.2s while image scale 1.25→1 1.6s.

## 8. Recorder mode (`?rec=1`)
Body fixed, `#page` translated by a 6.5s Web Animation: hold to 1.95s, glide to section 2 by 3.35s, hold to 4.25s, glide to section 3 by 5.55s, hold. Reveals at 0, 2.65s, 4.85s. rAF loop reads the page transform and feeds the same scroll effects.

## 9. Phone (≤760px)
Nav icons only. Hero title top 17%, 15.6vw. Statement 8.6vw. Facts one column, title 12vw, portrait full width. `overflow-x:clip` on html/body.

## 10. Acceptance (1440×960)
On load the oryx stands in the grass and ORYX rises letter by letter behind its horns. First scroll: photo blurs and melts into cream; statement climbs in letter by letter with the two round photos popping into the gaps. Second scroll: facts title climbs in, table fades up, portrait wipes in, badge keeps turning. No real brands or logos other than the Samur wordmark.
