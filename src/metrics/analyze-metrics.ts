import { FileMetricAnalyzer, FolderMetricAnalysis, FolderMetricsAnalysis } from './types';
import { FileSystemNode, FileSystemNodeWithFileHandle } from '../types';
import { forEachTreeNode } from '../utils/tree';

export async function analyzeMetrics(
  analyzers: FileMetricAnalyzer[],
  tree: FileSystemNode,
): Promise<FolderMetricsAnalysis> {
  const fileNodes = collectFiles(tree);
  const result: FolderMetricsAnalysis = {};
  for (const fileNode of fileNodes) {
    for (const analyzer of analyzers) {
      const analysisResult = await analyzer.analyze(fileNode.handle);
      for (const { name, value } of analysisResult) {
        const folderMetricAnalysis: FolderMetricAnalysis =
          result[name] ?? ({ valueByFile: {} } as FolderMetricAnalysis);
        folderMetricAnalysis.valueByFile[fileNode.id] = value;
        result[name] = folderMetricAnalysis;
      }
    }
  }
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
