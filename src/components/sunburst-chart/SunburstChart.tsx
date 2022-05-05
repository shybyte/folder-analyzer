import { ChartTreeNode } from './chart-tree';
import { createSunburstChart } from './sunburst-chart';
import { createEffect } from 'solid-js';
import { FileSystemNode } from '../../types';
import { FolderMetricsAnalysis, MetricName } from '../../metrics/types';

interface SunburstChartProps {
  root: FileSystemNode;
  metrics: FolderMetricsAnalysis;
  selectedMetric: MetricName;
}

export function SunburstChart(props: SunburstChartProps) {
  let canvasElement!: HTMLCanvasElement;

  function createChartTree(node: FileSystemNode): ChartTreeNode {
    return {
      id: node.id.toString(),
      name: node.name,
      color: '#f00',
      value: props.metrics[props.selectedMetric]?.valueByFile[node.id] ?? 0,
      children: node.children?.map(createChartTree) ?? [],
    };
  }

  createEffect(() => {
    console.time('createChartTree');
    const chartTree = createChartTree(props.root);
    console.timeEnd('createChartTree');
    console.log('chartTree', chartTree);

    console.time('createSunburstChart');
    createSunburstChart({
      canvas: canvasElement,
      data: chartTree,
      // onHover(node) {
      //   // console.log('node', node);
      // },
    });
    console.timeEnd('createSunburstChart');
  });

  return (
    <div>
      <canvas ref={canvasElement} width={500} height={500}></canvas>
    </div>
  );
}
