# Gestión de Eventos Frontend (React + Vite)

## Requisitos

- **Node.js**: 18.x o 20.x (recomendado LTS)
- **npm**: 9+ (se instala con Node)

## Instalación

```bash
npm install
```

## Comandos de ejecución
```bash
npm run dev
```

- **Compilación de producción:**
```bash
npm run build
```

- **Previsualización del build:**
```bash
npm run preview
```

- **Linter:**
```bash
npm run lint
```

## Dependencias principales

- **react** `^19.1.1`
- **react-dom** `^19.1.1`
- **react-router-dom** `^7.9.4`
- **react-bootstrap** `^2.10.10`
- **bootstrap** `^5.3.8`
- **bootstrap-icons** `^1.13.1`
- **tailwindcss** `^4.1.15`
- **@tailwindcss/vite** `^4.1.15`

## Dependencias de desarrollo

- **vite** `^7.1.7`
- **@vitejs/plugin-react** `^5.0.4`
- **eslint** `^9.36.0`
- **@eslint/js** `^9.36.0`
- **eslint-plugin-react-hooks** `^5.2.0`
- **eslint-plugin-react-refresh** `^0.4.22`
- **globals** `^16.4.0`
- **@types/react** `^19.1.16`
- **@types/react-dom** `^19.1.9`

## Notas de configuración

- `vite.config.js`: usa `react()` y `tailwindcss()` como plugins.
- Estilos: `bootstrap`/`bootstrap-icons` y `tailwindcss` disponibles. Estilos base en `src/index.css` y `src/App.css`.
- Entrada de la app: `src/main.jsx` con `App.jsx`. Estructura en `src/components/`, `src/pages/`, `src/layouts/`, `src/context/`.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
