# EasyContactForm — Admin Dashboard

<p>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="React Router" src="https://img.shields.io/badge/React_Router-6-CA4245?logo=reactrouter&logoColor=white">
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-2-6E9F18?logo=vitest&logoColor=white">
</p>

The web admin dashboard for the **EasyContactForm** service (package name
`easycontact-dashboard`). Sign in, create and configure projects, design forms
in a visual builder, manage branding, read submissions, and copy the embed
snippet that drops a form onto any site.

> This is the frontend only. It talks to the PHP backend in the companion repo
> **[easycontactforms_api](https://github.com/olivierluethy/easycontactforms_api)**
> over a small `{ success, data }` JSON API (`src/api/client.js`).

## Features

- **Auth** — register and log in; a bearer token is kept in `localStorage` and
  sent on every request (`RequireAuth` guards the dashboard routes).
- **Projects** — create projects, rename them inline, filter the list, and
  manage per-project settings.
- **Form builder** — assemble and configure a form's fields (`FormBuilder`),
  preview it before publishing (`PreviewModal`).
- **Branding** — customise a project's look through branding fields.
- **Submissions** — browse submissions in a table and read a full entry in a
  side drawer (`SubmissionsTable`, `SubmissionDrawer`).
- **Embed** — copy a ready-to-paste snippet to integrate a form into any page
  (`SnippetBlock`, `IntegrationPanel`).
- **Theming** — light/dark toggle backed by a theme provider.

## Tech stack

- **React 18** with **React Router 6** for routing.
- **Vite 5** for dev server and builds.
- **Vitest** + **Testing Library** (jsdom) for unit and component tests.
- Plain `fetch` API wrapper (`src/api/client.js`) — no data-fetching library.

## Getting started

**Requirements:** Node.js 18+ and npm.

```bash
# Install dependencies
npm install

# Point the app at the backend
cp .env.example .env    # then edit VITE_API_BASE

# Start the dev server (http://localhost:5173)
npm run dev
```

### Environment

| Variable | Purpose |
|---|---|
| `VITE_API_BASE` | Base URL of the `easycontactforms_api` backend (defaults to `http://localhost:8000` if unset). |

### Scripts

```bash
npm run dev       # Vite dev server on port 5173
npm run build     # production build to dist/
npm run preview   # preview the production build on port 4173
npm test          # run the test suite once (Vitest)
npm run test:watch # run tests in watch mode
```

## Project layout

```
src/
  api/client.js        fetch wrapper: token injection + { success, data } unwrapping
  context/             AuthContext, ProjectsContext
  pages/               Login, Register, Projects, ProjectDetail
  components/           FormBuilder, SubmissionsTable, SnippetBlock, branding, modals…
  hooks/               useCopy, useDebouncedValue
  theme/               ThemeProvider (light/dark)
  utils/               formatting, project filters, snippet builder (with tests)
```

## License

Released under the [MIT License](LICENSE) © 2026 Olivier Lüthy. You're free to use, modify and distribute this
software, including commercially, as long as the copyright notice and license are included.

## Author

Built by **Olivier Lüthy** — [GitHub](https://github.com/olivierluethy).
