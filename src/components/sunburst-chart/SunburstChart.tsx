import styles from './SunburstChart.module.scss';
import { ChartTreeNode } from './chart-tree';
import { createSunburstChart } from './sunburst-chart';
import { createEffect, createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { FileSystemNode } from '../../types';
import { FolderMetricsAnalysis, MetricName } from '../../metrics/types';
import { max } from '../../utils/array';
import { Tooltip } from './Tooltip';

interface SunburstChartProps {
  root: FileSystemNode;
  metrics: FolderMetricsAnalysis;
  selectedMetric: MetricName;
}

export function SunburstChart(props: SunburstChartProps) {
  let containerElement!: HTMLDivElement;
  let canvasElement!: HTMLCanvasElement;
  let resizeObserver: ResizeObserver;
  let sunburstChart: { cleanUp: () => void };
  const [getTooltip, setTooltip] = createSignal<string | undefined>();

  function createChartTree(node: FileSystemNode): ChartTreeNode<FileSystemNode> {
    const children = node.children?.map(createChartTree) ?? [];
    return {
      id: node.name + '-' + node.id.toString(),
      ref: node,
      height: 1 + max(children, (child) => child.height),
      name: node.name,
      color: '#f00',
      value: props.metrics[props.selectedMetric]?.valueByFile[node.id] ?? 0,
      children: children,
    };
  }

  const createChartTreeMemoized = createMemo(() => createChartTree(props.root));

  function onHover(node: ChartTreeNode<unknown> | undefined) {
    // console.log('node:', node);
    setTooltip(node?.name);
  }

  function render() {
    canvasElement.width = containerElement.offsetWidth;
    canvasElement.height = containerElement.offsetHeight;

    if (canvasElement.width < 20 && canvasElement.height < 20) {
      return;
    }

    console.time('createChartTree');
    const chartTree = createChartTreeMemoized();
    console.timeEnd('createChartTree');
    console.log('chartTree', chartTree);

    console.time('createSunburstChart');
    if (sunburstChart) {
      sunburstChart.cleanUp();
    }
    sunburstChart = createSunburstChart({
      canvas: canvasElement,
      data: chartTree,
      onClick(node) {
        console.log('clicked Node', node?.ref);
      },
      onHover: onHover,
    });
    console.timeEnd('createSunburstChart');
  }

  function onResize() {
    if (
      containerElement.offsetWidth !== canvasElement.width ||
      containerElement.offsetHeight !== canvasElement.height
    ) {
      render();
    }
  }

  onCleanup(() => {
    sunburstChart.cleanUp();
  });

  createEffect(() => {
    render();

    if (!resizeObserver) {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(containerElement);
    }
  });

  return (
    <div ref={containerElement} class={styles.sunburstChart}>
      <Show when={getTooltip()}>
        <Tooltip text={getTooltip()!} container={containerElement}></Tooltip>
      </Show>
      <canvas ref={canvasElement}></canvas>
    </div>
  );
}
