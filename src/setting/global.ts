import type { GlobConfig } from "/@/types/config";

const { VITE_APP_ENV, VITE_APP_TITLE, VITE_APP_URL, VITE_TDUCK_URL } = (
  import.meta as any
).env;

export const globalData: Readonly<GlobConfig> = {
  env: VITE_APP_ENV as string,
  title: VITE_APP_TITLE as string,
  apiUrl: VITE_APP_URL as string,
};
