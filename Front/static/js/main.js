/* =========================================================
   Jersey Fest — interacciones visuales (solo UI).
   La lógica real (guardar, votar) la hace Spring Boot.
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Modo ligero (lo decide el script del <head>): menos partículas y 30 fps
  const lite = document.documentElement.classList.contains("lite");
  const K = lite ? 2 : 1; // compensa la velocidad al ir a la mitad de fps

  // Bucle de animación con límite de fps, se puede parar y reanudar
  const makeLoop = (fn, fps) => {
    const interval = 1000 / fps;
    let id = 0, last = 0, running = false;
    const tick = (t) => {
      id = requestAnimationFrame(tick);
      if (t - last < interval - 2) return;
      last = t;
      fn();
    };
    return {
      start() { if (!running) { running = true; id = requestAnimationFrame(tick); } },
      stop()  { running = false; cancelAnimationFrame(id); }
    };
  };

  const debounce = (fn, ms) => {
    let t;
    return () => { clearTimeout(t); t = setTimeout(fn, ms); };
  };

  /* ---------- Guirnalda de luces ---------- */
  const lights = document.querySelector(".lights");
  if (lights) {
    const build = () => {
      lights.innerHTML = "";
      const count = Math.max(10, Math.floor(window.innerWidth / (lite ? 60 : 42)));
      for (let i = 0; i < count; i++) {
        const li = document.createElement("li");
        li.style.setProperty("--delay", (Math.random() * 1.8).toFixed(2) + "s");
        lights.appendChild(li);
      }
    };
    build();
    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(build, 200); });
  }

  /* ---------- Nieve ---------- */
  const canvas = document.getElementById("snow");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, flakes;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const n = lite ? Math.min(45, Math.floor(w / 14)) : Math.min(140, Math.floor(w / 10));
      flakes = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.4 + 0.6,
        s: Math.random() * 0.7 + 0.3,
        d: Math.random() * Math.PI * 2,
        o: Math.random() * 0.5 + 0.35
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.s * K;
        f.d += 0.01 * K;
        f.x += Math.sin(f.d) * 0.4 * K;
        if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
        ctx.globalAlpha = f.o;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    resize();
    ctx.fillStyle = "#fff";
    const snowLoop = makeLoop(draw, lite ? 30 : 60);
    snowLoop.start();
    window.addEventListener("resize", debounce(() => { resize(); ctx.fillStyle = "#fff"; }, 150));
  } else if (canvas) {
    canvas.remove();
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

  /* ---------- Aparición al hacer scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Cuenta atrás (fecha en data-countdown, formato ISO) ---------- */
  const cd = document.querySelector("[data-countdown]");
  if (cd) {
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
  }

  /* ---------- Botón votar (efecto visual) ----------
     Con Spring el botón envía el formulario (POST).
     Abierto como archivo local, solo se simula el voto. */
  const isStatic = location.protocol === "file:";
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

  /* ---------- Subida: arrastrar y vista previa ---------- */
  const dz = document.querySelector(".dropzone");
  if (dz) {
    const input = dz.querySelector('input[type="file"]');
    const fileLabel = dz.querySelector(".dropzone__file");
    const previewMedia = document.querySelector("[data-preview-media]");

    ["dragenter", "dragover"].forEach((ev) =>
      dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("is-drag"); }));
    ["dragleave", "drop"].forEach((ev) =>
      dz.addEventListener(ev, () => dz.classList.remove("is-drag")));

    input.addEventListener("change", () => {
      const file = input.files[0];
      if (!file) return;
      if (fileLabel) fileLabel.textContent = file.name;
      if (previewMedia && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          previewMedia.innerHTML = "";
          const img = document.createElement("img");
          img.src = reader.result;
          img.alt = "Vista previa del jersey";
          previewMedia.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /* Texto de la vista previa en vivo */
  document.querySelectorAll("[data-bind]").forEach((field) => {
    const target = document.querySelector('[data-bound="' + field.dataset.bind + '"]');
    if (!target) return;
    const fallback = target.textContent;
    const update = () => {
      const v = field.tagName === "SELECT"
        ? field.options[field.selectedIndex].text
        : field.value.trim();
      target.textContent = v || fallback;
    };
    field.addEventListener("input", update);
    field.addEventListener("change", update);
  });

  /* =========================================================
     LA BOLA: purpurina, bola de nieve, anillo de luces,
     inclinación 3D con el ratón y "agitar" al pulsar
     ========================================================= */
  const orn = document.querySelector("[data-ornament]");
  if (orn) {
    const NS = "http://www.w3.org/2000/svg";
    const tilt = orn.querySelector(".ornament__tilt");
    const ball = orn.querySelector(".ornament__ball");
    const glitter = orn.querySelector(".glitter");
    const snowCv = orn.querySelector(".ornament__snow");

    // Purpurina dentro del cristal
    if (glitter) {
      const G = lite ? 28 : 90;
      for (let i = 0; i < G; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 190;
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", (200 + Math.cos(a) * r).toFixed(1));
        c.setAttribute("cy", (200 + Math.sin(a) * r).toFixed(1));
        c.setAttribute("r", (Math.random() * 1.6 + 0.6).toFixed(1));
        c.setAttribute("fill", Math.random() < 0.3 ? "#ffc83d" : "#ffffff");
        c.style.setProperty("--d", (Math.random() * 2.4).toFixed(2) + "s");
        glitter.appendChild(c);
      }
    }

    // Anillo de luces (las de delante tapan la bola, las de detrás quedan ocultas)
    const N = lite ? 10 : 16;
    const bulbs = [];
    for (let i = 0; i < N; i++) {
      const b = document.createElement("span");
      b.className = "orb-bulb";
      tilt.appendChild(b);
      bulbs.push(b);
    }
    const T = (-14 * Math.PI) / 180, cosT = Math.cos(T), sinT = Math.sin(T);
    let angle = 0, boost = 0, S = tilt.offsetWidth;
    const placeBulbs = () => {
      const RX = S * 0.68, RY = S * 0.15;
      bulbs.forEach((b, i) => {
        const t = angle + (i / N) * Math.PI * 2;
        const x = RX * Math.cos(t), y = RY * Math.sin(t);
        const depth = Math.sin(t); // >0 delante, <0 detrás
        const s = 0.7 + (depth + 1) * 0.25;
        b.style.transform = "translate(" + (x * cosT - y * sinT).toFixed(1) + "px," +
          (x * sinT + y * cosT).toFixed(1) + "px) scale(" + s.toFixed(2) + ")";
        b.style.zIndex = depth > 0 ? 7 : 1;
        b.style.opacity = (0.5 + (depth + 1) * 0.25).toFixed(2);
      });
    };

    // Bola de nieve interior
    const ctx = snowCv.getContext("2d");
    let W = 0, H = 0;
    const sizeSnow = () => {
      const dpr = lite ? 1 : Math.min(2, window.devicePixelRatio || 1);
      S = tilt.offsetWidth;
      W = ball.offsetWidth; H = ball.offsetHeight;
      snowCv.width = W * dpr; snowCv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      placeBulbs();
    };
    sizeSnow();
    window.addEventListener("resize", debounce(sizeSnow, 150));
    const flakes = Array.from({ length: lite ? 35 : 75 }, () => {
      const max = Math.random() * 0.45 + 0.2;
      return { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: max, max,
               r: Math.random() * 2 + 0.8, ph: Math.random() * 6.28 };
    });
    const stepSnow = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (const f of flakes) {
        f.ph += 0.02 * K;
        f.vy = Math.min(f.vy + 0.02 * K, f.max);
        f.vx *= lite ? 0.92 : 0.96;
        f.x += (f.vx + Math.sin(f.ph) * 0.25) * K;
        f.y += f.vy * K;
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
        if (f.y < -40) f.y = -40;
        if (f.x < -4) f.x = W + 4;
        if (f.x > W + 4) f.x = -4;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = () => {
      angle += (0.008 + boost) * K;
      boost *= lite ? 0.92 : 0.96;
      placeBulbs();
      stepSnow();
    };
    const orbLoop = makeLoop(frame, lite ? 30 : 60);
    if (reduceMotion) {
      placeBulbs(); stepSnow();
    } else if ("IntersectionObserver" in window) {
      // Solo se anima mientras la bola está en pantalla
      new IntersectionObserver(([e]) => { e.isIntersecting ? orbLoop.start() : orbLoop.stop(); })
        .observe(orn);
    } else {
      orbLoop.start();
    }

    // Inclinación 3D siguiendo el ratón
    orn.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = orn.getBoundingClientRect();
      const dx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const dy = ((e.clientY - r.top) / r.height - 0.5) * 2;
      tilt.style.setProperty("--ry", (dx * 14).toFixed(1) + "deg");
      tilt.style.setProperty("--rx", (-dy * 14).toFixed(1) + "deg");
      tilt.style.setProperty("--gx", (-dx * 12).toFixed(1) + "px");
      tilt.style.setProperty("--gy", (-dy * 12).toFixed(1) + "px");
    });
    orn.addEventListener("pointerleave", () => {
      ["--rx", "--ry", "--gx", "--gy"].forEach((p) => tilt.style.removeProperty(p));
    });

    // Agitar: tambaleo + ventisca interior + estallido de estrellas
    const colors = ["#ffc83d", "#e5384f", "#2fb36f", "#4cc3ef", "#fff8ee"];
    const shake = (x, y) => {
      tilt.classList.remove("is-shaken");
      void tilt.offsetWidth;
      tilt.classList.add("is-shaken");
      flakes.forEach((f) => { f.vx = (Math.random() - 0.5) * 9; f.vy = -(Math.random() * 5 + 1.5); });
      boost = 0.12;
      if (reduceMotion) { stepSnow(); return; }
      for (let i = 0; i < 18; i++) {
        const s = document.createElementNS(NS, "svg");
        s.setAttribute("viewBox", "0 0 24 24");
        s.setAttribute("class", "burst");
        s.innerHTML = '<use href="#star"/>';
        const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 150;
        s.style.cssText = "--x:" + x + "px;--y:" + y + "px;--s:" + (10 + Math.random() * 20).toFixed(0) +
          "px;--c:" + colors[i % colors.length] + ";--tx:" + (Math.cos(a) * d).toFixed(0) +
          "px;--ty:" + (Math.sin(a) * d).toFixed(0) + "px";
        orn.appendChild(s);
        s.addEventListener("animationend", () => s.remove());
      }
    };
    orn.addEventListener("click", (e) => {
      const r = orn.getBoundingClientRect();
      shake(e.clientX - r.left, e.clientY - r.top);
    });
    orn.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      const b = ball.getBoundingClientRect(), r = orn.getBoundingClientRect();
      shake(b.left - r.left + b.width / 2, b.top - r.top + b.height / 2);
    });
  }

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
