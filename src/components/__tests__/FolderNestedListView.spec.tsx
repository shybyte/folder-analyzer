import { ROOT_ID } from '@cypress/mount-utils';
import { render } from 'solid-js/web';
import { FolderNestedListView } from '../tree-view/FolderNestedListView';
import { createDummyFolderTree } from '../../utils/dummy-data';
import { Counter } from '../../utils';

describe('FolderNestedListView', () => {
  it('renders within acceptable time', () => {
    // 88741 nodes
    const tree = createDummyFolderTree('root', 17, 4, new Counter());
    const rootElement = document.getElementById(ROOT_ID)!;
    performance.mark('beforeRender');
    render(
      () => <FolderNestedListView root={tree} metrics={{}} sortKey={'name'} selectedMetric={'dummy'} />,
      rootElement,
    );
    cy.get('ul')
      .should('exist')
      .then(() => {
        performance.mark('afterRender');
        performance.measure('renderDuration', 'beforeRender', 'afterRender');
        const measure = performance.getEntriesByName('renderDuration')[0]!;
        assert.isAtMost(measure.duration, 200);
        console.log('measure.duration:', measure.duration);
        cy.log(`[PERFORMANCE] Render Time for FolderNestedListView: ${measure.duration} ms`);
      });
  });
});

export {};
