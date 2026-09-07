# Lumiere Grande Hotel

A luxury hotel marketing and booking website built with React, Vite, and Tailwind CSS.

## Features

- **Home page** — hero section, hotel story, amenities, featured suites, and guest testimonials
- **Suites & Rooms** — browsable room catalog with filtering by room type and price range
- **Room detail pages** — image gallery, full room description, amenities, and a booking sidebar (`/suites/:slug`)
- **Contact page** — contact details and a message form
- **Booking modal** — accessible from anywhere in the site, lets guests select a room, dates, and guest count
- Client-side routing via `react-router-dom` (`HashRouter`, so it works from a single static file with no server config)

## Tech Stack

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI components |
| [Vite 7](https://vite.dev/) | Dev server & build tool |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [react-router-dom 7](https://reactrouter.com/) | Client-side routing |
| [lucide-react](https://lucide.dev/) | Icons |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Conditional class name handling |
| [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) | Bundles the production build into a single `index.html` |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

Starts a local dev server with hot reload:

```bash
npm run dev
```

### Production Build

Builds the app into a single self-contained `dist/index.html`:

```bash
npm run build
```

### Preview Production Build

Serves the built app locally to sanity-check it before deploying:

```bash
npm run preview
```

## Project Structure

```
├── public/
│   └── images/            # Static assets (hero image, etc.)
├── src/
│   ├── components/        # Reusable UI pieces (Navbar, Footer, RoomCard, BookingModal, ...)
│   ├── context/           # BookingContext — global state for the booking modal
│   ├── data/               # Static room data (rooms.js)
│   ├── pages/              # Route-level pages (HomePage, SuitesPage, RoomDetailPage, ContactPage)
│   ├── utils/              # Helpers (cn.js — className merging)
│   ├── types.js            # Shared constants (room type list)
│   ├── App.jsx              # Routes and app shell
│   ├── main.jsx              # React app entry point
│   └── index.css              # Tailwind theme & global styles
├── index.html
├── vite.config.js
└── package.json
```

## Adding or Editing Rooms

Room data lives in `src/data/rooms.js` as a plain array of objects. Each room needs:

```js
{
  id, slug, name, type, pricePerNight, size, capacity,
  beds, view, shortDescription, longDescription,
  amenities, image, gallery, rating, reviews, featured
}
```

Room detail pages are generated automatically from this data via the `/suites/:slug` route — no extra wiring needed when you add a new room.

## Notes

- Routing uses `HashRouter`, so URLs look like `/#/suites/grande-suite`. This keeps the app deployable as a static file without server-side rewrite rules.
- The booking modal's "Confirm Reservation" and the contact form's "Send Message" are front-end only — they simulate a successful submission but don't call a real backend or send emails. Wire these up to your reservation system or an email service before going live.

## Developer 
```
Name: Lina Oeu
Email: linaoeu567556@gmail.com
```