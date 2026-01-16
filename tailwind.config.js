const colors = require('tailwindcss/colors')
module.exports = {
    darkMode: 'class',
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                ...colors,

                // Brand colors
                primary: "#3b82f6", // Modern Blue
                secondary: "#10b981", // Modern Teal/Green
                "accent-success": "#10b981",

                // === NAVIGATION SEMANTIC COLORS ===
                // Text colors for navigation
                'nav-text': '#111827',           // gray-900 (modo claro)
                'nav-text-hover': '#111827',     // mantiene oscuro en hover
                'nav-text-active': '#3b82f6',   // primary cuando está activo
                'nav-text-dark': '#cbd5e1',      // slate-300 (modo oscuro)
                'nav-text-dark-hover': '#ffffff', // blanco en hover (modo oscuro)

                // Background colors for navigation
                'nav-bg': 'transparent',         // sin fondo por defecto
                'nav-bg-hover': '#f3f4f6',       // gray-100 en hover
                'nav-bg-active': '#dbeafe',      // blue-100 cuando está activo

                // === SURFACE COLORS ===
                'surface-primary': '#ffffff',     // Fondo principal
                'surface-secondary': '#f9fafb',   // Fondo secundario (gray-50)
                'surface-sidebar': '#ffffff',     // Fondo del sidebar
                'surface-card': '#ffffff',        // Fondo de cards

                // Legacy surface colors (mantener por compatibilidad)
                "background-light": "#f8fafc",
                "background-dark": "#0f172a",
                "sidebar-light": "#ffffff",
                "sidebar-dark": "#1e293b",
                "card-light": "#ffffff",
                "card-dark": "#1e293b",

                // === TEXT COLORS ===
                'text-primary': '#111827',        // gray-900 - Texto principal
                'text-secondary': '#6b7280',      // gray-500 - Texto secundario
                'text-muted': '#9ca3af',          // gray-400 - Texto terciario

                // === BORDER COLORS ===
                'border-primary': '#e5e7eb',      // gray-200
                'border-secondary': '#f3f4f6',    // gray-100
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