/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
    readonly SSR: boolean;
    // 根据您的项目需要，可以添加其他环境变量
    readonly [key: string]: any;
  };
}