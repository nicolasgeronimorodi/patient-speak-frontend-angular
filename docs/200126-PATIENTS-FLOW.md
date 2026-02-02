# Modulo de Pacientes - Documentacion Tecnica

**Fecha:** 2026-01-20
**Version:** 1.0

---

## Resumen

Se implemento un modulo completo de gestion de pacientes que permite:
- Asociar pacientes a transcripciones (obligatorio)
- Crear nuevos pacientes con consentimiento informado
- Buscar pacientes existentes mediante autocomplete
- Gestionar pacientes desde el sidebar (lista, detalle, desactivar)
- Cumplir con la Ley 25.326 de Proteccion de Datos Personales de Argentina

---

## Scripts SQL para Supabase

### 1. Crear tabla `patients`

```sql
-- Tabla de pacientes con datos de identificacion y consentimiento
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),

  -- Datos de identificacion
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  document_type TEXT DEFAULT 'DNI',
  document_number TEXT,

  -- Consentimiento (OBLIGATORIO por Ley 25.326)
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMPTZ,

  -- Auditoria
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Constraint: documento unico globalmente
  CONSTRAINT unique_patient_document UNIQUE (document_type, document_number)
);
```

**Campos:**
- `user_id`: Usuario que CREO el paciente (para auditoria, no restringe acceso)
- `first_name`, `last_name`: Datos obligatorios del paciente
- `document_type`: Tipo de documento (DNI, Pasaporte, CUIT/CUIL)
- `document_number`: Numero de documento (opcional pero unico si se proporciona)
- `consent_given`: Indica si el paciente dio consentimiento informado
- `consent_date`: Fecha/hora en que se otorgo el consentimiento
- `is_active`: Soft delete (false = paciente desactivado)

### 2. Trigger para `updated_at`

```sql
-- Actualiza automaticamente updated_at cuando se modifica un registro
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Row Level Security (RLS) - Acceso Global

```sql
-- Habilitar RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden VER todos los pacientes
CREATE POLICY "Authenticated users can view all patients"
ON patients FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Todos los usuarios autenticados pueden CREAR pacientes
CREATE POLICY "Authenticated users can insert patients"
ON patients FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Todos los usuarios autenticados pueden ACTUALIZAR pacientes
CREATE POLICY "Authenticated users can update patients"
ON patients FOR UPDATE
USING (auth.uid() IS NOT NULL);
```

**Nota:** Los pacientes son GLOBALES. Todos los usuarios autenticados de la clinica pueden ver y gestionar todos los pacientes.

### 4. Indice para busqueda

```sql
-- Optimiza busquedas por nombre y documento
CREATE INDEX idx_patients_search ON patients(user_id, first_name, last_name, document_number);
```

### 5. Agregar FK a transcriptions

```sql
-- Agrega columna patient_id a transcripciones existentes
ALTER TABLE public.transcriptions
ADD COLUMN patient_id UUID REFERENCES patients(id);

-- Indice para consultas por paciente
CREATE INDEX idx_transcriptions_patient ON transcriptions(patient_id);
```

---

## Archivos Creados

### Modelos de Base de Datos

| Archivo | Descripcion |
|---------|-------------|
| `models/database-models/patient/patient.interface.ts` | Interfaz `PatientEntity` que mapea la tabla de Supabase |

### View Models

| Archivo | Interfaz | Uso |
|---------|----------|-----|
| `models/view-models/patient-form.view.model.ts` | `PatientFormViewModel` | Formulario de creacion de paciente |
| `models/view-models/patient-list-item.view.model.ts` | `PatientListItemViewModel` | Items en lista y autocomplete |
| `models/view-models/patient-detail.view.model.ts` | `PatientDetailViewModel` | Vista de detalle completo |
| `models/view-models/patient-filter.view.model.ts` | `PatientFilterViewModel` | Filtros de busqueda y paginacion |

### Mappers

| Archivo | Clase | Metodos |
|---------|-------|---------|
| `models/mappers/patient.mapping.ts` | `PatientMappers` | `toListItem()`, `toDetail()`, `fromForm()` |

### Servicios

| Archivo | Metodos |
|---------|---------|
| `services/patient.service.ts` | `createPatient()`, `getPaginatedPatients()`, `searchPatients()`, `getPatientById()`, `deactivatePatient()` |

### Componentes

| Carpeta | Descripcion |
|---------|-------------|
| `components/patient-query/` | Lista de pacientes con busqueda, paginacion y cards |
| `components/patient-detail/` | Detalle de paciente con datos y estado de consentimiento |

---

## Archivos Modificados

### transcription-form.view.model.ts

```typescript
export interface TranscriptionFormViewModel {
  title: string;
  content: string;
  language: string;
  tag_id: string;
  patient_id: string;  // NUEVO - obligatorio
}
```

### transcription-new.component.ts

Se agregaron:
- Propiedad `patientMode: 'existing' | 'new'` para toggle
- Propiedad `patientSuggestions` para autocomplete
- Propiedad `selectedPatient` para paciente seleccionado
- FormGroup `patientForm` para nuevo paciente
- Array `documentTypes` con opciones de tipo de documento
- Metodo `searchPatients()` para autocomplete
- Metodo `onPatientSelect()` al seleccionar paciente
- Metodo `setPatientMode()` para cambiar modo
- Metodo `clearPatientSelection()` para limpiar seleccion
- Metodo `createPatientAndSave()` para crear paciente y guardar transcripcion

### transcription-new.component.html

Se agrego seccion "Paciente" con:
- Toggle buttons: "Paciente existente" / "Nuevo paciente"
- `p-autoComplete` para buscar pacientes existentes
- Card con paciente seleccionado y boton para limpiar
- Formulario para nuevo paciente (nombre, apellido, documento)
- Checkbox de consentimiento informado con texto legal

### app.routes.ts

```typescript
{ path: 'patients', component: PatientQueryComponent },
{ path: 'patients/:id', component: PatientDetailComponent },
```

### sidebar.component.ts

Se agrego grupo "Pacientes" con item "Gestionar pacientes" que enlaza a `/patients`.

---

## Flujo de Usuario

### Crear Transcripcion con Paciente Existente

1. Usuario navega a "Nueva transcripcion"
2. Graba audio y selecciona categoria
3. En seccion "Paciente", modo "Paciente existente" esta activo por defecto
4. Escribe nombre, apellido o DNI en el autocomplete
5. Selecciona paciente de la lista de sugerencias
6. Aparece card con datos del paciente seleccionado
7. Guarda transcripcion

### Crear Transcripcion con Nuevo Paciente

1. Usuario navega a "Nueva transcripcion"
2. Graba audio y selecciona categoria
3. Hace click en "Nuevo paciente"
4. Completa formulario: nombre, apellido, tipo documento, numero documento
5. Marca checkbox de consentimiento informado (obligatorio)
6. Guarda transcripcion
7. Sistema crea paciente primero, luego asocia transcripcion

### Gestionar Pacientes

1. Usuario hace click en "Gestionar pacientes" en sidebar
2. Ve lista de pacientes con busqueda y paginacion
3. Puede buscar por nombre, apellido o documento
4. Click en card abre detalle del paciente
5. En detalle puede ver datos y estado de consentimiento
6. Puede desactivar paciente (soft delete)

---

## Validaciones

### Al Guardar Transcripcion

- Texto obligatorio
- Categoria obligatoria
- Paciente obligatorio (existente seleccionado O nuevo creado)

### Al Crear Nuevo Paciente

- Nombre obligatorio
- Apellido obligatorio
- Consentimiento obligatorio (checkbox marcado)
- Documento unico si se proporciona (constraint en BD)

---

## Cumplimiento Legal

### Ley 25.326 - Proteccion de Datos Personales

- **Consentimiento explicito**: Checkbox obligatorio antes de registrar datos
- **Informacion clara**: Texto explica para que se usan los datos
- **Derecho de acceso/rectificacion/supresion**: Mencionado en texto de consentimiento
- **Auditoria**: Se guarda fecha de consentimiento y usuario que creo el registro

### Texto de Consentimiento

> El paciente autoriza el tratamiento de sus datos personales (nombre, apellido, documento) con el fin de recibir atencion medica y generar registros de consultas. Los datos seran tratados conforme a la Ley 25.326 de Proteccion de Datos Personales.

---

## Consideraciones Tecnicas

### Busqueda de Pacientes

El autocomplete busca en tres campos usando `ilike` de Supabase:
- `first_name`
- `last_name`
- `document_number`

Requiere minimo 2 caracteres y retorna maximo 10 resultados.

### Soft Delete

Los pacientes no se eliminan fisicamente. Se marca `is_active = false` y las consultas filtran por `is_active = true`.

### Pacientes Globales

A diferencia de otras entidades, los pacientes NO estan restringidos por `user_id` en RLS. Todos los usuarios autenticados pueden acceder a todos los pacientes. El campo `user_id` solo indica quien creo el registro (auditoria).
