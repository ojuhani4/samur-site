(() => {
  const S = window.SITE || {};
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = matchMedia("(max-width: 760px)").matches;


  /* ── Abertura: vídeo em loop (sempre em movimento) + zoom lento guiado pela rolagem ─────────────
     O vídeo e a camada da copa vivem no mesmo invólucro; a rolagem só escala/desloca o invólucro, então a copa
     fica sempre alinhada. O corte "cover" é calculado aqui (com ponto focal no celular) para posicionar a copa. */
  const cine = document.querySelector(".cine");
  const camada = cine && cine.querySelector(".cine-camada");
  const video = camada && camada.querySelector(".cine-video");
  if (cine && camada && video && S.hero && S.video) {
    const H = S.hero;
    const momentos = [...cine.querySelectorAll(".momento")];
    const corte = camada.querySelector(".cine-corte");
    let movel = celular, geo = null, pAlvo = 0, pAtual = 0;

    const fonte = () => { const src = movel ? S.video.mobile : S.video.desktop; if (video.getAttribute("src") !== src) { video.setAttribute("src", src); video.load(); } };
    const tocar = () => { if (reduzir) return; const p = video.play(); if (p && p.catch) p.catch(() => cine.classList.add("sem-video")); };

    // Geometria "cover": o quadro do vídeo equivale ao espaço H.largura × H.altura. No celular o ponto focal é a árvore.
    const medir = () => {
      const cw = camada.clientWidth, ch = camada.clientHeight;
      const k = Math.max(cw / H.largura, ch / H.altura);
      const w = H.largura * k, h = H.altura * k;
      let fx = 0.5, fy = 0.5;
      if (movel && H.foco) { const visivel = cw / k; fx = Math.min(1, Math.max(0, (H.foco.x - visivel / 2) / Math.max(1, H.largura - visivel))); }
      const ox = (cw - w) * fx, oy = (ch - h) * fy;
      video.style.objectPosition = `${(fx * 100).toFixed(2)}% ${(fy * 100).toFixed(2)}%`;
      geo = { k, ox, oy, cw, ch };
      if (corte) { corte.style.left = `${(ox + H.corte.x * k).toFixed(1)}px`; corte.style.top = `${(oy + H.corte.y * k).toFixed(1)}px`; corte.style.width = `${(H.corte.w * k).toFixed(1)}px`; corte.style.opacity = "1"; }
      camada.style.transformOrigin = `${(ox + H.largura / 2 * k).toFixed(1)}px ${(oy + H.altura / 2 * k).toFixed(1)}px`;
      aplicar(pAtual);
    };
    const aplicar = (p) => {
      if (!geo) return;
      const e = p * p * (3 - 2 * p) * 0.6 + p * 0.4;
      const s = 1 + H.zoom * e;
      camada.style.transform = reduzir ? "none" : `translate3d(0, ${(-H.desloc * e * geo.k).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
    };
    const progresso = () => { const r = cine.getBoundingClientRect(); const curso = cine.offsetHeight - innerHeight; return Math.min(1, Math.max(0, -r.top / (curso || 1))); };
    const atualizarMomentos = (p) => {
      for (const m of momentos) {
        const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
        const ativo = p >= de && (p < ate || (ate >= 1 && p >= 1));
        m.classList.toggle("ativo", ativo); m.inert = !ativo;
      }
      cine.classList.toggle("andou", p > 0.02);
      cine.style.setProperty("--derrete", Math.min(1, Math.max(0, (p - 0.78) / 0.2)).toFixed(3));
    };
    const quadro = () => {
      pAlvo = progresso();
      pAtual += (pAlvo - pAtual) * 0.18;
      if (Math.abs(pAlvo - pAtual) < 0.0005) pAtual = pAlvo;
      aplicar(pAtual); atualizarMomentos(pAtual);
      requestAnimationFrame(quadro);
    };

    fonte(); medir(); tocar();
    addEventListener("resize", medir);
    matchMedia("(max-width: 760px)").addEventListener("change", (e) => { movel = e.matches; fonte(); medir(); tocar(); });
    // pausa quando a abertura saiu da tela, volta quando reaparece
    new IntersectionObserver(([en]) => { if (en.isIntersecting) tocar(); else video.pause(); }, { rootMargin: "20% 0px" }).observe(cine);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) tocar(); });
    if (reduzir) { atualizarMomentos(0); }
    else requestAnimationFrame(quadro);
  }

  /* ── Capítulos-filme: vídeo em loop, carregado quando se aproxima, pausado quando sai ── */
  document.querySelectorAll(".filme[data-filme]").forEach((sec) => {
    const cfg = S.filmes && S.filmes[sec.dataset.filme];
    const v = sec.querySelector(".filme-video");
    if (!cfg || !v) return;
    const momentos = [...sec.querySelectorAll(".momento")];
    let movel = celular, vivo = false;
    const fonte = () => { const src = movel ? cfg.mobile : cfg.desktop; if (v.getAttribute("src") !== src) { v.setAttribute("src", src); v.load(); } };
    const tocar = () => { if (reduzir) return; fonte(); const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    const progresso = () => { const r = sec.getBoundingClientRect(); const curso = sec.offsetHeight - innerHeight; return Math.min(1, Math.max(0, -r.top / (curso || 1))); };
    const atualizar = (p) => {
      for (const m of momentos) { const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1); const ativo = p >= de && (p < ate || (ate >= 1 && p >= 1)); m.classList.toggle("ativo", ativo); m.inert = !ativo; }
      sec.style.setProperty("--derrete", Math.min(1, Math.max(0, (p - 0.8) / 0.2)).toFixed(3));
      sec.style.setProperty("--borda", (1 - Math.min(1, p / 0.12)).toFixed(3));
    };
    const quadro = () => { if (!vivo) return; atualizar(progresso()); requestAnimationFrame(quadro); };
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { tocar(); if (!vivo) { vivo = true; if (!reduzir) requestAnimationFrame(quadro); } }
      else { vivo = false; v.pause(); }
    }), { rootMargin: "100% 0px 100% 0px" }).observe(sec);
    matchMedia("(max-width: 760px)").addEventListener("change", (e) => { movel = e.matches; if (vivo) tocar(); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden && vivo) tocar(); });
    if (reduzir) atualizar(0);
  });

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
  if (palavra && !palavra.children.length) { // the Arabic page carries the calligraphic wordmark as an image instead
    const txt = palavra.textContent.trim(); palavra.setAttribute("aria-label", txt); palavra.textContent = "";
    [...txt].forEach((c, i) => { const s = document.createElement("span"); s.className = "hc"; s.textContent = c; s.style.setProperty("--i", i); s.setAttribute("aria-hidden", "true"); palavra.append(s); });
  }
  const porPalavra = document.documentElement.lang === "ar"; // Arabic letters must stay joined: climb word by word
  document.querySelectorAll("[data-letters]").forEach((el) => {
    const linhas = [...el.querySelectorAll(".line")].map((l) => l.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
    const plano = (linhas.length ? linhas.join(" ") : el.textContent).replace(/\s+/g, " ").trim();
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

  /* ── Menu no celular, troca de idioma com a seção, "planeje esta viagem" ── */
  const topo = document.querySelector(".topo");
  const menuBotao = document.querySelector(".menu-botao");
  if (topo && menuBotao) {
    const fechar = () => { topo.classList.remove("aberto"); menuBotao.setAttribute("aria-expanded", "false"); };
    menuBotao.addEventListener("click", () => { const aberto = topo.classList.toggle("aberto"); menuBotao.setAttribute("aria-expanded", String(aberto)); if (aberto) topo.querySelector(".menu a")?.focus(); });
    topo.querySelectorAll(".menu a").forEach((a) => a.addEventListener("click", fechar));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && topo.classList.contains("aberto")) { fechar(); menuBotao.focus(); } });
  }
  document.querySelectorAll("a.lang").forEach((a) => a.addEventListener("click", () => { if (location.hash && location.hash.length > 1) a.href = a.getAttribute("href").split("#")[0] + location.hash; }));
  document.querySelectorAll("[data-trip]").forEach((a) => a.addEventListener("click", () => {
    const campo = document.getElementById("f-msg");
    if (campo && !campo.value.trim()) campo.value = (S.textos && S.textos.viagem ? S.textos.viagem : "Trip: ") + a.dataset.trip;
  }));

  /* ── Topo, revelar e ano ──────────────────────────────────────────────── */
  const whats = document.querySelector(".whats");
  let formNaTela = false; // o botão flutuante se recolhe para não cobrir o "Enviar"
  const abertura = document.querySelector(".cine");
  const aoRolar = () => {
    topo && topo.classList.toggle("rolou", scrollY > 40);
    const aberturaNaTela = abertura ? scrollY < abertura.offsetHeight - innerHeight * 0.4 : false; // o botão só aparece depois do filme de abertura
    whats && whats.classList.toggle("visivel", !aberturaNaTela && !formNaTela);
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
    const T = Object.assign({ checar: "Please check the highlighted fields.", enviando: "Sending…", ok: "Received. We will be in touch within a day.", falha: "It could not be sent right now. Your details are still here: try again, or reach us directly:",
      erroNome: "Please enter your name.", erroEmail: "Please enter a valid email address.", erroTel: "Please enter a WhatsApp number with the country code, e.g. +966 5x xxx xxxx.", whatsappRotulo: "WhatsApp", emailRotulo: "Email", ou: "or" }, S.textos || {});
    const status = form.querySelector(".form-status");
    const botao = form.querySelector("button[type=submit]");
    const numero = String((S.whatsapp && S.whatsapp.numero) || "").replace(/\D/g, "");
    const contatos = () => {
      const frag = document.createDocumentFragment();
      if (numero) { const a = document.createElement("a"); a.href = `https://wa.me/${numero}`; a.target = "_blank"; a.rel = "noopener"; a.textContent = T.whatsappRotulo; frag.append(" ", a); }
      if (S.contato.email) { const b = document.createElement("a"); b.href = `mailto:${S.contato.email}`; b.textContent = T.emailRotulo; frag.append(numero ? ` ${T.ou} ` : " ", b); }
      return frag;
    };
    const avisar = (txt, tipo, comContatos) => { status.textContent = txt; if (comContatos) status.append(contatos()); status.className = `form-status campo--inteiro ${tipo || ""}`; };
    // Arabic-Indic and Persian digits become ASCII; spaces and punctuation go; a leading 00 becomes +
    const normalizarTel = (v) => v.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[\s().\-\u2010-\u2015]/g, "").replace(/^00/, "+");
    const telValido = (v) => /^\+?\d{8,15}$/.test(normalizarTel(v));
    const erroDe = (c) => { const campo = c.closest(".campo"); let el = campo.querySelector(".campo-erro"); if (!el) { el = document.createElement("small"); el.className = "campo-erro"; el.id = `${c.id}-erro`; campo.append(el); } return el; };
    const marcar = (c, msg) => { const campo = c.closest(".campo"); const el = erroDe(c); campo.classList.toggle("erro", !!msg); el.textContent = msg || ""; el.hidden = !msg; c.setAttribute("aria-invalid", msg ? "true" : "false"); if (msg) c.setAttribute("aria-describedby", el.id); else c.removeAttribute("aria-describedby"); };
    form.querySelectorAll("[required]").forEach((c) => c.addEventListener("input", () => { if (c.closest(".campo").classList.contains("erro")) marcar(c, ""); }));

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (form.elements._honey.value) return; // robô
      let primeiroInvalido = null;
      form.querySelectorAll("[required]").forEach((c) => {
        let msg = "";
        if (c.type === "email") { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value.trim())) msg = T.erroEmail; }
        else if (c.type === "tel") { if (!telValido(c.value)) msg = T.erroTel; }
        else if (c.value.trim().length < 2) msg = T.erroNome;
        marcar(c, msg);
        if (msg && !primeiroInvalido) primeiroInvalido = c;
      });
      if (primeiroInvalido) { avisar(T.checar, "falha"); primeiroInvalido.focus(); return; }

      const dados = Object.fromEntries(new FormData(form));
      delete dados._honey; delete dados._next;
      if (dados.whatsapp) dados.whatsapp = normalizarTel(dados.whatsapp);
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
        const j = await r.json().catch(() => null);
        const confirmado = j && (j.success === true || j.success === "true"); // só um "sim" explícito do provedor conta
        if (!r.ok || !confirmado) throw new Error((j && j.message) || r.status);
        form.reset();
        form.querySelectorAll(".campo.erro").forEach((c) => c.classList.remove("erro"));
        avisar(T.ok, "ok");
      } catch (e) {
        console.warn("Falha no envio do formulário:", e); // os valores digitados ficam no formulário
        avisar(T.falha, "falha", true);
      } finally {
        botao.disabled = false;
      }
    });
  }
})();
