# Samur · homepage spec (as built)

## Brief
A single-page site for **Samur**, a Saudi company selling East African safaris to Saudi travellers. Samur (سمر) is the Arabic name of the umbrella acacia, so the acacia is the symbol of the page: the hero title rises behind a lion asleep on an acacia branch, the emblem is an acacia in a double ring, and the closing section is an acacia at sunset.
Aesthetic: quiet nature magazine, visually heavy. Paper `#ECE3D1` / `#E6DCC8`, ink `#43282A`, rust `#A86438`, hairlines ink 16%. Bodoni Moda 500 (opsz 11) for display, Inter for labels and body, Noto Naskh Arabic for Arabic accents. Fixed fractal-noise grain, multiply, 38%.

## Media
All real photographs from Wikimedia Commons, resized to 1600–2600px, listed with licences in `CREDITS.md`. Hero: a male lion asleep on a branch (Salix Oculus, CC BY-SA 4.0), cropped to 2600×1373; the lion-and-branch cut-out (`assets/hero-lion-cutout.webp`, sky keyed out, twigs removed) sits at top 10.85%, full width, so the title rises behind the mane.

## Sections
1. **Hero** (100svh). Stage `max(100vw, 180.3svh)` wide, photo settles 1.06→1 over 2.2s. Nav: wordmark "Samur سمر" left, five links right, all paper-coloured. Eyebrow "AFRICAN SAFARIS · FROM THE KINGDOM", title "SAMUR" at 13.2cqw in paper, letters rising .18em out of 10px blur 95ms apart; the acacia cut-out covers the lower half. Pill "SEE THE JOURNEYS" bottom centre; one-line brand sentence bottom left. On scroll the stage drifts .32×, the photo and cut-out blur to 6px, and a paper gradient melts the bottom (full opacity by ~17% scrolled).
2. **Intro** (100svh, centred). Label "UNDER THE ACACIA · تحت شجرة السمر". Statement "FROM ● RIYADH / TO THE ● SERENGETI / IN A DAY" with lion and zebra photo pills, acacia emblem, 52ch paragraph on the Saudi-specific promise.
3. **The cast** (pinned 260svh). Heading "THE CAST", a rail of seven 2:3 cards (lion, zebra, elephant, giraffe, leopard, cheetah, wildebeest) with English and Arabic names, translated horizontally by scroll progress while the stage is pinned; even cards sit 48px lower. Phone: a scroll-snap rail.
4. **How we travel.** Three 3:4 photos (bush airstrip, open vehicle, dhow) with "BY AIR / OPEN VEHICLE / BY THE SEA".
5. **The journeys** (darker paper). Five alternating 7/5 rows, each with a 4:3 photo (wipe reveal + parallax), number and season, title, route, paragraph, four facts, price from SAR and an Enquire pill: The Great Migration (8d, SAR 29,500), Bush & Zanzibar (10d, 34,900), The Flying Safari (7d, 38,500), Family under the acacia (9d, 31,500 adult / 18,900 child), The Private Kingdom (12d, 68,000).
6. **Stays.** "LUXURY, THEN MORE LUXURY" and a 12-column grid of four photos labelled by tier and place.
7. **The Samur way** (100svh). "MADE FOR THE KINGDOM", play badge, paragraph, facts table (flights, guides, kitchen, prayer, visas, best months), lion portrait.
8. **Plan** (100svh, dark). Sunset acacia with scrim, "PLAN YOUR SAFARI" in paper, WhatsApp and email pills, Arabic line, footer with links and photo credits.

## Motion rules
Every section reveals once at 22% visibility: letters climb from .55em with a 4° tilt (22–40ms apart), blocks rise 22px, photos wipe up with `clip-path` while settling from scale 1.18, table rows fade one by one. Images drift ±7% with scroll. Reduced motion shows final states.
