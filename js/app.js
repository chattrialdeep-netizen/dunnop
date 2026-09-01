(() => {
  const glitchCanvas = document.getElementById('glitchCanvas');
  const muteBtn = document.getElementById('muteBtn');
  const entryScreen = document.getElementById('entryScreen');
  const revealScreen = document.getElementById('revealScreen');
  const codeForm = document.getElementById('codeForm');
  const codeInput = document.getElementById('codeInput');
  const codeField = document.getElementById('codeField');
  const verifyBtn = document.getElementById('verifyBtn');
  const statusBar = document.getElementById('statusBar');
  const statusText = document.getElementById('statusText');
  const crtMonitor = document.getElementById('crtMonitor');
  const crtScreen = document.getElementById('crtScreen');
  const terminalOutput = document.getElementById('terminalOutput');
  const againBtn = document.getElementById('againBtn');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');

  const PENDING_CODES = new Set(
    ['888.143.74', 'D4NYB0L', 'R0DB1L4T', '4N2NY', 'S0N13B0213'].map((c) => c.trim().toLowerCase())
  );

  const CELEBRATE_EMOJIS = ['🎓', '🎉', '🎊', '📜', '🥳', '✨', '👏', '🌟', '🏆', '🎈', '🙌', '💥', '🤩', '💯', '🔥', '🥂', '🍾', '🌈', '⭐', '😍', '🎇', '🎆', '🪅', '🎁', '💪', '👑', '🚀', '💎', '🌠', '🕺', '💃', '🥇', '🎯', '🧑‍🎓', '👩‍🎓', '🎵', '🎶', '🤟', '🙆', '🎺'];
  const CONFUSED_EMOJIS = ['🤔', '❓', '😵‍💫', '🙅', '🚫', '😬', '🫤', '❌', '🤷', '😅', '🧐', '❗'];

  let codesMap = new Map();
  let muted = false;
  let audioCtx = null;
  let finishTyping = null;

  const myConfetti = confetti.create(confettiCanvas, { resize: true, useWorker: true });

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

  // ---------- letter glitch background ----------
  function createLetterGlitch(canvas, {
    colors = ['#00FF41', '#00cc35', '#00992a', '#00661c'],
    glitchSpeed = 50,
    smooth = true,
    characters = 'ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789:・."=*+-<>¦',
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
      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;
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
      colors: ['#00FF41', '#00cc35', '#00992a', '#00661c'],
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

  function playBoot() {
    if (muted) return;
    const ctx = ensureAudioCtx();
    const notes = [220, 330, 440, 660];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  function playDenied() {
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

  function playKeyTick() {
    if (muted) return;
    const ctx = ensureAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    const start = ctx.currentTime;
    osc.frequency.setValueAtTime(900 + Math.random() * 200, start);
    gain.gain.setValueAtTime(0.03, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.04);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.05);
  }

  muteBtn.addEventListener('click', () => {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });

  // ---------- terminal renderer (line-numbered typewriter) ----------
  function typeTerminal(container, text, speed = 20) {
    return new Promise((resolve) => {
      container.innerHTML = '';
      const lines = text.split('\n');
      let lineIndex = 0;
      let charIndex = 0;
      let done = false;
      let timer = null;
      let currentTextEl = null;

      const cursor = document.createElement('span');
      cursor.className = 'term-cursor';
      cursor.textContent = '█';

      function buildLine(index) {
        const row = document.createElement('div');
        row.className = 'term-line';
        const num = document.createElement('span');
        num.className = 'term-num';
        if (lines[index].trim() !== '') num.textContent = String(index + 1).padStart(2, '0');
        const textEl = document.createElement('span');
        textEl.className = 'term-text';
        row.appendChild(num);
        row.appendChild(textEl);
        container.appendChild(row);
        return textEl;
      }

      function startLine() {
        currentTextEl = buildLine(lineIndex);
        charIndex = 0;
        currentTextEl.appendChild(cursor);
        stepChar();
      }

      function finishNow() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        container.innerHTML = '';
        let lastTextEl = null;
        lines.forEach((lineStr, index) => {
          lastTextEl = buildLine(index);
          lastTextEl.textContent = lineStr;
        });
        if (lastTextEl) lastTextEl.appendChild(cursor);
        finishTyping = null;
        resolve();
      }

      function stepChar() {
        if (done) return;
        const lineStr = lines[lineIndex];
        if (charIndex < lineStr.length) {
          const ch = lineStr[charIndex];
          currentTextEl.insertBefore(document.createTextNode(ch), cursor);
          charIndex += 1;
          if (Math.random() < 0.35) playKeyTick();
          let delay = speed;
          if ('.,!?'.includes(ch)) delay = speed * 5;
          timer = setTimeout(stepChar, delay + Math.random() * speed * 0.6);
        } else {
          lineIndex += 1;
          if (lineIndex < lines.length) {
            timer = setTimeout(startLine, speed * 6);
          } else {
            done = true;
            finishTyping = null;
            resolve();
          }
        }
      }

      finishTyping = finishNow;
      if (lines.length) startLine();
      else resolve();
    });
  }

  crtScreen.addEventListener('click', () => {
    if (finishTyping) finishTyping();
  });

  // ---------- reveal flow ----------
  function animateIn(panel) {
    panel.classList.remove('anim-in');
    void panel.offsetWidth;
    panel.classList.add('anim-in');
  }

  function setStatus(text, mode) {
    statusBar.classList.remove('is-error', 'is-success');
    if (mode) statusBar.classList.add(mode);
    statusText.innerHTML = mode
      ? text
      : `${text}<span class="auth-card__cursor">_</span>`;
  }

  async function showSuccess(entry) {
    entryScreen.hidden = true;
    revealScreen.hidden = false;
    animateIn(revealScreen);

    crtMonitor.classList.remove('power-on');
    void crtMonitor.offsetWidth;
    crtMonitor.classList.add('power-on');

    playBoot();
    celebrationBurst();

    const message = entry.message || '[no message on file]';
    await typeTerminal(terminalOutput, message, 22);
  }

  let toastTimer = null;

  function showToast(message) {
    clearTimeout(toastTimer);
    toastText.textContent = message;
    toast.classList.remove('is-visible');
    void toast.offsetWidth;
    toast.classList.add('is-visible');
    playDenied();
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 4000);
  }

  let errorTimer = null;

  function showError() {
    codeField.classList.remove('shake');
    void codeField.offsetWidth; // force reflow so the shake can retrigger
    codeField.classList.add('shake');
    codeField.classList.add('is-error');

    setStatus('Access key not recognized.', 'is-error');

    animateIn(entryScreen);
    playDenied();
    confusedPuff();

    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => {
      codeField.classList.remove('is-error');
      setStatus('Waiting for input');
    }, 3500);
  }

  function resetToEntry() {
    revealScreen.hidden = true;
    entryScreen.hidden = false;
    animateIn(entryScreen);
    codeInput.value = '';
    terminalOutput.textContent = '';
    codeField.classList.remove('is-error', 'shake');
    verifyBtn.classList.remove('is-loading');
    verifyBtn.disabled = false;
    setStatus('Waiting for input');
    codeInput.focus();
  }

  // ---------- events ----------
  codeInput.addEventListener('focus', () => {
    if (!statusBar.classList.contains('is-error') && !statusBar.classList.contains('is-success')) {
      setStatus('Key entry active');
    }
  });
  codeInput.addEventListener('blur', () => {
    if (!statusBar.classList.contains('is-error') && !statusBar.classList.contains('is-success')) {
      setStatus('Waiting for input');
    }
  });
  codeInput.addEventListener('input', () => {
    if (statusBar.classList.contains('is-error')) {
      codeField.classList.remove('is-error');
      setStatus('Key entry active');
    }
  });

  codeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = normalize(codeInput.value);
    if (!code || verifyBtn.disabled) return;

    clearTimeout(errorTimer);
    verifyBtn.disabled = true;
    verifyBtn.classList.add('is-loading');
    codeField.classList.remove('is-error');
    setStatus('Verifying...', null);

    setTimeout(() => {
      verifyBtn.classList.remove('is-loading');
      verifyBtn.disabled = false;

      if (PENDING_CODES.has(code)) {
        setStatus('Waiting for input');
        showToast('DATA UPLOADING, PLEASE TRY AGAIN TOMORROW.');
        return;
      }

      const entry = codesMap.get(code);

      if (entry) {
        setStatus('Verified.', 'is-success');
        entryScreen.classList.add('is-success');
        setTimeout(() => {
          entryScreen.classList.remove('is-success');
          showSuccess(entry);
        }, 260);
      } else {
        showError();
      }
    }, 450);
  });

  againBtn.addEventListener('click', resetToEntry);
})();
