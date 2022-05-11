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
