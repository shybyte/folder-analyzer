import { startDevServer } from '@cypress/vite-dev-server';
import myViteConfig from '../../vite.config';

export default function (on: any, config: any) {
  on('dev-server:start', (options: any) => {
    const viteConfig = {
      ...myViteConfig,
    };
    return startDevServer({ options, viteConfig });
  });
}
