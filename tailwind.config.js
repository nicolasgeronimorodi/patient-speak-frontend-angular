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

                // === BRAND COLORS ===
                primary: "#3b82f6",
                secondary: "#10b981",
                "accent-success": "#10b981",

                // === SEMANTIC COLOR SYSTEM ===

                // SURFACES (fondos de áreas)
                'surface-base': '#ffffff',
                'surface-base-dark': '#0f172a',
                'surface-elevated': '#ffffff',
                'surface-elevated-dark': '#1e293b',
                'surface-overlay': '#f9fafb',
                'surface-overlay-dark': '#334155',

                // TEXT (colores de texto)
                'text-primary': '#111827',
                'text-primary-dark': '#f1f5f9',
                'text-secondary': '#64748b',
                'text-secondary-dark': '#94a3b8',
                'text-muted': '#94a3b8',
                'text-muted-dark': '#64748b',

                // BORDERS
                'border-default': '#e2e8f0',
                'border-default-dark': '#334155',

                // INTERACTIVE (elementos interactivos)
                'interactive-hover': '#f1f5f9',
                'interactive-hover-dark': '#475569',
                'interactive-active': '#dbeafe',
                'interactive-active-dark': 'rgba(59, 130, 246, 0.2)',

                // === LEGACY COLORS (mantener temporalmente para compatibilidad) ===
                "background-light": "#f8fafc",
                "background-dark": "#0f172a",
                "sidebar-light": "#ffffff",
                "sidebar-dark": "#1e293b",
                "card-light": "#ffffff",
                "card-dark": "#1e293b",
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