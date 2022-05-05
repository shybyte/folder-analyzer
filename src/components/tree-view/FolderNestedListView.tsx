import { createSignal, For, Show } from 'solid-js';
import styles from './FolderNestedListView.module.scss';
import { compareByName, compareNodesButFolderFirst, SortKey } from '../../utils/tree';
import { sortByCompare } from '../../utils/array';
import { FileSystemNode } from '../../types';
import { FolderMetricsAnalysis, MetricName } from '../../metrics/types';

interface FolderNestedListViewProps {
  root: FileSystemNode;
  metrics: FolderMetricsAnalysis;
  selectedMetric: MetricName;
  sortKey: SortKey;
}

export function FolderNestedListView(props: FolderNestedListViewProps) {
  return (
    <div class={styles.folderNestedListView}>
      <NodeView
        node={props.root}
        open={true}
        metrics={props.metrics}
        selectedMetric={props.selectedMetric}
        sortNodes={(nodes: FileSystemNode[]) => {
          const compareBySortKey = createCompareBySortKey(props.sortKey, props.metrics);
          return sortByCompare(nodes, (a, b) => compareNodesButFolderFirst(compareBySortKey, a, b));
        }}
      />
    </div>
  );
}

function createCompareBySortKey(
  sortKey: SortKey,
  metrics: FolderMetricsAnalysis,
): (a: FileSystemNode, b: FileSystemNode) => number {
  if (sortKey === 'name') {
    return compareByName;
  } else {
    const metricAnalysis = metrics[sortKey];
    return (a1, b1) => {
      const metricValue1 = metricAnalysis?.valueByFile[a1.id] ?? 0;
      const metricValue2 = metricAnalysis?.valueByFile[b1.id] ?? 0;
      return metricValue2 - metricValue1;
    };
  }
}

interface NodeViewProps {
  node: FileSystemNode;
  metrics: FolderMetricsAnalysis;
  selectedMetric: MetricName;
  sortNodes: (nodes: FileSystemNode[]) => FileSystemNode[];
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
          <For each={props.sortNodes(props.node.children!)}>
            {(childNode) => (
              <li>
                <NodeView
                  node={childNode}
                  metrics={props.metrics}
                  selectedMetric={props.selectedMetric}
                  sortNodes={props.sortNodes}
                ></NodeView>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </>
  );
}
