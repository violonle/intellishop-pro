/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1677ff', // Ant Design Blue
                    hover: '#4096ff',
                    active: '#0958d9',
                }
            }
        },
    },
    plugins: [],
}
