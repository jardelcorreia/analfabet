// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { nodePolyfills } from "file:///home/project/node_modules/vite-plugin-node-polyfills/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Explicitly specify globals, though Buffer and process are defaults.
      // This ensures our intent is clear.
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      // Enable polyfill for `node:` protocol imports if any dependency uses them.
      protocolImports: true
    })
  ],
  define: {
    global: "globalThis",
    "process.env": {}
  },
  resolve: {
    alias: {
      process: "process/browser",
      buffer: "buffer",
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      util: "util",
      events: "events"
    }
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: [
      "buffer",
      "process/browser",
      "crypto-browserify",
      "stream-browserify",
      "util",
      "events",
      "jsonwebtoken"
      // Add jsonwebtoken here
    ],
    esbuildOptions: {
      define: {
        global: "globalThis"
      },
      // No longer need esbuild-specific polyfill plugins here,
      // as vite-plugin-node-polyfills handles it more globally.
      plugins: []
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
      // Reverted to default by removing 'include' array
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["date-fns", "lucide-react"],
          polyfills: ["buffer", "process", "crypto-browserify", "stream-browserify", "util", "events"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBub2RlUG9seWZpbGxzKHtcbiAgICAgIC8vIEV4cGxpY2l0bHkgc3BlY2lmeSBnbG9iYWxzLCB0aG91Z2ggQnVmZmVyIGFuZCBwcm9jZXNzIGFyZSBkZWZhdWx0cy5cbiAgICAgIC8vIFRoaXMgZW5zdXJlcyBvdXIgaW50ZW50IGlzIGNsZWFyLlxuICAgICAgZ2xvYmFsczoge1xuICAgICAgICBCdWZmZXI6IHRydWUsXG4gICAgICAgIGdsb2JhbDogdHJ1ZSxcbiAgICAgICAgcHJvY2VzczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICAvLyBFbmFibGUgcG9seWZpbGwgZm9yIGBub2RlOmAgcHJvdG9jb2wgaW1wb3J0cyBpZiBhbnkgZGVwZW5kZW5jeSB1c2VzIHRoZW0uXG4gICAgICBwcm90b2NvbEltcG9ydHM6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGRlZmluZToge1xuICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnLFxuICAgICdwcm9jZXNzLmVudic6IHt9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIHByb2Nlc3M6ICdwcm9jZXNzL2Jyb3dzZXInLFxuICAgICAgYnVmZmVyOiAnYnVmZmVyJyxcbiAgICAgIGNyeXB0bzogJ2NyeXB0by1icm93c2VyaWZ5JyxcbiAgICAgIHN0cmVhbTogJ3N0cmVhbS1icm93c2VyaWZ5JyxcbiAgICAgIHV0aWw6ICd1dGlsJyxcbiAgICAgIGV2ZW50czogJ2V2ZW50cycsXG4gICAgfSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICBpbmNsdWRlOiBbXG4gICAgICAnYnVmZmVyJyxcbiAgICAgICdwcm9jZXNzL2Jyb3dzZXInLFxuICAgICAgJ2NyeXB0by1icm93c2VyaWZ5JyxcbiAgICAgICdzdHJlYW0tYnJvd3NlcmlmeScsXG4gICAgICAndXRpbCcsXG4gICAgICAnZXZlbnRzJyxcbiAgICAgICdqc29ud2VidG9rZW4nIC8vIEFkZCBqc29ud2VidG9rZW4gaGVyZVxuICAgIF0sXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIGRlZmluZToge1xuICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgICAgIH0sXG4gICAgICAvLyBObyBsb25nZXIgbmVlZCBlc2J1aWxkLXNwZWNpZmljIHBvbHlmaWxsIHBsdWdpbnMgaGVyZSxcbiAgICAgIC8vIGFzIHZpdGUtcGx1Z2luLW5vZGUtcG9seWZpbGxzIGhhbmRsZXMgaXQgbW9yZSBnbG9iYWxseS5cbiAgICAgIHBsdWdpbnM6IFtdLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZSxcbiAgICAgIC8vIFJldmVydGVkIHRvIGRlZmF1bHQgYnkgcmVtb3ZpbmcgJ2luY2x1ZGUnIGFycmF5XG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgIHV0aWxzOiBbJ2RhdGUtZm5zJywgJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgIHBvbHlmaWxsczogWydidWZmZXInLCAncHJvY2VzcycsICdjcnlwdG8tYnJvd3NlcmlmeScsICdzdHJlYW0tYnJvd3NlcmlmeScsICd1dGlsJywgJ2V2ZW50cyddLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLHFCQUFxQjtBQUU5QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixjQUFjO0FBQUE7QUFBQTtBQUFBLE1BR1osU0FBUztBQUFBLFFBQ1AsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLE1BQ1g7QUFBQTtBQUFBLE1BRUEsaUJBQWlCO0FBQUEsSUFDbkIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWUsQ0FBQztBQUFBLEVBQ2xCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxTQUFTO0FBQUEsTUFDVCxRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixNQUFNO0FBQUEsTUFDTixRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsSUFDeEIsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQTtBQUFBO0FBQUEsTUFHQSxTQUFTLENBQUM7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsaUJBQWlCO0FBQUEsTUFDZix5QkFBeUI7QUFBQTtBQUFBLElBRTNCO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDN0IsT0FBTyxDQUFDLFlBQVksY0FBYztBQUFBLFVBQ2xDLFdBQVcsQ0FBQyxVQUFVLFdBQVcscUJBQXFCLHFCQUFxQixRQUFRLFFBQVE7QUFBQSxRQUM3RjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
