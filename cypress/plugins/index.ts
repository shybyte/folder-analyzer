import { startDevServer } from '@cypress/vite-dev-server';
import myViteConfig from '../../vite.config';
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';

export default function (on: any, config: any) {
  installLogsPrinter(on, {
    includeSuccessfulHookLogs: true,
    printLogsToFile: 'always',
    printLogsToConsole: 'always',
    outputRoot: config.projectRoot + '/logs/',
    outputTarget: {
      'performance-logs|txt': 'txt',
    },
  });
  on('dev-server:start', (options: any) => {
    const viteConfig = {
      ...myViteConfig,
    };
    return startDevServer({ options, viteConfig });
  });
}
