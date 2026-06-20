// vitest.config.ts
// テストを2プロジェクトに分割する。
// - astro:  Astro/ライブラリ/コンテンツの単体テスト（*.test.ts）。getViteConfig で
//           Astro の解決を効かせる。SSR/node 環境。
// - react:  React アイランドのテスト（*.test.tsx）。@vitejs/plugin-react + jsdom。
//           getViteConfig の SSR 外部化は React の dispatcher を分裂させ
//           "Invalid hook call" を起こすため、React テストでは使わない。
import { getViteConfig } from 'astro/config';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const astroProject = getViteConfig({
  test: {
    name: 'astro',
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});

const reactProject = defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  test: {
    name: 'react',
    include: ['tests/**/*.test.tsx'],
    environment: 'jsdom',
    // globals を有効化すると @testing-library/react が afterEach(cleanup) を
    // 自動登録し、テスト間で DOM が積み上がらない。
    globals: true,
  },
});

export default defineConfig({
  test: {
    projects: [astroProject, reactProject],
  },
});
