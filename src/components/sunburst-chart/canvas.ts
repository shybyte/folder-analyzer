import { NumberRange, Pos2D } from '../../types';

// eslint-disable-next-line max-params
export function drawCircleSlice(
  ctx: CanvasRenderingContext2D,
  center: Pos2D,
  angle: NumberRange,
  radius: number,
  color: string,
) {
  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.fillStyle = color;
  ctx.arc(center.x, center.y, radius, angle.start, angle.end);
  ctx.lineTo(center.x, center.y);
  ctx.fill();
  ctx.stroke();
}

// eslint-disable-next-line max-params
export function renderTextRotatedAroundCenter(
  ctx: CanvasRenderingContext2D,
  text: string,
  rotationCenter: Pos2D,
  angle: number,
  distanceToCenter: number,
) {
  ctx.save();
  ctx.font = '12px sans-serif';
  ctx.fillStyle = 'black';
  ctx.translate(rotationCenter.x, rotationCenter.y);
  ctx.rotate(angle);
  ctx.translate(distanceToCenter, 0);
  if (Math.PI / 2 < angle && angle < Math.PI * 1.5) {
    ctx.scale(-1, -1);
  }
  ctx.textAlign = 'center';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}
