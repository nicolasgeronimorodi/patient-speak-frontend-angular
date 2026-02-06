# Plan de verificacion manual

## Cuentas de prueba requeridas

| Rol | Email | Notas |
|-----|-------|-------|
| Admin | (cuenta admin existente) | Acceso completo |
| Operador | (cuenta operador existente) | Acceso limitado |

---

## 1. Autenticacion y sesion

### AUTH-01 - Login exitoso
- **Precondicion**: Usuario registrado y activo
- **Pasos**:
  1. Navegar a `/login`
  2. Ingresar email y password validos
  3. Click en "Iniciar sesion"
- **Resultado esperado**: Redirige a `/home`. Sidebar visible con items correspondientes al rol.
- **Prioridad**: Alta

### AUTH-02 - Login con credenciales invalidas
- **Precondicion**: Ninguna
- **Pasos**:
  1. Navegar a `/login`
  2. Ingresar email o password incorrectos
  3. Click en "Iniciar sesion"
- **Resultado esperado**: Se muestra mensaje de error. No se redirige.
- **Prioridad**: Alta

### AUTH-03 - Logout
- **Precondicion**: Usuario logueado
- **Pasos**:
  1. Click en boton de cerrar sesion (sidebar o topbar)
- **Resultado esperado**: Redirige a `/login`. No se puede acceder a rutas protegidas.
- **Prioridad**: Alta

### AUTH-04 - Usuario inactivo es deslogueado automaticamente
- **Precondicion**: Un admin ha desactivado al usuario previamente (is_active = false en profiles)
- **Pasos**:
  1. Intentar navegar a cualquier ruta protegida (ej: `/home`)
- **Resultado esperado**: El AuthGuard detecta is_active = false, ejecuta signOut y redirige a `/login`.
- **Prioridad**: Alta

### AUTH-05 - Acceso a rutas protegidas sin autenticacion
- **Precondicion**: No estar logueado
- **Pasos**:
  1. Navegar directamente a `/home`, `/patients`, `/admin/users/list`
- **Resultado esperado**: Redirige a `/login` en todos los casos.
- **Prioridad**: Alta

---

## 2. Gestion de usuarios (Admin)

### USR-01 - Listado de usuarios
- **Precondicion**: Logueado como admin
- **Pasos**:
  1. Navegar a `/admin/users/list`
  2. Verificar que la tabla muestra columnas: Correo, Nombre, Rol, Estado, Fecha de creacion, Acciones
- **Resultado esperado**: Se muestran todos los usuarios con paginacion. Badges de estado "Activo" (verde) e "Inactivo" (rojo) visibles.
- **Prioridad**: Alta

### USR-02 - Crear usuario operador
- **Precondicion**: Logueado como admin
- **Pasos**:
  1. En `/admin/users/list`, click en "Agregar usuario operador"
  2. Verificar que navega a `/admin/users/operator-users/new`
  3. Completar formulario: email, password, nombre completo, rol
  4. Click en guardar
- **Resultado esperado**: Usuario creado exitosamente. Toast de exito. El nuevo usuario aparece en la lista.
- **Prioridad**: Alta

### USR-03 - Desactivar usuario
- **Precondicion**: Logueado como admin. Existe un usuario activo distinto al admin actual.
- **Pasos**:
  1. En `/admin/users/list`, localizar un usuario activo
  2. Click en boton de desactivar (icono ban)
  3. Confirmar en el dialogo de confirmacion
- **Resultado esperado**: Toast "Usuario desactivado correctamente". El badge cambia a "Inactivo" (rojo). El boton de desactivar se reemplaza por el de activar.
- **Prioridad**: Alta

### USR-04 - Activar usuario
- **Precondicion**: Logueado como admin. Existe un usuario inactivo.
- **Pasos**:
  1. En `/admin/users/list`, localizar un usuario inactivo
  2. Click en boton de activar (icono check-circle)
  3. Confirmar en el dialogo de confirmacion
- **Resultado esperado**: Toast "Usuario activado correctamente". El badge cambia a "Activo" (verde). El boton de activar se reemplaza por el de desactivar.
- **Prioridad**: Alta

### USR-05 - Prevencion de auto-desactivacion
- **Precondicion**: Logueado como admin
- **Pasos**:
  1. En `/admin/users/list`, intentar desactivar al propio usuario admin (si el boton esta visible)
- **Resultado esperado**: Se muestra error "No puedes desactivarte a ti mismo". El usuario permanece activo.
- **Prioridad**: Alta
- **Estado**: NO CUMPLE

### USR-06 - Usuario desactivado no puede loguearse
- **Precondicion**: Un usuario fue desactivado (USR-03 completado)
- **Pasos**:
  1. Cerrar sesion del admin
  2. Intentar loguearse con las credenciales del usuario desactivado
  3. Si el login es exitoso, intentar navegar a `/home`
- **Resultado esperado**: El AuthGuard detecta is_active = false, cierra la sesion y redirige a `/login`.
- **Prioridad**: Alta

### USR-07 - Editar usuario
- **Precondicion**: Logueado como admin
- **Pasos**:
  1. En `/admin/users/list`, click en boton editar (icono lapiz) de un usuario
  2. Modificar el nombre
  3. Guardar cambios
- **Resultado esperado**: Toast de exito. Los cambios se reflejan en la lista.
- **Prioridad**: Media

### USR-08 - Operador no accede a lista de usuarios
- **Precondicion**: Logueado como operador
- **Pasos**:
  1. Navegar directamente a `/admin/users/list`
- **Resultado esperado**: Redirige a `/home`. La ruta no es accesible para operadores.
- **Prioridad**: Alta

---

## 3. Gestion de pacientes

### PAT-01 - Listado de pacientes con busqueda
- **Precondicion**: Logueado. Existen pacientes registrados.
- **Pasos**:
  1. Navegar a `/patients`
  2. Verificar que se muestran pacientes con paginacion
  3. Escribir un nombre o documento en el campo de busqueda
- **Resultado esperado**: La lista se filtra segun el criterio de busqueda. La busqueda tiene debounce de 300ms.
- **Prioridad**: Alta

### PAT-02 - Ver detalle de paciente
- **Precondicion**: Logueado. Existen pacientes.
- **Pasos**:
  1. En `/patients`, click en un paciente
  2. Verificar informacion: nombre, apellido, tipo de documento, numero de documento, estado de consentimiento
- **Resultado esperado**: Se muestra toda la informacion del paciente correctamente.
- **Prioridad**: Alta

### PAT-03 - Editar paciente (solo admin)
- **Precondicion**: Logueado como admin
- **Pasos**:
  1. Navegar al detalle de un paciente
  2. Click en "Editar"
  3. Modificar algun campo (ej: nombre)
  4. Guardar
- **Resultado esperado**: Toast de exito. Los cambios se reflejan en el detalle.
- **Prioridad**: Media

### PAT-04 - Desactivar paciente (solo admin)
- **Precondicion**: Logueado como admin. Paciente activo.
- **Pasos**:
  1. Navegar al detalle de un paciente
  2. Click en desactivar/eliminar
  3. Confirmar
- **Resultado esperado**: Paciente desactivado. Ya no aparece en listados normales.
- **Prioridad**: Media

### PAT-05 - Eliminacion permanente de paciente (solo admin)
- **Precondicion**: Logueado como admin
- **Pasos**:
  1. Navegar al detalle de un paciente
  2. Click en eliminar permanentemente
  3. Confirmar en el dialogo de advertencia
- **Resultado esperado**: Paciente, transcripciones y observaciones asociadas eliminados permanentemente. Toast de exito.
- **Prioridad**: Media

### PAT-06 - Auditoria de paciente (solo admin)
- **Precondicion**: Logueado como admin. Paciente con historial de modificaciones.
- **Pasos**:
  1. Navegar al detalle de un paciente
  2. Click en "Auditoria"
  3. Verificar log de acciones (INSERT, UPDATE, DELETE, SELECT)
- **Resultado esperado**: Se muestra historial de acciones con fecha, usuario, tipo de accion y datos modificados.
- **Prioridad**: Media

### PAT-07 - Crear paciente con validacion de documento
- **Precondicion**: Logueado
- **Pasos**:
  1. Navegar a `/transcription/new`
  2. Seleccionar "Nuevo paciente"
  3. Ingresar datos con numero de documento invalido (formato incorrecto)
  4. Intentar guardar
- **Resultado esperado**: Se muestra error de validacion en el campo de documento. No se crea el paciente.
- **Prioridad**: Alta

---

## 4. Transcripciones

### TRX-01 - Crear transcripcion con paciente existente
- **Precondicion**: Logueado. Existe al menos un paciente.
- **Pasos**:
  1. Navegar a `/transcription/new`
  2. Buscar y seleccionar un paciente existente
  3. Completar motivo de consulta y contenido de transcripcion
  4. Seleccionar una categoria/tag
  5. Guardar
- **Resultado esperado**: Transcripcion creada. Redirige al detalle. Toast de exito.
- **Prioridad**: Alta

### TRX-02 - Crear transcripcion con speech-to-text
- **Precondicion**: Logueado. Navegador con soporte de microfono.
- **Pasos**:
  1. Navegar a `/transcription/new`
  2. Seleccionar paciente
  3. Click en boton de grabacion
  4. Hablar por unos segundos
  5. Detener grabacion
  6. Verificar que el texto transcrito aparece en el campo de contenido
- **Resultado esperado**: El audio se transcribe a texto y se muestra en el campo de contenido.
- **Prioridad**: Alta

### TRX-03 - Listado de transcripciones con filtros
- **Precondicion**: Logueado. Existen transcripciones.
- **Pasos**:
  1. Navegar a `/transcriptions` o `/home`
  2. Aplicar filtro por rango de fechas
  3. Aplicar filtro por categoria/tag
  4. Aplicar filtro por operador (si admin)
  5. Aplicar filtro por paciente
- **Resultado esperado**: La lista se filtra correctamente segun cada criterio aplicado. Los filtros son inclusivos en rango de fechas (inicio y fin del dia).
- **Prioridad**: Alta

### TRX-04 - Ver detalle de transcripcion
- **Precondicion**: Logueado. Existe una transcripcion accesible.
- **Pasos**:
  1. Click en una transcripcion del listado
  2. Verificar: contenido, motivo de consulta, paciente, profesional, fecha, categoria
- **Resultado esperado**: Toda la informacion se muestra correctamente.
- **Prioridad**: Alta

### TRX-05 - Exportar transcripcion a PDF
- **Precondicion**: Logueado. En detalle de transcripcion.
- **Pasos**:
  1. Click en boton "Exportar PDF"
- **Resultado esperado**: Se descarga un archivo PDF con la informacion de la transcripcion formateada.
- **Prioridad**: Media

### TRX-06 - Enviar transcripcion por email
- **Precondicion**: Logueado. En detalle de transcripcion.
- **Pasos**:
  1. Click en boton de enviar por email
- **Resultado esperado**: Se envia la transcripcion al email del usuario actual. Toast de exito.
- **Prioridad**: Media

### TRX-07 - Eliminar transcripcion (soft delete)
- **Precondicion**: Logueado. Permisos de eliminacion.
- **Pasos**:
  1. En detalle de transcripcion, click en eliminar
  2. Confirmar en dialogo
- **Resultado esperado**: Transcripcion marcada como no valida (is_valid = false). Ya no aparece en listados. Toast de exito.
- **Prioridad**: Alta

### TRX-08 - Guard de detalle de transcripcion
- **Precondicion**: Logueado como operador
- **Pasos**:
  1. Intentar acceder al detalle de una transcripcion creada por OTRO operador via URL directa
- **Resultado esperado**: Si el operador no tiene permiso `transcription:read:all`, se redirige a `/home`.
- **Prioridad**: Alta

---

## 5. Observaciones

### OBS-01 - Ver observaciones de una transcripcion
- **Precondicion**: Logueado. Transcripcion con observaciones existentes.
- **Pasos**:
  1. Navegar al detalle de una transcripcion
  2. Click en "Observaciones" o navegar a `/transcriptions/:id/observations`
- **Resultado esperado**: Se muestran las observaciones con contenido, fecha de creacion y autor. Paginacion funcional.
- **Prioridad**: Alta

### OBS-02 - Crear observacion
- **Precondicion**: Logueado con permisos de creacion de observaciones. En detalle de transcripcion.
- **Pasos**:
  1. Escribir contenido en el campo de observacion
  2. Click en guardar/agregar
- **Resultado esperado**: Observacion creada. Aparece en la lista de observaciones. Toast de exito.
- **Prioridad**: Alta

### OBS-03 - Eliminar observacion logicamente (admin)
- **Precondicion**: Logueado como admin. Existe una transcripcion con observaciones.
- **Pasos**:
  1. Navegar a `/transcriptions/:id/observations`
  2. Verificar que aparece un boton con icono de papelera (rojo) en cada tarjeta de observacion
  3. Click en el boton de eliminar de una observacion
  4. Confirmar en el dialogo de confirmacion
- **Resultado esperado**: Toast "Observacion eliminada correctamente". La observacion desaparece de la lista. La observacion permanece en la base de datos con is_deleted = true.
- **Prioridad**: Alta

### OBS-04 - Boton eliminar observacion NO visible para operador
- **Precondicion**: Logueado como operador. Existe una transcripcion propia con observaciones.
- **Pasos**:
  1. Navegar a `/transcriptions/:id/observations`
  2. Inspeccionar las tarjetas de observacion
- **Resultado esperado**: No se muestra ningun boton de eliminar (papelera) en las observaciones. Solo se ve contenido, fecha y autor.
- **Prioridad**: Alta

### OBS-05 - Paginacion de observaciones
- **Precondicion**: Logueado. Transcripcion con mas de 6 observaciones.
- **Pasos**:
  1. Navegar a observaciones de la transcripcion
  2. Verificar que se muestran 6 por pagina
  3. Click en "Siguiente"
  4. Click en "Anterior"
- **Resultado esperado**: Paginacion funcional. Label "Pagina X de Y" actualizado. Botones deshabilitados en primera/ultima pagina.
- **Prioridad**: Media

---

## 6. Tags/Categorias (Admin)

### TAG-01 - Listado de tags
- **Precondicion**: Logueado como admin
- **Pasos**:
  1. Navegar a `/admin/tags`
  2. Verificar que se muestran tags con paginacion
  3. Buscar por nombre
- **Resultado esperado**: Tags listados correctamente. Busqueda filtra resultados.
- **Prioridad**: Media

### TAG-02 - Crear tag global
- **Precondicion**: Logueado como admin
- **Pasos**:
  1. En `/admin/tags`, click en boton de agregar
  2. Navega a `/admin/tags/new`
  3. Ingresar nombre del tag
  4. Guardar
- **Resultado esperado**: Tag creado. Aparece en la lista. Disponible en formulario de transcripcion.
- **Prioridad**: Media

### TAG-03 - Editar tag
- **Precondicion**: Logueado como admin. Tag existente.
- **Pasos**:
  1. En `/admin/tags`, click en editar un tag
  2. Modificar nombre
  3. Guardar
- **Resultado esperado**: Nombre actualizado en la lista y en transcripciones existentes.
- **Prioridad**: Baja

### TAG-04 - Desactivar tag
- **Precondicion**: Logueado como admin. Tag activo.
- **Pasos**:
  1. En `/admin/tags`, click en desactivar un tag
  2. Confirmar
- **Resultado esperado**: Tag marcado como invalido (is_valid = false). Ya no disponible para nuevas transcripciones.
- **Prioridad**: Baja

---

## 7. Reportes/Dashboard (Admin)

### RPT-01 - Grafico de transcripciones por dia
- **Precondicion**: Logueado como admin. Existen transcripciones en distintos dias.
- **Pasos**:
  1. Navegar a `/dashboard/charts/transcriptions-per-day`
  2. Verificar que se muestra grafico de linea con datos
  3. Seleccionar rango de fechas con los calendarios
  4. Verificar que el grafico se actualiza
- **Resultado esperado**: Grafico muestra datos correctos. Filtro de fechas funciona. Los calendarios no se superponen con el grafico (appendTo="body").
- **Prioridad**: Media

### RPT-02 - Grafico de transcripciones por categoria
- **Precondicion**: Logueado como admin. Existen transcripciones con distintas categorias.
- **Pasos**:
  1. Navegar a `/dashboard/charts/transcriptions-by-tag`
  2. Verificar que se muestra grafico de barras horizontales con datos
  3. Seleccionar rango de fechas
  4. Verificar que el grafico se actualiza
- **Resultado esperado**: Grafico muestra datos correctos con espaciado adecuado entre barras. Filtro de fechas funciona.
- **Prioridad**: Media

### RPT-03 - Operador no accede a dashboard
- **Precondicion**: Logueado como operador
- **Pasos**:
  1. Navegar directamente a `/dashboard/charts/transcriptions-per-day`
- **Resultado esperado**: Redirige a `/home`.
- **Prioridad**: Alta

---

## 8. Control de acceso por rol

### ROL-01 - Sidebar condicional por rol
- **Precondicion**: Cuentas de admin y operador disponibles
- **Pasos**:
  1. Loguearse como admin. Verificar items del sidebar: Transcripciones, Pacientes, Administracion (usuarios, categorias), Reportes.
  2. Cerrar sesion
  3. Loguearse como operador. Verificar items del sidebar: solo Transcripciones y Pacientes.
- **Resultado esperado**: Admin ve todos los items. Operador ve solo los items permitidos. No se muestran secciones de Administracion ni Reportes para operador.
- **Prioridad**: Alta

### ROL-02 - Operador no accede a rutas de admin
- **Precondicion**: Logueado como operador
- **Pasos**:
  1. Intentar navegar directamente a:
     - `/admin/users/list`
     - `/admin/users/operator-users/new`
     - `/admin/tags`
     - `/admin/tags/new`
     - `/dashboard/charts/transcriptions-per-day`
     - `/patients/:id/edit`
     - `/patients/:id/audit`
- **Resultado esperado**: En todos los casos, redirige a `/home`.
- **Prioridad**: Alta

### ROL-03 - Guard de perfil propio
- **Precondicion**: Logueado
- **Pasos**:
  1. Navegar a `/profile/:miId` (propio)
  2. Navegar a `/profile/:otroId` (de otro usuario)
- **Resultado esperado**: Acceso permitido al propio perfil. Acceso denegado al perfil ajeno.
- **Prioridad**: Media

---

## 9. Breadcrumbs y navegacion

### NAV-01 - Breadcrumbs en pantallas principales
- **Precondicion**: Logueado
- **Pasos**:
  1. Navegar a las siguientes pantallas y verificar breadcrumbs:
     - `/admin/users/list` -> Inicio > Administracion > Lista de usuarios
     - `/admin/users/operator-users/new` -> Inicio > Administracion > Alta de usuario operador
     - `/transcriptions/:id/observations` -> Inicio > Transcripciones > Observaciones
     - `/dashboard/charts/transcriptions-per-day` -> Inicio > Reportes > Estadisticas diarias
     - `/dashboard/charts/transcriptions-by-tag` -> Inicio > Reportes > Reporte por categoria
- **Resultado esperado**: Breadcrumbs correctos en cada pantalla. Links de "Inicio" navegan a `/home`.
- **Prioridad**: Baja

---

## Resumen de prioridades

| Prioridad | Cantidad | IDs |
|-----------|----------|-----|
| Alta | 20 | AUTH-01 a AUTH-05, USR-01 a USR-06, USR-08, PAT-01, PAT-02, PAT-07, TRX-01 a TRX-04, TRX-07, TRX-08, OBS-01 a OBS-04, ROL-01, ROL-02, RPT-03 |
| Media | 13 | USR-07, PAT-03 a PAT-06, TRX-05, TRX-06, OBS-05, TAG-01, TAG-02, RPT-01, RPT-02, ROL-03 |
| Baja | 3 | TAG-03, TAG-04, NAV-01 |
