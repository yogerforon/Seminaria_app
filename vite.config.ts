import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  // esbuild: {
  //   loader: {
  //     '.js': 'jsx',
  //     '.ts': 'tsx'
  //   }
  // },
  optimizeDeps: {
    exclude: ['@mapbox/node-pre-gyp', 'mock-aws-s3', 'aws-sdk', 'nock']
  },
  // resolve: {
  //   alias: {
  //     '@mapbox/node-pre-gyp': require.resolve('@mapbox/node-pre-gyp/lib/util/nw-pre-gyp/index.html')
  //   }
  // },
});
