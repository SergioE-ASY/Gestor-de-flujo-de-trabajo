# Estilos y Diseño

El sistema visual de e-asy se implementa completamente con **CSS custom properties** y el motor de plantillas de Django. No se usa ningún framework CSS externo.

---

## Sistema de Temas

Los temas se controlan con dos atributos en el elemento `<html>`:

| Atributo | Valores | Descripción |
|---|---|---|
| `data-theme` | `dark` (por defecto), `light` | Modo base de la interfaz |
| `data-color` | `default`, `pink`, `red`, `blue`, `green` | Color de acento |

El valor inicial se inyecta en el `<head>` de `base.html` antes de que se pinte nada, evitando destellos (`FOUC`):

```html
<script>(function(){
  document.documentElement.setAttribute('data-theme', '{{ user.base_theme }}');
  document.documentElement.setAttribute('data-color', '{{ user.color_theme }}');
})();</script>
```

Los cambios posteriores se aplican mediante AJAX (sin recarga) y se persisten en el modelo `User`.

---

## Variables CSS

Definidas en `static/css/app.css`:

```css
:root {                        /* base oscura */
  --bg: #0a0f14;
  --surface: #111820;
  --border: #1e2d3d;
  --text: #e2e8f0;
  --accent: #00e5ff;
}

[data-theme="light"] {         /* base clara */
  --bg: #f8fafc;
  --surface: #ffffff;
  --border: #e2e8f0;
  --text: #0f172a;
  --accent: #00bccd;
}

[data-color="pink"]  { --accent: #ec4899; }
[data-color="red"]   { --accent: #ef4444; }
[data-color="blue"]  { --accent: #3b82f6; }
[data-color="green"] { --accent: #22c55e; }

/* Colores de acento adaptados al modo claro */
[data-theme="light"][data-color="pink"]  { --accent: #db2777; }
[data-theme="light"][data-color="red"]   { --accent: #dc2626; }
[data-theme="light"][data-color="blue"]  { --accent: #2563eb; }
[data-theme="light"][data-color="green"] { --accent: #16a34a; }
```

---

## Colores Premium

Los colores `pink`, `red`, `blue` y `green` están bloqueados para usuarios con `is_premium = False`. El intento de activarlos devuelve HTTP 403. En la interfaz aparecen con un icono de candado y se abre un modal de mejora de plan.

---

## Modo oscuro (por defecto)

Estética cyber/neón con fondos muy oscuros (`#0a0f14`) y acentos brillantes. El acento por defecto es cian eléctrico (`#00e5ff`).

## Modo claro

Fondos blancos y grises claros con el mismo acento adaptado a menor luminosidad para mantener contraste (`#00bccd` por defecto).

---

🔙 [Volver al README principal](../README.md)
