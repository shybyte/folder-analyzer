import { FileMetricAnalyzer, FolderMetricAnalysis, FolderMetricsAnalysis } from './types';
import { FileSystemNode, FileSystemNodeWithFileHandle } from '../types';
import { forEachTreeNode } from '../utils/tree';
import { ConcurrentQueue } from '../utils/concurrency';

export async function analyzeMetrics(
  analyzers: FileMetricAnalyzer[],
  tree: FileSystemNode,
): Promise<FolderMetricsAnalysis> {
  const fileNodes = collectFiles(tree);
  const concurrentQueue = new ConcurrentQueue(10);
  const promises: Promise<void>[] = [];
  const result: FolderMetricsAnalysis = {};

  for (const fileNode of fileNodes) {
    for (const analyzer of analyzers) {
      const promise = concurrentQueue.addTask(async () => {
        const analysisResult = await analyzer.analyze(fileNode.handle);
        for (const { name, value } of analysisResult) {
          const folderMetricAnalysis: FolderMetricAnalysis =
            result[name] ?? ({ valueByFile: {} } as FolderMetricAnalysis);
          folderMetricAnalysis.valueByFile[fileNode.id] = value;
          result[name] = folderMetricAnalysis;
        }
      });
      promises.push(promise);
    }
  }

  await Promise.all(promises);

  return result;
}

function collectFiles(tree: FileSystemNode): FileSystemNodeWithFileHandle[] {
  const result: FileSystemNodeWithFileHandle[] = [];
  forEachTreeNode(tree, (treeNode) => {
    if (treeNode.handle instanceof FileSystemFileHandle) {
      result.push(treeNode as FileSystemNodeWithFileHandle);
    }
  });
  return result;
}
