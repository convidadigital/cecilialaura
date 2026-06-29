const scene = document.getElementById('scene');
const chave = document.getElementById('chave');
const frameCorreto = document.getElementById('frameCorreto');
const videoFinal = document.getElementById('videoFinal');
const texto = document.getElementById('texto');
const instrucao = document.getElementById('instrucao');
const glow = document.getElementById('glow');

let dragging = false;
let encaixou = false;
let startDx = 0;
let startDy = 0;

// Ajustes principais para sua imagem 9:16.
const alvo = { x: 51.5, y: 48.0 };       // centro da fechadura
const posicaoEncaixada = { left: 50, top: 50 }; // posição final do frame-correto cobre a tela toda
const tolerancia = 180;

function getClient(e) {
  const p = e.touches ? e.touches[0] : e;
  return { x: p.clientX, y: p.clientY };
}

function iniciar(e) {
  if (encaixou) return;
  dragging = true;
  chave.style.transition = 'none';
  const p = getClient(e);
  const r = chave.getBoundingClientRect();
  startDx = p.x - r.left;
  startDy = p.y - r.top;
  e.preventDefault();
}

function mover(e) {
  if (!dragging || encaixou) return;
  const p = getClient(e);
  chave.style.left = `${p.x - startDx + chave.offsetWidth / 2}px`;
  chave.style.top = `${p.y - startDy + chave.offsetHeight / 2}px`;
  e.preventDefault();
}

function soltar() {
  if (!dragging || encaixou) return;
  dragging = false;

  const sr = scene.getBoundingClientRect();
  const kr = chave.getBoundingClientRect();
  const cx = kr.left + kr.width / 2;
  const cy = kr.top + kr.height / 2;
  const ax = sr.width * alvo.x / 100;
  const ay = sr.height * alvo.y / 100;
  const dist = Math.hypot(cx - ax, cy - ay);

  if (dist <= tolerancia) encaixar();
}

function encaixar() {
  encaixou = true;
  instrucao.style.display = 'none';

  // Mostra o frame correto assim que a chave chega no ponto certo.
  chave.style.transition = '.45s ease';
  chave.style.opacity = '0';
  frameCorreto.style.opacity = '1';
  glow.classList.add('active');
  particulas();

  setTimeout(() => {
    tocarVideo();
  }, 700);
}

function tocarVideo() {
  frameCorreto.style.opacity = '0';
  videoFinal.style.opacity = '1';

  videoFinal.currentTime = 0;
  const playPromise = videoFinal.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      videoFinal.controls = true;
    });
  }

  videoFinal.onended = () => {
    texto.classList.add('show');
  };
}

function particulas() {
  for (let i = 0; i < 42; i++) {
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.style.left = `${alvo.x}%`;
    s.style.top = `${alvo.y}%`;
    scene.appendChild(s);

    const a = Math.random() * Math.PI * 2;
    const d = 40 + Math.random() * 130;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;

    s.animate([
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
      { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.1)`, opacity: 0 }
    ], { duration: 1600, easing: 'ease-out' });

    setTimeout(() => s.remove(), 1700);
  }
}

chave.addEventListener('mousedown', iniciar);
chave.addEventListener('touchstart', iniciar, { passive: false });
window.addEventListener('mousemove', mover);
window.addEventListener('touchmove', mover, { passive: false });
window.addEventListener('mouseup', soltar);
window.addEventListener('touchend', soltar);
