import { FileNodeID } from '../types';

export type MetricName = string;

export interface MetricNameValuePair {
  name: string;
  value: number;
}

export interface FileMetricAnalyzer {
  analyze(file: FileSystemFileHandle): Promise<MetricNameValuePair[]>;
}

export type FolderMetricsAnalysis = Partial<Record<MetricName, FolderMetricAnalysis>>;

export interface FolderMetricAnalysis {
  valueByFile: Partial<Record<FileNodeID, number>>;
}
