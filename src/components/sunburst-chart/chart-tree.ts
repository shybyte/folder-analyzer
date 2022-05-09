import { random, sum } from './utils';
import { max } from '../../utils/array';

export type ChartTreeNode<T> = {
  id: string;
  ref: T;
  height: number;
  name: string;
  value: number;
  children: ChartTreeNode<T>[];
  color: string;
};

export function createRandomChartTree(breadth: number, depth: number, name = '/root'): ChartTreeNode<string> {
  const isLeaf = depth === 0;
  const children = isLeaf
    ? []
    : Array.from({ length: breadth }, (_v, i) => createRandomChartTree(breadth, depth - 1, `${name}/${i}`));

  return {
    id: name,
    ref: name,
    name: name,
    height: 1 + max(children, (child) => child.height),
    children: children,
    value: isLeaf ? Math.round(random(10) + 1) : sum(children, (it) => it.value),
    color: `rgb(${random(256)},${random(256)},${random(256)})`,
  };
}
