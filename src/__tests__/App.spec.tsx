import { ROOT_ID } from '@cypress/mount-utils';
import { render } from 'solid-js/web';
import App from '../App';

describe('App', () => {
  it('renders a "Select Folder" button', () => {
    const rootElement = document.getElementById(ROOT_ID)!;
    render(() => <App />, rootElement);
    cy.contains('Select Folder').should('be.enabled');
  });
});

export {};
