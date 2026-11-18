window.SITE = {
  nome: "Samur",

  whatsapp: {
    numero: "966500000000", // digits only, with country code. Placeholder until the real number is set.
    mensagem: "Hello Samur, I would like to plan a safari.",
  },

  contato: {
    email: "hello@samur.sa", // placeholder inbox; the first FormSubmit message asks this address to activate
    // Optional: Web3Forms key (https://web3forms.com). Empty = FormSubmit.
    web3formsChave: "",
    assunto: "New enquiry from the Samur website",
  },

  frames: {
    total: 160,
    desktop: "assets/frames/desktop/f_film_{n}.webp",
    mobile: "assets/frames/mobile/f_film_{n}.webp",
  },

  // Chapter films: 64 frames each, generated from the chapter photographs (see CREDITS.md), loaded as you approach.
  filmes: {
    lion:    { total: 64, desktop: "assets/capitulos/desktop/f_lion_{n}.webp",    mobile: "assets/capitulos/mobile/f_lion_{n}.webp" },
    vehicle: { total: 64, desktop: "assets/capitulos/desktop/f_vehicle_{n}.webp", mobile: "assets/capitulos/mobile/f_vehicle_{n}.webp" },
    crater:  { total: 64, desktop: "assets/capitulos/desktop/f_crater_{n}.webp",  mobile: "assets/capitulos/mobile/f_crater_{n}.webp" },
    balloon: { total: 64, desktop: "assets/capitulos/desktop/f_balloon_{n}.webp", mobile: "assets/capitulos/mobile/f_balloon_{n}.webp" },
    sunrise: { total: 64, desktop: "assets/capitulos/desktop/f_sunrise_{n}.webp", mobile: "assets/capitulos/mobile/f_sunrise_{n}.webp" },
    nungwi:  { total: 64, desktop: "assets/capitulos/desktop/f_nungwi_{n}.webp",  mobile: "assets/capitulos/mobile/f_nungwi_{n}.webp" },
    caravan:   { total: 64, desktop: "assets/capitulos/desktop/f_caravan_{n}.webp",   mobile: "assets/capitulos/mobile/f_caravan_{n}.webp" },
    elephants: { total: 64, desktop: "assets/capitulos/desktop/f_elephants_{n}.webp", mobile: "assets/capitulos/mobile/f_elephants_{n}.webp" },
    camp:      { total: 64, desktop: "assets/capitulos/desktop/f_camp_{n}.webp",      mobile: "assets/capitulos/mobile/f_camp_{n}.webp" },
    stonetown: { total: 64, desktop: "assets/capitulos/desktop/f_stonetown_{n}.webp", mobile: "assets/capitulos/mobile/f_stonetown_{n}.webp" },
  },

  // The acacia hero film (Daniel Case, Maasai Mara at sunset): the frames are a slow push into the photo;
  // the canopy is a separate cut-out layer placed over the title using this geometry. Units are pixels of
  // the original photograph; "hero" is the 16:9 desktop crop, "heroCelular" the 3:4 phone crop.
  hero: {
    largura: 6200, altura: 3487,
    corte: { x: 950, y: 726, w: 3400, h: 1700 },
    ancora: { x: 2230, y: 3726 },
    zoom: 0.07, extra: 0.0, desloc: 76,
  },
  heroCelular: {
    largura: 2616, altura: 3487,
    corte: { x: -442, y: 726, w: 3400, h: 1700 },
    ancora: { x: 838, y: 3726 },
    zoom: 0.07, extra: 0.0, desloc: 93,
  },
};
