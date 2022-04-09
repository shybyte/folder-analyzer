import { createSignal, For, Show } from 'solid-js';
import { FileSystemNode } from './common/FolderPicker';
import styles from './FolderNestedListView.module.css';
import { sortRecursivelyByName } from '../utils/tree';

interface FolderNestedListViewProps {
  root: FileSystemNode;
}

export function FolderNestedListView(props: FolderNestedListViewProps) {
  return (
    <div class={styles.folderNestedListView}>
      <NodeView node={sortRecursivelyByName(props.root)} open={true} />
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
        {props.node.name}
      </div>
      <Show when={props.node.children && isOpen()}>
        <ul>
          <For each={props.node.children}>
            {(childNode, i) => (
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
