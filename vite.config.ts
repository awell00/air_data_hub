import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import reactRefresh from '@vitejs/plugin-react-refresh';

export default defineConfig({
    publicDir: '../public',
    plugins: [
        laravel({
            input: [
                'resources/sass/app.scss',
                'resources/js/app.ts',
                'resources/css/app.css',
                'resources/css/mobiscroll.javascript.min.css'
            ],
            refresh: true,
        }),
        reactRefresh()
    ],
});
