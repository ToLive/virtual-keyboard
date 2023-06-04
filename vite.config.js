import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, './src/components'),
            '@helpers': path.resolve(__dirname, './src/helpers'),
        },
    },
});
