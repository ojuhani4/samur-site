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
    desktop: "assets/frames/desktop/f_{n}.webp",
    mobile: "assets/frames/mobile/f_{n}.webp",
  },

  // The acacia hero film: the frames are a slow push into the photo; the tree is a separate
  // cut-out layer that the page places over the title using this geometry (frame-space pixels).
  hero: {
    largura: 2773, altura: 1560,           // the photo crop the frames were rendered from
    corte: { x: -113, y: 278, w: 3000, h: 1208 }, // where the cut-out sits in that crop
    ancora: { x: 1386, y: 1480 },          // base of the trunk: the cut-out scales around it
    zoom: 0.07, extra: 0.06, desloc: 34,   // film zoom, additional cut-out zoom, downward drift
  },
};
