import { FileSystemNode } from '../types';

const collator = new Intl.Collator();

export function compareNodesByNameButFolderFirst(a: FileSystemNode, b: FileSystemNode) {
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

export function sortRecursivelyByNameButFolderFirst(tree: FileSystemNode): FileSystemNode {
  return sortRecursively(tree, compareNodesByNameButFolderFirst);
}

export function sortRecursively(
  tree: FileSystemNode,
  compare: (a: FileSystemNode, b: FileSystemNode) => number,
): FileSystemNode {
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
