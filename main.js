const scenes = [...document.querySelectorAll('.scene')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const announcement = document.querySelector('#announcement');
let activeScene = 'intro';
let sceneTimer;

function showScene(name, focus = true) {
  window.clearTimeout(sceneTimer);
  activeScene = name;
  scenes.forEach((scene) => {
    const isActive = scene.dataset.scene === name;
    scene.classList.toggle('is-active', isActive);
    scene.setAttribute('aria-hidden', String(!isActive));
    if (isActive) scene.scrollTop = 0;
  });
  const current = document.querySelector(`[data-scene="${name}"]`);
  const heading = current.querySelector('h1, h2');
  announcement.textContent = heading ? heading.textContent.trim() : '';
  if (focus && heading) {
    sceneTimer = window.setTimeout(() => heading.focus({ preventScroll: true }), reduceMotion.matches ? 20 : 500);
  }
}

// Конверт и письмо
const envelope = document.querySelector('#openEnvelope');
envelope.addEventListener('click', () => {
  if (envelope.classList.contains('is-opening')) return;
  envelope.classList.add('is-opening');
  envelope.disabled = true;
  document.querySelector('.envelope-hint').textContent = 'это письмо — только тебе';
  window.setTimeout(() => showScene('letter'), reduceMotion.matches ? 120 : 1050);
});
document.querySelector('#toReasons').addEventListener('click', () => showScene('reasons'));

// Причины
const reasons = [
  'Твоя улыбка. Она будто умеет делать любой день светлее.',
  'Твой смех. Хочется снова и снова становиться его причиной.',
  'Твоя нежность. Рядом с тобой даже тишина становится уютной.',
  'Твои глаза. В них я каждый раз нахожу что-то, ради чего стоит остаться.',
  'Ты настоящая. И именно за это хочется любить тебя ещё сильнее.',
  'Просто ты. Без причин, без условий, каждый день.'
];
const reasonText = document.querySelector('#reasonText');
const reasonCount = document.querySelector('#reasonCount');
const reasonProgress = document.querySelector('#reasonProgress');
const nextReason = document.querySelector('#nextReason');
let reasonIndex = 0;
let reasonLocked = false;
const arrowIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';

reasons.forEach((_, index) => {
  const dot = document.createElement('span');
  dot.className = `reason-dot${index === 0 ? ' is-active' : ''}`;
  reasonProgress.append(dot);
});

function renderReason() {
  reasonText.textContent = reasons[reasonIndex];
  reasonCount.textContent = `${String(reasonIndex + 1).padStart(2, '0')} / ${String(reasons.length).padStart(2, '0')}`;
  [...reasonProgress.children].forEach((dot, index) => dot.classList.toggle('is-active', index === reasonIndex));
  nextReason.innerHTML = `${reasonIndex === reasons.length - 1 ? 'У меня есть вопрос…' : 'Ещё одна причина'}${arrowIcon}`;
}
renderReason();

nextReason.addEventListener('click', () => {
  if (reasonLocked) return;
  if (reasonIndex === reasons.length - 1) {
    showScene('question');
    return;
  }
  reasonLocked = true;
  reasonText.classList.add('is-changing');
  window.setTimeout(() => {
    reasonIndex += 1;
    renderReason();
    reasonText.classList.remove('is-changing');
    reasonLocked = false;
  }, reduceMotion.matches ? 10 : 200);
});

// Убегающая кнопка
const playground = document.querySelector('#answerPlayground');
const noButton = document.querySelector('#noButton');
const yesButton = document.querySelector('#yesButton');
const noLabels = ['Нет', 'Точно нет?', 'Подумай ещё', 'Ну пожалуйста', 'Я всё равно убегу', 'Почти поймал!'];
let dodges = 0;

function moveNoButton() {
  const area = playground.getBoundingClientRect();
  const button = noButton.getBoundingClientRect();
  const width = Math.max(button.width, 130);
  const height = Math.max(button.height, 52);
  const maxX = Math.max(0, area.width - width);
  const maxY = Math.max(0, area.height - height);
  let x = Math.random() * maxX;
  let y = Math.random() * maxY;
  // Не закрываем главную кнопку: нижняя половина площадки предпочтительнее.
  if (dodges < 2) y = Math.max(92, y);
  y = Math.min(y, maxY);
  noButton.style.left = `${Math.round(x)}px`;
  noButton.style.top = `${Math.round(y)}px`;
  noButton.textContent = noLabels[Math.min(dodges, noLabels.length - 1)];
  dodges += 1;
  yesButton.style.transform = `translateX(-50%) scale(${Math.min(1 + dodges * .035, 1.18)})`;
  announcement.textContent = noButton.textContent;
}
noButton.addEventListener('pointerenter', (event) => {
  if (event.pointerType !== 'touch') moveNoButton();
});
noButton.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') {
    event.preventDefault();
    moveNoButton();
  }
});
noButton.addEventListener('click', (event) => {
  event.preventDefault();
  moveNoButton();
});

// Конфетти
const canvas = document.querySelector('#confetti');
const context = canvas.getContext('2d');
let particles = [];
let confettiFrame = 0;
let confettiStart = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas();

function heartPath(ctx, size) {
  ctx.beginPath();
  ctx.moveTo(0, size * .32);
  ctx.bezierCurveTo(-size * .62, -size * .12, -size * .48, -size * .72, 0, -size * .35);
  ctx.bezierCurveTo(size * .48, -size * .72, size * .62, -size * .12, 0, size * .32);
  ctx.closePath();
}

function createConfetti() {
  const colors = ['#a83f59', '#db7588', '#efb1b7', '#f6d4d2', '#7d2941'];
  particles = Array.from({ length: Math.min(130, Math.round(window.innerWidth / 3.2)) }, (_, index) => ({
    x: window.innerWidth * .5 + (Math.random() - .5) * 100,
    y: window.innerHeight * .46 + (Math.random() - .5) * 40,
    vx: (Math.random() - .5) * 13,
    vy: -7 - Math.random() * 11,
    gravity: .17 + Math.random() * .08,
    drag: .992,
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - .5) * .18,
    size: 5 + Math.random() * 9,
    color: colors[index % colors.length],
    heart: index % 4 === 0,
    life: 1
  }));
}

function drawConfetti(time) {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const elapsed = time - confettiStart;
  particles.forEach((particle) => {
    particle.vx *= particle.drag;
    particle.vy += particle.gravity;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.spin;
    particle.life = Math.max(0, 1 - Math.max(0, elapsed - 3500) / 1800);
    context.save();
    context.globalAlpha = particle.life;
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.fillStyle = particle.color;
    if (particle.heart) {
      heartPath(context, particle.size);
      context.fill();
    } else {
      context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
    }
    context.restore();
  });
  if (elapsed < 5400 && activeScene === 'finale') {
    confettiFrame = requestAnimationFrame(drawConfetti);
  } else {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

function launchConfetti() {
  cancelAnimationFrame(confettiFrame);
  if (reduceMotion.matches) return;
  resizeCanvas();
  createConfetti();
  confettiStart = performance.now();
  confettiFrame = requestAnimationFrame(drawConfetti);
}

yesButton.addEventListener('click', () => {
  showScene('finale');
  launchConfetti();
});

// Повтор без перезагрузки страницы
document.querySelector('#replayButton').addEventListener('click', () => {
  cancelAnimationFrame(confettiFrame);
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  reasonIndex = 0;
  reasonLocked = false;
  dodges = 0;
  renderReason();
  noButton.textContent = noLabels[0];
  noButton.style.left = 'calc(50% - 65px)';
  noButton.style.top = '122px';
  yesButton.style.transform = 'translateX(-50%)';
  envelope.classList.remove('is-opening');
  envelope.disabled = false;
  document.querySelector('.envelope-hint').textContent = 'нажми на конверт';
  showScene('intro');
});
