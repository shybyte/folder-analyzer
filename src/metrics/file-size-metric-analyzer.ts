import { FileMetricAnalyzer, MetricName, MetricNameValuePair } from './types';

export const FILE_SIZE_METRIC: MetricName = 'fileSize';

export class FileSizeMetricAnalyzer implements FileMetricAnalyzer {
  async analyze(fileSystemFileHandle: FileSystemFileHandle): Promise<MetricNameValuePair[]> {
    const file = await fileSystemFileHandle.getFile();
    return [{ name: FILE_SIZE_METRIC, value: file.size }];
  }
}
