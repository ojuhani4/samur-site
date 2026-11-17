(() => {
  const S = window.SITE || {};
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const telaCompacta = matchMedia("(max-width: 760px), (pointer: coarse) and (max-width: 1000px)");


  /* ── Rolagem que toca o vídeo ─────────────────────────────────────────── */
  const cine = document.querySelector(".cine");
  const palco = cine?.querySelector(".cine-palco");
  const canvas = palco?.querySelector(".cine-canvas");
  if (cine && canvas && S.frames && S.frames.total) {
    const ctx = canvas.getContext("2d");
    const total = S.frames.total;
    const ultimo = total - 1;
    const quadrosDesktop = new Array(total);
    const quadrosMoveis = new Array(total);
    const momentos = [...cine.querySelectorAll(".momento")];
    const passoMovel = 4;
    const limiteMovel = 3;
    let celular = telaCompacta.matches;
    let alvo = 0, atual = 0, desenhado = -1;
    let pendentesMoveis = 0, animacao = 0;

    const carregar = (i, movel) => {
      const quadros = movel ? quadrosMoveis : quadrosDesktop;
      if (quadros[i]) return;
      const img = quadros[i] = new Image();
      if (movel) pendentesMoveis++;
      img.decoding = "async";
      if (i === 0) img.fetchPriority = "high";
      const concluir = () => {
        if (movel) pendentesMoveis--;
        if (movel !== celular) return;
        desenhar(Math.round(atual));
        if (movel && !reduzir) carregarPerto();
      };
      img.onload = concluir;
      img.onerror = concluir;
      const padrao = movel ? S.frames.mobile : S.frames.desktop;
      img.src = padrao.replace("{n}", String(i + 1).padStart(4, "0"));
    };

    // O celular carrega somente os quadros próximos da posição atual da rolagem.
    const amostraMovel = (i) => Math.min(ultimo, Math.round(i / passoMovel) * passoMovel);
    function carregarPerto() {
      if (alvo === 0 && atual === 0) return;
      const destino = amostraMovel(alvo);
      const direcao = alvo >= atual ? passoMovel : -passoMovel;
      const vizinho = amostraMovel(Math.max(0, destino + direcao));
      for (const i of [amostraMovel(atual), destino, vizinho]) {
        if (pendentesMoveis >= limiteMovel) return;
        carregar(i, true);
      }
    }

    // No desktop, mantém a sequência completa com os primeiros quadros espaçados.
    const filaDesktop = [];
    for (const passo of [8, 4, 2, 1]) {
      for (let i = 0; i < total; i += passo) {
        if (!filaDesktop.includes(i)) filaDesktop.push(i);
      }
    }
    let proximoDesktop = 0, loteDesktop = 0;
    const carregarLoteDesktop = () => {
      loteDesktop = 0;
      if (celular || reduzir) return;
      for (let n = 0; n < 6 && proximoDesktop < filaDesktop.length; n++) {
        carregar(filaDesktop[proximoDesktop++], false);
      }
      if (proximoDesktop < filaDesktop.length) loteDesktop = setTimeout(carregarLoteDesktop, 40);
    };

    const maisProximo = (quadros, i) => {
      const pronto = (j) => quadros[j]?.complete && quadros[j].naturalWidth;
      for (let d = 0; d < total; d++) {
        if (pronto(i - d)) return i - d;
        if (pronto(i + d)) return i + d;
      }
      return -1;
    };

    const ajustar = () => {
      const mudou = celular !== telaCompacta.matches;
      celular = telaCompacta.matches;
      const dpr = Math.min(window.devicePixelRatio || 1, celular ? 1.5 : 2);
      const largura = Math.round(canvas.clientWidth * dpr);
      const altura = Math.round(canvas.clientHeight * dpr);
      if (mudou || canvas.width !== largura || canvas.height !== altura) {
        canvas.width = largura;
        canvas.height = altura;
        desenhado = -1;
      }
      carregar(0, celular);
      if (!loteDesktop) carregarLoteDesktop();
      desenhar(Math.round(atual));
      agendarQuadro();
    };

    function desenhar(i) {
      const quadros = celular ? quadrosMoveis : quadrosDesktop;
      const j = maisProximo(quadros, i);
      if (j < 0 || j === desenhado) return;
      const img = quadros[j];
      const cw = canvas.width, ch = canvas.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // "cover"
      const w = img.naturalWidth * escala, h = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      desenhado = j;
    }

    const progresso = () => {
      const r = cine.getBoundingClientRect();
      const curso = cine.offsetHeight - palco.clientHeight;
      return Math.min(1, Math.max(0, -r.top / (curso || 1)));
    };

    const atualizarMomentos = (p) => {
      for (const m of momentos) {
        const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
        const ativo = p >= de && (p < ate || (ate >= 1 && p >= 1));
        m.classList.toggle("ativo", ativo);
        m.inert = !ativo;
      }
      cine.classList.toggle("andou", p > 0.02);
    };

    const agendarQuadro = () => {
      if (!reduzir && !animacao) animacao = requestAnimationFrame(quadro);
    };
    const quadro = () => {
      animacao = 0;
      alvo = progresso() * ultimo;
      atual += (alvo - atual) * 0.18; // suaviza: sensação de filme, não de slide
      if (Math.abs(alvo - atual) < 0.05) atual = alvo;
      if (celular) carregarPerto();
      desenhar(Math.round(atual));
      atualizarMomentos(ultimo ? atual / ultimo : 0);
      if (atual !== alvo) agendarQuadro();
    };

    addEventListener("resize", ajustar);
    addEventListener("scroll", agendarQuadro, { passive: true });
    telaCompacta.addEventListener("change", ajustar);
    ajustar();
    if (reduzir) atualizarMomentos(0);
  }

  /* ── Parallax leve nas artes ──────────────────────────────────────────── */
  const artes = reduzir ? [] : [...document.querySelectorAll(".arte")];
  if (artes.length) {
    const mover = () => {
      if (telaCompacta.matches) return;
      for (const a of artes) {
        const r = a.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        a.style.transform = `translate3d(0, ${(c * -60).toFixed(1)}px, 0) scale(1.08)`;
      }
    };
    addEventListener("scroll", () => {
      if (!telaCompacta.matches) requestAnimationFrame(mover);
    }, { passive: true });
    const ajustarArtes = () => {
      if (telaCompacta.matches) {
        for (const a of artes) a.style.removeProperty("transform");
      } else {
        mover();
      }
    };
    telaCompacta.addEventListener("change", ajustarArtes);
    ajustarArtes();
  }

  /* ── Topo, revelar e ano ──────────────────────────────────────────────── */
  const topo = document.querySelector(".topo");
  const num = String(S.whatsapp?.numero || "").replace(/\D/g, "");
  const whats = num ? document.querySelector(".whats") : null;
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
  if (whats) {
    whats.href = `https://wa.me/${num}?text=${encodeURIComponent(S.whatsapp.mensagem || "")}`;
  }

  /* ── Formulário → e-mail ──────────────────────────────────────────────── */
  const form = document.querySelector(".form");
  if (form && S.contato) {
    const T = Object.assign({ checar: "Please check the highlighted fields.", enviando: "Sending…", ok: "Received. We will be in touch within a day.", falha: "It could not be sent right now. Message us on WhatsApp instead." }, S.textos || {});
    const status = form.querySelector(".form-status");
    const botao = form.querySelector("button[type=submit]");
    const nota = form.querySelector("#nota-contato");
    const contatoAtivo = Boolean(S.contato.web3formsChave || S.contato.email);
    botao.disabled = !contatoAtivo;
    if (nota) nota.hidden = contatoAtivo;
    const avisar = (txt, tipo) => { status.textContent = txt; status.className = `form-status campo--inteiro ${tipo || ""}`; };

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (!contatoAtivo) return;
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
