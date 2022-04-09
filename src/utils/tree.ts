import { FileSystemNode } from '../components/common/FolderPicker';

export function sortRecursivelyByNameButFolderFirst(tree: FileSystemNode): FileSystemNode {
  return sortRecursively(tree, (a, b) => {
    if (a.children && !b.children) {
      return -1;
    } else if (!a.children && b.children) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
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
