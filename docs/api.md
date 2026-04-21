# REST API

La API REST está disponible en `/api/v1/` y usa autenticación **JWT Bearer token**.

---

## Autenticación

### Obtener tokens

```http
POST /api/v1/auth/token/
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

Respuesta:

```json
{
  "access": "<token-de-acceso>",
  "refresh": "<token-de-refresco>"
}
```

El `access` token expira en **60 minutos**. El `refresh` token dura **7 días**.

### Usar el token

Incluir en todas las peticiones autenticadas:

```http
Authorization: Bearer <access-token>
```

### Renovar el access token

```http
POST /api/v1/auth/token/refresh/
Content-Type: application/json

{ "refresh": "<token-de-refresco>" }
```

El refresh token se rota automáticamente — guarda el nuevo `refresh` de la respuesta.

### Verificar un token

```http
POST /api/v1/auth/token/verify/
Content-Type: application/json

{ "token": "<token>" }
```

### Revocar token (logout)

```http
POST /api/v1/auth/token/revoke/
Authorization: Bearer <access-token>
Content-Type: application/json

{ "refresh": "<token-de-refresco>" }
```

Devuelve `204 No Content`. El refresh token queda en la blacklist y ya no puede renovarse.

---

## Rate Limiting

| Endpoint | Límite |
|---|---|
| `POST /api/v1/auth/token/` | 10 req/min por IP |
| `POST /api/v1/auth/token/refresh/` | 20 req/min por IP |

Al superar el límite se devuelve `429 Too Many Requests`:
```json
{ "error": "Demasiadas peticiones. Inténtalo más tarde." }
```

---

## Usuario actual

```http
GET  /api/v1/me/           # Obtener perfil propio
PATCH /api/v1/me/          # Actualizar nombre, temas, etc.
```

---

## Proyectos

```http
GET  /api/v1/projects/          # Listar proyectos del usuario autenticado
POST /api/v1/projects/          # Crear proyecto

GET   /api/v1/projects/{id}/    # Detalle del proyecto
PATCH /api/v1/projects/{id}/    # Editar proyecto (requiere rol owner/manager)
```

### Crear proyecto (body)

```json
{
  "name": "Mi Proyecto",
  "key": "MIPRO",
  "description": "...",
  "organization": "<uuid-org>",
  "status": "planning",
  "priority": "medium"
}
```

---

## Tareas

```http
GET  /api/v1/projects/{project_id}/tasks/           # Listar tareas
POST /api/v1/projects/{project_id}/tasks/           # Crear tarea (owner/manager/developer)

GET    /api/v1/projects/{project_id}/tasks/{id}/    # Detalle de tarea
PATCH  /api/v1/projects/{project_id}/tasks/{id}/    # Editar tarea (owner/manager/developer)
DELETE /api/v1/projects/{project_id}/tasks/{id}/    # Eliminar tarea (owner/manager/developer)
```

### Filtrar por estado

```http
GET /api/v1/projects/{project_id}/tasks/?status=in_progress
```

Valores válidos: `backlog`, `todo`, `in_progress`, `in_review`, `done`

### Crear tarea (body)

```json
{
  "title": "Implementar login",
  "description": "...",
  "type": "task",
  "status": "backlog",
  "priority": "high",
  "due_date": "2026-05-01",
  "estimated_min": 120,
  "assignee_id": "<uuid-usuario>",
  "sprint_id": "<uuid-sprint>",
  "tag_ids": ["<uuid-tag>"]
}
```

---

## Comentarios

```http
GET  /api/v1/projects/{project_id}/tasks/{task_id}/comments/         # Listar comentarios
POST /api/v1/projects/{project_id}/tasks/{task_id}/comments/         # Añadir comentario

DELETE /api/v1/projects/{project_id}/tasks/{task_id}/comments/{id}/  # Borrar comentario (solo el autor)
```

---

## Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | OK |
| 201 | Creado |
| 204 | Sin contenido (delete / logout) |
| 400 | Petición inválida |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 429 | Rate limit superado |

---

🔙 [Volver al README principal](../README.md)
