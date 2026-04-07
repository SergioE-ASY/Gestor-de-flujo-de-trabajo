# Documentación de Arquitectura de Base de Datos (HGP v2.0)

Esta base de datos relacional ha sido diseñada para **HGP**, una herramienta de gestión de proyectos ágil. Utiliza **PostgreSQL** y está optimizada para soportar un backend en Node.js (Express), actualizaciones en tiempo real (WebSockets) y un frontend analítico.

---

## 1. Patrones y Decisiones de Diseño

*   **Identificadores Seguros (UUIDv4):** Se utilizan UUIDs en lugar de enteros incrementales para las claves primarias (`id`). Esto previene ataques de enumeración (adivinar IDs en la API) y facilita futuras integraciones o migraciones de datos.
*   **Borrados Lógicos (Soft Deletes):** Las entidades principales (`organizations`, `users`, `projects`, `tasks`) no se eliminan físicamente mediante `DELETE`. Se utiliza un campo `deleted_at`. Esto preserva el historial, las métricas y la integridad referencial.
*   **Identificadores Legibles (Estilo Jira):** Aunque la base de datos usa UUIDs, el sistema genera un identificador humano para cada tarea combinando el prefijo del proyecto y un número secuencial (Ej: `DEV-42`).
*   **Delegación en Base de Datos:** Las operaciones automáticas y recurrentes (actualizar la fecha de modificación, generar números secuenciales de tareas, sellar la fecha de finalización) se manejan nativamente mediante *Triggers* de PostgreSQL.

---

## 2. Mapa de Relaciones (Cardinalidad)

El esquema sigue un modelo relacional estricto con las siguientes cardinalidades clave:

### Relaciones de Pertenencia y Jerarquía
*   **Organización a Proyectos (1 : N):** Una organización posee múltiples proyectos.
*   **Proyecto a Tareas (1 : N):** Un proyecto contiene muchas tareas. Si el proyecto se borra lógicamente, las tareas asociadas también deben considerarse inactivas a nivel de aplicación.
*   **Proyecto a Sprints (1 : N):** Un proyecto puede tener múltiples iteraciones de tiempo (sprints).
*   **Sprint a Tareas (1 : N):** Un sprint agrupa varias tareas. Una tarea solo puede pertenecer a un sprint a la vez (o a ninguno, si está en el *backlog* general).
*   **Tarea a Subtareas (1 : N - Recursiva):** Una tarea puede ser "padre" de múltiples subtareas utilizando el campo `parent_task_id`.

### Relaciones de Colaboración
*   **Organización a Usuarios (N : M):** Múltiples usuarios pueden pertenecer a múltiples organizaciones. Esto se resuelve mediante la tabla pivot `organization_users`, que define si el usuario y su rol general en dicho entorno.
*   **Proyectos a Usuarios (N : M):** Muchos usuarios trabajan en muchos proyectos. Esto se resuelve mediante la tabla pivot `project_members`, que además define el rol específico del usuario dentro de ese proyecto.
*   **Usuarios a Tareas (1 : N):** Un usuario puede tener asignadas múltiples tareas (mediante `assignee_id` en la tabla `tasks`).
*   **Tareas a Etiquetas (N : M):** Una tarea puede tener múltiples etiquetas y una etiqueta puede aplicarse a muchas tareas. Resuelto vía la tabla pivot `task_tags`.

### Relaciones de Interacción y Registro
*   **Tarea a Comentarios / Adjuntos / Tiempos (1 : N):** Una tarea puede acumular múltiples comentarios, archivos adjuntos y registros de tiempo. Todos referencian al usuario que los creó.

---

## 3. Diccionario de Datos: Entidades Principales

### Nivel: Sistema y Organización

#### `organizations`
Representa el espacio de trabajo principal de la empresa o cliente. Aísla los datos en un entorno multi-inquilino (*multi-tenant*).
*   **Campos clave:** `crm_company_id` (para futura integración bidireccional con un CRM), `deleted_at`.

#### `organization_users` (Tabla Pivot)
Define a qué organizaciones pertenece un usuario y cuál es su rol general en esa organización específica.
*   **Campos clave:** `role` (Define permisos de organización: admin, manager, member, viewer).

#### `users`
Almacena las credenciales y el perfil de los individuos que utilizan la plataforma.
*   **Campos clave:** `password_hash` (debe guardar hashes de bcrypt/argon2, nunca texto plano).

### Nivel: Estructura del Trabajo

#### `projects`
Contenedores principales del trabajo. Agrupan sprints, tareas y miembros del equipo.
*   **Campos clave:**
    *   `key`: Prefijo de 2 a 10 caracteres (ej. "HGP"). Es vital porque forma la primera mitad del identificador visual de la tarea. Debe ser único dentro de la misma organización.
    *   `owner_id`: El responsable legal/administrativo del proyecto.

#### `project_members` (Tabla Pivot)
Define quién tiene acceso a qué proyecto y con qué nivel de autoridad.
*   **Campos clave:** `role` (Permisos locales para este proyecto específico: owner, manager, member, viewer).

#### `sprints`
Representan iteraciones o ciclos de trabajo de duración fija (ej. 2 semanas), fundamentales para metodologías ágiles como Scrum.
*   **Campos clave:** `start_date`, `end_date`, `status` (planned, active, closed).

### Nivel: Ejecución (El Tablero Kanban)

#### `tasks` (El núcleo del sistema)
Representa cualquier unidad de trabajo (historia de usuario, bug, tarea técnica).
*   **Campos clave:**
    *   `type`: Define su naturaleza (`epic`, `story`, `task`, `bug`).
    *   `project_sequence`: Entero autogenerado. Combinado con el `key` del proyecto, genera el ID visual (ej: `HGP-15`).
    *   `parent_task_id`: Permite desglosar *Epics* en *Stories*, o *Stories* en *Tasks*.
    *   `status`: Determina la columna en la que reside dentro del tablero Kanban (`backlog`, `todo`, `in_progress`, etc.).
    *   `position`: Entero para guardar el orden exacto (drag & drop) dentro de una columna específica del Kanban.
    *   `completed_at`: Se sella automáticamente cuando el `status` pasa a `done`.

### Nivel: Metadatos y Colaboración

#### `tags` & `task_tags`
Sistema de etiquetado transversal por proyecto. Permite categorizar tareas más allá de su tipo (Ej: `frontend`, `urgente`, `bloqueado`).

#### `time_logs`
Vital para el seguimiento de la productividad y facturación.
*   **Propósito:** Registra cuánto tiempo (en minutos) ha invertido un usuario en una tarea específica en un día concreto.
*   **Uso analítico:** Se compara contra el `estimated_min` de la tarea para generar el *Burndown Chart*.

#### `comments` & `attachments`
Permiten la comunicación y el intercambio de archivos directamente en el contexto de la tarea. Cada registro está vinculado tanto a la tarea como al usuario autor.

#### `notifications`
Sistema asíncrono para mantener informados a los usuarios.
*   **Propósito:** Guarda un registro de eventos relevantes (menciones, asignaciones) dirigido a un `user_id`.
*   **Integración:** Pensado para alimentar una campana de notificaciones en el frontend y trabajar en conjunto con el servidor WebSocket.

---

## 4. Tipos Enumerados (ENUMs)

Para mantener la integridad de los datos y evitar errores tipográficos, la base de datos restringe los valores de ciertas columnas a listas predefinidas:

| Nombre del ENUM | Valores Permitidos | Contexto de Uso |
| :--- | :--- | :--- |
| **`user_role`** | `admin`, `manager`, `member`, `viewer` | Privilegios globales en la plataforma. |
| **`member_role`** | `owner`, `manager`, `member`, `viewer` | Privilegios locales dentro de un proyecto. |
| **`task_type`** | `epic`, `story`, `task`, `bug` | Clasificación ágil de la unidad de trabajo. |
| **`task_status`**| `backlog`, `todo`, `in_progress`, `in_review`, `done`, `cancelled` | Flujo de trabajo estándar (Kanban). |
| **`sprint_status`**| `planned`, `active`, `closed` | Ciclo de vida de una iteración ágil. |

---

## 5. Automatizaciones Nativas (Triggers)

El esquema abstrae la lógica repetitiva del backend de Node.js mediante los siguientes Triggers:

1.  **Mantenimiento de `updated_at`:** Cada vez que se ejecuta un `UPDATE` en las tablas principales, el campo `updated_at` cambia a la hora actual del servidor.
2.  **Sello de finalización (`completed_at`):** Al mover una tarea al estado `done`, la base de datos marca la fecha y hora exacta. Si la tarea se reabre, este campo vuelve a `NULL`.
3.  **Generación de Secuencia (`project_sequence`):** Antes de un `INSERT` en la tabla `tasks`, el trigger busca el número más alto existente en ese proyecto específico y le suma +1 de forma atómica y segura contra la concurrencia.