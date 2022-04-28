import { createSignal, For, Show } from 'solid-js';
import styles from './FolderNestedListView.module.scss';
import { compareNodesByNameButFolderFirst } from '../utils/tree';
import { sortByCompare } from '../utils/array';
import { FileSystemNode } from '../types';
import { FolderMetricsAnalysis } from '../metrics/types';
import { FILE_SIZE_METRIC } from '../metrics/file-size-metric-analyzer';

interface FolderNestedListViewProps {
  root: FileSystemNode;
  metrics: FolderMetricsAnalysis;
}

export function FolderNestedListView(props: FolderNestedListViewProps) {
  return (
    <div class={styles.folderNestedListView}>
      <NodeView node={props.root} open={true} metrics={props.metrics} />
    </div>
  );
}

interface NodeViewProps {
  node: FileSystemNode;
  metrics: FolderMetricsAnalysis;
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
        {props.node.name} ({props.node.id}) {props.metrics[FILE_SIZE_METRIC]?.valueByFile[props.node.id]}
      </div>
      <Show when={props.node.children && isOpen()}>
        <ul>
          <For each={sortByCompare(props.node.children!, compareNodesByNameButFolderFirst)}>
            {(childNode) => (
              <li>
                <NodeView node={childNode} metrics={props.metrics}></NodeView>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </>
  );
}
