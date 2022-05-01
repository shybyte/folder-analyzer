import { FolderMetricAnalysis, FolderMetricsAnalysis } from './types';
import { FileSystemNode } from '../types';

export function aggregateMetrics(root: FileSystemNode, metrics: FolderMetricsAnalysis) {
  for (const metric of Object.values(metrics)) {
    aggregateMetric(root, metric!);
  }
}

export function aggregateMetric(root: FileSystemNode, fileMetrics: FolderMetricAnalysis) {
  if (root.children) {
    let sum = 0;
    for (const child of root.children) {
      aggregateMetric(child, fileMetrics);
      sum += fileMetrics.valueByFile[child.id] ?? 0;
    }
    fileMetrics.valueByFile[root.id] = sum;
  }
}
