// Entorno LOCAL (Supabase corriendo en Docker)
// Copia este archivo como environment.ts y completa los valores.
// Las credenciales locales se obtienen con: npx supabase status --output json
export const environment = {
    production: false,
    supabaseUrl: 'http://127.0.0.1:54321',
    supabaseKey: '<ANON_KEY de supabase status>',
    supabaseFunctionsUrl: 'http://127.0.0.1:54321/functions/v1',
    openaiApiKey: '',
    useWhisperAPI: false,
};
