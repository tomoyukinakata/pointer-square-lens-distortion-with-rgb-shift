// @ts-check
import { defineConfig } from "astro/config";
import path from "path";
import glsl from "vite-plugin-glsl";

// https://astro.build/config
export default defineConfig({
  // base: "/webgl/",
  build: {
    assets: "assets/js",
  },
  server: {
    host: true,
  },
  site: "https://www.yukiloz7.com/",
  vite: {
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "assets/js/[name].[hash].js",
          chunkFileNames: "assets/js/[name].[hash].js",
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? "";

            if (/\.css$/i.test(name)) {
              return "assets/css/[name].[hash][extname]";
            }

            if (/\.(avif|webp|png|jpe?g|gif|svg)$/i.test(name)) {
              return "assets/img/[name].[hash][extname]";
            }

            return "assets/[name].[hash][extname]";
          },
        },
      },
    },
    plugins: [
      glsl({
        include: ["**/*.glsl", "**/*.vert", "**/*.frag"],
        warnDuplicatedImports: true,
        removeDuplicatedImports: true,
        minify: false,
        watch: true,
      }),
    ],
    resolve: {
      alias: {
        "@": path.join(process.cwd(), "src"),
        "@scripts": path.join(process.cwd(), "src/scripts"),
        "@styles": path.join(process.cwd(), "src/styles"),
        "@layouts": path.join(process.cwd(), "src/layouts"),
      },
    },
  },
});
