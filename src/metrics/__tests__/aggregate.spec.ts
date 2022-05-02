import { FileSystemNode } from '../../types';
import { aggregateMetric, aggregateMetricMean, AggregationFunctionByMethod } from '../aggregrate';

describe('aggregateMetrics', () => {
  it('empty returns 0', () => {
    const tree: FileSystemNode = {
      id: 0,
      name: 'root',
      children: [],
    };
    const metrics = { valueByFile: {} };
    aggregateMetric(tree, metrics, AggregationFunctionByMethod.Sum);
    expect(metrics).to.deep.equal({ valueByFile: { 0: undefined } });
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

    aggregateMetric(tree, metrics, AggregationFunctionByMethod.Sum);
    expect(metrics).to.deep.equal({ valueByFile: { 0: 30, 1: 10, 2: 20 } });

    aggregateMetric(tree, metrics, AggregationFunctionByMethod.Min);
    expect(metrics).to.deep.equal({ valueByFile: { 0: 10, 1: 10, 2: 20 } });

    aggregateMetric(tree, metrics, AggregationFunctionByMethod.Max);
    expect(metrics).to.deep.equal({ valueByFile: { 0: 20, 1: 10, 2: 20 } });

    aggregateMetricMean(tree, metrics);
    expect(metrics).to.deep.equal({ valueByFile: { 0: 15, 1: 10, 2: 20 } });
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
          children: [
            { id: 3, name: 'file2' },
            { id: 4, name: 'file3' },
          ],
        },
      ],
    };
    const metrics = { valueByFile: { 1: 10, 3: 20, 4: 30 } };
    aggregateMetric(tree, metrics, AggregationFunctionByMethod.Sum);
    expect(metrics).to.deep.equal({ valueByFile: { 0: 60, 1: 10, 2: 50, 3: 20, 4: 30 } });

    aggregateMetricMean(tree, metrics);
    expect(metrics).to.deep.equal({ valueByFile: { 0: 20, 1: 10, 2: 25, 3: 20, 4: 30 } });
  });
});

export {};
