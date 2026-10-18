# TV Explorer

TV Explorer is a browser app for finding television shows, viewing show details, comparing two shows, and summarizing a search. Show data comes from the [TVmaze public API](https://www.tvmaze.com/api).
# TV Explorer

TV Explorer is a browser app for searching television shows, viewing show details, comparing two shows, and summarizing search results. Show data comes from the [TVmaze public API](https://www.tvmaze.com/api).

## Routes

- `/` — search for shows, select a result for an inline preview, and open full details.
- `/shows/:showId` — load a show independently by its TVmaze ID; direct opening and refresh are supported.
- `/compare` — compare two distinct shows selected from the current search results.
- `/stats` — summarize the current search result count, rating coverage and average, and language and genre distributions.
- `/about` — project purpose, technologies, and data source.
- `/help` — search, keyboard, retry, and missing-data guidance.
- Other paths display a not-found page.

## Technologies and data flow

The app uses React, TypeScript, Vite, React Router, and React Context. Search is submitted from Explorer and `searchShows` is called by an effect; changing the input alone does not send a request. The shared Context keeps the current query, results, and comparison selection in memory while navigating between routes. A full-page refresh resets this state. The show-details route does not depend on search state and fetches the show using the ID in its URL.

To compare shows, select up to two distinct results with their labeled checkboxes and open Compare. A third selection is disabled until one show is deselected. The page compares available show fields and reports a rating difference only when both ratings are present.

Stats describes only the current search results, not the full TVmaze catalog. Only finite numeric ratings are included in the average; zero is valid, while missing ratings are excluded. A show may have multiple genres, so genre counts can exceed the number of shows. Missing or blank language and genre values appear as “Not available.”

## Requirements

Use a Node.js version supported by the installed Vite, React plugin, Vitest, and jsdom packages:

- Node.js `^20.19.0`
- Node.js `^22.12.0`
- Node.js `>=24.0.0`

These ranges exclude Node.js 21 and 23. npm is also required.

## Install and run

Install the dependency versions recorded in the lockfile:

```sh
npm ci
```

Start the development server:

```sh
npm run dev
```

Open the URL printed by Vite. Its address and port depend on which local ports are available; Vite may select another port if its default is occupied.

## Tests and build

Run the automated tests once; this command completes and exits:

```sh
npm test
```

Run tests in terminal watch mode:

```sh
npm run test:watch
```

Start the Vitest browser UI:

```sh
npm run test:ui
```

To keep the UI server open for interactive inspection and reruns, use:

```sh
npm run test:ui -- --watch
```

Open the URL printed by Vitest. Automated API tests mock `fetch`, and UI tests mock the search function. Tests use simulated responses, do not call TVmaze over the network, and are not end-to-end browser tests.

Run lint and create a production build:

```sh
npm run lint
npm run build
```

Preview the production build locally after building:

```sh
npm run preview
```

Open the preview URL printed by Vite; its address and port may vary if the default is occupied.

## Attribution and deployment

TVmaze requires attribution when using its API data. This app links to [TVmaze](https://www.tvmaze.com/) and the [CC BY-SA 4.0 license](https://creativecommons.org/licenses/by-sa/4.0/). Review the license terms, including ShareAlike, when redistributing adapted data.

The app uses `BrowserRouter`. Static hosting must be configured to serve `index.html` as a fallback for app routes, including `/shows/:showId`, `/compare`, `/stats`, `/about`, and `/help`; otherwise, opening or refreshing those paths directly may return a host-level 404. This repository does not configure or publish to a hosting provider.

Before publishing, verify direct navigation and refresh for each route in the target hosting environment.
