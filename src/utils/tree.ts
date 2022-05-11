import { FileSystemNode, MinimalFileSystemNode } from '../types';
import { Counter, omit } from './index';
import { FolderMetricsAnalysis } from '../metrics/types';

export type SortKey = 'name' | string;

const collator = new Intl.Collator();

interface HasName {
  name: string;
}

export function compareByName(a: HasName, b: HasName) {
  return collator.compare(a.name, b.name);
}

export function compareNodesByNameButFolderFirst<T extends MinimalFileSystemNode>(a: T, b: T) {
  return compareNodesButFolderFirst(compareByName, a, b);
}

export function compareNodesButFolderFirst<T extends MinimalFileSystemNode>(
  compareFunction: (a: T, b: T) => number,
  a: T,
  b: T,
) {
  if (a.children && !b.children) {
    return -1;
  } else if (!a.children && b.children) {
    return 1;
  } else {
    return compareFunction(a, b);
  }
}

export function sortRecursivelyByNameButFolderFirst(tree: FileSystemNode): FileSystemNode {
  return sortRecursively(tree, compareNodesByNameButFolderFirst);
}

export function sortRecursively(
  tree: FileSystemNode,
  compare: (a: FileSystemNode, b: FileSystemNode) => number,
): FileSystemNode {
  if (!tree.children || tree.children.length === 0) {
    return tree;
  } else {
    const result: FileSystemNode = {
      id: tree.id,
      name: tree.name,
      children: [...tree.children].sort(compare).map((node) => sortRecursively(node, compare)),
    };
    if (tree.handle) {
      result.handle = tree.handle;
    }
    return result;
  }
}

export function forEachTreeNode(tree: FileSystemNode, callback: (node: FileSystemNode) => void) {
  callback(tree);
  if (tree.children) {
    for (const child of tree.children) {
      forEachTreeNode(child, callback);
    }
  }
}

export function countNodes(tree: FileSystemNode) {
  let counter = 0;
  forEachTreeNode(tree, () => {
    counter += 1;
  });
  return counter;
}

export function addIds(tree: MinimalFileSystemNode, idCounter = new Counter()): FileSystemNode {
  const result: FileSystemNode = { ...omit(tree, 'children'), id: idCounter.getAndInc() };
  if (tree.children) {
    result.children = tree.children.map((child) => addIds(child, idCounter));
  }
  return result;
}

interface HasNameAndNumericId {
  name: string;
  id: number;
}

export function createCompareBySortKey<T extends HasNameAndNumericId>(
  sortKey: SortKey,
  metrics: FolderMetricsAnalysis,
): (a: T, b: T) => number {
  if (sortKey === 'name') {
    return compareByName;
  } else {
    const metricAnalysis = metrics[sortKey];
    return (a1, b1) => {
      const metricValue1 = metricAnalysis?.valueByFile[a1.id] ?? 0;
      const metricValue2 = metricAnalysis?.valueByFile[b1.id] ?? 0;
      return metricValue2 - metricValue1;
    };
  }
}
