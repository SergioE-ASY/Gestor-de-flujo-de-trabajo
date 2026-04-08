# ⚙️ Instalación y Puesta en Marcha

Sigue estos sencillos pasos para tener tu entorno local del **Gestor de Flujo de Trabajo** operando bajo Docker, o bien para hacer un desarrollo desacoplado del frontend y backend de manera manual.

## 📋 Requisitos Previos

Si deseas la opción más automatizada, necesitas:
- [Git](https://git-scm.com/)
- [Docker y Docker Compose](https://www.docker.com/)

Si deseas ejecutarlo manualmente:
- Node.js u otra runtime de programación correspondiente a tu Backend/Frontend.

---

## 🚀 Opción 1: Levantarlo mediante Docker (Recomendado)

Asegúrate de tener un motor de Docker corriendo en tu máquina actual y en la raíz ejecuta:

```bash
docker-compose up -d --build
```
Este comando construirá de forma aislada las imágenes del Backend, el Frontend y cualquier servicio auxiliar que el proyecto necesite, montándolos en la red virtual especificada en `docker-compose.yml`.

---

## 💻 Opción 2: Desarrollo Manual

Si tienes pensado contribuir al código específico de un servicio y prefieres arrancar la capa por separado para depurar (`debug`), entraremos en la terminal de cada carpeta:

### Lanzar Frontend
```bash
cd Frontend
# (Revisar administrador de paquetes de tu preferencia si es npm, yarn, pnpm)
npm install
npm run dev
```

### Lanzar Backend
```bash
cd Backend
# (De forma similar)
npm install
npm run dev
```
*(Asegúrate de que no haya colisiones de puertos localmente y de que la URL de tu base de datos sea alcanzable de forma local)*

---

🔙 [Volver al README principal](../README.md)
