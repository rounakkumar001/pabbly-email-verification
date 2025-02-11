import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const CONFIG = {
  site: {
    name: 'Pabbly',
    serverUrl: import.meta.env.VITE_SERVER_URL ?? '',
    assetURL: import.meta.env.VITE_ASSET_URL ?? '',
    basePath: import.meta.env.VITE_BASE_PATH ?? '',
    version: packageJson.version,
  },
  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.app.root,
  }
};
