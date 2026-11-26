/* =========================================================
   El hilo que nos une — interacciones visuales (solo UI).
   La lógica real (guardar, votar, sesión) la hace Spring Boot.
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isStatic = location.protocol === "file:";

  /* =========================================================
     NIVEL DE CALIDAD
     0 completo · 1 ligero (.lite) · 2 mínimo (.lite.min)
     El <head> elige el nivel inicial; aquí se baja si va lento.
     ========================================================= */
  const tier = () => (root.classList.contains("min") ? 2 : root.classList.contains("lite") ? 1 : 0);
  const tierListeners = [];
  const onTier = (fn) => tierListeners.push(fn);
  const degrade = () => {
    if (tier() === 0) root.classList.add("lite");
    else root.classList.add("lite", "min");
    tierListeners.forEach((fn) => fn(tier()));
  };

  /* Bucle con límite de fps. fn(k) recibe k = fotogramas de 60 fps transcurridos,
     así la velocidad es la misma vaya a 60, 30 o 20 fps. */
  const makeLoop = (fn) => {
    let id = 0, last = 0;
    const loop = {
      fps: 60,
      running: false,
      start() {
        if (loop.running) return;
        loop.running = true;
        last = 0;
        id = requestAnimationFrame(tick);
      },
      stop() {
        loop.running = false;
        cancelAnimationFrame(id);
      }
    };
    const tick = (t) => {
      if (!loop.running) return;
      id = requestAnimationFrame(tick);
      if (last && t - last < 1000 / loop.fps - 2) return;
      const k = last ? Math.min((t - last) / 16.67, 3) : 1;
      last = t;
      fn(k);
    };
    return loop;
  };

  const debounce = (fn, ms) => {
    let t;
    return () => { clearTimeout(t); t = setTimeout(fn, ms); };
  };

  /* Medidor de fluidez: si los fotogramas tardan demasiado, baja un nivel */
  if (!reduceMotion && tier() < 2) {
    let frames = 0, slow = 0, start = 0, last = 0;
    const sample = (t) => {
      if (!start) { start = last = t; frames = 0; slow = 0; requestAnimationFrame(sample); return; }
      const dt = t - last;
      last = t;
      frames++;
      if (dt > 40) slow++;
      if (frames < 60) { requestAnimationFrame(sample); return; }
      const avg = (t - start) / frames;
      start = 0;
      if (avg > 24 || slow > 8) degrade();
      // Se sigue vigilando de vez en cuando mientras quede nivel que bajar
      if (tier() < 2) setTimeout(() => requestAnimationFrame(sample), avg > 24 || slow > 8 ? 800 : 5000);
    };
    setTimeout(() => requestAnimationFrame(sample), 1200);
  }

  /* ---------- Guirnalda de luces ---------- */
  const lights = document.querySelector(".lights");
  if (lights) {
    const build = () => {
      const count = Math.max(8, Math.floor(window.innerWidth / [42, 60, 70][tier()]));
      if (lights.childElementCount === count) return;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const li = document.createElement("li");
        li.style.setProperty("--delay", (Math.random() * 2.6).toFixed(2) + "s");
        frag.appendChild(li);
      }
      lights.replaceChildren(frag);
    };
    build();
    window.addEventListener("resize", debounce(build, 200));
    onTier(build);
  }

  /* ---------- Nieve a pantalla completa (solo nivel completo) ---------- */
  const canvas = document.getElementById("snow");
  if (canvas) {
    if (reduceMotion || tier() > 0) {
      canvas.remove();
    } else {
      const ctx = canvas.getContext("2d");
      let w = 0, h = 0, flakes = [];

      const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        const n = Math.min(120, Math.floor(w / 12));
        flakes = Array.from({ length: n }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2.2 + 0.6,
          s: Math.random() * 0.7 + 0.3,
          d: Math.random() * Math.PI * 2,
          o: Math.random() * 0.5 + 0.35
        }));
      };

      const draw = (k) => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#fff";
        for (const f of flakes) {
          f.y += f.s * k;
          f.d += 0.01 * k;
          f.x += Math.sin(f.d) * 0.4 * k;
          if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
          ctx.globalAlpha = f.o;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      };

      resize();
      const snowLoop = makeLoop(draw);
      snowLoop.start();
      window.addEventListener("resize", debounce(resize, 150));
      onTier(() => { snowLoop.stop(); canvas.remove(); });
    }
  }

  /* ---------- La bola: balanceo y giro 3D ----------
     Solo nivel completo. Sin ratón gira despacio sola; con ratón encima
     se inclina hacia él. En .lite / .min o movimiento reducido queda quieta.
     Fuera de pantalla no gasta nada. */
  const orn = document.querySelector("[data-ornament]");
  const ornBody = orn && orn.querySelector(".ornament__body");
  if (ornBody) {
    const VARS = ["--rx", "--ry", "--px", "--py"];
    let mx = 0, my = 0, hover = false, cx = 0, cy = 0, visible = true;
    const t0 = performance.now();

    const frame = (k) => {
      const t = (performance.now() - t0) / 1000;
      const tx = hover ? mx : Math.sin(t * 0.55) * 0.6;
      const ty = hover ? my : Math.sin(t * 0.4 + 1) * 0.3;
      const ease = 1 - Math.pow(0.94, k);
      cx += (tx - cx) * ease;
      cy += (ty - cy) * ease;
      ornBody.style.setProperty("--ry", (cx * 18).toFixed(2) + "deg");
      ornBody.style.setProperty("--rx", (-cy * 18).toFixed(2) + "deg");
      ornBody.style.setProperty("--px", (cx * 14).toFixed(1) + "px");
      ornBody.style.setProperty("--py", (cy * 14).toFixed(1) + "px");
    };
    const ornLoop = makeLoop(frame);

    const update = () => {
      if (!reduceMotion && visible && tier() === 0) ornLoop.start();
      else { ornLoop.stop(); VARS.forEach((p) => ornBody.style.removeProperty(p)); }
    };
    update();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }).observe(orn);
    }
    onTier(update);

    orn.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = orn.getBoundingClientRect();
      mx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      my = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      hover = true;
    });
    orn.addEventListener("pointerleave", () => { hover = false; });
  }

  /* ---------- Menú móvil ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- Aparición al hacer scroll (solo nivel completo) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const showAll = () => reveals.forEach((el) => el.classList.add("is-visible"));
  if (tier() > 0 || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
    onTier(() => { io.disconnect(); showAll(); });
  }

  /* ---------- Cuenta atrás (fecha en data-countdown, formato ISO) ---------- */
  document.querySelectorAll("[data-countdown]").forEach((cd) => {
    const target = new Date(cd.dataset.countdown);
    const els = {
      d: cd.querySelector("[data-d]"),
      h: cd.querySelector("[data-h]"),
      m: cd.querySelector("[data-m]"),
      s: cd.querySelector("[data-s]")
    };
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      let diff = Math.max(0, target - new Date());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5);  diff -= h * 36e5;
      const m = Math.floor(diff / 6e4);   diff -= m * 6e4;
      const s = Math.floor(diff / 1e3);
      els.d.textContent = d;
      els.h.textContent = pad(h);
      els.m.textContent = pad(m);
      els.s.textContent = pad(s);
    };
    tick();
    setInterval(tick, 1000);
  });

  /* ---------- Botón votar (efecto visual) ----------
     Con Spring el botón envía el formulario (POST).
     Abierto como archivo local, solo se simula el voto. */
  document.querySelectorAll(".vote-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      btn.classList.remove("pop");
      void btn.offsetWidth;
      btn.classList.add("pop");
      if (isStatic) {
        e.preventDefault();
        const voted = btn.classList.toggle("is-voted");
        btn.querySelector("span").textContent = voted ? "Votado" : "Votar";
        const counter = btn.closest(".card")?.querySelector(".card__votes strong");
        if (counter) {
          const n = parseInt(counter.textContent.replace(/\D/g, ""), 10) || 0;
          counter.textContent = (voted ? n + 1 : n - 1).toLocaleString("es-ES");
        }
      }
    });
  });

  /* ---------- Visor de jersey: delante y detrás en grande ----------
     Con Spring, la tarjeta trae data-delante y data-detras (URLs de las fotos).
     Sin ellas (tarjetas de muestra) se usa el dibujo del jersey y su espalda. */
  const viewer = document.getElementById("viewer");
  if (viewer) {
    const title = viewer.querySelector(".viewer__title");
    const author = viewer.querySelector(".viewer__author");
    const sides = viewer.querySelectorAll(".viewer__media");
    const actions = viewer.querySelector(".viewer__actions");

    /* Votar desde el visor: el botón del visor pulsa el de la tarjeta
       (mismo formulario POST, mismo aviso de login) y copia su estado. */
    const fillActions = (card) => {
      if (!actions) return;
      actions.replaceChildren();
      let cardBtn = card.querySelector(".vote-btn");
      if (cardBtn && cardBtn.closest("[hidden]")) cardBtn = null; // votación cerrada
      const votes = card.querySelector(".card__votes");
      if (!cardBtn) {
        const lock = card.querySelector(".vote-lock");
        if (lock) actions.appendChild(lock.cloneNode(true));
        return;
      }
      const votesCopy = votes ? votes.cloneNode(true) : null;
      const btn = cardBtn.cloneNode(true);
      btn.type = "button";
      const sync = () => {
        btn.className = cardBtn.className;
        btn.innerHTML = cardBtn.innerHTML;
        if (votesCopy) votesCopy.innerHTML = votes.innerHTML;
      };
      btn.addEventListener("click", () => {
        cardBtn.click();
        setTimeout(sync, 0);
      });
      if (votesCopy) actions.appendChild(votesCopy);
      actions.appendChild(btn);
    };

    document.addEventListener("click", (e) => {
      const open = e.target.closest(".card__open");
      if (!open) return;
      const card = open.closest(".card");
      title.textContent = card.querySelector(".card__title")?.textContent.trim() || "Jersey";
      author.textContent = card.querySelector(".card__author")?.textContent.trim() || "";
      sides.forEach((box) => {
        const side = box.dataset.side;
        box.style.setProperty("--card-bg", open.style.getPropertyValue("--card-bg"));
        const url = card.dataset[side];
        if (url) {
          const img = document.createElement("img");
          img.src = url;
          img.alt = title.textContent + " · " + (side === "delante" ? "delante" : "detrás");
          img.decoding = "async";
          box.replaceChildren(img);
        } else {
          const svg = open.querySelector("svg")?.cloneNode(true);
          if (svg && side === "detras") svg.querySelector("use")?.setAttribute("href", "#sweater-back");
          box.replaceChildren(...(svg ? [svg] : []));
        }
      });
      fillActions(card);
      viewer.showModal();
    });
    viewer.addEventListener("click", (e) => {
      if (e.target === viewer || e.target.closest("[data-close-viewer]")) viewer.close();
    });
  }

  /* ---------- Filtros (solo estado visual) ---------- */
  document.querySelectorAll(".chips").forEach((group) => {
    group.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      group.querySelectorAll(".chip").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
    });
  });

  /* ---------- Buscador (filtra tarjetas en cliente) ---------- */
  const search = document.querySelector("[data-search]");
  if (search) {
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll(".grid .card").forEach((card) => {
        card.hidden = q && !card.textContent.toLowerCase().includes(q);
      });
    });
  }

  /* ---------- Subida: arrastrar y vista previa (una por cada zona) ---------- */
  document.querySelectorAll(".dropzone").forEach((dz) => {
    const input = dz.querySelector('input[type="file"]');
    const badge = dz.querySelector(".dropzone__badge");

    ["dragenter", "dragover"].forEach((ev) =>
      dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("is-drag"); }));
    ["dragleave", "drop"].forEach((ev) =>
      dz.addEventListener(ev, () => dz.classList.remove("is-drag")));

    input.addEventListener("change", () => {
      const file = input.files[0];
      dz.querySelector(".dropzone__preview")?.remove();
      dz.classList.toggle("has-file", !!file);
      if (badge) badge.textContent = file ? file.name : "";
      if (file && file.type.startsWith("image/")) {
        // URL temporal: no carga la imagen entera en memoria como texto
        const img = document.createElement("img");
        img.className = "dropzone__preview";
        img.src = URL.createObjectURL(file);
        img.alt = "";
        img.decoding = "async";
        img.onload = () => URL.revokeObjectURL(img.src);
        dz.appendChild(img);
      }
    });
  });

  /* =========================================================
     VENTANA LOGIN / REGISTRO
     ========================================================= */
  const dlg = document.getElementById("auth");
  const authCopy = {
    login:    ["¡Hola de nuevo!", "Entra para subir tu jersey y votar."],
    registro: ["Únete al concurso", "Crea tu cuenta en menos de un minuto."]
  };
  const setTab = (name) => {
    if (!dlg) return;
    dlg.querySelectorAll('[role="tab"]').forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    dlg.querySelectorAll('[role="tabpanel"]').forEach((p) => { p.hidden = p.id !== "panel-" + name; });
    const title = dlg.querySelector(".auth__title");
    const sub = dlg.querySelector(".auth__sub");
    if (title) title.textContent = authCopy[name][0];
    if (sub) sub.textContent = authCopy[name][1];
  };
  if (dlg) {
    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open-auth]");
      if (opener) {
        e.preventDefault();
        setTab(opener.dataset.openAuth);
        if (!dlg.open) dlg.showModal();
        return;
      }
      const tabBtn = e.target.closest("[data-tab]");
      if (tabBtn && dlg.contains(tabBtn)) { e.preventDefault(); setTab(tabBtn.dataset.tab); }
      if (e.target.closest("[data-close-auth]")) dlg.close();
    });
    // Cerrar al pulsar fuera
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    // Spring puede pedir que se abra sola (p. ej. tras un login fallido)
    if (dlg.dataset.autoOpen) { setTab(dlg.dataset.autoOpen); dlg.showModal(); }
  }

  /* ---------- Acciones que piden sesión (subir y votar) ----------
     Formularios con data-requires-auth="mensaje": sin sesión, al intentar
     elegir una foto, soltarla o enviar, se abre el login con ese mensaje.
     Con Spring, <body data-logged> lo pone Thymeleaf (${usuario != null}). */
  const isLogged = () => document.body.dataset.logged === "true";
  const askLogin = (form) => {
    if (!dlg) return;
    setTab("login");
    const sub = dlg.querySelector(".auth__sub");
    if (sub && form.dataset.requiresAuth) sub.textContent = form.dataset.requiresAuth;
    if (!dlg.open) dlg.showModal();
  };
  const guard = (e) => {
    if (isLogged()) return;
    const form = e.target.closest && e.target.closest("form[data-requires-auth]");
    if (!form) return;
    if (e.type === "click" && !e.target.closest('.dropzone, [type="submit"]')) return;
    e.preventDefault();
    e.stopPropagation();
    askLogin(form);
  };
  ["click", "drop", "submit"].forEach((ev) => document.addEventListener(ev, guard, true));

  /* Mostrar / ocultar contraseña */
  document.querySelectorAll("[data-toggle-pw]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
    });
  });

  /* =========================================================
     MENÚ DE USUARIO
     ========================================================= */
  const closeMenus = (except) => {
    document.querySelectorAll(".user-menu.is-open").forEach((m) => {
      if (m === except) return;
      m.classList.remove("is-open");
      m.querySelector(".user-menu__btn").setAttribute("aria-expanded", "false");
    });
  };
  document.querySelectorAll(".user-menu").forEach((m) => {
    const b = m.querySelector(".user-menu__btn");
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMenus(m);
      const open = m.classList.toggle("is-open");
      b.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-menu")) closeMenus();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenus(); });

  /* =========================================================
     SESIÓN SIMULADA (solo al abrir los HTML sin Spring)
     Con Spring, lo que se ve lo decide th:if="${usuario}".
     ========================================================= */
  if (isStatic) {
    const KEY = "jf-demo-user";
    const read = () => { try { return localStorage.getItem(KEY) === "1"; } catch (_) { return false; } };
    const write = (v) => { try { v ? localStorage.setItem(KEY, "1") : localStorage.removeItem(KEY); } catch (_) {} };
    const apply = (logged) => {
      document.body.dataset.logged = String(logged);
      document.querySelectorAll('[data-auth="anon"]').forEach((el) => { el.hidden = logged; });
      document.querySelectorAll('[data-auth="user"]').forEach((el) => { el.hidden = !logged; });
    };
    const onProfile = document.body.dataset.page === "perfil";
    apply(read() || onProfile);

    document.querySelectorAll("[data-auth-form]").forEach((f) => {
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        write(true);
        apply(true);
        if (dlg) dlg.close();
      });
    });
    document.querySelectorAll("[data-logout]").forEach((f) => {
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        write(false);
        if (onProfile) location.href = "index.html";
        else { apply(false); closeMenus(); }
      });
    });
  }
})();
