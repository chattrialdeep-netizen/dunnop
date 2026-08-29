(() => {
  const glitchCanvas = document.getElementById('glitchCanvas');
  const muteBtn = document.getElementById('muteBtn');
  const entryScreen = document.getElementById('entryScreen');
  const revealScreen = document.getElementById('revealScreen');
  const codeForm = document.getElementById('codeForm');
  const codeInput = document.getElementById('codeInput');
  const errorMsg = document.getElementById('errorMsg');
  const congratsText = document.getElementById('congratsText');
  const revealImg = document.getElementById('revealImg');
  const revealName = document.getElementById('revealName');
  const againBtn = document.getElementById('againBtn');
  const confettiCanvas = document.getElementById('confettiCanvas');

  const CELEBRATE_EMOJIS = ['🎓', '🎉', '🎊', '📜', '🥳', '✨', '👏', '🌟', '🏆', '🎈', '🙌', '💥', '🤩', '💯', '🔥', '🥂', '🍾', '🌈', '⭐', '😍', '🎇', '🎆', '🪅', '🎁', '💪', '👑', '🚀', '💎', '🌠', '🕺', '💃', '🥇', '🎯', '🧑‍🎓', '👩‍🎓', '🎵', '🎶', '🤟', '🙆', '🎺'];
  const CONFUSED_EMOJIS = ['🤔', '❓', '😵‍💫', '🙅', '🚫', '😬', '🫤', '❌', '🤷', '😅', '🧐', '❗'];

  let codesMap = new Map();
  let muted = false;
  let audioCtx = null;

  const myConfetti = confetti.create(confettiCanvas, { resize: true, useWorker: true });

  // ---------- letter glitch background ----------
  function createLetterGlitch(canvas, {
    colors = ['#00FF00'],
    glitchSpeed = 50,
    smooth = true,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789',
  } = {}) {
    const ctx = canvas.getContext('2d');
    const fontSize = 16;
    const charWidth = 10;
    const charHeight = 20;
    const chars = Array.from(characters);

    let letters = [];
    let grid = { columns: 0, rows: 0 };
    let lastGlitchTime = Date.now();
    let rafId = null;
    let resizeTimeout = null;

    const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
    const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

    function hexToRgb(hex) {
      const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthand, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : null;
    }

    function interpolateColor(start, end, factor) {
      const r = Math.round(start.r + (end.r - start.r) * factor);
      const g = Math.round(start.g + (end.g - start.g) * factor);
      const b = Math.round(start.b + (end.b - start.b) * factor);
      return `rgb(${r}, ${g}, ${b})`;
    }

    function calculateGrid(width, height) {
      return { columns: Math.ceil(width / charWidth), rows: Math.ceil(height / charHeight) };
    }

    function initLetters(columns, rows) {
      grid = { columns, rows };
      letters = Array.from({ length: columns * rows }, () => ({
        char: randomChar(),
        color: randomColor(),
        targetColor: randomColor(),
        colorProgress: 1,
      }));
    }

    function drawLetters() {
      if (!letters.length) return;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = 'top';
      letters.forEach((letter, i) => {
        const x = (i % grid.columns) * charWidth;
        const y = Math.floor(i / grid.columns) * charHeight;
        ctx.fillStyle = letter.color;
        ctx.fillText(letter.char, x, y);
      });
    }

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const { columns, rows } = calculateGrid(rect.width, rect.height);
      initLetters(columns, rows);
      drawLetters();
    }

    function updateLetters() {
      if (!letters.length) return;
      const updateCount = Math.max(1, Math.floor(letters.length * 0.05));
      for (let i = 0; i < updateCount; i++) {
        const idx = Math.floor(Math.random() * letters.length);
        const letter = letters[idx];
        if (!letter) continue;
        letter.char = randomChar();
        letter.targetColor = randomColor();
        if (!smooth) {
          letter.color = letter.targetColor;
          letter.colorProgress = 1;
        } else {
          letter.colorProgress = 0;
        }
      }
    }

    function handleSmoothTransitions() {
      let needsRedraw = false;
      letters.forEach((letter) => {
        if (letter.colorProgress < 1) {
          letter.colorProgress = Math.min(1, letter.colorProgress + 0.05);
          const startRgb = hexToRgb(letter.color);
          const endRgb = hexToRgb(letter.targetColor);
          if (startRgb && endRgb) {
            letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
            needsRedraw = true;
          }
        }
      });
      if (needsRedraw) drawLetters();
    }

    function animate() {
      const now = Date.now();
      if (now - lastGlitchTime >= glitchSpeed) {
        updateLetters();
        drawLetters();
        lastGlitchTime = now;
      }
      if (smooth) handleSmoothTransitions();
      rafId = requestAnimationFrame(animate);
    }

    function handleResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(rafId);
        resize();
        animate();
      }, 100);
    }

    resize();
    animate();
    window.addEventListener('resize', handleResize);
  }

  if (glitchCanvas) {
    createLetterGlitch(glitchCanvas, {
      colors: ['#00FF00'],
      glitchSpeed: 50,
      smooth: true,
    });
  }

  // ---------- data ----------
  fetch('data/codes.json')
    .then((res) => res.json())
    .then((data) => {
      Object.entries(data).forEach(([code, entry]) => {
        codesMap.set(code.trim().toLowerCase(), entry);
      });
    })
    .catch(() => {
      // if the data file fails to load, every code will just show "not found"
    });

  function normalize(code) {
    return code.trim().toLowerCase();
  }

  // ---------- sound (Web Audio API, no external files) ----------
  function ensureAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playChime() {
    if (muted) return;
    const ctx = ensureAudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  function playFizzle() {
    if (muted) return;
    const ctx = ensureAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const start = ctx.currentTime;
    osc.frequency.setValueAtTime(300, start);
    osc.frequency.exponentialRampToValueAtTime(80, start + 0.35);
    gain.gain.setValueAtTime(0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  }

  muteBtn.addEventListener('click', () => {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });

  // ---------- confetti helpers ----------
  function emojiShapes(list, scalar) {
    return list.map((e) => confetti.shapeFromText({ text: e, scalar }));
  }

  function celebrationBurst() {
    const scalar = 3;
    const shapes = emojiShapes(CELEBRATE_EMOJIS, scalar);
    const sparkleShapes = emojiShapes(['✨', '🌟', '🎉', '💫', '⭐', '🎊', '🎆', '🎇', '💎', '🌠'], 2);
    const common = { shapes, scalar, gravity: 0.6, ticks: 220, disableForReduceMotion: true };

    // center upward cannon
    myConfetti({ ...common, particleCount: 50, spread: 110, startVelocity: 65, origin: { x: 0.5, y: 0.9 } });
    // left cannon
    setTimeout(() => {
      myConfetti({ ...common, particleCount: 50, angle: 60, spread: 80, startVelocity: 70, origin: { x: 0, y: 1 } });
    }, 150);
    // right cannon
    setTimeout(() => {
      myConfetti({ ...common, particleCount: 50, angle: 120, spread: 80, startVelocity: 70, origin: { x: 1, y: 1 } });
    }, 150);
    // second wave, wider spread from center
    setTimeout(() => {
      myConfetti({ ...common, particleCount: 25, spread: 200, startVelocity: 55, origin: { x: 0.5, y: 0.5 }, gravity: 0.5 });
    }, 500);
    // relentless side cannons for a few seconds
    let volleys = 0;
    const volleyTimer = setInterval(() => {
      volleys += 1;
      myConfetti({ ...common, particleCount: 150, angle: 60, spread: 90, startVelocity: 65, origin: { x: 0, y: 0.9 } });
      myConfetti({ ...common, particleCount: 150, angle: 120, spread: 90, startVelocity: 65, origin: { x: 1, y: 0.9 } });
      if (volleys >= 8) clearInterval(volleyTimer);
    }, 220);
    // final sparkle rain from the top, maxed out
    setTimeout(() => {
      myConfetti({
        shapes: sparkleShapes,
        scalar: 2,
        particleCount: 500,
        spread: 200,
        startVelocity: 25,
        gravity: 0.4,
        ticks: 280,
        origin: { x: 0.5, y: -0.1 },
        disableForReduceMotion: true,
      });
    }, 900);
  }

  function confusedPuff() {
    const scalar = 2.2;
    myConfetti({
      shapes: emojiShapes(CONFUSED_EMOJIS, scalar),
      scalar,
      particleCount: 45,
      spread: 80,
      startVelocity: 25,
      gravity: 1.4,
      ticks: 90,
      origin: { x: 0.5, y: 0.55 },
      disableForReduceMotion: true,
    });
  }

  // ---------- reveal flow ----------
  function showSuccess(entry) {
    errorMsg.classList.remove('visible');
    entryScreen.hidden = true;
    revealScreen.hidden = false;

    revealImg.src = entry.image;
    revealImg.alt = entry.name ? `${entry.name}'s graduation photo` : 'Graduation photo';
    congratsText.textContent = entry.name ? `CONGRATS, ${entry.name.toUpperCase()}!` : 'CONGRATULATIONS!';
    revealName.textContent = entry.name || '';
    revealImg.style.clipPath = 'circle(0% at 50% 50%)';

    if (window.gsap) {
      gsap.fromTo('.stage', { x: 0 }, {
        keyframes: [{ x: -8 }, { x: 8 }, { x: -6 }, { x: 6 }, { x: 0 }],
        duration: 0.4,
        ease: 'power1.inOut',
      });
      gsap.fromTo(congratsText, { scale: 0, opacity: 0, rotate: -8 }, {
        scale: 1, opacity: 1, rotate: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)', delay: 0.15,
      });
      gsap.fromTo('.photo-frame', { scale: 0.4, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.7, delay: 0.2, ease: 'back.out(1.7)',
      });
      gsap.to(revealImg, {
        clipPath: 'circle(75% at 50% 50%)',
        duration: 1.1,
        delay: 0.35,
        ease: 'power3.out',
      });
      gsap.fromTo(revealName, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.5 });
      gsap.fromTo(againBtn, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 1.1 });
    } else {
      revealImg.style.clipPath = 'circle(75% at 50% 50%)';
    }

    celebrationBurst();
    playChime();
  }

  let errorTimer = null;

  function showError() {
    codeInput.classList.remove('shake');
    void codeInput.offsetWidth; // force reflow so the shake can retrigger
    codeInput.classList.add('shake');

    errorMsg.textContent = "Hmm, that code doesn't ring a bell — double-check it.";
    errorMsg.classList.add('visible');

    if (window.gsap) {
      gsap.fromTo('.entry-panel', { x: 0 }, {
        keyframes: [{ x: -6 }, { x: 6 }, { x: -4 }, { x: 4 }, { x: 0 }],
        duration: 0.35,
        ease: 'power1.inOut',
      });
    }

    confusedPuff();
    playFizzle();

    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => {
      errorMsg.classList.remove('visible');
    }, 3500);
  }

  function resetToEntry() {
    revealScreen.hidden = true;
    entryScreen.hidden = false;
    codeInput.value = '';
    revealImg.style.clipPath = 'circle(0% at 50% 50%)';
    codeInput.focus();
  }

  // ---------- events ----------
  codeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = normalize(codeInput.value);
    if (!code) return;

    const entry = codesMap.get(code);
    if (entry) {
      showSuccess(entry);
    } else {
      showError();
    }
  });

  againBtn.addEventListener('click', resetToEntry);
})();
