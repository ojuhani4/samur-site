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

  video: { desktop: "assets/video/opening.mp4", mobile: "assets/video/opening-720.mp4" },

  // Chapter films: 64 frames each, generated from the chapter photographs (see CREDITS.md), loaded as you approach.
  filmes: {
    lion: { desktop: "assets/video/lion.mp4", mobile: "assets/video/lion-720.mp4" },
    vehicle: { desktop: "assets/video/vehicle.mp4", mobile: "assets/video/vehicle-720.mp4" },
    crater: { desktop: "assets/video/crater.mp4", mobile: "assets/video/crater-720.mp4" },
    balloon: { desktop: "assets/video/balloon.mp4", mobile: "assets/video/balloon-720.mp4" },
    sunrise: { desktop: "assets/video/sunrise.mp4", mobile: "assets/video/sunrise-720.mp4" },
    nungwi: { desktop: "assets/video/nungwi.mp4", mobile: "assets/video/nungwi-720.mp4" },
    caravan: { desktop: "assets/video/caravan.mp4", mobile: "assets/video/caravan-720.mp4" },
    elephants: { desktop: "assets/video/elephants.mp4", mobile: "assets/video/elephants-720.mp4" },
    camp: { desktop: "assets/video/camp.mp4", mobile: "assets/video/camp-720.mp4" },
  },

  // The acacia hero film (Daniel Case, Maasai Mara at sunset): the frames are a slow push into the photo;
  // the canopy is a separate cut-out layer placed over the title using this geometry. Units are pixels of
  // the original photograph; "hero" is the 16:9 desktop crop, "heroCelular" the 3:4 phone crop.
  hero: {
    largura: 6200, altura: 3487,
    corte: { x: 950, y: 726, w: 3400, h: 1700 },
    ancora: { x: 2230, y: 3726 },
    zoom: 0.07, extra: 0.0, desloc: 76,
    foco: { x: 2700 },                      // the tree: phones centre the cover crop here
  },
};
