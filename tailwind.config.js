export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#00236f',
                'primary-light': '#eef2ff',
                surface: '#f7f9fb',
                ink: '#191c1e',
                muted: '#606572',
                success: '#00714d',
                warning: '#9a6700',
                danger: '#ba1a1a',
                border: '#e2e5ea',
            },
            fontFamily: { sans: ['Inter', 'Tahoma', 'Arial', 'sans-serif'] },
            boxShadow: { soft: '0 1px 3px rgba(25, 28, 30, 0.06)' },
        },
    },
    plugins: [],
};
