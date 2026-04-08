# 🎨 Estilos y Diseño del Frontend

El diseño de la aplicación web está centrado en una estética moderna de alto contraste y dinamismo, apoyada en **Tailwind CSS v4** y un potente sistema de variables CSS nativas que facilitan un diseño unificado y la rápida transición entre un modo claro limpio y un modo oscuro con estética "neón" tecnológica.

## 🌞 Esquema de Colores (Modo Claro)

El tema claro se caracteriza por espacios luminosos acompañados de acentos frescos en tonos turquesa/cian. Prioriza la legibilidad visual sin perder carácter:
- **Fondos (Background):** Blanco puro (`#FFFFFF`) para tarjetas o entradas interactuables, combinando con superficies secundarias gris claro para separar zonas (`#F8FAFC`).
- **Acento Primario:** Turquesa enérgico (`#00BCCD`) con brillos suaves para interacciones y botones.
- **Acento Secundario:** Gris pizarra metálico (`#94A3B8`) para contornos, estados menos prioritarios y tipografías secundarias.
- **Tipografía y Contenido:** Textos principales de fuerte contraste cercano al negro (`#020617` y `#475569`), que descansan visualmente sobre elementos brillantes.

## 🌙 Esquema de Colores (Modo Oscuro)

El modo oscuro abandona la neutralidad para adoptar un estilo llamativo, contrastado y tecnológico ("cyber/neón"). Utiliza fondos extremadamente negros para maximizar la emisión de luz y resplandor de los colores principales:
- **Fondos Radiales:** Muy oscuros y profundos (`#000E12` a `#0A0F14`) de forma que no existan interferencias ni grises dominantes a diferencia de otros 'Dark Modes' convencionales.
- **Acento Primario Neón:** Cian y añil electrizantes (`#00E5FF`). El color se intensifica durante el "Hover" (p.ej a `#66FFFF`) aportando una sensación de brillo activo ante las acciones del usuario.
- **Gradientes Eléctricos:** Una mezcla drástica entre un cian brillante hacia reflejos profundos azulados (`#005C66`), logrando el salto tonal que se espera de una interfaz tecnológica de última generación.
- **Estados Semánticos:** Los estados de error, advertencia o éxito (Rojo, Amarillo, Verde) también se oscurecen al ser aplicados en backgrounds opacos al `10%`, favoreciendo el realce de los caracteres tipográficos como luz de láser.

## ⚙️ Integración con Tailwind CSS v4

La columna vertebral de nuestra arquitectura de estilos está basada en las últimas adaptaciones de CSS y utilitarios, orquestadas desde `Frontend/src/index.css`:

1. **Variables y Raíz:** Modificando de manera global en pseudo-clases como `:root` y `.dark` las propiedades nativas (`--background`, `--foreground`, etc.).
2. **Directiva `@theme inline`:** Alimentamos la configuración sin necesidad de depender del antiguo `tailwind.config.ts`, instruyendo al compilador de Tailwind los nuevos mapeos de color de forma inmediata y explícita.
3. **Desarrollo Ágil:** Esta configuración permite un despliegue muy rápido mediante la inyección de clases de semántica universal; podemos estilizar interfaces usando clases como `bg-background`, `bg-accent-primary`, o `text-sidebar-active-text`.

---

🔙 [Volver al README principal](../README.md)
