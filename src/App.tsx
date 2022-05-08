import { batch, Component, createEffect, createMemo, createSignal, Match, Switch } from 'solid-js';
import styles from './App.module.scss';
import { FolderPicker } from './components/common/FolderPicker';
import { FolderNestedListView } from './components/tree-view/FolderNestedListView';
import { PerformanceMetricDataPoint, recordMetric, sendMetricIfConfigured } from './utils/performance';
import { FileSystemNode } from './types';
import { analyzeMetrics } from './metrics/analyze-metrics';
import { FILE_SIZE_METRIC, FileSizeMetricAnalyzer } from './metrics/file-size-metric-analyzer';
import { FolderMetricsAnalysis, MetricName } from './metrics/types';
import { verifyPermission } from './utils';
import { readData, storeData } from './db/datastore';
import { reReadFolder } from './read-folder';
import { aggregateMetrics, AggregationMethod } from './metrics/aggregrate';
import { FileCountMetricAnalyzer } from './metrics/file-count-metric-analyzer';
import { SimpleSelect } from './components/common/SimpleSelect';
import { SortKey } from './utils/tree';
import { useSearchParams } from 'solid-app-router';
import { SunburstChart } from './components/sunburst-chart/SunburstChart';

/* eslint-disable max-lines*/

const TREE_BROWSER_SEARCH_PARAM = 'treeBrowser';

// eslint-disable-next-line max-lines-per-function,max-statements
const App: Component = () => {
  sendMetricIfConfigured('load-app', performance.now());
  recordMetric('prepare-data-loading');
  const [searchParams, setSearchParams] = useSearchParams();
  const [getRootFolderHandle, setRootFolderHandle] = createSignal<FileSystemDirectoryHandle>();
  const [getRootFolder, setRootFolder] = createSignal<FileSystemNode>();
  const [metricsAnalysis, setMetricsAnalysis] = createSignal<FolderMetricsAnalysis>({});
  const [getSelectedMetric, setSelectedMetric] = createSignal<MetricName>(FILE_SIZE_METRIC);
  const [getSelectedAggregationMethod, setSelectedAggregationMethod] = createSignal(AggregationMethod.Sum);
  const [getSortKey, setSortKey] = createSignal<SortKey>('name');

  const getSelectedTreeBrowser = () =>
    (searchParams[TREE_BROWSER_SEARCH_PARAM] ?? TreeBrowserComponent.Tree) as TreeBrowserComponent;

  const analyzers = [new FileSizeMetricAnalyzer(), new FileCountMetricAnalyzer()];

  async function onFolderPicked(folder: FileSystemNode) {
    console.log('folder', folder);
    setRootFolderHandle(folder.handle as FileSystemDirectoryHandle);
    setRootFolder(folder);
    await analyze();
  }

  async function analyze() {
    let rootFolder = getRootFolder();
    if (rootFolder) {
      if (rootFolder.handle) {
        await verifyPermission(rootFolder.handle);
      } else if (getRootFolderHandle()) {
        rootFolder = await reReadFolder(getRootFolderHandle()!);
        setRootFolder(rootFolder);
      }
      const analyzeMetricsPerformance = PerformanceMetricDataPoint.start('analyzeMetrics');
      const analysis = await analyzeMetrics(analyzers, rootFolder);
      analyzeMetricsPerformance.end();
      console.log('analysis:', analysis);
      setMetricsAnalysis(analysis);
      void storeData({
        rootFolder: rootFolder,
        rootFolderHandle: rootFolder.handle as FileSystemDirectoryHandle,
        rootFolderMetrics: analysis,
      });
    }
  }

  createEffect(async () => {
    recordMetric('load-data-from-index-db');
    const restoredData = await readData();
    if (restoredData) {
      recordMetric('render-app');
      batch(() => {
        setRootFolder(restoredData.rootFolder);
        setRootFolderHandle(restoredData.rootFolderHandle);
        setMetricsAnalysis(restoredData.rootFolderMetrics);
      });
      recordMetric('layout-app');
      setTimeout(() => {
        recordMetric();
      }, 0);
    } else {
      recordMetric();
    }
  });

  const aggregatedMetrics = createMemo((): FolderMetricsAnalysis => {
    const rootFolder = getRootFolder();
    return (rootFolder && aggregateMetrics(rootFolder, metricsAnalysis(), getSelectedAggregationMethod())) || {};
  });

  return (
    <section class={styles.app}>
      <header>
        <FolderPicker
          onFolderPicked={(folder) => {
            void onFolderPicked(folder);
          }}
        />
        <button
          onClick={() => {
            void analyze();
          }}
          disabled={!getRootFolder()}
        >
          Analyze
        </button>
        <SimpleSelect
          setSelectedValue={setSelectedMetric}
          selectedValue={getSelectedMetric()}
          values={Object.keys(metricsAnalysis())}
        ></SimpleSelect>
        <SimpleSelect
          setSelectedValue={setSelectedAggregationMethod}
          selectedValue={getSelectedAggregationMethod()}
          values={Object.values(AggregationMethod)}
        ></SimpleSelect>
        <SimpleSelect
          setSelectedValue={setSortKey}
          selectedValue={getSortKey()}
          values={['name', ...Object.keys(aggregatedMetrics())]}
        ></SimpleSelect>
        <SimpleSelect
          setSelectedValue={(newValue) => {
            setSearchParams({ [TREE_BROWSER_SEARCH_PARAM]: newValue });
          }}
          selectedValue={getSelectedTreeBrowser()}
          values={Object.values(TreeBrowserComponent)}
        ></SimpleSelect>
      </header>
      <div class={styles.main}>
        <Switch>
          <Match when={getRootFolder() && getSelectedTreeBrowser() === TreeBrowserComponent.Tree}>
            <FolderNestedListView
              root={getRootFolder()!}
              metrics={aggregatedMetrics()}
              selectedMetric={getSelectedMetric()}
              sortKey={getSortKey()}
            />
          </Match>
          <Match when={getRootFolder() && getSelectedTreeBrowser() === TreeBrowserComponent.Sunburst}>
            <SunburstChart root={getRootFolder()!} metrics={aggregatedMetrics()} selectedMetric={getSelectedMetric()} />
          </Match>
        </Switch>
      </div>
    </section>
  );
};

enum TreeBrowserComponent {
  Tree = 'Tree',
  Sunburst = 'Sunburst',
}

export default App;
