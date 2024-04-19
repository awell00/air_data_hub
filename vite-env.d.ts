interface ImportMetaEnv {
  VITE_API_TOKEN: string;
  VITE_APP_URL: string;
  VITE_RADAR: string;
  VITE_MAPBOX: string;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
