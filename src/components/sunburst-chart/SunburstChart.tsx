import { createRandomChartTree } from './chart-tree';
import { createSunburstChart } from './sunburst-chart';
import { onMount } from 'solid-js';

export function SunburstChart() {
  let canvasElement!: HTMLCanvasElement;

  onMount(() => {
    console.time('create');
    const chartTree = createRandomChartTree(7, 2);
    console.log('chartTree', chartTree);
    console.timeEnd('create');

    function renderSun() {
      console.time('render');
      createSunburstChart({
        canvas: canvasElement,
        data: chartTree,
        onHover(node) {
          console.log('node', node);
        },
      });
      console.timeEnd('render');
    }

    renderSun();
  });

  return (
    <div>
      <canvas ref={canvasElement} width={500} height={500}></canvas>
    </div>
  );
}
