import { random, sum } from './utils';

export type ChartTreeNode = {
  id: string;
  name: string;
  value: number;
  children: ChartTreeNode[];
  color: string;
};

export function createRandomChartTree(breadth: number, depth: number, name = '/root'): ChartTreeNode {
  const isLeaf = depth === 0;
  const children = isLeaf
    ? []
    : Array.from({ length: breadth }, (_v, i) => createRandomChartTree(breadth, depth - 1, `${name}/${i}`));

  return {
    id: name,
    name: name,
    children: children,
    value: isLeaf ? Math.round(random(10) + 1) : sum(children, (it) => it.value),
    color: `rgb(${random(256)},${random(256)},${random(256)})`,
  };
}
