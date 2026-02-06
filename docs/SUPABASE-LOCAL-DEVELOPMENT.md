# Supabase Local Development - Entorno Local con Docker

## Indice

1. [Contexto y Motivacion](#contexto-y-motivacion)
2. [Arquitectura de Entornos](#arquitectura-de-entornos)
3. [Prerequisitos](#prerequisitos)
4. [Como se configuro (paso a paso)](#como-se-configuro-paso-a-paso)
5. [Como usar los entornos](#como-usar-los-entornos)
6. [Estructura de archivos relevantes](#estructura-de-archivos-relevantes)
7. [Como funciona el environment switching en Angular](#como-funciona-el-environment-switching-en-angular)
8. [Comandos de referencia de Supabase CLI](#comandos-de-referencia-de-supabase-cli)
9. [Troubleshooting](#troubleshooting)
10. [Limitaciones conocidas](#limitaciones-conocidas)

---

## Contexto y Motivacion

El proyecto originalmente solo se conectaba a una instancia de Supabase en la nube (region Sao Paulo). Esto significa que **si no hay red, la aplicacion no funciona**. Para una presentacion profesional, esto es un riesgo.

La solucion: configurar una instancia **local** de Supabase que corre en Docker, con el mismo schema, los mismos datos, las mismas funciones RPC, los mismos triggers, y las mismas edge functions. De esta forma, se puede trabajar completamente offline.

### Que es Supabase Local?

Supabase es un wrapper de PostgreSQL que agrega autenticacion (GoTrue), API REST automatica (PostgREST), storage, edge functions (Deno), y un dashboard (Studio). El **Supabase CLI** permite correr todos estos servicios localmente usando Docker containers.

---

## Arquitectura de Entornos

```
+-------------------+          +-------------------+
|   LOCAL (Docker)  |          |   NUBE (Supabase)  |
|                   |          |                    |
| PostgreSQL :54322 |          | supabase.co        |
| API        :54321 |          | API cloud          |
| Studio     :54323 |          | Dashboard cloud    |
| Mailpit    :54324 |          | Email real         |
| Edge Fns   :54321 |          | Edge Fns cloud     |
+-------------------+          +--------------------+
        |                              |
        v                              v
  npm run start:local           npm run start:dev
  (ng serve --config local)    (ng serve --config development)
```

Angular decide a que entorno conectarse mediante **file replacements** en `angular.json`. No se toca ningun servicio ni componente.

---

## Prerequisitos

### Herramientas necesarias

| Herramienta     | Version minima | Para que se usa                              |
|-----------------|----------------|----------------------------------------------|
| Node.js         | >= 20          | Ejecutar Supabase CLI via npx                |
| Docker Desktop  | Cualquiera     | Correr los containers de Supabase            |
| nvm-windows     | Cualquiera     | Gestionar versiones de Node (opcional)       |

### Configuracion de PowerShell

Si nunca ejecutaste scripts en PowerShell, necesitas habilitar la ejecucion:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Docker Desktop en Windows

- Instalar Docker Desktop desde https://www.docker.com/products/docker-desktop
- Habilitar WSL2 (recomendado por Supabase)
- Verificar que Docker este corriendo antes de usar `supabase start`

---

## Como se configuro (paso a paso)

### Paso 1: Instalar Supabase CLI

Se instalo como dependencia de desarrollo del proyecto:

```bash
npm install supabase --save-dev
```

Esto permite ejecutar comandos con `npx supabase <comando>` sin instalar globalmente.

### Paso 2: Inicializar Supabase en el proyecto

```bash
npx supabase init
```

Esto creo el directorio `supabase/` con un archivo `config.toml` que configura los servicios locales.

### Paso 3: Vincular al proyecto remoto

```bash
npx supabase login          # Abre el navegador para autenticar con Supabase
npx supabase link --project-ref yiieqenyqwmorclswjqx
```

Esto vincula el proyecto local con el proyecto `PatientSpeak_0.0.2` en la nube (Sao Paulo).

### Paso 4: Descargar el schema de la base de datos

```bash
npx supabase db pull
```

Esto se conecto a la base de datos en la nube y genero un archivo de migracion en `supabase/migrations/` que contiene:
- Todas las tablas (`transcriptions`, `patients`, `profiles`, `tags`, `observations`, etc.)
- Todas las funciones RPC (`count_transcriptions_search`, `search_transcriptions_paginated`, `is_user_admin`, etc.)
- Todos los triggers
- Todas las politicas de Row Level Security (RLS)
- Extensiones de PostgreSQL (`uuid-ossp`, `pgcrypto`, etc.)

### Paso 5: Descargar los datos

```bash
npx supabase db dump --data-only -f supabase/seed.sql --linked
```

Esto descargo todos los datos de la nube en formato SQL (INSERTs) al archivo `supabase/seed.sql`. Este archivo se ejecuta automaticamente cuando se hace `supabase db reset`.

### Paso 6: Migrar Edge Functions

Las edge functions estaban originalmente en `supabase-edge-functions/`. Se migraron al directorio estandar de Supabase CLI:

```
supabase-edge-functions/         -->  supabase/functions/
  create-user/index.ts                 create-user/index.ts
  create-user-invite/index.ts          create-user-invite/index.ts
  send-transcription-as-email/         send-transcription-as-email/
    index.ts                             index.ts
```

El directorio antiguo `supabase-edge-functions/` fue eliminado.

### Paso 7: Configurar Angular environments

Se crearon dos archivos de entorno:

**`src/environments/environment.ts`** (entorno LOCAL por defecto):
```typescript
export const environment = {
    production: false,
    supabaseUrl: 'http://127.0.0.1:54321',
    supabaseKey: '<anon key JWT local>',
    supabaseFunctionsUrl: 'http://127.0.0.1:54321/functions/v1',
    openaiApiKey: '',
    useWhisperAPI: false,
};
```

**`src/environments/environment.development.ts`** (entorno NUBE):
```typescript
export const environment = {
    production: false,
    supabaseUrl: 'https://yiieqenyqwmorclswjqx.supabase.co',
    supabaseKey: '<anon key JWT cloud>',
    supabaseFunctionsUrl: 'https://yiieqenyqwmorclswjqx.supabase.co/functions/v1',
    openaiApiKey: '<openai key>',
    useWhisperAPI: false,
};
```

### Paso 8: Configurar angular.json

Se agrego `fileReplacements` a la configuracion `development` para que use el environment de la nube, y se agrego una configuracion `local` que usa el environment base (local):

```json
"configurations": {
    "production": { ... },
    "development": {
        "optimization": false,
        "extractLicenses": false,
        "sourceMap": true,
        "fileReplacements": [{
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.development.ts"
        }]
    },
    "local": {
        "optimization": false,
        "extractLicenses": false,
        "sourceMap": true
    }
}
```

Tambien se agrego la configuracion `local` en el bloque `serve`:

```json
"serve": {
    "configurations": {
        "production": { "buildTarget": "patient-speak-frontend:build:production" },
        "development": { "buildTarget": "patient-speak-frontend:build:development" },
        "local": { "buildTarget": "patient-speak-frontend:build:local" }
    },
    "defaultConfiguration": "development"
}
```

### Paso 9: Agregar scripts de conveniencia

En `package.json`:

```json
"scripts": {
    "start": "ng serve",
    "start:local": "ng serve --configuration local",
    "start:dev": "ng serve --configuration development",
    "supabase:start": "npx supabase start",
    "supabase:stop": "npx supabase stop",
    "supabase:reset": "npx supabase db reset"
}
```

---

## Como usar los entornos

### Modo LOCAL (presentacion offline, sin internet)

1. Asegurate de que Docker Desktop este corriendo
2. Levanta Supabase local:
   ```bash
   npm run supabase:start
   ```
3. Arranca Angular apuntando a local:
   ```bash
   npm run start:local
   ```
4. Accede a la app en `http://localhost:4200`
5. (Opcional) Accede a Supabase Studio local en `http://127.0.0.1:54323`

### Modo NUBE (desarrollo normal, con internet)

```bash
npm run start:dev
```

Esto arranca Angular conectado a la instancia de Supabase en la nube. No necesita Docker.

### Cuando terminas de trabajar en local

```bash
npm run supabase:stop
```

Los datos se persisten entre reinicios (Docker volumes). No se pierden.

### Si necesitas resetear la base de datos local

```bash
npm run supabase:reset
```

Esto re-aplica las migraciones y re-ejecuta `supabase/seed.sql`.

### Sincronizar datos nuevos desde la nube al entorno local

Si estuviste trabajando con la nube y cargaste datos nuevos (transcripciones, pacientes, etc.), podes actualizar el entorno local para que refleje esos cambios:

```bash
npx supabase db dump --data-only -f supabase/seed.sql --linked
npm run supabase:reset
```

El primer comando descarga los datos actuales de la nube y sobreescribe `seed.sql`. El segundo resetea la base local y carga el seed actualizado.

Si ademas hubo cambios de schema (nuevas tablas, funciones RPC, triggers), primero descarga el schema tambien:

```bash
npx supabase db pull
npx supabase db dump --data-only -f supabase/seed.sql --linked
npm run supabase:reset
```

---

## Estructura de archivos relevantes

```
patient-speak-frontend-angular/
  supabase/
    config.toml                   # Configuracion de servicios locales
    migrations/
      20260128004908_remote_schema.sql  # Schema completo (tablas, RPCs, triggers, RLS)
    seed.sql                      # Datos de seed (dump de la nube)
    functions/
      create-user/
        index.ts                  # Edge function: crear usuario
      create-user-invite/
        index.ts                  # Edge function: invitar usuario
      send-transcription-as-email/
        index.ts                  # Edge function: enviar email
  src/
    environments/
      environment.ts              # Config LOCAL (127.0.0.1:54321)
      environment.development.ts  # Config NUBE (supabase.co)
    app/
      services/
        supabase-client-base.service.ts  # Unico punto de contacto con environment
  angular.json                    # fileReplacements para switching
  package.json                    # Scripts de conveniencia
```

---

## Como funciona el environment switching en Angular

Angular tiene un mecanismo llamado **file replacements** que permite sustituir archivos en tiempo de compilacion segun la configuracion seleccionada.

### Flujo:

1. Todos los servicios importan `environment` desde `src/environments/environment.ts`
2. Cuando se compila con `--configuration development`, Angular reemplaza `environment.ts` por `environment.development.ts`
3. Cuando se compila con `--configuration local`, Angular usa `environment.ts` tal cual (sin reemplazo)
4. El servicio `SupabaseClientBaseService` usa `environment.supabaseUrl` y `environment.supabaseKey` para crear el cliente
5. Ningun otro archivo necesita cambios

### Diagrama:

```
ng serve --configuration local
  --> environment.ts (URLs locales) --> createClient('http://127.0.0.1:54321', ...)

ng serve --configuration development
  --> environment.development.ts (URLs nube) --> createClient('https://...supabase.co', ...)
```

---

## Comandos de referencia de Supabase CLI

| Comando | Descripcion |
|---------|-------------|
| `npx supabase start` | Levanta todos los servicios Docker locales |
| `npx supabase stop` | Detiene los servicios (mantiene datos) |
| `npx supabase stop --no-backup` | Detiene y elimina todos los datos |
| `npx supabase status` | Muestra URLs y credenciales locales |
| `npx supabase status --output json` | Mismo pero en formato JSON |
| `npx supabase db reset` | Re-aplica migraciones + seed |
| `npx supabase db pull` | Descarga schema remoto como migracion |
| `npx supabase db push` | Sube migraciones locales al remoto |
| `npx supabase db dump --data-only -f seed.sql --linked` | Descarga datos remotos |
| `npx supabase db diff -f nombre` | Genera migracion de cambios locales |
| `npx supabase functions serve` | Sirve edge functions localmente |
| `npx supabase login` | Autenticar con Supabase (abre navegador) |
| `npx supabase link --project-ref <ref>` | Vincular a proyecto remoto |

---

## Troubleshooting

### Error: "la ejecucion de scripts esta deshabilitada"

Ejecuta en PowerShell:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Error: "Cannot find project ref. Have you run supabase link?"

El proyecto no esta vinculado. Ejecuta:
```bash
npx supabase link --project-ref yiieqenyqwmorclswjqx
```

### Error de autenticacion al hacer db pull/push

El error `"Unsupported or invalid secret format"` puede aparecer al conectar al pooler. El schema se descarga correctamente via `pg_dump` directo, pero el paso de diff puede fallar. Si la migracion ya se genero en `supabase/migrations/`, el schema esta completo.

### Docker no esta corriendo

Si `supabase start` falla, verifica que Docker Desktop este ejecutandose. En Windows, busca el icono de Docker en la barra de tareas.

### Los datos no aparecen despues de `supabase start`

Ejecuta `npm run supabase:reset` para re-aplicar las migraciones y el seed.

### supabase start falla en la primera ejecucion

La primera vez tarda bastante porque descarga muchas imagenes Docker (PostgreSQL, GoTrue, PostgREST, Realtime, Storage, Studio, etc.). Asegurate de tener buena conexion a internet para esa primera descarga.

---

## Limitaciones conocidas

1. **Edge functions que dependen de servicios externos**: La funcion `send-transcription-as-email` usa la API de Resend. Sin internet, no podra enviar emails aunque el resto de la aplicacion funcione.

2. **OpenAI API**: El `openaiApiKey` esta vacio en el entorno local. Las funcionalidades que dependan de Whisper/OpenAI no funcionaran offline.

3. **Autenticacion de usuarios**: Los usuarios de la nube no se replican automaticamente al auth local. El `seed.sql` contiene datos de tablas publicas, pero los usuarios de `auth.users` pueden no incluirse en el dump. Puede ser necesario crear usuarios de prueba manualmente en Studio local (`http://127.0.0.1:54323`).

4. **Espacio en disco**: Docker Desktop con todos los containers de Supabase puede ocupar varios GB de espacio en disco.

5. **Mailpit vs email real**: En local, los emails se capturan en Mailpit (`http://127.0.0.1:54324`) en vez de enviarse realmente. Esto es util para testing.
