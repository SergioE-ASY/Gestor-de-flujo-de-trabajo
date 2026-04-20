# Instalación y Puesta en Marcha

## Requisitos Previos

- Python 3.13
- PostgreSQL 14+
- Git

---

## Opción 1: Docker (recomendado)

Asegúrate de tener Docker y Docker Compose instalados y ejecuta en la raíz del repositorio:

```bash
docker-compose up -d --build
```

Esto levanta el contenedor Django y la base de datos PostgreSQL en la red virtual configurada.

---

## Opción 2: Entorno local manual

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd Gestor-de-flujo-de-trabajo/taskflow/taskmanager
```

### 2. Crear y activar el entorno virtual

```bash
python3.13 -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Copia el fichero de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

Variables clave en `.env`:

```env
SECRET_KEY=<clave-secreta-django>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=taskmanager
DB_USER=<tu-usuario-postgres>
DB_PASSWORD=<tu-password>   # dejar vacío si usas autenticación peer (socket Unix)
DB_HOST=                    # dejar vacío para socket Unix, o 'localhost' para TCP
DB_PORT=5432
```

> **Autenticación por socket (Unix):** Si PostgreSQL está configurado con `peer` auth, deja `DB_HOST` y `DB_PASSWORD` vacíos y usa tu usuario del sistema como `DB_USER`.

### 5. Crear la base de datos

```bash
createdb taskmanager          # peer auth (si tu usuario tiene permisos)
# o con contraseña:
psql -U postgres -c "CREATE DATABASE taskmanager;"
```

### 6. Aplicar migraciones

```bash
python manage.py migrate
```

### 7. Crear superusuario

```bash
python manage.py createsuperuser
```

### 8. Cargar archivos estáticos (solo producción)

```bash
python manage.py collectstatic
```

### 9. Arrancar el servidor de desarrollo

```bash
python manage.py runserver
```

La aplicación estará disponible en `http://localhost:8000`.  
El panel de administración en `http://localhost:8000/admin/`.  
La API REST en `http://localhost:8000/api/v1/`.

---

## Notas de producción

- Cambia `DEBUG=False` y genera un `SECRET_KEY` seguro en `.env`
- Configura `ALLOWED_HOSTS` con tu dominio real
- Sustituye `LocMemCache` por Redis en `CACHES` para que el rate limiting sea efectivo en entornos multi-proceso:
  ```python
  CACHES = {
      'default': {
          'BACKEND': 'django.core.cache.backends.redis.RedisCache',
          'LOCATION': 'redis://127.0.0.1:6379/1',
      }
  }
  ```

---

🔙 [Volver al README principal](../README.md)
