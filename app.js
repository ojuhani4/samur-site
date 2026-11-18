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
    let alvo = 0, atual = 0, desenhado = -1;

    const carregar = (i) => {
      if (quadros[i]) return quadros[i];
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);
      img.onload = () => { if (Math.round(atual) === i || desenhado === -1) desenhar(i, true); };
      return (quadros[i] = img);
    };

    // Carrega em passadas (1 a cada 8, depois 1 a cada 4…) para cobrir o filme inteiro cedo
    carregar(0);
    if (!reduzir) {
      const fila = [];
      for (const passo of [8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!fila.includes(i)) fila.push(i);
      let k = 0;
      const lote = () => { for (let n = 0; n < 6 && k < fila.length; n++) carregar(fila[k++]); if (k < fila.length) setTimeout(lote, 40); };
      lote();
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    if (reduzir) atualizarMomentos(0);
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

  /* ── Vídeos: carregam perto da tela, tocam só quando visíveis ─────────── */
  const videos = [...document.querySelectorAll("video[data-src]")];
  const carregarVideo = (v) => {
    if (v.dataset.pronto) return;
    v.src = (celular && v.dataset.srcM) || v.dataset.src;
    v.dataset.pronto = "1";
    v.load();
  };
  if (videos.length) {
    const ioV = new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { carregarVideo(v); if (!reduzir) v.play().catch(() => {}); }
      else if (v.dataset.pronto) v.pause();
    }), { rootMargin: "60% 0px 60% 0px" });
    videos.forEach((v) => ioV.observe(v));
  }

  /* ── Cenas: janela que abre, profundidade e parallax por capítulo ─────── */
  const cenas = [...document.querySelectorAll(".cena")].map((el) => ({
    el,
    midia: el.querySelector(".cena-midia"),
    foto: el.querySelector(".cena-foto"),
    texto: el.querySelector(".cena-texto"),
    inset: el.querySelector(".cena-inset"),
  }));
  if (cenas.length && !reduzir) {
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const suave = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
    let mx = 0, my = 0, tx = 0, ty = 0; // inclinação pelo ponteiro (só desktop)
    if (!celular) addEventListener("pointermove", (e) => {
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });

    const passo = () => {
      tx += (mx - tx) * 0.06; ty += (my - ty) * 0.06;
      const vh = innerHeight;
      for (const c of cenas) {
        const r = c.el.getBoundingClientRect();
        if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) { continue; }
        const curso = c.el.offsetHeight - vh;
        const entrada = suave(1 - r.top / vh);                 // 0: chegando por baixo · 1: fixada
        const p = clamp(-r.top / (curso || 1), 0, 1);          // progresso enquanto fixada
        const saida = suave(1 - r.bottom / vh);                 // 0: ainda presa · 1: saiu por cima
        const ativa = entrada >= 0.999 && saida <= 0.001;

        // A janela: começa menor e arredondada sobre o papel, abre até a tela inteira; ao sair, recua e escurece.
        const escala = 0.74 + 0.26 * entrada - 0.1 * saida;
        const raio = 36 * (1 - entrada) + 28 * saida;
        const subir = 9 * (1 - entrada) - 6 * saida;           // vh
        const brilho = 0.55 + 0.45 * entrada - 0.5 * saida;
        const rx = ativa ? -ty * 2.2 : 0, ry = ativa ? tx * 2.2 : 0;
        c.midia.style.transform = `translate3d(0, ${subir.toFixed(2)}vh, 0) scale(${escala.toFixed(3)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        c.midia.style.borderRadius = `${raio.toFixed(1)}px`;
        c.midia.style.filter = `brightness(${brilho.toFixed(3)})`;

        // Fotos: lento recuo (1.14 → 1.0) + deslocamento oposto ao ponteiro = profundidade
        if (c.foto) {
          const z = 1.14 - 0.14 * p;
          const dx = ativa ? -tx * 14 : 0, dy = ativa ? -ty * 10 : 0;
          c.foto.style.transform = `translate3d(${dx.toFixed(1)}px, ${(dy - p * 24).toFixed(1)}px, 0) scale(${z.toFixed(3)})`;
        }
        // Texto: entra cedo, sobe devagar, sai antes do fim
        if (c.texto) {
          const o = Math.min(suave(p / 0.22), 1 - suave((p - 0.74) / 0.26));
          c.texto.style.opacity = o.toFixed(3);
          c.texto.style.transform = `translate3d(0, ${(36 * (1 - suave(p / 0.22)) - p * 30).toFixed(1)}px, 0)`;
        }
        // Inset: chega depois, mais perto da câmera, anda mais rápido que o fundo
        if (c.inset) {
          const o = Math.min(suave((p - 0.16) / 0.26), 1 - suave((p - 0.8) / 0.2));
          const e = suave((p - 0.16) / 0.26);
          const dx = ativa ? tx * 22 : 0, dy = ativa ? ty * 16 : 0;
          c.inset.style.opacity = o.toFixed(3);
          c.inset.style.transform = `translate3d(${dx.toFixed(1)}px, ${(70 * (1 - e) - p * 120 + dy).toFixed(1)}px, 0) scale(${(0.9 + 0.1 * e).toFixed(3)}) rotate(${(-3 * (1 - e)).toFixed(2)}deg)`;
        }
      }
      requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
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
