import { FileSystemNode } from '../components/common/FolderPicker';

export function sortRecursivelyByName(tree: FileSystemNode): FileSystemNode {
  return sortRecursively(tree, (a, b) => a.name.localeCompare(b.name));
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
