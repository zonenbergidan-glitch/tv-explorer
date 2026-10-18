# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # TV Explorer

  TV Explorer is a React app for searching television shows and viewing details for a selected show. Search results and show information come from the [TVmaze public API](https://www.tvmaze.com/api).

  ## Pages

  - `/` — search shows, select a result, and view its image, genres, language, rating, and summary.
  - `/about` — project purpose, technologies, and data source.
  - `/help` — search, keyboard, error, and missing-data guidance.
  - Other paths show a not-found page.

  The app uses React, TypeScript, Vite, and React Router.

  ## Requirements

  Use a Node.js version supported by the installed Vite, React plugin, Vitest, and jsdom packages:

  - Node.js `^20.19.0`
  - Node.js `^22.12.0`
  - Node.js `>=24.0.0`

  These ranges exclude Node.js 21 and 23. npm is required to install dependencies and run the scripts below.

  ## Install and run

  From the project directory, install the exact dependency versions in the lockfile:

  ```sh
  npm ci
  ```

  Start the development server:

  ```sh
  npm run dev
  ```

  Open the URL printed by Vite. The address and port depend on which local ports are available; Vite may choose another port if its default is already in use.

  ## Checks

  Run the automated tests once:

  ```sh
  npm test
  ```

  Run tests in watch mode:

  ```sh
  npm run test:watch
  ```

  Automated tests use mocked network responses: API tests mock `fetch`, and UI tests mock the search function. They do not call TVmaze over the network, and they are not end-to-end browser tests.

  Run lint and create a production build:

  ```sh
  npm run lint
  npm run build
  ```

  Preview the production build locally after building:

  ```sh
  npm run preview
  ```

  Open the preview URL printed by Vite. The preview address and port may vary if the default port is occupied.

  ## Data attribution and deployment

  TVmaze requires attribution for use of its API data. The app links to [TVmaze](https://www.tvmaze.com/) and the [CC BY-SA 4.0 license](https://creativecommons.org/licenses/by-sa/4.0/); review the license terms, including ShareAlike, when redistributing adapted data.

  The app uses `BrowserRouter`. When deploying to static hosting, configure the host to serve `index.html` as a fallback for app routes such as `/about` and `/help`; otherwise, opening or refreshing those paths directly may return a host-level 404. This repository does not configure or publish to a hosting provider.
