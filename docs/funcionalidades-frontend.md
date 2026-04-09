# ⚙️ Funcionalidades del Frontend

Este documento detalla las principales funcionalidades implementadas en el cliente visual de la aplicación. La interfaz está construida con **React + TypeScript (Vite)** y hace uso de un servidor provisional `json-server` para simular la API real durante la fase de maqueta.

---

## 🗂️ Panel de Tareas — Tablero Kanban

El módulo central de la aplicación. Presenta todas las tareas distribuidas visualmente en tres columnas de estado que reflejan el ciclo de vida de cada mandato:

| Columna | Estado equivalente | Descripción |
|---|---|---|
| **Pendientes de asignar** | `todo` | Tareas creadas pero sin responsable ni planificación |
| **Tareas asignadas** | `in_progress` | Tareas activas con responsable y fecha de vencimiento |
| **Tareas completadas** | `done` | Mandatos cerrados, mostrando fecha de archivo |

Cada tarjeta muestra: prioridad codificada por color, proyecto de origen, etiquetas, avatares de responsables y días restantes hasta el vencimiento.

---

## 🖱️ Drag & Drop — Mover Tareas entre Columnas

> **Funcionalidad más destacada del tablero.** Implementada con la API nativa de HTML5 Drag and Drop, sin librerías externas.

El usuario puede arrastrar cualquier tarjeta de una columna a otra directamente, lo cual desencadena una actualización automática tanto en el estado local de React como en el backend (vía `PATCH /tasks/:id`).

### Comportamiento específico por transición:

- **Pendiente → Asignadas** (tarea sin responsable): se abre automáticamente el **Modal de Asignación** para seleccionar usuario, tiempo estimado y fecha de vencimiento antes de confirmar el movimiento.
- **Pendiente → Asignadas** (tarea ya tiene responsable): se mueve directamente, actualizando el estado a `in_progress`.
- **Cualquier columna → Completadas**: se actualiza el estado a `done` de manera inmediata.
- **Reversibilidad**: si la petición al servidor falla, el estado local se **revierte automáticamente** a su posición original.

### Feedback visual:
- La tarjeta se vuelve **semitransparente** y se escala ligeramente mientras es arrastrada (clase `.dragging`).
- La columna de destino se **ilumina** con un borde lila punteado al pasar la tarjeta por encima (clase `.drag-over`).

### Archivos implicados:
- [`TaskCard.tsx`](../Frontend/src/components/TaskCard.tsx) — eventos `onDragStart` / `onDragEnd`
- [`KanbanBoard.tsx`](../Frontend/src/components/KanbanBoard.tsx) — zonas de soltado `onDragOver` / `onDrop`
- [`TaskManager.tsx`](../Frontend/src/components/TaskManager.tsx) — función `handleTaskMove` con lógica de negocio

---

## ➕ Formulario de Nueva Tarea

Permite crear una nueva tarea desde un panel lateral dedicado. Recoge:

- Título y descripción con barra de herramientas de edición básica
- Tipo de tarea (Tarea, Bug, Feature, Subtarea)
- Prioridad (Baja, Media, Alta, Urgente)
- Proyecto y etiquetas (tags) asociados
- Fecha límite y tiempo estimado (slider en horas)
- Responsable (asignado directamente desde el formulario)

Al confirmar, se realiza un `POST /tasks` y la nueva tarea aparece instantáneamente en la columna de pendientes sin recargar la página.

---

## 🔔 Modal de Asignación

Accesible tanto desde el botón **"ASIGNAR AHORA"** en las tarjetas pendientes como automáticamente al arrastrar una tarea sin responsable a la columna "Asignadas".

Muestra:
- Ficha resumida de la tarea (título, proyecto, prioridad)
- Selector de responsable con indicador de carga de trabajo por color (disponible / ocupado / crítico)
- Campo de fecha de vencimiento
- Slider de tiempo estimado (en horas)

Al confirmar, el cambio se guarda en el servidor y la tarjeta se mueve visualmente a la columna "Asignadas".

---

## 🏠 Escritorio (Dashboard)

Vista de resumen ejecutivo con los siguientes bloques:

- **KPIs** (4 tarjetas): total de mandatos, en progreso, pendientes, completados
- **Proyectos activos**: barra de progreso por proyecto con ratio completado/total
- **Vencimientos próximos**: listado de las tareas con `due_date` más inminente, con código de color urgente
- **Carga del equipo**: mini-tarjeta por miembro con indicador de workload y contador de tareas

---

## 📊 Analíticas

Panel de métricas operacionales compuesto por gráficas construidas puramente con CSS (sin librerías de terceros):

- **Distribución por estado**: barras proporcionales para pendiente / en progreso / completado
- **Distribución por prioridad**: desglose urgente / alta / media / baja
- **Tasa de éxito**: porcentaje de tareas completadas sobre el total con indicador visual
- **Tareas por proyecto**: ranking de proyectos por volumen de tareas
- **Rendimiento del equipo**: gráfica de tareas asignadas vs. completadas por miembro

---

## 🧩 Pipeline CRM

Vista Kanban de proyectos/clientes distribuidos en 4 etapas del pipeline comercial:

**Prospecto → Negociando → Activo → Cerrado**

Cada tarjeta de cliente muestra: clave del proyecto, nivel de prioridad, número de tareas totales vs. completadas, barra de progreso y gestor asignado.

> [!NOTE]
> El mapeo de proyectos a etapas es estático en esta fase de maqueta. Cuando se integre el backend real, únicamente habrá que añadir un campo `crm_stage` al modelo de proyecto.

---

## 👥 Equipo

Galería de tarjetas de todos los miembros del equipo. Cada tarjeta incluye:

- Avatar con color identificativo y estado de carga de trabajo (disponible / ocupado / crítico)
- Nombre y rol (Ejecutivo / Gerente / Miembro)
- Estadísticas de tareas: en curso, pendientes y completadas
- Barra de rendimiento individual
- Vista previa de las tareas asignadas más recientes

---

## ⚙️ Configuración

Panel de administración dividido en secciones:

- **Organización**: nombre, nivel y estado del sistema
- **Usuarios**: listado de todos los miembros con su rol, workload y botón de edición
- **Preferencias del sistema**: toggles visuales para notificaciones, asignación automática, modo auditoría y actualizaciones en tiempo real

> [!NOTE]
> Los toggles y botones de edición son visuales en esta fase. Su funcionalidad completa se implementará al conectar con el backend real.

---

## 🔌 Capa de Datos (Provisional)

Durante la fase de maqueta, todos los módulos consumen datos de un servidor `json-server` que lee el archivo `Frontend/db.json`.

La abstracción de la API reside en [`Frontend/src/api.ts`](../Frontend/src/api.ts), que expone tres funciones:

```typescript
fetchAllData()           // GET usuarios, proyectos, tags, tareas y organización
createTask(task)         // POST /tasks
updateTask(id, payload)  // PATCH /tasks/:id
```

El contexto global [`DataContext.tsx`](../Frontend/src/components/DataContext.tsx) distribuye estos datos a todos los componentes evitando prop drilling innecesario.

---

## 📐 Arquitectura de Componentes

```text
TaskManager.tsx          ← Raíz de la app: estado global, routing entre páginas
├── Sidebar.tsx          ← Navegación lateral
├── TopNav.tsx           ← Barra superior
├── KanbanBoard.tsx      ← Tablero de tareas con DnD
│   └── TaskCard.tsx     ← Tarjeta individual arrastrable
├── NewTaskForm.tsx      ← Formulario de creación
├── AssignModal.tsx      ← Modal de asignación
├── DashboardPage.tsx    ← Escritorio / KPIs
├── CrmPage.tsx          ← Pipeline CRM
├── AnalyticsPage.tsx    ← Analíticas
├── TeamPage.tsx         ← Gestión de equipo
├── ConfigPage.tsx       ← Configuración
├── DataContext.tsx      ← Proveedor de datos global
├── Atoms.tsx            ← Componentes UI reutilizables (Avatar, Badge)
├── types.ts             ← Tipos TypeScript compartidos
└── constants.ts         ← Constantes de configuración visual
```

---

🔙 [Volver al README principal](../README.md)
