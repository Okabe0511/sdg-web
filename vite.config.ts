import { resolve } from 'path';
import { loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createHtmlPlugin } from 'vite-plugin-html';
import type { UserConfig, ConfigEnv } from 'vite';

import { modifyVars } from './src/assets/styles/ant/lessModifyVars';

function pathResolve(dir: string) {
  return resolve(__dirname, '.', dir);
}

export default ({ mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const { VITE_APP_TITLE, VITE_OUT_DIR, VITE_PORT, VITE_PUBLIC_PATH, VITE_APP_PROXY } = env;

  return {
    base: VITE_PUBLIC_PATH,
    resolve: {
      alias: {
        '/@': pathResolve('src'),
        '/@views': pathResolve('src/views'),
        '/@components': pathResolve('src/components'),
        '/@types': pathResolve('src/types'),
        '/@images': pathResolve('src/assets/images'),
        '/@hooks': pathResolve('src/hooks'),
      },
    },

    server: {
      host: '0.0.0.0',
      open: true,
      port: Number(VITE_PORT),
      hmr: {
        overlay: false,
      },
      proxy: {
        '^/api': {
          target: VITE_APP_PROXY,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: VITE_OUT_DIR,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ['lodash', 'ant-design-vue/es/locale/zh_CN', '@ant-design/icons-vue', 'echarts'],
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${resolve(
              'src/assets/styles/abstracts/index.less'
            )}";`,
            ...modifyVars,
          },
          javascriptEnabled: true,
        },
      },
    },
    plugins: [
      vue(),
      createHtmlPlugin({
        minify: mode === 'production',
        inject: {
          data: {
            title: VITE_APP_TITLE,
          },
        },
      }),
    ],
  };
};
