(() => {
  const S = window.SITE || {};
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = matchMedia("(max-width: 760px)").matches;


  /* ── Rolagem que toca o vídeo ─────────────────────────────────────────── */
  const cine = document.querySelector(".cine");
  const canvas = cine && cine.querySelector(".cine-canvas");
  if (cine && canvas && S.frames && S.frames.total) {
    const ctx = canvas.getContext("2d");
    const total = S.frames.total;
    const padrao = celular ? S.frames.mobile : S.frames.desktop;
    const src = (i) => padrao.replace("{n}", String(i + 1).padStart(4, "0"));
    const quadros = new Array(total);
    const momentos = [...cine.querySelectorAll(".momento")];
    const corte = cine.querySelector(".cine-corte");
    const H = (celular && S.heroCelular) || S.hero;
    let alvo = 0, atual = 0, desenhado = -1, dpr = 1, ultimo = null; // ultimo: onde o quadro foi desenhado (px CSS)

    // A árvore é uma camada à parte: acompanha o zoom do filme e cresce um pouco mais, ancorada no tronco.
    const posicionarCorte = (p) => {
      if (!corte || !H || !ultimo) return;
      const e = p * p * (3 - 2 * p) * 0.6 + p * 0.4;
      const s = 1 + H.zoom * e, f = 1 + H.extra * e;
      const w = H.largura / s, h = H.altura / s;
      const cx = H.largura / 2;
      const cy = Math.min(Math.max(H.altura / 2 + H.desloc * e, h / 2), H.altura - h / 2);
      const k = ultimo.w / w; // px CSS por px da foto
      const x1 = H.ancora.x + (H.corte.x - H.ancora.x) * f, y1 = H.ancora.y + (H.corte.y - H.ancora.y) * f;
      const sx = ultimo.ox + (x1 - (cx - w / 2)) * k, sy = ultimo.oy + (y1 - (cy - h / 2)) * k;
      corte.style.width = `${(H.corte.w * f * k).toFixed(1)}px`;
      corte.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
      corte.style.opacity = "1";
    };

    const carregar = (i, prioridade) => {
      if (quadros[i]) return quadros[i];
      const img = new Image();
      img.decoding = "async";
      if (prioridade) img.fetchPriority = "high";
      img.src = src(i);
      img.onload = () => { if (Math.round(atual) === i || desenhado === -1) desenhar(i, true); };
      return (quadros[i] = img);
    };

    // O primeiro quadro e a árvore têm prioridade: o resto do filme só começa a baixar quando os dois já estão na tela
    // (senão 160 pedidos disputam a banda com a abertura e a página fica em branco por segundos).
    const primeiro = carregar(0, true);
    if (!reduzir) {
      const fila = [];
      for (const passo of [8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!fila.includes(i)) fila.push(i);
      let k = 0, iniciado = false;
      const lote = () => { for (let n = 0; n < 6 && k < fila.length; n++) carregar(fila[k++]); if (k < fila.length) setTimeout(lote, 40); };
      const iniciar = () => { if (iniciado) return; iniciado = true; lote(); };
      const esperar = (img) => new Promise((ok) => { if (!img || (img.complete && img.naturalWidth)) ok(); else { img.addEventListener("load", ok, { once: true }); img.addEventListener("error", ok, { once: true }); } });
      Promise.all([esperar(primeiro), esperar(corte)]).then(iniciar);
      setTimeout(iniciar, 4000); // nunca fica preso se algo falhar
    }

    const pronto = (i) => quadros[i] && quadros[i].complete && quadros[i].naturalWidth;
    const maisProximo = (i) => {
      for (let d = 0; d < total; d++) {
        if (pronto(i - d)) return i - d;
        if (pronto(i + d)) return i + d;
      }
      return -1;
    };

    const ajustar = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      desenhado = -1;
      desenhar(Math.round(atual), true);
    };

    function desenhar(i, forcar) {
      const j = maisProximo(i);
      if (j < 0 || (j === desenhado && !forcar)) return;
      const img = quadros[j];
      const cw = canvas.width, ch = canvas.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // "cover"
      const w = img.naturalWidth * escala, h = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      ultimo = { ox: (cw - w) / 2 / dpr, oy: (ch - h) / 2 / dpr, w: w / dpr, h: h / dpr };
      desenhado = j;
    }

    const progresso = () => {
      const r = cine.getBoundingClientRect();
      const curso = cine.offsetHeight - innerHeight;
      return Math.min(1, Math.max(0, -r.top / (curso || 1)));
    };

    const atualizarMomentos = (p) => {
      for (const m of momentos) {
        const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
        m.classList.toggle("ativo", p >= de && (p < ate || (ate >= 1 && p >= 1)));
      }
      cine.classList.toggle("andou", p > 0.02);
      cine.style.setProperty("--derrete", Math.min(1, Math.max(0, (p - 0.78) / 0.2)).toFixed(3));
      posicionarCorte(p);
    };

    const quadro = () => {
      alvo = progresso() * (total - 1);
      atual += (alvo - atual) * 0.18; // suaviza: sensação de filme, não de slide
      if (Math.abs(alvo - atual) < 0.05) atual = alvo;
      desenhar(Math.round(atual));
      atualizarMomentos(atual / (total - 1));
      requestAnimationFrame(quadro);
    };

    addEventListener("resize", ajustar);
    ajustar();
    if (reduzir) { atualizarMomentos(0); posicionarCorte(0); }
    else requestAnimationFrame(quadro);
  }

  /* ── Parallax leve nas artes ──────────────────────────────────────────── */
  const artes = reduzir ? [] : [...document.querySelectorAll(".arte")];
  if (artes.length) {
    const mover = () => {
      for (const a of artes) {
        const r = a.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        a.style.transform = `translate3d(0, ${(c * -60).toFixed(1)}px, 0) scale(1.08)`;
      }
    };
    addEventListener("scroll", () => requestAnimationFrame(mover), { passive: true });
    mover();
  }

  /* ── Letras: a palavra da abertura e os títulos das seções ──────────── */
  const palavra = document.getElementById("palavra");
  if (palavra) {
    const txt = palavra.textContent.trim(); palavra.setAttribute("aria-label", txt); palavra.textContent = "";
    [...txt].forEach((c, i) => { const s = document.createElement("span"); s.className = "hc"; s.textContent = c; s.style.setProperty("--i", i); s.setAttribute("aria-hidden", "true"); palavra.append(s); });
  }
  const porPalavra = document.documentElement.lang === "ar"; // Arabic letters must stay joined: climb word by word
  document.querySelectorAll("[data-letters]").forEach((el) => {
    const plano = el.textContent.replace(/\s+/g, " ").trim();
    let i = 0;
    const andar = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 1) { if (n.classList.contains("ppill")) { n.style.setProperty("--i", i++); return; } return andar(n); }
      if (n.nodeType !== 3) return;
      if (!n.textContent.trim()) { n.remove(); return; }
      const frag = document.createDocumentFragment();
      n.textContent.replace(/\s+/g, " ").split(/( )/).forEach((parte) => {
        if (!parte) return;
        if (parte === " ") { frag.append(document.createTextNode(" ")); return; }
        const w = document.createElement("span"); w.className = "w";
        if (porPalavra) { const s = document.createElement("span"); s.className = "ch"; s.textContent = parte; s.style.setProperty("--i", i); i += 3; w.append(s); }
        else for (const ch of parte) { const s = document.createElement("span"); s.className = "ch"; s.textContent = ch; s.style.setProperty("--i", i++); w.append(s); }
        frag.append(w);
      });
      n.replaceWith(frag);
    });
    andar(el);
    el.setAttribute("aria-label", plano);
    el.querySelectorAll(".line").forEach((l) => l.setAttribute("aria-hidden", "true"));
  });
  const ticks = document.getElementById("ticks");
  if (ticks) { let d = ""; for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), r1 = k % 4 === 0 ? 35 : 38; d += `M${(42 + c * r1).toFixed(2)} ${(42 + s * r1).toFixed(2)}L${(42 + c * 41.5).toFixed(2)} ${(42 + s * 41.5).toFixed(2)}`; } ticks.innerHTML = `<path d="${d}" fill="none"/>`; }

  /* ── Seções: is-in dispara as letras, pílulas, tabela e molduras ─────── */
  const ioSec = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); ioSec.unobserve(e.target); }
  }), { threshold: 0.22, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach((s) => ioSec.observe(s));
  document.querySelectorAll(".moldura img").forEach((img) => img.addEventListener("animationend", () => img.parentElement.classList.add("assentada")));

  /* ── O elenco: o trilho anda enquanto a seção está presa ─────────────── */
  const trilho = document.getElementById("trilho"), elenco = document.getElementById("elenco");
  if (trilho && elenco && !reduzir) {
    const mover = () => {
      if (matchMedia("(max-width: 860px)").matches) { trilho.style.transform = ""; return; }
      const r = elenco.getBoundingClientRect();
      const prog = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      const max = Math.max(0, trilho.scrollWidth + 2 * 56 - innerWidth);
      const sinal = document.documentElement.dir === "rtl" ? 1 : -1;
      trilho.style.transform = `translate3d(${(sinal * prog * max).toFixed(1)}px,0,0)`;
    };
    addEventListener("scroll", () => requestAnimationFrame(mover), { passive: true });
    addEventListener("resize", mover);
    mover();
  }

  /* ── Topo, revelar e ano ──────────────────────────────────────────────── */
  const topo = document.querySelector(".topo");
  const whats = document.querySelector(".whats");
  let formNaTela = false; // o botão flutuante se recolhe para não cobrir o "Enviar"
  const aoRolar = () => {
    topo && topo.classList.toggle("rolou", scrollY > 40);
    whats && whats.classList.toggle("visivel", scrollY > innerHeight * 0.6 && !formNaTela);
  };
  const formEl = document.querySelector(".form");
  if (formEl) new IntersectionObserver(([e]) => { formNaTela = e.isIntersecting; aoRolar(); }).observe(formEl);
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
  }), { threshold: 0.18 });
  document.querySelectorAll(".revelar").forEach((el) => io.observe(el));
  document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ── WhatsApp ─────────────────────────────────────────────────────────── */
  if (whats && S.whatsapp) {
    const num = String(S.whatsapp.numero || "").replace(/\D/g, "");
    whats.href = `https://wa.me/${num}?text=${encodeURIComponent(S.whatsapp.mensagem || "")}`;
  }

  /* ── Formulário → e-mail ──────────────────────────────────────────────── */
  const form = document.querySelector(".form");
  if (form && S.contato) {
    const T = Object.assign({ checar: "Please check the highlighted fields.", enviando: "Sending…", ok: "Received. We will be in touch within a day.", falha: "It could not be sent right now. Message us on WhatsApp instead." }, S.textos || {});
    const status = form.querySelector(".form-status");
    const botao = form.querySelector("button[type=submit]");
    const avisar = (txt, tipo) => { status.textContent = txt; status.className = `form-status campo--inteiro ${tipo || ""}`; };

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (form.elements._honey.value) return; // robô
      let valido = true;
      form.querySelectorAll("[required]").forEach((c) => {
        const ok = c.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value) : c.value.trim().length > 1;
        c.closest(".campo").classList.toggle("erro", !ok);
        if (!ok) valido = false;
      });
      if (!valido) return avisar(T.checar, "falha");

      const dados = Object.fromEntries(new FormData(form));
      delete dados._honey;
      const assunto = S.contato.assunto || `New enquiry from the ${S.nome || ""} website`;
      let url, corpo;
      if (S.contato.web3formsChave) {
        url = "https://api.web3forms.com/submit";
        corpo = { access_key: S.contato.web3formsChave, subject: assunto, from_name: S.nome, ...dados };
      } else {
        url = `https://formsubmit.co/ajax/${encodeURIComponent(S.contato.email)}`;
        corpo = { _subject: assunto, _template: "table", _captcha: "false", ...dados };
      }

      botao.disabled = true;
      avisar(T.enviando);
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(corpo),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j.success === false || j.success === "false") throw new Error(j.message || r.status);
        form.reset();
        avisar(T.ok, "ok");
      } catch (e) {
        console.warn("Falha no envio do formulário:", e);
        avisar(T.falha, "falha");
      } finally {
        botao.disabled = false;
      }
    });
  }
})();
