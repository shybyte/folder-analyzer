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

  createEffect(() => {
    console.time('createChartTree');
    const chartTree = createChartTree(props.root);
    console.timeEnd('createChartTree');
    console.log('chartTree', chartTree);

    console.time('createSunburstChart');
    createSunburstChart({
      canvas: canvasElement,
      data: chartTree,
      onClick(node) {
        console.log('clicked Node', node.ref);
      },
    });
    console.timeEnd('createSunburstChart');
  });

  return (
    <div>
      <canvas ref={canvasElement} width={500} height={500}></canvas>
    </div>
  );
}
