const scene = document.getElementById('scene');
const key = document.getElementById('key');
const frame = document.getElementById('frame');
const video = document.getElementById('video');
const hint = document.getElementById('hint');
const glow = document.getElementById('glow');
const fallback = document.getElementById('fallback');

const REDIRECT_URL = 'https://convite-digital.com/c/lauracecilia';

let dragging = false;
let completed = false;
let pointerId = null;
let offsetX = 0;
let offsetY = 0;

// Ponto aproximado da fechadura na imagem, em porcentagem da tela.
const lockPoint = { x: 68, y: 46 };

// Posição visual da chave antes de cortar para o frame-correto.png.
const snapKey = { left: '58%', top: '43%', rotation: '0deg', width: '74vw' };

function clientPoint(e) {
  return e.touches ? e.touches[0] : e;
}

function startDrag(e) {
  if (completed) return;
  dragging = true;
  key.classList.add('dragging');
  key.style.transition = 'none';

  const p = clientPoint(e);
  const r = key.getBoundingClientRect();
  offsetX = p.clientX - r.left;
  offsetY = p.clientY - r.top;

  if (e.pointerId !== undefined && key.setPointerCapture) {
    pointerId = e.pointerId;
    try { key.setPointerCapture(pointerId); } catch (_) {}
  }
  e.preventDefault();
}

function moveDrag(e) {
  if (!dragging || completed) return;
  const p = clientPoint(e);
  key.style.left = `${p.clientX - offsetX + key.offsetWidth / 2}px`;
  key.style.top = `${p.clientY - offsetY + key.offsetHeight / 2}px`;
  e.preventDefault();
}

function endDrag(e) {
  if (!dragging || completed) return;
  dragging = false;
  key.classList.remove('dragging');

  if (pointerId !== null && key.releasePointerCapture) {
    try { key.releasePointerCapture(pointerId); } catch (_) {}
  }

  const sceneRect = scene.getBoundingClientRect();
  const keyRect = key.getBoundingClientRect();

  // Usa o lado direito da chave como ponto de encaixe, pois a chave está horizontal ao arrastar.
  const keyTipX = keyRect.left + keyRect.width * 0.86;
  const keyTipY = keyRect.top + keyRect.height * 0.50;

  const targetX = sceneRect.width * lockPoint.x / 100;
  const targetY = sceneRect.height * lockPoint.y / 100;
  const distance = Math.hypot(keyTipX - targetX, keyTipY - targetY);

  if (distance < 220) {
    snapToFrameAndPlay();
  } else {
    key.style.transition = '.45s ease';
    key.style.left = '20%';
    key.style.top = '63%';
    key.style.width = 'min(56vw, 430px)';
    key.style.transform = 'translate(-50%, -50%) rotate(90deg)';
  }
}

function snapToFrameAndPlay() {
  completed = true;
  hint.style.display = 'none';
  fallback.classList.remove('show');

  key.style.transition = '.42s ease';
  key.style.left = snapKey.left;
  key.style.top = snapKey.top;
  key.style.width = snapKey.width;
  key.style.maxWidth = 'none';
  key.style.transform = `translate(-50%, -50%) rotate(${snapKey.rotation})`;
  glow.classList.add('on');
  createSparkles();

  setTimeout(() => {
    frame.style.opacity = '1';
    key.style.opacity = '0';
  }, 430);

  setTimeout(() => {
    playFinalVideo();
  }, 600);
}

function playFinalVideo() {
  frame.style.opacity = '0';
  video.style.opacity = '1';
  video.currentTime = 0;
  video.muted = true;
  video.playsInline = true;

  const p = video.play();
  if (p && typeof p.catch === 'function') {
    p.catch(() => fallback.classList.add('show'));
  }
}

function createSparkles() {
  for (let i = 0; i < 28; i++) {
    const s = document.createElement('span');
    s.style.position = 'absolute';
    s.style.left = '68%';
    s.style.top = '46%';
    s.style.width = '5px';
    s.style.height = '5px';
    s.style.borderRadius = '50%';
    s.style.background = '#ffd889';
    s.style.boxShadow = '0 0 12px #ffd889';
    s.style.zIndex = '15';
    s.style.pointerEvents = 'none';
    scene.appendChild(s);

    const a = Math.random() * Math.PI * 2;
    const d = 40 + Math.random() * 115;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    s.animate([
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
      { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`, opacity: 0 }
    ], { duration: 1400, easing: 'ease-out' });
    setTimeout(() => s.remove(), 1500);
  }
}

function redirectNow() {
  window.location.replace(REDIRECT_URL);
}

video.addEventListener('ended', redirectNow);
fallback.addEventListener('click', () => {
  fallback.classList.remove('show');
  playFinalVideo();
});

// Pointer Events funcionam melhor no celular e também no computador.
key.addEventListener('pointerdown', startDrag, { passive: false });
window.addEventListener('pointermove', moveDrag, { passive: false });
window.addEventListener('pointerup', endDrag, { passive: false });
window.addEventListener('pointercancel', endDrag, { passive: false });

// Fallback para navegadores antigos.
key.addEventListener('touchstart', startDrag, { passive: false });
window.addEventListener('touchmove', moveDrag, { passive: false });
window.addEventListener('touchend', endDrag, { passive: false });
