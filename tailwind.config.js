module.exports = {
    darkMode: 'class',
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#3b82f6", // Modern Blue
                secondary: "#10b981", // Modern Teal/Green
                "background-light": "#f8fafc",
                "background-dark": "#0f172a",
                "sidebar-light": "#ffffff",
                "sidebar-dark": "#1e293b",
                "card-light": "#ffffff",
                "card-dark": "#1e293b",
                "accent-success": "#10b981",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
                sans: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.75rem",
                "xl": "1rem",
            },
        },
    },
    plugins: [require('tailwindcss-primeui')]
};