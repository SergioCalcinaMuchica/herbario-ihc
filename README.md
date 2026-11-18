# Herbario — prototipo

Interfaz del sistema de co-creación botánica descrito en `../docs/`.
SvelteKit 3 + Svelte 5 + Bun. Datos simulados en memoria: no hay backend ni modelo real.

## Correr

```bash
cd app
bun install
bun run dev
```

Abre `http://localhost:5173`.

## Verificar

```bash
bun run check   # svelte-check: 0 errores, 0 avisos
bun run build   # build estático en build/
```

## Qué está implementado

- Tres espacios: Herbario (Sesiones / Biblioteca), Invernadero, Sustrato.
- Navegación por ramas y nodos, sin hilo de mensajes; `[` y `]` recorren la rama.
- Barra de cultivo con aclaraciones contextuales y registro llano/divulgativo/experto.
- Generación simulada con hitos; `Detener` conserva borrador y permite reanudar.
- La consulta original del usuario queda visible en la lámina y se incluye en la exportación y la búsqueda.
- Selección de planta: lámina comparativa de 3 candidatas con ilustración vectorial, encaje, cuidado, dificultad y seguridad con mascotas; `Elegir esta` crea la rama de especie y fija la ficha.
- Supuestos críticos bajo el composer; corregir marca la lámina como desactualizada.
- Inspector léxico con doble registro: reemplazo por variante ya generada y ámbito (hilo / especie / global).
- Cartas de hecho, supuesto, preferencia y artefacto; fijar, exportar, editar y descartar.
- Sustrato acotado a 3–6 cartas propias, con heredado resumido y contadores que abren la auditoría.
- Auditoría modal con pestañas, filtro, facetas y carga por tramos (vista de archivo).
- Buscador con facetas (`/`), scrubber temporal y Biblioteca de láminas fijadas.
- Estados vacío, generando, podado, error implícito, desactualizado y baja certeza.
- Responsive: tres columnas, panel deslizante y una columna con cajones.

## Caso de estrés

Abre `?estres=1` (o `http://localhost:5173/?estres=1`) para cargar 8 ramas, 200 láminas y 3.400 cartas. El Sustrato sigue mostrando 4 cartas; el árbol colapsa las ramas de más de 12 nodos salvo la activa.

Medición y análisis en `../docs/07-estres-scroll.md`.

## Atajos

`/` buscar · `[` `]` nodo anterior/siguiente · `Esc` cerrar · `Ctrl+.` detener.

## Límites conocidos

- La generación es un temporizador local con respuestas predefinidas por palabras clave.
- Las ternas de selección son conjuntos locales activados por palabras clave (poca luz, sol, flor, mascotas); no hay catálogo externo ni navegación.
- No hay persistencia: recargar restaura los datos de ejemplo.
- Conflicto entre preferencias: se muestra el aviso, no hay resolución automática.
- No se probó en dispositivo móvil real; el layout responsive está definido por CSS.
