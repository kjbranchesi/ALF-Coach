const ASSET_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp', '.svg'];

export async function load(url, context, defaultLoad) {
  const lower = url.toLowerCase();
  if (ASSET_EXTENSIONS.some(ext => lower.endsWith(ext))) {
    return {
      format: 'module',
      source: 'export default "";\n',
      shortCircuit: true
    };
  }
  return defaultLoad(url, context, defaultLoad);
}
