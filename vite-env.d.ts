interface ImportMetaEnv {
  VITE_API_TOKEN: string;
  VITE_APP_URL: string;
  VITE_RADAR: string;
  VITE_MAPBOX: string;
  VITE_ADMIN_EMAIL: string;
  VITE_HERE_API_KEY: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
