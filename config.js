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
    desktop: "assets/frames/desktop/f_sunset_{n}.webp",
    mobile: "assets/frames/mobile/f_sunset_{n}.webp",
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
    largura: 3200, altura: 4267,
    corte: { x: -50, y: 721, w: 3400, h: 1700 },
    ancora: { x: 1230, y: 3721 },
    zoom: 0.07, extra: 0.0, desloc: 93,
  },
};
