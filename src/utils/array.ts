import { FileSystemNode } from '../components/common/FolderPicker';

export function sortByCompare<T>(array: readonly T[], compare: (a: T, b: T) => number): T[] {
  return [...array].sort(compare);
}
