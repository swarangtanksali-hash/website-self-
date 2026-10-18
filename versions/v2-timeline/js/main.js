/* Swarang Tanksali — site interactions. No dependencies, no network calls. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Recommendations (rendered with textContent, never innerHTML) ---------- */
  // Source: LinkedIn recommendations received (text verbatim; `highlight` is a short pull-quote from the same text).
  const RECOMMENDATIONS = [
    {
      name: "Maansi Sanghi",
      role: "Founder, Envizon · Fractional CMO & GTM Leader for B2B SaaS",
      relation: "Worked with Swarang on the same team",
      highlight: "Swarang brought in structure and clarity.",
      text: "I had the pleasure of working with Swarang, and he has been a fantastic colleague. In marketing, he took the time to understand SaaS nuances and worked out what was best for the company while aligning with marketing requirements.\n\nOn the finance side, Swarang brought in structure and clarity—whether it was budgeting, accounting, or tools expense management. He brought in better visibility and management. His efforts ensured smoother processes and more informed decision-making across the board.\n\nBeyond work, Swarang is intelligent, trustworthy, and a genuinely fun colleague to have around. He is accountable, always willing to help, and brings positive energy to the team.",
    },
    {
      name: "Maharshi Vyas",
      role: "Head, PrimeServ STG Business",
      relation: "Worked with Swarang at Howden",
      highlight: "A catalyst to grow business.",
      text: "Swarang is a highly competent, process driven and smart finance professional with whom I had pleasure of working at Howden. He blends his finance knowledge and acts as a catalyst to grow business while collaborating with multiple disciplines successfully. His attitude of taking ownership and providing accurate details has been his forte. His team thrives under his open and structured leadership style. I can confidently recommend Swarang to any organization who is looking for a leader who has micro as well macro understanding of the paradigm. I wish him the best in his future endeavors.",
    },
    {
      name: "Shirish Uplenchwar",
      role: "Business Development Director – India, Energy Dome · Independent Director",
      relation: "Managed Swarang directly",
      highlight: "An exceptional communicator with excellent analytical and problem-solving skills.",
      text: "I have had the opportunity to analyze Swarang's skills and qualifications, and I can confidently say that he is a talented and dedicated professional who would be a valuable asset to any organisation.\n\nSwarang is an exceptional communicator with excellent analytical and problem-solving skills. He is always willing to go the extra mile to ensure that tasks are completed to the highest standards, and his attention to detail is unparalleled. Additionally, he is a quick learner and is always eager to acquire new knowledge and skills.\n\nSwarang's passion for his work is contagious, and his positive attitude and friendly demeanor make him a joy to work with. He is an excellent team player who is always willing to collaborate and contribute to the success of the group.",
    },
    {
      name: "Aloke Sharma",
      role: "Vice President, Corporate Finance · Blackstone-backed EPL",
      relation: "Managed Swarang directly at Magna",
      highlight: "Approaches tasks from different angles to get to the solution.",
      text: "Had the chance to work with Swarang directly at Magna, the thing that stood out for me was his commitment to work and the willingness to learn. Have seen him over the years growing as an individual and a performer. The individuality resounds in having the point of view and approaching tasks from different angles to get to the solution. All the best Swarang",
    },
    {
      name: "Yayati Jawale",
      role: "Senior Vice President, Citi",
      relation: "Managed Swarang directly",
      highlight: "A go-getter, always ready to jump into action.",
      text: "Swarang is a great person to work with, a go getter always ready to jump in to action. Good team player always willing to help others.",
    },
    {
      name: "Puneet Jain",
      role: "Finance Director, Vegrow · Strategic Finance Leader",
      relation: "Senior colleague",
      highlight: "A perpetual optimist with an eye for detail.",
      text: "Swarang is a dedicated professional having an eye for detail. Always open for taking up new challenges, goes that extra mile to help others to achieve the deadlines. Believes in team work and guides the team to perform the task accurately. Having an inquisitive mindset and excellent probing skills enables him to improve his learning curve on an ongoing basis. A perpetual optimist and self motivated personality makes him an asset of your team.",
    },
  ];

  /* ---------- Preloader ---------- */
  function runLoader(done) {
    const loader = $("#loader");
    const count = $("#loaderCount");
    const bar = $("#loaderBar");
    document.body.classList.add("is-loading");
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      done();
    };
    if (reduceMotion) { finish(); return; }
    // Never trap the visitor behind the loader (e.g. rAF paused in a background tab).
    setTimeout(finish, 2500);
    const start = performance.now();
    const dur = 1300;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      count.textContent = "T+" + Math.round(30 - 27 * e);
      bar.style.setProperty("width", (e * 100).toFixed(1) + "%");
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(finish, 220);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Rotating word ---------- */
  function initRotator() {
    const el = $("#rotator");
    if (!el || reduceMotion) return;
    const words = ["decisions.", "runway.", "savings.", "board stories.", "growth."];
    let i = 0;
    setInterval(() => {
      el.classList.add("is-out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove("is-out");
        el.classList.add("is-in");
        void el.offsetWidth;
        el.classList.remove("is-in");
      }, 350);
    }, 2600);
  }

  /* ---------- Hero canvas: reactive dot grid + growth line ---------- */
  function initHeroCanvas() {
    const canvas = $("#heroCanvas");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const hero = $("#hero");
    let w = 0, h = 0, dpr = 1, dots = [], visible = true, t0 = performance.now();
    const mouse = { x: -9999, y: -9999 };
    const GAP = 34;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = GAP / 2; y < h; y += GAP) for (let x = GAP / 2; x < w; x += GAP) dots.push({ x, y });
    }

    // Deterministic "growth" series: noisy but trending up.
    const series = Array.from({ length: 48 }, (_, i) => {
      const trend = i / 47;
      return 0.15 + trend * 0.7 + Math.sin(i * 0.9) * 0.05 + Math.sin(i * 2.3) * 0.03;
    });

    function draw(now) {
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      const R = 150;
      for (const d of dots) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const k = Math.max(0, 1 - dist / R);
        const ox = dist > 0 ? (dx / dist) * k * 8 : 0;
        const oy = dist > 0 ? (dy / dist) * k * 8 : 0;
        ctx.fillStyle = k > 0 ? `rgba(62,230,160,${0.12 + k * 0.7})` : "rgba(255,255,255,0.07)";
        ctx.beginPath();
        ctx.arc(d.x + ox, d.y + oy, 1 + k * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      // growth line, drawn progressively then breathing
      const elapsed = (now - t0) / 1000;
      const prog = reduceMotion ? 1 : Math.min(1, elapsed / 2.6);
      const n = Math.max(2, Math.floor(series.length * prog));
      const baseY = h * 0.92, span = h * 0.55;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = (i / (series.length - 1)) * w;
        const y = baseY - (series[i] + Math.sin(elapsed * 0.8 + i * 0.4) * 0.01) * span;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(62,230,160,0)");
      grad.addColorStop(0.5, "rgba(62,230,160,0.35)");
      grad.addColorStop(1, "rgba(184,243,107,0.6)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (!reduceMotion) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was && !reduceMotion) requestAnimationFrame(draw);
    }).observe(hero);
    requestAnimationFrame(draw);
  }

  /* ---------- Portrait tilt + parallax chips ---------- */
  function initTilt() {
    const wrap = $("#heroVisual");
    const portrait = $("#portrait");
    if (!wrap || !portrait || !finePointer || reduceMotion) return;
    const chips = $$(".chip", portrait);
    $("#hero").addEventListener("pointermove", (e) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const py = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      portrait.style.setProperty("transform", `rotateY(${px * 10}deg) rotateX(${-py * 8}deg)`);
      chips.forEach((c) => {
        const d = parseFloat(c.dataset.depth) || 0;
        c.style.setProperty("transform", `translate3d(${px * d}px, ${py * d}px, 40px)`);
      });
    }, { passive: true });
  }

  /* ---------- Custom cursor + magnetic buttons ---------- */
  function initCursor() {
    if (!finePointer || reduceMotion) return;
    document.documentElement.classList.add("has-cursor");
    const cursor = $(".cursor");
    const dot = $(".cursor__dot");
    dot.style.setProperty("transform", "translate3d(-100px, -100px, 0)");
    window.addEventListener("pointermove", (e) => {
      dot.style.setProperty("transform", `translate3d(${e.clientX}px, ${e.clientY}px, 0)`);
    }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      cursor.classList.toggle("is-hover", !!e.target.closest("a, button"));
    });

    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        el.style.setProperty("transform", `translate(${mx * 0.22}px, ${my * 0.3}px)`);
      });
      el.addEventListener("pointerleave", () => el.style.removeProperty("transform"));
    });
  }

  /* ---------- Spotlight cards ---------- */
  function initSpotlight() {
    $$(".spot").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }, { passive: true });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------- Count-up stats ---------- */
  function initCounters() {
    const animate = (el) => {
      const to = parseFloat(el.dataset.to);
      const from = parseFloat(el.dataset.from || "0");
      const dec = parseInt(el.dataset.decimals || "0", 10);
      if (!Number.isFinite(to) || !Number.isFinite(from)) return;
      if (reduceMotion) { el.textContent = to.toFixed(dec); return; }
      const start = performance.now(), dur = 1800;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = (from + (to - from) * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    $$(".count").forEach((el) => io.observe(el));
  }

  /* ---------- Before / After ---------- */
  function initBeforeAfter() {
    const box = $("#ba");
    if (!box) return;
    const rows = $$(".ba__row", box);
    const opts = $$(".toggle__opt", box);
    let state = "before", auto = null, touched = false;

    const set = (s) => {
      state = s;
      box.classList.toggle("is-after", s === "after");
      opts.forEach((o) => {
        const on = o.dataset.state === s;
        o.classList.toggle("is-on", on);
        o.setAttribute("aria-checked", String(on));
      });
      rows.forEach((r) => {
        const pct = parseFloat(s === "after" ? r.dataset.after : r.dataset.before) || 0;
        r.querySelector(".ba__bar").style.setProperty("--w", String(Math.max(0, Math.min(100, pct)) / 100));
        r.querySelector(".ba__val").textContent = s === "after" ? r.dataset.la : r.dataset.lb;
      });
    };
    opts.forEach((o) => o.addEventListener("click", () => { touched = true; clearInterval(auto); set(o.dataset.state); }));
    rows.forEach((r) => r.querySelector(".ba__bar").style.setProperty("--w", "0"));

    // When it scrolls into view: fill "before", then flip to "after" automatically once.
    new IntersectionObserver(([en], obs) => {
      if (!en.isIntersecting) return;
      obs.disconnect();
      set("before");
      setTimeout(() => { if (!touched) set("after"); }, 1800);
      if (!reduceMotion) {
        auto = setInterval(() => { if (!touched) set(state === "after" ? "before" : "after"); }, 4200);
      }
    }, { threshold: 0.4 }).observe(box);
  }

  /* ---------- Career timeline: hover or click a stint ---------- */
  function initStints() {
    const wrap = $("#stints");
    if (!wrap) return;
    const tabs = $$(".stint", wrap);
    const fill = $("#stintsFill");
    const select = (tab, focus = false) => {
      const idx = tabs.indexOf(tab);
      if (idx < 0) return;
      tabs.forEach((t, i) => {
        const on = i === idx;
        t.classList.toggle("is-on", on);
        t.classList.toggle("is-past", i < idx);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls") || "");
        if (panel) panel.hidden = !on;
      });
      if (fill) fill.style.setProperty("transform", `scaleX(${tabs.length > 1 ? idx / (tabs.length - 1) : 1})`);
      // On narrow screens the rail scrolls; keep the selected stint in view.
      const rail = tab.parentElement;
      if (rail.scrollWidth > rail.clientWidth) {
        rail.scrollTo({ left: tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
      }
      if (focus) tab.focus({ preventScroll: true });
    };
    tabs.forEach((t) => {
      t.addEventListener("click", () => select(t));
      if (finePointer) t.addEventListener("pointerenter", () => select(t));
      t.addEventListener("keydown", (e) => {
        const i = tabs.indexOf(t);
        const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        select(tabs[(next + tabs.length) % tabs.length], true);
      });
    });
    select(tabs.find((t) => t.classList.contains("is-on")) || tabs[tabs.length - 1]);
  }

  /* ---------- Terminal typing ---------- */
  function initTerminal() {
    const body = $("#terminalBody");
    if (!body) return;
    const script = [
      { cls: "t-prompt", text: "whoami", type: true },
      { cls: "t-plain", text: "Finance controller. Slightly AI-pilled." },
      { cls: "t-prompt", text: "ls shipped/", type: true },
      { cls: "t-ok", text: "AI-powered KPI & usage dashboards" },
      { cls: "t-out", text: "used by leadership, finance, GTM and CS" },
      { cls: "t-ok", text: "Runway app for our founder" },
      { cls: "t-out", text: "clear view of cash and burn, used in board meetings" },
      { cls: "t-ok", text: "Automated month-end on Zoho, Ramp and QBO" },
      { cls: "t-out", text: "MIS at T+3, 50+ hours a month back" },
    ];
    let started = false;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    async function play() {
      while (true) {
        body.textContent = "";
        for (const line of script) {
          const div = document.createElement("div");
          div.className = "t-line " + line.cls;
          body.appendChild(div);
          if (line.type && !reduceMotion) {
            const caret = document.createElement("span");
            caret.className = "t-caret";
            for (let i = 1; i <= line.text.length; i++) {
              div.textContent = line.text.slice(0, i);
              div.appendChild(caret);
              await sleep(28 + Math.random() * 30);
            }
            caret.remove();
            await sleep(450);
          } else {
            div.textContent = line.text;
            await sleep(reduceMotion ? 0 : 520);
          }
        }
        const caret = document.createElement("span");
        caret.className = "t-caret";
        body.appendChild(caret);
        if (reduceMotion) return;
        await sleep(5200);
      }
    }
    new IntersectionObserver(([en], obs) => {
      if (en.isIntersecting && !started) { started = true; obs.disconnect(); play(); }
    }, { threshold: 0.35 }).observe(body);
  }

  /* ---------- Recommendations carousel ---------- */
  function initVoices() {
    const track = $("#voicesTrack");
    const dotsWrap = $("#voiceDots");
    const section = $("#voices");
    if (!track) return;
    if (!RECOMMENDATIONS.length) {
      section.hidden = true;
      $$('a[href="#voices"]').forEach((a) => { a.hidden = true; });
      return;
    }

    const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");

    RECOMMENDATIONS.forEach((rec, idx) => {
      const fig = document.createElement("figure");
      fig.className = "voice spot";
      const q = document.createElement("div");
      q.className = "voice__q"; q.textContent = "“"; q.setAttribute("aria-hidden", "true");
      const hl = document.createElement("p");
      hl.className = "voice__hl";
      hl.textContent = rec.highlight || "";
      const bq = document.createElement("blockquote");
      String(rec.text).split(/\n{2,}/).forEach((para) => {
        const p = document.createElement("p");
        p.textContent = para.trim();
        bq.appendChild(p);
      });
      fig.append(q);
      if (rec.highlight) fig.appendChild(hl);
      fig.appendChild(bq);
      if (String(rec.text).length > 420) {
        bq.classList.add("is-clamped");
        const more = document.createElement("button");
        more.className = "voice__more"; more.type = "button"; more.textContent = "Read more";
        more.addEventListener("click", () => {
          const clamped = bq.classList.toggle("is-clamped");
          more.textContent = clamped ? "Read more" : "Show less";
        });
        fig.appendChild(more);
      }
      const cap = document.createElement("figcaption");
      const av = document.createElement("span");
      av.className = "voice__avatar"; av.textContent = initials(rec.name); av.setAttribute("aria-hidden", "true");
      const who = document.createElement("div");
      const nm = document.createElement("div"); nm.className = "voice__name"; nm.textContent = rec.name;
      const rl = document.createElement("div"); rl.className = "voice__role"; rl.textContent = rec.role;
      who.append(nm, rl);
      if (rec.relation) {
        const rel = document.createElement("div"); rel.className = "voice__role"; rel.textContent = rec.relation;
        who.appendChild(rel);
      }
      cap.append(av, who);
      fig.appendChild(cap);
      track.appendChild(fig);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Recommendation ${idx + 1}`);
      dot.addEventListener("click", () => go(idx));
      dotsWrap.appendChild(dot);
    });

    const cards = $$(".voice", track);
    const dots = $$("button", dotsWrap);
    const go = (i) => {
      const idx = (i + cards.length) % cards.length;
      track.scrollTo({ left: cards[idx].offsetLeft - track.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    };
    const current = () => {
      let best = 0, bestD = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    };
    const syncDots = () => { const c = current(); dots.forEach((d, i) => d.classList.toggle("is-on", i === c)); };
    track.addEventListener("scroll", () => requestAnimationFrame(syncDots), { passive: true });
    $("#voicePrev").addEventListener("click", () => go(current() - 1));
    $("#voiceNext").addEventListener("click", () => go(current() + 1));
    syncDots();

    // drag to scroll (mouse)
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.target.closest("button")) return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add("is-drag");
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false; track.classList.remove("is-drag");
      if (moved) go(current());
    });

    // gentle autoplay while visible and not interacted with
    if (!reduceMotion && cards.length > 1) {
      let timer = null, paused = false;
      ["pointerenter", "focusin", "touchstart"].forEach((ev) => track.addEventListener(ev, () => { paused = true; }, { passive: true }));
      new IntersectionObserver(([en]) => {
        clearInterval(timer);
        if (en.isIntersecting) timer = setInterval(() => { if (!paused) go(current() + 1); }, 6500);
      }, { threshold: 0.4 }).observe(track);
    }
  }

  /* ---------- Nav: hide on scroll down, active link, mobile menu ---------- */
  function initNav() {
    const nav = $("#nav");
    const bar = $("#progressBar");
    let lastY = window.scrollY;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      nav.classList.toggle("is-hidden", y > lastY && y > 200);
      lastY = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty("transform", `scaleX(${max > 0 ? y / max : 0})`);
    }, { passive: true });

    const links = $$(".nav__links a");
    const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => io.observe(s));

    const burger = $("#burger");
    const menu = $("#mobileMenu");
    const close = () => { menu.hidden = true; burger.setAttribute("aria-expanded", "false"); document.body.style.removeProperty("overflow"); };
    burger.addEventListener("click", () => {
      const open = menu.hidden;
      menu.hidden = !open;
      burger.setAttribute("aria-expanded", String(open));
      if (open) document.body.style.setProperty("overflow", "hidden"); else close();
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) close(); });
  }

  /* ---------- Copy email ---------- */
  function initCopy() {
    const btn = $("#copyEmail");
    const toast = $("#toast");
    if (!btn) return;
    const email = btn.dataset.email || "";
    const show = (msg) => {
      toast.textContent = msg;
      toast.classList.add("is-on");
      clearTimeout(show.t);
      show.t = setTimeout(() => toast.classList.remove("is-on"), 2200);
    };
    btn.addEventListener("click", async () => {
      try {
        if (!navigator.clipboard) throw new Error("no clipboard");
        await navigator.clipboard.writeText(email);
        show("Email copied. Talk soon!");
      } catch {
        window.location.href = "mailto:" + encodeURIComponent(email).replace("%40", "@");
      }
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = String(new Date().getFullYear());
    initVoices();
    initNav();
    initReveal();
    initCounters();
    initBeforeAfter();
    initStints();
    initTerminal();
    initSpotlight();
    initCopy();
    runLoader(() => {
      document.body.classList.add("is-ready");
      initHeroCanvas();
      initRotator();
      initTilt();
      initCursor();
    });
  });
})();
