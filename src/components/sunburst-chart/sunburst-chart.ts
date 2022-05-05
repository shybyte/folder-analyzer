import { ChartTreeNode } from './chart-tree';

interface SunburstChartProps {
  canvas: HTMLCanvasElement;
  onHover?: (chartTreeNode: ChartTreeNode) => void;
  data: ChartTreeNode;
}

export interface RenderedChartNode {
  angleRange: AngleRange;
}

export type AngleRange = {
  start: number;
  end: number;
};

export function createSunburstChart(props: SunburstChartProps) {
  const ctx = props.canvas.getContext('2d')!;
  const { width, height } = props.canvas;

  const renderedChartNodeById = new Map<string, RenderedChartNode>();
  console.log('renderedChartNodeById:', renderedChartNodeById);

  // https://www.codeblocq.com/2016/04/Create-a-Pie-Chart-with-HTML5-canvas/
  // eslint-disable-next-line max-statements
  function renderSunburst(tree: Readonly<ChartTreeNode>, radius = 100, startAngle = 0, endAngle = 2 * Math.PI) {
    ctx.strokeStyle = '#fff';

    const centerX = width / 2;
    const centerY = height / 2;
    const angleRange = endAngle - startAngle;
    let currentStartAngle = startAngle;
    for (const child of tree.children) {
      const angleDelta = (child.value / tree.value) * angleRange;
      const currentEndAngle = currentStartAngle + angleDelta;
      renderSunburst(child, radius + 100, currentStartAngle, currentEndAngle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.fillStyle = child.color;
      ctx.arc(centerX, centerY, radius, currentStartAngle, currentEndAngle);
      renderedChartNodeById.set(child.id, { angleRange: { start: currentStartAngle, end: currentEndAngle } });
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      ctx.stroke();
      currentStartAngle = currentEndAngle;
    }
    // console.log('renderedChartNodeById:', renderedChartNodeById);
  }

  props.canvas.addEventListener('mousemove', (_ev) => {
    // console.log('ev.x', ev.offsetX, ev.offsetY);
    if (props.onHover) {
      props.onHover(props.data);
    }
  });

  renderSunburst(props.data);
}
