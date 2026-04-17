# TaskFlow — Gestor de Tareas MVP

Aplicación Django completa para gestión de proyectos y tareas, con tablero Kanban, sprints, comentarios, adjuntos y registro de tiempo.

## Stack
- **Backend:** Django 5.0, PostgreSQL
- **Frontend:** HTML/CSS/JS vanilla (sin frameworks externos)
- **Auth:** Sistema de usuarios propio con UUID

## Estructura del proyecto
```
taskmanager/
├── core/               # Configuración Django (settings, urls, wsgi)
├── accounts/           # Usuarios custom (UUID, avatar, roles)
├── organizations/      # Organizaciones y miembros
├── projects/           # Proyectos, sprints, miembros
├── tasks/              # Tareas, subtareas, tags, comentarios, adjuntos, timelogs
├── notifications/      # Notificaciones en tiempo real
├── templates/          # Templates HTML
├── static/             # CSS y JS
├── manage.py
└── requirements.txt
```

## Instalación

### 1. Requisitos previos
- Python 3.11+
- PostgreSQL 14+

### 2. Clonar y preparar entorno
```bash
git clone <repo>
cd taskmanager

python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate          # Windows

pip install -r requirements.txt
```

### 3. Configurar base de datos
Crea la base de datos en PostgreSQL:
```sql
CREATE DATABASE taskmanager;
```

### 4. Variables de entorno
```bash
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL
```

### 5. Migraciones y superusuario
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 6. Ejecutar
```bash
python manage.py runserver
```
Abre http://localhost:8000

## Funcionalidades MVP

### ✅ Autenticación
- Registro, login y logout
- Perfil de usuario con avatar
- Roles: admin, manager, miembro

### ✅ Organizaciones
- Crear y gestionar organizaciones
- Invitar usuarios por email
- Roles: propietario, administrador, miembro

### ✅ Proyectos
- CRUD completo de proyectos
- Clave única por proyecto (ej: TM-1, TM-2...)
- Estados: Planificación, Activo, En pausa, Completado, Cancelado
- Prioridades: Baja, Media, Alta, Crítica
- Miembros del proyecto con roles
- Soft delete

### ✅ Tablero Kanban
- Columnas: Backlog → Por hacer → En progreso → En revisión → Hecho
- Drag & drop entre columnas
- Filtro por sprint activo
- Vista de lista alternativa

### ✅ Tareas
- CRUD con número de secuencia por proyecto (KEY-N)
- Tipos: Tarea, Bug, Historia, Épica, Subtarea
- Subtareas con padre/hijo
- Asignación a miembros
- Fechas límite con indicador de vencimiento
- Estimación en minutos
- Etiquetas de colores por proyecto

### ✅ Comentarios
- Comentarios en tareas
- Eliminación por el autor

### ✅ Adjuntos
- Subida de archivos a tareas

### ✅ Registro de tiempo
- Log de horas trabajadas por tarea y usuario
- Progreso vs estimación

### ✅ Sprints
- Planificar y activar sprints
- Asignar tareas a sprints

### ✅ Notificaciones
- Notificación al asignar tarea
- Notificación al comentar
- Contador en sidebar
- Marcar como leída (individual y todas)

## Producción (básico)
```bash
DEBUG=False
python manage.py collectstatic
# Usa gunicorn + nginx
pip install gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```
