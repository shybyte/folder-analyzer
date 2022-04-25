import { createSignal, For, Show } from 'solid-js';
import styles from './FolderNestedListView.module.scss';
import { compareNodesByNameButFolderFirst } from '../utils/tree';
import { sortByCompare } from '../utils/array';
import { FileSystemNode } from '../types';

interface FolderNestedListViewProps {
  root: FileSystemNode;
}

export function FolderNestedListView(props: FolderNestedListViewProps) {
  return (
    <div class={styles.folderNestedListView}>
      <NodeView node={props.root} open={true} />
    </div>
  );
}

interface NodeViewProps {
  node: FileSystemNode;
  open?: boolean;
}

export function NodeView(props: NodeViewProps) {
  const [isOpen, setOpen] = createSignal(props.open ?? false);
  return (
    <>
      <div
        classList={{ [styles.folder]: !!props.node.children }}
        aria-expanded={isOpen()}
        onClick={() => setOpen(!isOpen())}
      >
        {props.node.name} ({props.node.id})
      </div>
      <Show when={props.node.children && isOpen()}>
        <ul>
          <For each={sortByCompare(props.node.children!, compareNodesByNameButFolderFirst)}>
            {(childNode) => (
              <li>
                <NodeView node={childNode}></NodeView>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </>
  );
}
