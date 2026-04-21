# Arquitectura y Estructura del Proyecto

El proyecto está organizado en formato **Monorepo** con un único servicio Django activo en producción.

## Árbol de Directorios

```text
Gestor-de-flujo-de-trabajo/
├── taskflow/
│   └── taskmanager/          # Proyecto Django principal
│       ├── core/             # Configuración global (settings, urls, wsgi)
│       ├── accounts/         # Usuarios, login, registro, temas, tarifas
│       ├── organizations/    # Organizaciones y membresías
│       ├── projects/         # Proyectos, sprints, permisos de proyecto
│       ├── tasks/            # Tareas, comentarios, adjuntos, time logs
│       ├── notifications/    # Notificaciones en tiempo real
│       ├── shared/           # Decoradores y utilidades reutilizables
│       ├── api/              # REST API (DRF + JWT)
│       ├── static/           # CSS, JS e imágenes estáticas
│       ├── templates/        # Plantillas HTML Django
│       ├── media/            # Uploads de usuarios (avatares, adjuntos)
│       ├── manage.py
│       └── requirements.txt
├── docs/                     # Documentación del proyecto
│   └── BaseDeDatos/          # Diagramas y scripts de la BD
├── Frontend/                 # Prototipo React (referencia de diseño, no activo en prod)
├── docker-compose.yml
└── README.md
```

## Arquitectura de la Aplicación

Django sirve tanto la interfaz web (plantillas HTML) como la API REST desde el mismo proceso:

```
Navegador / App móvil
        │
        ├─ GET/POST HTML ──▶ Django Views (plantillas)
        │                         │
        └─ REST JSON ────────▶ DRF API (/api/v1/)
                                  │
                         Django ORM ──▶ PostgreSQL
```

### Capas principales

| Capa | Tecnología | Responsabilidad |
|---|---|---|
| Enrutamiento | `core/urls.py` | Distribuye peticiones entre apps y API |
| Vistas web | `*/views.py` + decoradores | Lógica de negocio + renderizado de plantillas |
| API REST | `api/views.py` + DRF serializers | Endpoints JSON con autenticación JWT |
| Permisos | `*/permissions.py` | Funciones booleanas centralizadas por app |
| Decoradores | `shared/decorators.py` | `@require_project_member`, `@project_permission`, `@require_org_member`, `@org_permission` |
| Modelos | `*/models.py` | Entidades de negocio mapeadas a PostgreSQL |

## Sistema de Permisos

Cada app tiene su propio `permissions.py` con funciones puras que reciben una membresía y devuelven `bool`. Los decoradores de `shared/decorators.py` los aplican de forma declarativa sobre las vistas:

```python
@login_required
@project_permission(can_edit_task, pk_kwarg='project_pk')
def task_edit(request, project_pk, pk, project=None, membership=None):
    ...
```

Para solicitudes AJAX los decoradores devuelven `JsonResponse({'error': ...}, status=403)` en lugar de redirigir.

## Roles

### Organizaciones
`owner > admin > member`

### Proyectos
`owner > manager > developer > viewer`

---

🔙 [Volver al README principal](../README.md)
