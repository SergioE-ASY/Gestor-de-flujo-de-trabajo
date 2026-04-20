# Tecnologías Utilizadas

Este documento detalla las diferentes tecnologías que componen el **Gestor de Flujo de Trabajo (e-asy)**. Sirve de referencia tanto para desarrolladores como para nuevos integrantes del proyecto.

## Backend

| Tecnología | Versión | Rol |
|---|---|---|
| Python | 3.13 | Lenguaje principal |
| Django | 5.0.4 | Framework web (MVC + plantillas) |
| Django REST Framework | ≥ 3.15 | Capa REST / API JSON |
| djangorestframework-simplejwt | ≥ 5.3 | Autenticación JWT (access + refresh tokens) |
| django-ratelimit | ≥ 4.1 | Limitación de velocidad por IP |
| psycopg2-binary | ≥ 2.9.10 | Driver PostgreSQL para Python |
| Pillow | ≥ 10.3 | Gestión de imágenes (avatares) |
| django-filter | 24.2 | Filtrado en querysets |
| python-decouple | 3.8 | Variables de entorno (.env) |
| WhiteNoise | 6.6 | Servicio de archivos estáticos en producción |

## Base de Datos

| Tecnología | Rol |
|---|---|
| PostgreSQL | Base de datos relacional principal |

## Frontend (plantillas del backend)

El cliente visual se renderiza con el motor de plantillas de Django usando **HTML + CSS custom properties + JavaScript vanilla**. No existe un framework SPA separado en producción.

| Recurso | Rol |
|---|---|
| CSS custom properties (`--accent`, `--bg`, …) | Sistema de temas (claro/oscuro + colores de acento) |
| `data-theme` / `data-color` en `<html>` | Conmutación de tema sin recarga |
| JavaScript vanilla (`static/js/app.js`) | Interacciones AJAX, drag-and-drop de columnas Kanban |

## Infraestructura

| Tecnología | Rol |
|---|---|
| Docker + Docker Compose | Contenedorización y orquestación |
| python-decouple | Gestión de `.env` para configuración por entorno |

---

🔙 [Volver al README principal](../README.md)
