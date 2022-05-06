import { ChartTreeNode } from './chart-tree';

interface SunburstChartProps<T> {
  canvas: HTMLCanvasElement;
  onHover?: (chartTreeNode: ChartTreeNode<T>) => void;
  onClick?: (chartTreeNode: ChartTreeNode<T>) => void;
  data: ChartTreeNode<T>;
}

export interface RenderedChartNode<T> {
  node: ChartTreeNode<T>;
  radiusRange: NumberRange;
  angleRange: NumberRange;
}

export type NumberRange = {
  start: number;
  end: number;
};

export function createSunburstChart<T>(props: SunburstChartProps<T>) {
  const ctx = props.canvas.getContext('2d')!;
  const { width, height } = props.canvas;

  const renderedChartNodeById = new Map<string, RenderedChartNode<T>>();

  const centerX = width / 2;
  const centerY = height / 2;
  const ringRadius = 100;

  // https://www.codeblocq.com/2016/04/Create-a-Pie-Chart-with-HTML5-canvas/
  // eslint-disable-next-line max-statements
  function renderSunburst(tree: Readonly<ChartTreeNode<T>>, radius = 100, startAngle = 0, endAngle = 2 * Math.PI) {
    ctx.strokeStyle = '#fff';

    const angleRange = endAngle - startAngle;
    let currentStartAngle = startAngle;
    for (const child of tree.children) {
      const angleDelta = (child.value / tree.value) * angleRange;
      const currentEndAngle = currentStartAngle + angleDelta;
      renderSunburst(child, radius + ringRadius, currentStartAngle, currentEndAngle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.fillStyle = child.color;
      ctx.arc(centerX, centerY, radius, currentStartAngle, currentEndAngle);
      renderedChartNodeById.set(child.id, {
        node: child,
        angleRange: { start: currentStartAngle, end: currentEndAngle },
        radiusRange: { start: radius - ringRadius, end: radius },
      });
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      ctx.stroke();
      currentStartAngle = currentEndAngle;
    }
  }

  props.canvas.addEventListener('mousemove', (ev) => {
    const renderedNode = findNodeForMouseEvent(ev);
    if (renderedNode && props.onHover) {
      props.onHover(renderedNode.node);
    }
  });

  props.canvas.addEventListener('click', (ev) => {
    const renderedNode = findNodeForMouseEvent(ev);
    if (renderedNode && props.onClick) {
      props.onClick(renderedNode.node);
    }
  });

  function findNodeForMouseEvent(mouseEvent: MouseEvent) {
    const dx = mouseEvent.offsetY - centerY;
    const dy = mouseEvent.offsetX - centerX;
    const angleRad = calculateAngle(dx, dy);
    const radius = Math.sqrt(dx ** 2 + dy ** 2);
    return findNode(radius, angleRad, renderedChartNodeById);
  }

  renderSunburst(props.data);
}

function calculateAngle(x: number, y: number): number {
  const angleRadRaw = Math.atan2(x, y);
  return angleRadRaw > 0 ? angleRadRaw : Math.PI * 2 + angleRadRaw;
}

function findNode<T>(
  radius: number,
  angle: number,
  renderedChartNodeById: Map<string, RenderedChartNode<T>>,
): RenderedChartNode<T> | undefined {
  return [...renderedChartNodeById.values()].find(
    (it) => isInRange(angle, it.angleRange) && isInRange(radius, it.radiusRange),
  );
}

function isInRange(value: number, range: NumberRange) {
  return range.start <= value && value <= range.end;
}
