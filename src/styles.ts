import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
        primary: {
          color: '{slate.200}',
          inverseColor: '{zinc.950}',
          hoverColor: '{slate.400}',
          activeColor: '{zinc.400}',
        },
        highlight: {
          background: '{zinc.950}',
          focusBackground: '{zinc.700}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
        primary: {
          color: '{zinc.50}',
          inverseColor: '{zinc.950}',
          hoverColor: '{zinc.100}',
          activeColor: '{zinc.200}',
        },
        highlight: {
          background: 'rgba(250, 250, 250, .16)',
          focusBackground: 'rgba(250, 250, 250, .24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
      },
    },
  },
});

export const DarkPreset = definePreset(Aura, {
  semantic: {
    // Definir tokens para esquemas de color claro/oscuro
    // Alineado con el sistema semántico de tailwind.config.js
    colorScheme: {
      // Esquema oscuro personalizado
      dark: {
        background: '#0f172a', // = surface-base-dark - Fondo global oscuro de la app
        textColor: '#f1f5f9', // = text-primary-dark - Texto principal en fondo oscuro
        surface: {
          '900': '#0f172a', // = surface-base-dark - Superficies principales (muy oscuro)
          '800': '#1e293b', // = surface-elevated-dark - Superficies elevadas (tarjetas, modales, sidebar)
          '700': '#334155', // = surface-overlay-dark - Superficies overlay (hover states)
          '0': '#f1f5f9', // = text-primary-dark - Color claro para texto/iconos en superficies oscuras
        },
        highlight: {
          background: 'rgba(241, 245, 249, 0.1)', // Basado en text-primary-dark con 10% opacidad
          focusBackground: 'rgba(241, 245, 249, 0.2)', // Basado en text-primary-dark con 20% opacidad
          color: '#f1f5f9', // = text-primary-dark
          focusColor: '#f1f5f9', // = text-primary-dark
        },
      },
      // Para la sección "light" podemos heredar los valores de Aura sin cambios, por lo que no la definimos aquí
    },
  },
  // Ajustes específicos por componente para asegurar contrastes adecuados
  components: {
    card: {
      colorScheme: {
        dark: {
          root: {
            background: '{surface.800}', // = surface-elevated-dark - Fondo de tarjeta
            color: '{surface.0}', // = text-primary-dark - Texto de tarjeta
          },
        },
      },
    },
  },
});
