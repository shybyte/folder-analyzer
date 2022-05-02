import { FolderMetricAnalysis, FolderMetricsAnalysis } from './types';
import { FileSystemNode } from '../types';

export enum AggregationMethod {
  Sum = 'Sum',
  Min = 'Min',
  Max = 'Max',
  Mean = 'Mean',
}

declare global {
  function structuredClone<T>(x: T): T;
}

export function aggregateMetrics(
  root: FileSystemNode,
  metrics: FolderMetricsAnalysis,
  aggregationMethod: AggregationMethod,
): FolderMetricsAnalysis {
  const result = structuredClone(metrics);
  for (const metric of Object.values(result)) {
    if (aggregationMethod === AggregationMethod.Mean) {
      aggregateMetricMean(root, metric!);
    } else {
      aggregateMetric(root, metric!, AggregationFunctionByMethod[aggregationMethod]);
    }
  }
  return result;
}

export const AggregationFunctionByMethod = {
  Min: (x: number | undefined, y: number | undefined) => (x === undefined || y === undefined ? x ?? y : Math.min(x, y)),
  Max: (x: number | undefined, y: number | undefined) => (x === undefined || y === undefined ? x ?? y : Math.max(x, y)),
  Sum: (x: number | undefined, y: number | undefined) => (x ?? 0) + (y ?? 0),
};

export function aggregateMetric(
  node: FileSystemNode,
  fileMetrics: FolderMetricAnalysis,
  aggregationFunction: (x: number | undefined, y: number | undefined) => number | undefined,
): number {
  if (node.children) {
    let result = undefined;
    for (const child of node.children) {
      aggregateMetric(child, fileMetrics, aggregationFunction);
      result = aggregationFunction(result, fileMetrics.valueByFile[child.id]);
    }
    fileMetrics.valueByFile[node.id] = result;
  }
  return fileMetrics.valueByFile[node.id] ?? 0;
}

interface AggregateMetricMeanResult {
  sum: number;
  count: number;
}

export function aggregateMetricMean(
  node: FileSystemNode,
  fileMetrics: FolderMetricAnalysis,
): AggregateMetricMeanResult {
  if (node.children) {
    let count = 0;
    let sum = 0;
    for (const child of node.children) {
      const childResult = aggregateMetricMean(child, fileMetrics);
      count += childResult.count;
      sum += childResult.sum;
    }
    fileMetrics.valueByFile[node.id] = sum / count;
    return {
      count: count,
      sum: sum,
    };
  } else {
    return {
      count: 1,
      sum: fileMetrics.valueByFile[node.id] ?? 0,
    };
  }
}
