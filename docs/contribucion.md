# 🤝 Guía de Contribución

¡Gracias por el interés en contribuir a enriquecer el **Gestor de Flujo de Trabajo**! Este es un breve resumen de los pasos para agregar código al repositorio y hacer que tu trabajo se integre armónicamente.

## Pasos para generar cambios

1. **Trabaja en ramas separadas:** No deberíamos introducir commit directamente a la rama principal (usualmente `main` o `master`).
   ```bash
   # Crea tu rama con un nombre descriptivo
   git checkout -b feature/añadir-nuevo-filtro
   # o bien, si es para fix
   git checkout -b fix/error-login
   ```
2. **Haz commits claros e incrementales:** Intenta que cada commit resuelva una única parte pequeña del problema.
3. **Publica la rama en el repositorio:** 
   ```bash
   git push origin <nombre-de-tu-rama>
   ```
4. **Pull Request o Merge Request:** Desde el panel de tu cliente GIT, crea una solicitud para mezclar tu rama con la principal. Añade una descripción breve de qué fallaba y qué soluciona el código que has subido.

Cualquier duda, no dudes en levantar un Issue antes de programar una nueva "Feature" pesada, de esa forma el equipo evaluará el diseño antes de gastar recursos de escritura.

---

🔙 [Volver al README principal](../README.md)
