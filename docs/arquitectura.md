# 📂 Arquitectura y Estructura del Proyecto

El proyecto está organizado en formato **Monorepo**, conteniendo dentro de un mismo punto de entrada todos los servicios relevantes para el sistema global.

## Árbol de Directorios

```text
Gestor-de-flujo-de-trabajo/
├── Backend/                 # Lógica de negocio, conexión a base de datos y endpoints
├── Frontend/                # Vistas para el usuario (interfaz visual del sistema)
├── docs/                    # Repositorio de conocimientos (esta misma carpeta)
│   └── BaseDeDatos/         # Diagramas y lógicas referentes a la BD
└── docker-compose.yml       # Orquestación de la infraestructura con Docker
```

## Arquitectura de Aplicación
El proyecto se define en un clásico ecosistema Cliente-Servidor:
1. **El Frontend (Cliente)** recopila las interacciones del usuario y se encarga de presentar la información. Realiza peticiones asíncronas al Backend.
2. **El Backend (Servidor/API)** procesa la lógica de la aplicación y gestiona el acceso a la base de datos de manera segura y eficiente.
3. **Variables de ambiente:** La aplicación utiliza variables de entorno controladas tanto por los `.env` de las carpetas internas como por la inyección de `docker-compose`.

---

🔙 [Volver al README principal](../README.md)
