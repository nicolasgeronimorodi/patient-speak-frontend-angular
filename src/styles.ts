import {definePreset} from '@primeng/themes';
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
            950: '{zinc.950}'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{zinc.950}',
                    inverseColor: '#ffffff',
                    hoverColor: '{zinc.900}',
                    activeColor: '{zinc.800}'
                },
                highlight: {
                    background: '{zinc.950}',
                    focusBackground: '{zinc.700}',
                    color: '#ffffff',
                    focusColor: '#ffffff'
                }
            },
            dark: {
                primary: {
                    color: '{zinc.50}',
                    inverseColor: '{zinc.950}',
                    hoverColor: '{zinc.100}',
                    activeColor: '{zinc.200}'
                },
                highlight: {
                    background: 'rgba(250, 250, 250, .16)',
                    focusBackground: 'rgba(250, 250, 250, .24)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)'
                }
            }
        }
    }
});


export const DarkPreset = definePreset(Aura, {
  semantic: {
    // Paleta de colores primaria (opcionalmente podemos cambiarla o usar la de Aura)
    // primary: { ... },  // (ejemplo: podríamos definir un primario diferente aquí)

    // Definir tokens para esquemas de color claro/oscuro
    colorScheme: {
      // Esquema oscuro personalizado
      dark: {
        background: '#121212',              // Fondo global oscuro de la app
        textColor: 'rgba(255,255,255,0.87)', // Texto principal en fondo oscuro (blanco suavizado)
        surface: {
          '900': '#121212',   // Usamos este valor para superficies principales (muy oscuro)
          '800': '#1E1E1E',   // Un gris ligeramente más claro para superficies elevadas (tarjetas, modales)
          '700': '#2A2A2A',   // Otro tono para variaciones si se requiere
          '0': '#FFFFFF'      // Color claro para texto/iconos en superficies oscuras (se podría usar un blanco puro)
        },
        highlight: {
          background: 'rgba(255,255,255,0.16)',   // Fondo para elementos hover en oscuro (blanco 16% opaco)
          focusBackground: 'rgba(255,255,255,0.24)', // Fondo para elemento focuseado (24% opaco)
          color: 'rgba(255,255,255,0.87)',        // Texto en elementos resaltados (blanco 87%)
          focusColor: 'rgba(255,255,255,0.87)'    // Texto cuando el elemento está en foco
        }
        // Podemos agregar más tokens semánticos como formField (ej. bordes de input en hover/focus) si es necesario
      }
      // Para la sección "light" podemos heredar los valores de Aura sin cambios, por lo que no la definimos aquí
    }
  },
  // Se podrían añadir ajustes específicos por componente si hiciera falta asegurar contrastes particulares.
  // Por ejemplo, asegurando que p-card use surface-800 de fondo en oscuro en lugar de 900:
  components: {
    card: {
      colorScheme: {
        dark: {
          root: {
            background: '{surface.800}',  // Fondo de tarjeta un poco más claro que el fondo global para destacarla
            color: '{surface.0}'          // Texto de tarjeta en color claro
          }
        }
      }
    }
    // Similarmente podríamos ajustar inputtext, dialog, etc., pero en muchos casos no es necesario si los tokens globales están bien.
  }
});