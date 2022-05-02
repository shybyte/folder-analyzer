import { createSignal, For, Show } from 'solid-js';
import styles from './FolderNestedListView.module.scss';
import { compareNodesByNameButFolderFirst } from '../utils/tree';
import { sortByCompare } from '../utils/array';
import { FileSystemNode } from '../types';
import { FolderMetricsAnalysis, MetricName } from '../metrics/types';

interface FolderNestedListViewProps {
  root: FileSystemNode;
  metrics: FolderMetricsAnalysis;
  selectedMetric: MetricName;
}

export function FolderNestedListView(props: FolderNestedListViewProps) {
  return (
    <div class={styles.folderNestedListView}>
      <NodeView node={props.root} open={true} metrics={props.metrics} selectedMetric={props.selectedMetric} />
    </div>
  );
}

interface NodeViewProps {
  node: FileSystemNode;
  metrics: FolderMetricsAnalysis;
  selectedMetric: MetricName;
  open?: boolean;
}

export function NodeView(props: NodeViewProps) {
  const [isOpen, setOpen] = createSignal(props.open ?? false);

  const metricValueString = () => {
    const value = props.metrics[props.selectedMetric]?.valueByFile[props.node.id];
    return value ? Math.round(value).toLocaleString() : '';
  };

  return (
    <>
      <div
        class={styles.line}
        classList={{ [styles.folder]: !!props.node.children }}
        aria-expanded={isOpen()}
        onClick={() => setOpen(!isOpen())}
      >
        {props.node.name}
        <span class={styles.metricValue}>{metricValueString()}</span>
      </div>
      <Show when={props.node.children && isOpen()}>
        <ul>
          <For each={sortByCompare(props.node.children!, compareNodesByNameButFolderFirst)}>
            {(childNode) => (
              <li>
                <NodeView node={childNode} metrics={props.metrics} selectedMetric={props.selectedMetric}></NodeView>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </>
  );
}
