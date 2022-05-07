import styles from './SunburstChart.module.scss';
import { ChartTreeNode } from './chart-tree';
import { createSunburstChart } from './sunburst-chart';
import { createEffect, onCleanup, onMount } from 'solid-js';
import { FileSystemNode } from '../../types';
import { FolderMetricsAnalysis, MetricName } from '../../metrics/types';

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

  function createChartTree(node: FileSystemNode): ChartTreeNode<FileSystemNode> {
    return {
      id: node.name + '-' + node.id.toString(),
      ref: node,
      name: node.name,
      color: '#f00',
      value: props.metrics[props.selectedMetric]?.valueByFile[node.id] ?? 0,
      children: node.children?.map(createChartTree) ?? [],
    };
  }

  function render() {
    console.time('createChartTree');
    const chartTree = createChartTree(props.root);
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
        console.log('clicked Node', node.ref);
      },
    });
    console.timeEnd('createSunburstChart');
  }

  onCleanup(() => {
    console.log('cleanUp');
    sunburstChart.cleanUp();
  });

  onMount(() => {
    resizeObserver = new ResizeObserver(() => {
      canvasElement.width = containerElement.offsetWidth;
      canvasElement.height = containerElement.offsetHeight;
      if (canvasElement.width > 20 && canvasElement.height > 0) {
        render();
      }
    });
    resizeObserver.observe(containerElement);
  });

  createEffect(() => {
    render();
  });

  return (
    <div ref={containerElement} class={styles.sunburstChart}>
      <canvas ref={canvasElement}></canvas>
    </div>
  );
}
