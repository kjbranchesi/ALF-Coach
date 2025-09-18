import { extname } from 'node:path';

const SUPPORTED_ASSETS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

export async function load(url, context, defaultLoad) {
  const extension = extname(new URL(url).pathname).toLowerCase();

  if (SUPPORTED_ASSETS.has(extension)) {
    return {
      format: 'module',
      shortCircuit: true,
      source: `export default ${JSON.stringify(url)};`
    };
  }

  return defaultLoad(url, context, defaultLoad);
}
