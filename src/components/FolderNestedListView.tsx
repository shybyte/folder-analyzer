import { FileSystemNode } from './common/FolderPicker';

interface FolderNestedListViewProps {
  root: FileSystemNode;
}

export function FolderNestedListView(props: FolderNestedListViewProps) {
  return <pre>{JSON.stringify(props.root, null, 2)}</pre>;
}
