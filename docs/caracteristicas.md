# Características Principales

El **Gestor de Flujo de Trabajo (e-asy)** proporciona las herramientas necesarias para la gestión ágil de proyectos de software, desde la organización de equipos hasta el seguimiento granular de tareas.

---

## Organizaciones y Equipos

- Creación y gestión de organizaciones con roles (`owner`, `admin`, `member`)
- Invitación de usuarios por email
- Protección contra eliminación del último propietario de una organización
- Actualización de roles con control de escalada de privilegios

## Proyectos

- Creación de proyectos vinculados a una organización con clave única (ej. `PRJ-1`)
- Roles por proyecto: `owner`, `manager`, `developer`, `viewer`
- Estados: `planning`, `active`, `on_hold`, `completed`, `cancelled`
- Prioridades: `low`, `medium`, `high`, `critical`
- Soft delete (los proyectos no se borran definitivamente)
- Estadísticas de tareas por estado

## Sprints

- Creación y gestión de sprints por proyecto
- Estados: `planned`, `active`, `completed`
- Control de fechas de inicio y fin

## Tareas

- Tipos: tarea, bug, historia, épica, subtarea
- Estados con tablero Kanban: `backlog → todo → in_progress → in_review → done`
- Asignación a miembros del proyecto
- Etiquetas personalizadas por proyecto (con color)
- Adjuntos de archivos
- Registro de tiempo (time logs) con notas y fecha
- Comentarios por tarea (solo el autor puede borrar los suyos)
- Notificaciones automáticas al asignar una tarea o añadir un comentario
- Subtareas jerarquizadas

## Permisos Centralizados

Toda la lógica de autorización vive en `permissions.py` por app, aplicada mediante decoradores declarativos. No existen comprobaciones de rol dispersas en las vistas.

| Acción | Roles permitidos |
|---|---|
| Crear / editar / eliminar tarea | owner, manager, developer |
| Cambiar estado de tarea | owner, manager, developer |
| Registrar tiempo / adjuntar archivos | owner, manager, developer |
| Gestionar sprints | owner, manager |
| Gestionar etiquetas | owner, manager |
| Gestionar miembros del proyecto | owner, manager |
| Eliminar proyecto | owner |

## REST API (JWT)

- Autenticación con tokens JWT (Bearer): obtención, refresco, verificación y revocación
- Tokens de acceso de 60 minutos, refresh de 7 días con rotación automática
- Blacklist de tokens revocados
- Endpoints para proyectos, tareas y comentarios con los mismos controles de permisos que las vistas web

## Seguridad

- Rate limiting por IP en endpoints críticos:
  - Login: 5 req/min
  - Registro: 3 req/min
  - API token obtain: 10 req/min
  - API token refresh: 20 req/min
- Protección CSRF en todas las vistas de formulario
- Decoradores AJAX-aware (devuelven JSON 403 en lugar de redirigir)

## Temas y Apariencia

- Modo base: **oscuro** (por defecto) / **claro**
- Colores de acento gratuitos: `default` (cian)
- Colores de acento **Premium**: `pink`, `red`, `blue`, `green`
- Todos los temas funcionan tanto en modo oscuro como claro
- Cambio de tema sin recarga mediante AJAX + CSS custom properties

## Plan Premium

- Campo `is_premium` por usuario
- Los temas de color exclusivos requieren plan Premium
- Página de tarifas con planes Free (0 €) y Premium (19,99 €)
- Gestión de activación/desactivación Premium desde el admin de Django

---

🔙 [Volver al README principal](../README.md)
