/**
 * Generate the sequence
 */
const ITERATIONS = 66;
let sequence = [0];
let curr;
for (let i = 2; i < ITERATIONS; i++) {
  curr = sequence[i - 2];
  if (sequence.indexOf(curr - i) === -1 && curr - i > 0) {
    sequence.push(curr - i);
  } else {
    sequence.push(curr + i);
  }
}

/**
 * Options
 */
const SCALING = 8;
const ANIMATE = true;
const ANIMSPEED = 0.1;
const COLORSPEED = 5;

/**
 * Canvas setup
 */
const c = document.createElement('canvas');
const ctx = c.getContext('2d');
// Find the appropriate width of the canvas, i.e. the largest difference in the number line
c.width = (Math.max(...sequence) - Math.min(...sequence)) * SCALING + Math.min(...sequence) + 4;
// Find the appropriate height of the canvas, i.e. the largest diameter
for (let i = 0, diff, max = 0; i < sequence.length - 1; i++) {
  diff = Math.abs(sequence[i + 1] - sequence[i]);
  if (diff > max) max = diff;
  c.height = max * SCALING + 4;
}
// Adding some internal padding for antializing
ctx.translate(2, 2);
document.getElementById('wrapper').appendChild(c);

/**
 * Animated drawing
 */
const getPos = i => (sequence[i] + sequence[i + 1]) / 2;
const getRadius = i => Math.abs(sequence[i] - sequence[i + 1]) / 2;
const isNextLarger = i => sequence[i + 1] > sequence[i];
const isUp = i => Boolean(i % 2);
let nextframe,
  progress = 0;
const drawAnim = function () {
  // Clear the canvas
  ctx.clearRect(0, 0, c.width, c.height);

  // Previous circles
  let index = Math.floor(progress);
  for (let i = 0, pos, radius, spin = true; i < index; i++) {
    pos = (sequence[i] + sequence[i + 1]) / 2;
    radius = Math.abs(sequence[i + 1] - sequence[i]) / 2;
    ctx.strokeStyle = `hsl(${180 + i * COLORSPEED}, 50%, 50%)`;
    ctx.beginPath();
    ctx.arc(pos * SCALING, c.height / 2, radius * SCALING, 0, Math.PI, spin);
    ctx.stroke();
    spin = !spin;
  }

  // Animated part
  let pos = getPos(index);
  let radius = getRadius(index);
  let arc = Math.PI * (progress - Math.floor(progress));
  let start = isNextLarger(index) ? Math.PI : 0;
  let end = isUp(index) && !isNextLarger(index) || !isUp(index) && isNextLarger(index) ? start + arc : start - arc;
  let spin = isUp(index) && !isNextLarger(index) || !isUp(index) && isNextLarger(index) ? false : true;
  ctx.strokeStyle = `hsl(${180 + index * COLORSPEED}, 50%, 50%)`;
  ctx.beginPath();
  ctx.arc(pos * SCALING, c.height / 2, radius * SCALING, start, end, spin);
  ctx.stroke();

  // Next frames
  if (progress < sequence.length - 1) nextframe = requestAnimationFrame(drawAnim);
  progress += ANIMSPEED;
};

/**
 * Static drawing
 */
const drawStatic = () => {
  // Axes
  ctx.beginPath();
  ctx.moveTo(0, c.height / 2);
  ctx.lineTo(c.width, c.height / 2);
  ctx.stroke();

  // Curve
  let spin = true;
  let pos, radius;
  for (let i = 0; i < sequence.length - 1; i++) {
    pos = (sequence[i] + sequence[i + 1]) / 2;
    radius = Math.abs(sequence[i + 1] - sequence[i]) / 2;
    ctx.strokeStyle = `hsl(${180 + i * COLORSPEED}, 50%, 50%)`;
    ctx.beginPath();
    ctx.arc(pos * SCALING, c.height / 2, radius * SCALING, 0, Math.PI, spin);
    ctx.stroke();
    spin = !spin;
  }
};

/**
 * Startup
 */
if (ANIMATE) {
  drawAnim();
} else {
  drawStatic();
}

/**
 * Run again
 */
document.getElementById('run').onclick = function (ev) {
  try {
    cancelAnimationFrame(nextframe);
  } catch (err) {} finally {
    progress = 0;
    drawAnim();
  }
};
