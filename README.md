# Navigable HTML Export for Obsidian

[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-blue.svg)](https://obsidian.md)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Donate-yellow.svg)](https://buymeacoffee.com/nicodx)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> 🌐 **Navigable HTML Export** está especialmente diseñado para exportar cualquier nota de Obsidian como un **documento HTML interactivo, responsivo y completamente autónomo (offline)**, integrando la estructura jerárquica de la nota, **tabla de contenidos interactiva con Scroll-Spy**, **propiedades de la nota (frontmatter / metadatos)**, **fórmulas matemáticas en LaTeX (KaTeX)**, **imágenes incrustadas en Base64**, **modo claro/oscuro** y notas al pie, listo para ser navegado en navegadores desktop y mobile.

> **English:** **Navigable HTML Export** exports Obsidian notes to modern, responsive, and standalone HTML files with embedded KaTeX math, frontmatter properties table, interactive table of contents with scroll-spy, collapsible headings, and dark/light mode.

---

## ☕ Apoyar el Proyecto / Support

Si este plugin te resulta de utilidad para tus notas, apuntes o trabajo diario, puedes colaborar conmigo para apoyar su mantenimiento y nuevas mejoras:

👉 [**Puedes colaborar conmigo en Buy Me a Coffee**](https://buymeacoffee.com/nicodx)

---

## ✨ Características Principales / Features

- 📱 **Navegación Moderna & Responsiva**: Tabla de contenidos lateral con seguimiento de lectura en tiempo real (*Scroll-Spy*), buscador de secciones y menú Drawer en pantallas móviles.
- 🔼 **Títulos Colapsables / Plegables**: Cada encabezado (`H1` a `H6`) cuenta con una flecha interactiva para contraer/expandir secciones y barra superior con botones globales "Expandir Todo" y "Contraer Todo".
- 🌓 **Modo Claro / Oscuro**: Selector de tema con detección automática de preferencia del sistema y guardado local.
- 🧮 **Fórmulas Matemáticas LaTeX Impecables**: Renderizado KaTeX 100% offline para ecuaciones inline (`$...$`) y bloques (`$$...$$`).
- 🏷️ **Tarjeta de Propiedades (Frontmatter)**: Visualización limpia y colapsable de metadatos, etiquetas `#tags`, fechas y autor.
- 🖼️ **Imágenes y Archivos Incrustados**: Conversión de imágenes locales a Base64 para que el archivo `.html` sea único, portátil y funcione sin servidor.
- 📋 **Bloques de Código Interactivos**: Botón de un clic para copiar código al portapapeles.
- 🖨️ **Impresión Optimizada**: Estilos de impresión y guardado en PDF (`Ctrl + P`) en tamaño A4 con márgenes y maquetación limpia.

---

## 🚀 Instalación / Installation

### Desde Obsidian Community Plugins (Próximamente)
1. Abre Obsidian ➔ **Ajustes** ➔ **Plugins de la comunidad**.
2. Busca **Navigable HTML Export**.
3. Haz clic en **Instalar** y luego en **Activar**.

### Instalación Manual
1. Descarga el último release desde la pestaña [Releases](https://github.com/nicodx/navigable-html-export-obsidian/releases).
2. Extrae los archivos (`main.js`, `manifest.json`, `styles.css`) en la carpeta:
   `TU_VAULT/.obsidian/plugins/navigable-html-export/`
3. En Obsidian, recarga los plugins en **Ajustes ➔ Plugins de la comunidad** y activa **Navigable HTML Export**.

---

## 💻 Cómo Usar / How to Use

1. Abre cualquier nota en Obsidian.
2. Abre la ventana de exportación mediante:
   - **Paleta de Comandos** (`Ctrl + P` o `Cmd + P`) ➔ `Navigable HTML Export: Exportar nota activa a HTML Navegable (con opciones)`.
   - El **icono de globo** en la barra lateral izquierda (Ribbon).
   - Clic derecho sobre la nota en el explorador de archivos ➔ `Exportar a HTML Navegable`.
3. Ajusta las opciones (tema inicial, tabla de contenidos, fórmulas LaTeX, propiedades) y presiona **🌐 Exportar a HTML**.
4. ¡El archivo se abrirá automáticamente en tu navegador listo para ser explorado!

---

## ⚙️ Opciones de Configuración

| Opción | Descripción |
| --- | --- |
| **Tema de color predeterminado** | Sistema (Automático), Modo Claro o Modo Oscuro. |
| **Incluir Tabla de Contenidos (TOC)** | Muestra la barra lateral con índice y seguimiento de lectura. |
| **Filtro de búsqueda en la TOC** | Campo de búsqueda en el índice para filtrar secciones. |
| **Barra de progreso de lectura** | Indicador visual superior del avance de lectura. |
| **Botón volver arriba** | Botón flotante para regresar rápidamente al inicio. |
| **Renderizar fórmulas LaTeX** | Activa/desactiva el renderizado KaTeX integrado. |
| **Incluir propiedades de la nota** | Muestra la tarjeta de metadatos al inicio. |
| **Incrustar imágenes en Base64** | Embebe las imágenes locales dentro del archivo HTML. |
| **Botón copiar código** | Agrega botón de copia rápida en cada bloque de código. |
| **Abrir HTML automáticamente** | Abre el archivo en el navegador web al exportar. |

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
