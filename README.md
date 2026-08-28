# Movie Collections

Movie Collections is an Angular app for finding films on TMDB, viewing details, submitting guest
ratings and organising films into browser-local collections.

It uses Angular 21, standalone components, signals, zoneless change detection, Angular Material and
SCSS.

## Features

- Debounced movie search with pagination and retry states.
- Deep-linked movie details that open as a dialog over the current page.
- TMDB guest-session ratings.
- Create, edit and delete collections stored in `localStorage`.
- Add multiple search results to one or more collections.
- Responsive layouts, light/dark themes and online/offline feedback.

## Getting Started

```bash
npm ci
npm start
```

The development server runs at `http://localhost:4200`.

The repository includes a demo TMDB API key in `src/environments/` so the app can run immediately.
The key is visible in the browser bundle because this is a client-only application. A production
system should call TMDB through a backend or proxy.

## Commands

| Command                | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `npm start`            | Start the development server            |
| `npm run build`        | Create a production build               |
| `npm run lint`         | Run ESLint and Stylelint                |
| `npm run lint:fix`     | Fix supported lint issues               |
| `npm run format`       | Format source and configuration files   |
| `npm run format:check` | Check formatting without changing files |

## Structure

```text
src/app/
  core/       configuration, interceptors and app-wide services
  domain/     movie and collection models, API access and persistence
  features/   routed pages, feature state and feature-specific UI
  layout/     application shell, navigation and global feedback
  shared/     reusable UI components and directives
```

Feature folders use the following split where needed:

```text
feature/      routed components and orchestration
data-access/  feature facades and state
ui/           presentational components
```

## Architecture

- `MovieService` is the TMDB boundary. API responses are mapped to app models before reaching the
  UI.
- `SearchFacade` owns query, pagination, result status and selection state.
- `MovieDetailsFacade` owns the details request and rating state.
- `CollectionsService` owns collection rules and `localStorage` persistence.
- Request state uses signals with explicit `idle`, `loading`, `loaded` and `error` statuses.
- Effects unsubscribe from previous requests when their inputs change, preventing stale responses
  from replacing newer data.
- HTTP errors are normalised through `toAppError()` and displayed either inline or as action
  feedback.
- Feature UI receives data through `input()` and reports actions through `output()`.

Movie details are child routes of Search and Collection Detail. This keeps the page mounted behind
the dialog and gives each film a direct URL. Import boundaries between `core`, `domain`, `features`,
`layout` and `shared` are enforced by `eslint.config.js`.

The app does not use NgRx or NGXS. Its state is small and feature-owned, so Angular signals and
focused services are enough.

## Styling

Angular Material provides the component foundation and M3 theme. Global tokens, resets, themes and
mixins live under `src/styles/`; component styles remain scoped beside their components. Shared SCSS
mixins cover repeated card-grid layouts and interaction patterns.

## Limitations

- The TMDB key is public in the client bundle.
- Collections are available only in the browser where they were created.
- TMDB guest ratings depend on temporary guest sessions.
