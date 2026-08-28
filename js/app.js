(() => {
  const ambientLayer = document.getElementById('ambientLayer');
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

  const AMBIENT_EMOJIS = ['🎓', '📜', '🎉', '✨', '🥳', '🎊', '🌟', '🙌', '🏆', '📸', '🎈', '💫', '🔥', '👏', '🤩', '💯', '🥂', '🍾', '🌈', '⭐', '😍', '🎇', '🎆', '🪅', '🎁', '💪', '👑', '🚀', '💎', '🌠', '🕺', '💃', '🥇', '🎯', '📚', '🖊️', '🧑‍🎓', '👩‍🎓', '🎵', '🎶'];
  const CELEBRATE_EMOJIS = ['🎓', '🎉', '🎊', '📜', '🥳', '✨', '👏', '🌟', '🏆', '🎈', '🙌', '💥', '🤩', '💯', '🔥', '🥂', '🍾', '🌈', '⭐', '😍', '🎇', '🎆', '🪅', '🎁', '💪', '👑', '🚀', '💎', '🌠', '🕺', '💃', '🥇', '🎯', '🧑‍🎓', '👩‍🎓', '🎵', '🎶', '🤟', '🙆', '🎺'];
  const CONFUSED_EMOJIS = ['🤔', '❓', '😵‍💫', '🙅', '🚫', '😬', '🫤', '❌', '🤷', '😅', '🧐', '❗'];

  let codesMap = new Map();
  let muted = false;
  let audioCtx = null;

  const myConfetti = confetti.create(confettiCanvas, { resize: true, useWorker: true });

  // ---------- ambient background emojis ----------
  function spawnAmbientEmoji() {
    const span = document.createElement('span');
    span.className = 'ambient-emoji';
    span.textContent = AMBIENT_EMOJIS[Math.floor(Math.random() * AMBIENT_EMOJIS.length)];
    const left = Math.random() * 50;
    const duration = 5 + Math.random() * 1.5;
    const drift = (Math.random() - 0.5) * 200;
    const size = 1.4 + Math.random() * 1.8;
    span.style.left = left + 'vw';
    span.style.fontSize = size + 'rem';
    span.style.setProperty('--drift', drift + 'px');
    span.style.animationDuration = duration + 's';
    ambientLayer.appendChild(span);
    setTimeout(() => span.remove(), duration * 1000 + 500);
  }
  spawnAmbientEmoji();
  const ambientTimer = setInterval(spawnAmbientEmoji, 120);

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
    myConfetti({ ...common, particleCount: 1000, spread: 110, startVelocity: 65, origin: { x: 0.5, y: 0.9 } });
    // left cannon
    setTimeout(() => {
      myConfetti({ ...common, particleCount: 500, angle: 60, spread: 80, startVelocity: 70, origin: { x: 0, y: 1 } });
    }, 150);
    // right cannon
    setTimeout(() => {
      myConfetti({ ...common, particleCount: 500, angle: 120, spread: 80, startVelocity: 70, origin: { x: 1, y: 1 } });
    }, 150);
    // second wave, wider spread from center
    setTimeout(() => {
      myConfetti({ ...common, particleCount: 1000, spread: 200, startVelocity: 55, origin: { x: 0.5, y: 0.5 }, gravity: 0.5 });
    }, 500);
    // relentless side cannons for a few seconds
    let volleys = 0;
    const volleyTimer = setInterval(() => {
      volleys += 1;
      myConfetti({ ...common, particleCount: 600, angle: 60, spread: 90, startVelocity: 65, origin: { x: 0, y: 0.9 } });
      myConfetti({ ...common, particleCount: 600, angle: 120, spread: 90, startVelocity: 65, origin: { x: 1, y: 0.9 } });
      if (volleys >= 8) clearInterval(volleyTimer);
    }, 220);
    // final sparkle rain from the top, maxed out
    setTimeout(() => {
      myConfetti({
        shapes: sparkleShapes,
        scalar: 2,
        particleCount: 2000,
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
    congratsText.textContent = entry.name ? `🎉🥳 CONGRATS, ${entry.name.toUpperCase()}! 🎓🎊🏆🙌` : '🎉🥳 CONGRATULATIONS! 🎓🎊🏆🙌';
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

    errorMsg.textContent = "🤔❓ Hmm, that code doesn't ring a bell — double-check it! 🙅🚫😬";
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
