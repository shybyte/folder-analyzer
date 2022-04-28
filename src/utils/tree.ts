import { FileSystemNode, MinimalFileSystemNode } from '../types';
import { Counter } from './index';

const collator = new Intl.Collator();

export function compareNodesByNameButFolderFirst(a: MinimalFileSystemNode, b: MinimalFileSystemNode) {
  if (a.children && !b.children) {
    return -1;
  } else if (!a.children && b.children) {
    return 1;
  } else {
    // TODO: Investigate whether localeCompare or collator are faster in reality.
    // return a.name.localeCompare(b.name);
    return collator.compare(a.name, b.name);
  }
}

export function sortRecursivelyByNameButFolderFirst(tree: MinimalFileSystemNode): MinimalFileSystemNode {
  return sortRecursively(tree, compareNodesByNameButFolderFirst);
}

export function sortRecursively(
  tree: MinimalFileSystemNode,
  compare: (a: MinimalFileSystemNode, b: MinimalFileSystemNode) => number,
): MinimalFileSystemNode {
  if (!tree.children || tree.children.length === 0) {
    return tree;
  } else
    return {
      ...tree,
      children: [...tree.children].sort(compare).map((node) => sortRecursively(node, compare)),
    };
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
  const id = idCounter.getAndInc();
  const result: FileSystemNode = { name: tree.name, id };
  if (tree.handle) {
    result.handle = tree.handle;
  }
  if (tree.children) {
    result.children = tree.children.map((child) => addIds(child, idCounter));
  }
  return result;
}
