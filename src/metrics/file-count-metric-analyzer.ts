import { FileMetricAnalyzer, MetricName, MetricNameValuePair } from './types';

export const FILE_COUNT_METRIC: MetricName = 'fileCount';

export class FileCountMetricAnalyzer implements FileMetricAnalyzer {
  analyze(_fileSystemFileHandle: FileSystemFileHandle): Promise<MetricNameValuePair[]> {
    return Promise.resolve([{ name: FILE_COUNT_METRIC, value: 1 }]);
  }
}
