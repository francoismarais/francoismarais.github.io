const canvas = document.getElementById("ambient-canvas");
const context = canvas.getContext("2d", { alpha: true });
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let ratio = 1;
let animationFrame = 0;

const ribbons = [
  { color: "84, 242, 194", offset: 0.1, speed: 0.00045, width: 92 },
  { color: "255, 111, 145", offset: 1.4, speed: 0.00036, width: 116 },
  { color: "255, 209, 102", offset: 2.8, speed: 0.00032, width: 74 },
  { color: "106, 228, 255", offset: 4.2, speed: 0.0004, width: 86 },
];

function resizeCanvas() {
  ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawRibbon(ribbon, time) {
  const yBase = height * (0.22 + (Math.sin(time * ribbon.speed + ribbon.offset) + 1) * 0.22);
  const waveHeight = height * 0.12;
  const points = 8;

  context.beginPath();
  context.moveTo(-width * 0.12, yBase);

  for (let index = 0; index <= points; index += 1) {
    const x = (index / points) * width * 1.24 - width * 0.12;
    const phase = index * 0.92 + time * ribbon.speed + ribbon.offset;
    const y = yBase + Math.sin(phase) * waveHeight + Math.cos(phase * 0.72) * waveHeight * 0.58;
    context.lineTo(x, y);
  }

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `rgba(${ribbon.color}, 0)`);
  gradient.addColorStop(0.5, `rgba(${ribbon.color}, 0.34)`);
  gradient.addColorStop(1, `rgba(${ribbon.color}, 0)`);

  context.strokeStyle = gradient;
  context.lineWidth = ribbon.width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = `rgba(${ribbon.color}, 0.38)`;
  context.shadowBlur = 42;
  context.stroke();
}

function drawLightField(time) {
  const columns = Math.ceil(width / 72);
  const rows = Math.ceil(height / 72);

  context.save();
  context.globalCompositeOperation = "screen";

  for (let yIndex = 0; yIndex < rows; yIndex += 1) {
    for (let xIndex = 0; xIndex < columns; xIndex += 1) {
      const drift = Math.sin(time * 0.00035 + xIndex * 0.8 + yIndex * 0.5);
      const alpha = Math.max(0, drift) * 0.14;

      if (alpha <= 0.02) {
        continue;
      }

      context.fillStyle = `rgba(248, 244, 239, ${alpha})`;
      context.fillRect(xIndex * 72 + 24, yIndex * 72 + 18, 1.3, 1.3);
    }
  }

  context.restore();
}

function render(time) {
  context.clearRect(0, 0, width, height);
  context.globalCompositeOperation = "lighter";
  ribbons.forEach((ribbon) => drawRibbon(ribbon, time));
  drawLightField(time);
  context.globalCompositeOperation = "source-over";
  animationFrame = window.requestAnimationFrame(render);
}

function start() {
  if (prefersReducedMotion.matches) {
    return;
  }

  resizeCanvas();
  render(0);
}

window.addEventListener("resize", resizeCanvas);
prefersReducedMotion.addEventListener("change", () => {
  window.cancelAnimationFrame(animationFrame);
  if (!prefersReducedMotion.matches) {
    start();
  }
});

start();
