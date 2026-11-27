/* =========================================================
   El hilo que nos une — interacciones (solo interfaz).
   La lógica real (guardar candidaturas, votos) la hace Spring Boot.
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Calendario del concurso (hora peninsular, diciembre = UTC+1) ----------
     Si Spring quiere fijar otra fecha, puede poner en el contador
     data-countdown-target="2026-12-06T00:00:00+01:00" y data-countdown-label="…". */
  const FASES = [
    { hasta: "2026-12-06T00:00:00+01:00", texto: "Las inscripciones abren en" },
    { hasta: "2026-12-10T12:00:00+01:00", texto: "Las inscripciones cierran en" },
    { hasta: "2026-12-13T12:00:00+01:00", texto: "La votación popular cierra en" },
    { hasta: "2026-12-14T12:00:00+01:00", texto: "El jurado decide en" }
  ];
  const FIN = "¡Ya tenemos ganadores! Nos vemos en la entrega.";

  /* ---------- Cabecera: sombra al hacer scroll ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Menú móvil ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    nav.querySelectorAll(".nav__menu a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  /* ---------- Aparición al hacer scroll (y el hilo que se dibuja) ---------- */
  const animated = document.querySelectorAll(".reveal, .thread");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    animated.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    animated.forEach((el) => io.observe(el));
  }

  /* ---------- Cuenta atrás ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const faseActual = (now) => FASES.find((f) => now < new Date(f.hasta));

  document.querySelectorAll("[data-countdown]").forEach((cd) => {
    const label = cd.querySelector("[data-cd-label]");
    const els = {
      d: cd.querySelector("[data-d]"),
      h: cd.querySelector("[data-h]"),
      m: cd.querySelector("[data-m]"),
      s: cd.querySelector("[data-s]")
    };
    const fixedTarget = cd.dataset.countdownTarget ? new Date(cd.dataset.countdownTarget) : null;
    const fixedLabel = cd.dataset.countdownLabel || "";
    let timer = 0;

    const tick = () => {
      const now = new Date();
      let target, texto;
      if (fixedTarget && !isNaN(fixedTarget)) {
        target = fixedTarget; texto = fixedLabel;
      } else {
        const fase = faseActual(now);
        if (fase) { target = new Date(fase.hasta); texto = fase.texto; }
      }
      if (!target || target <= now) {
        cd.classList.add("is-over");
        if (label) label.textContent = FIN;
        clearInterval(timer);
        return;
      }
      if (label && texto) label.textContent = texto;
      let diff = target - now;
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5);  diff -= h * 36e5;
      const m = Math.floor(diff / 6e4);   diff -= m * 6e4;
      const s = Math.floor(diff / 1e3);
      els.d.textContent = pad(d);
      els.h.textContent = pad(h);
      els.m.textContent = pad(m);
      els.s.textContent = pad(s);
    };
    tick();
    timer = setInterval(tick, 1000);
  });

  /* ---------- Línea de tiempo: marca lo pasado y lo que está en curso ----------
     Cada .tl lleva data-date (ISO). La primera fecha futura es "ahora". */
  const hitos = document.querySelectorAll(".tl[data-date]");
  if (hitos.length) {
    const now = new Date();
    let marcado = false;
    hitos.forEach((tl) => {
      const fecha = new Date(tl.dataset.date);
      if (isNaN(fecha)) return;
      if (fecha <= now) tl.classList.add("is-done");
      else if (!marcado) { tl.classList.add("is-now"); marcado = true; }
    });
  }

  /* ---------- Formulario: foto con vista previa ---------- */
  document.querySelectorAll(".dropzone").forEach((dz) => {
    const input = dz.querySelector('input[type="file"]');
    const name = dz.querySelector(".dropzone__name");
    if (!input) return;

    ["dragenter", "dragover"].forEach((ev) =>
      dz.addEventListener(ev, () => { if (!input.disabled) dz.classList.add("is-drag"); }));
    ["dragleave", "drop"].forEach((ev) =>
      dz.addEventListener(ev, () => dz.classList.remove("is-drag")));

    input.addEventListener("change", () => {
      const file = input.files[0];
      dz.querySelector(".dropzone__preview")?.remove();
      if (name) name.textContent = file ? file.name : "";
      if (file && file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.className = "dropzone__preview";
        img.src = URL.createObjectURL(file);
        img.alt = "Vista previa de tu jersey";
        img.onload = () => URL.revokeObjectURL(img.src);
        dz.insertBefore(img, name);
      }
    });
  });

  /* ---------- Menor de edad: muestra los datos del tutor ----------
     Los campos ocultos se desactivan para que no bloqueen el envío. */
  document.querySelectorAll("[data-toggles]").forEach((check) => {
    const target = document.querySelector(check.dataset.toggles);
    if (!target) return;
    const sync = () => {
      const on = check.checked;
      target.hidden = !on;
      target.querySelectorAll("input, select, textarea").forEach((el) => { el.disabled = !on; });
    };
    sync();
    check.addEventListener("change", sync);
  });

  /* ---------- Botón votar (pequeño efecto) ---------- */
  document.querySelectorAll(".vote-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.remove("is-pop");
      void btn.offsetWidth;
      btn.classList.add("is-pop");
    });
  });

  /* =========================================================
     VENTANA ENTRAR / CREAR CUENTA
     ========================================================= */
  const isStatic = location.protocol === "file:" ||
    (/^(127\.0\.0\.1|localhost)$/.test(location.hostname) && location.port === "5500");
  const dlg = document.getElementById("auth");
  const authCopy = {
    login:    ["¡Hola de nuevo!", "Entra para presentar tu jersey y votar."],
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
    dlg.querySelector(".auth__title").textContent = authCopy[name][0];
    dlg.querySelector(".auth__sub").textContent = authCopy[name][1];
  };
  const openAuth = (tab, msg) => {
    if (!dlg) return;
    setTab(tab);
    if (msg) dlg.querySelector(".auth__sub").textContent = msg;
    if (!dlg.open) dlg.showModal();
    dlg.querySelector('[role="tabpanel"]:not([hidden]) input')?.focus();
  };
  if (dlg) {
    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open-auth]");
      if (opener) { e.preventDefault(); openAuth(opener.dataset.openAuth); return; }
      const tabBtn = e.target.closest("[data-tab]");
      if (tabBtn && dlg.contains(tabBtn)) { e.preventDefault(); setTab(tabBtn.dataset.tab); }
      if (e.target.closest("[data-close-auth]")) dlg.close();
    });
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });   // clic fuera
    if (dlg.dataset.autoOpen) openAuth(dlg.dataset.autoOpen);                        // /?error
  }

  /* Mostrar / ocultar contraseña */
  document.querySelectorAll("[data-toggle-pw]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
    });
  });

  /* Acciones que piden sesión: formularios con data-requires-auth="mensaje".
     Sin sesión, al pulsar una zona de foto, soltar una foto o enviar,
     se abre la ventana de entrar / crear cuenta con ese mensaje. */
  const isLogged = () => document.body.dataset.logged === "true";
  const guard = (e) => {
    if (isLogged() || !e.target.closest) return;
    const form = e.target.closest("form[data-requires-auth]");
    if (!form) return;
    if (e.type === "click" && !e.target.closest('.dropzone, [type="submit"]')) return;
    e.preventDefault();
    e.stopPropagation();
    openAuth("login", form.dataset.requiresAuth);
  };
  ["click", "drop", "submit"].forEach((ev) => document.addEventListener(ev, guard, true));
  // Sin esto, soltar un archivo fuera de una zona activa haría que el navegador lo abriera
  document.addEventListener("dragover", (e) => {
    if (!isLogged() && e.target.closest && e.target.closest("form[data-requires-auth] .dropzone")) e.preventDefault();
  });

  /* Menú del usuario */
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
      b.setAttribute("aria-expanded", String(m.classList.toggle("is-open")));
    });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".user-menu")) closeMenus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenus(); });

  /* Sesión simulada: solo al ver los HTML sin Spring (archivo o Live Server).
     Con Spring, lo que se ve lo decide th:if="${usuario}". */
  if (isStatic) {
    const KEY = "ehqnu-demo-user";
    const read = () => { try { return localStorage.getItem(KEY) === "1"; } catch (_) { return false; } };
    const write = (v) => { try { v ? localStorage.setItem(KEY, "1") : localStorage.removeItem(KEY); } catch (_) {} };
    const apply = (logged) => {
      document.body.dataset.logged = String(logged);
      document.querySelectorAll('[data-auth="anon"]').forEach((el) => { el.hidden = logged; });
      document.querySelectorAll('[data-auth="user"]').forEach((el) => { el.hidden = !logged; });
    };
    apply(read());
    document.querySelectorAll("[data-auth-form]").forEach((f) => {
      f.addEventListener("submit", (e) => { e.preventDefault(); write(true); apply(true); if (dlg) dlg.close(); });
    });
    document.querySelectorAll("[data-logout]").forEach((f) => {
      f.addEventListener("submit", (e) => { e.preventDefault(); write(false); apply(false); closeMenus(); });
    });
  }

  /* ---------- Bases: resalta el apartado visible en el índice ---------- */
  const tocLinks = document.querySelectorAll(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    tocLinks.forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (sec) map.set(sec, a);
    });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove("is-active"));
        map.get(e.target)?.classList.add("is-active");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    map.forEach((_, sec) => spy.observe(sec));
  }
})();
