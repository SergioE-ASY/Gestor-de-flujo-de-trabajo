# 📋 Gestor de Flujo de Trabajo

![Estado: En Desarrollo](https://img.shields.io/badge/Estado-En_Desarrollo-brightgreen)

Bienvenido al repositorio central del **Gestor de Flujo de Trabajo**, una aplicación integral de tipo Full-stack diseñada para ayudar a los equipos en la gestión visual, eficaz y ágil de todos sus proyectos y tareas.

---

## 🎯 Sobre el proyecto

Este proyecto está organizado bajo la estructura de un **monorepo**, el cual integra conjuntamente una aplicación cliente (Frontend), la lógica base del servidor y base de datos (Backend), así como los archivos de configuración necesarios para garantizar un despliegue sin fricciones mediante tecnologías de contenedores.

El principal objetivo de la herramienta es centralizar el ciclo de vida de los proyectos permitiendo establecer distintos estados (al estilo *Kanban*), lo que facilita enormemente la comunicación del equipo y otorga una gran visibilidad a nivel de gestión de pendientes.

---

## 🚀 Inicio Rápido

Para levantar la aplicación en tu propio entorno local usando Docker en escasos minutos, sitúate en la raíz del proyecto y ejecuta la siguiente secuencia:

```bash
# 1. Clona el repositorio
git clone <URL-DEL-REPOSITORIO> 

# 2. Posiciónate en la carpeta
cd Gestor-de-flujo-de-trabajo

# 3. Levanta los servicios
docker-compose up -d --build
```

Tras unos segundos, interactúa con la plataforma en tu puerto local (usualmente `http://localhost:3000`).

> [!NOTE]
> Para opciones de arranque manual sin utilizar Docker, o bien para conocer los requisitos previos del sistema, visita en mayor detalle nuestra **[Guía de Instalación](./docs/instalacion.md)**.

---

## 📁 Estructura del Repositorio

Navega rápidamente por los bloques básicos del ecosistema:

- `/Backend` - Aquí reside la API, los controladores de acceso a base de datos y la gestión del negocio.
- `/Frontend` - El cliente gráfico para los usuarios desarrollado mediante tecnologías UI de vanguardia.
- `/docs` - Colección completa de recursos de conocimiento, esenciales para integradores y desarrolladores.
- `docker-compose.yml` - El manifiesto que aglomera los servicios listos para la orquestación.

---

## 📚 Documentación Extendida (Desglose)

A fin de conservar la lectura de este portal de la forma más limpia posible, hemos segmentado los detalles técnicos en la carpeta `/docs`. Sumérgete haciendo clic en las áreas que más te interesen:

- [✨ Resumen de Características y Funcionalidades](./docs/caracteristicas.md)
- [🛠️ Stack de Tecnologías Aplicadas](./docs/tecnologias.md)
- [📂 Comprensión de la Arquitectura](./docs/arquitectura.md)
- [🎨 Estilos y Diseño del Frontend](./docs/estilos.md)
- [⚙️ Guía Exhaustiva de Instalación](./docs/instalacion.md)
- [🤝 Cómo Contribuir al Proyecto](./docs/contribucion.md)

---

## 👥 Soporte y Casos de Uso

Si llegas a toparte con un comportamiento anómalo o quieres aportar un cambio sustancial:
1. Revisa que el tema no haya sido cubierto previamente.
2. Sigue las directrices marcadas en el archivo de **Contribución** proporcionado más arriba.
3. Abre respetuosamente un *Issue* en el apartado correspondiente.
