import { FileSystemNode } from '../../types';
import { aggregateMetric } from '../aggregrate';

describe('aggregateMetrics', () => {
  it('empty returns 0', () => {
    const tree: FileSystemNode = {
      id: 0,
      name: 'root',
      children: [],
    };
    const metrics = { valueByFile: {} };
    aggregateMetric(tree, metrics);
    expect(metrics).to.deep.equal({ valueByFile: { 0: 0 } });
  });

  it('simple', () => {
    const tree: FileSystemNode = {
      id: 0,
      name: 'root',
      children: [
        {
          id: 1,
          name: 'file1',
        },
        {
          id: 2,
          name: 'file2',
        },
      ],
    };
    const metrics = { valueByFile: { 1: 10, 2: 20 } };
    aggregateMetric(tree, metrics);
    expect(metrics).to.deep.equal({ valueByFile: { 0: 30, 1: 10, 2: 20 } });
  });

  it('nested', () => {
    const tree: FileSystemNode = {
      id: 0,
      name: 'root',
      children: [
        {
          id: 1,
          name: 'file1',
        },
        {
          id: 2,
          name: 'subfolder',
          children: [{ id: 3, name: 'file2' }],
        },
      ],
    };
    const metrics = { valueByFile: { 1: 10, 3: 20 } };
    aggregateMetric(tree, metrics);
    expect(metrics).to.deep.equal({ valueByFile: { 0: 30, 1: 10, 2: 20, 3: 20 } });
  });
});

export {};
