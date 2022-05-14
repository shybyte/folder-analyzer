import { ChartTreeNode } from './chart-tree';
import { NumberRange, Pos2D } from '../../types';
import { drawCircleSlice, renderTextRotatedAroundCenter } from './canvas';
import { calculateAngle, isInRange, middle } from '../../utils';

interface SunburstChartProps<T> {
  canvas: HTMLCanvasElement;
  onHover?: (chartTreeNode: ChartTreeNode<T> | undefined) => void;
  onClick?: (chartTreeNode: ChartTreeNode<T> | undefined) => void;
  data: ChartTreeNode<T>;
}

export interface RenderedChartNode<T> {
  node: ChartTreeNode<T>;
  radiusRange: NumberRange;
  angleRange: NumberRange;
}

const PADDING = 10;

// eslint-disable-next-line max-statements
export function createSunburstChart<T>(props: SunburstChartProps<T>) {
  const ctx = props.canvas.getContext('2d')!;
  const { width, height } = props.canvas;
  const renderedChartNodeById = new Map<string, RenderedChartNode<T>>();
  const center: Pos2D = { x: width / 2, y: height / 2 };
  const ringRadius = (Math.min(width / 2, height / 2) - PADDING) / (props.data.height - 1);

  // https://www.codeblocq.com/2016/04/Create-a-Pie-Chart-with-HTML5-canvas/
  // eslint-disable-next-line sonarjs/cognitive-complexity
  function renderSunburst(tree: Readonly<ChartTreeNode<T>>, radius = 100, startAngle = 0, endAngle = 2 * Math.PI) {
    ctx.strokeStyle = '#fff';
    const angleRange = endAngle - startAngle;
    let currentStartAngle = startAngle;
    for (const child of tree.children) {
      const angleDelta = (child.value / tree.value) * angleRange;
      const currentEndAngle = currentStartAngle + angleDelta;
      if (currentEndAngle - currentStartAngle > 0.001) {
        renderSunburst(child, radius + ringRadius, currentStartAngle, currentEndAngle);
        drawCircleSlice(ctx, center, { start: currentStartAngle, end: currentEndAngle }, radius, child.color);
        // eslint-disable-next-line max-depth
        if (angleDelta > 0.1) {
          renderTextRotatedAroundCenter(
            ctx,
            child.name,
            center,
            middle(currentStartAngle, currentEndAngle),
            radius - ringRadius / 2,
          );
        }
        renderedChartNodeById.set(child.id, {
          node: child,
          angleRange: { start: currentStartAngle, end: currentEndAngle },
          radiusRange: { start: radius - ringRadius, end: radius },
        });
      }
      currentStartAngle = currentEndAngle;
    }
  }

  function onMouseMove(ev: MouseEvent) {
    if (props.onHover) {
      props?.onHover(findNodeForMouseEvent(ev)?.node);
    }
  }

  function onClick(ev: MouseEvent) {
    if (props.onClick) {
      props.onClick(findNodeForMouseEvent(ev)?.node);
    }
  }

  function findNodeForMouseEvent(mouseEvent: MouseEvent) {
    const dx = mouseEvent.offsetX - center.x;
    const dy = mouseEvent.offsetY - center.y;
    const angle = calculateAngle(dx, dy);
    const radius = Math.sqrt(dx ** 2 + dy ** 2);
    return findNode(radius, angle, renderedChartNodeById);
  }

  props.canvas.addEventListener('mousemove', onMouseMove);
  props.canvas.addEventListener('click', onClick);

  ctx.clearRect(0, 0, props.canvas.width, props.canvas.height);
  renderSunburst(props.data, ringRadius);

  return {
    cleanUp: () => {
      props.canvas.removeEventListener('mousemove', onMouseMove);
      props.canvas.removeEventListener('click', onClick);
    },
  };
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
