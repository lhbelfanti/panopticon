# Code Conventions

This document outlines the detailed and specific code conventions, project structure, and technological stack used in this project. It is intended to be used as a setup reference for new projects aiming to use the exact same conventions and structure.

## Frameworks and Languages
- **React Router v7 (Framework mode)**: Used as the core full-stack web framework (successor to Remix).
- **TypeScript**: The principal programming language used across the application to ensure strict typing.
- **Vite**: Used as the build tool and development server.
- **Tailwind CSS**: Used as the primary styling solution natively via `@tailwindcss/vite`.

## Structure of the Project
- **`app/`**: Contains the majority of the application's source code, React components, Remix routes, and services.
  - **`app/components/`**: Reusable UI components.
  - **`app/routes/`**: Application routes acting as pages.
  - **`app/services/`**: API calls, utils, and external service integrations.
  - **`app/localization/`**: Setup for i18n context and configurations.
  - **`app/data/`**: Static variable definitions and structured literal data.
- **`public/`**: Publicly accessible folder used for static assets like images, icons, and translation JSON files.

## HTML, CSS, and Code Conventions
- **Styling**: All CSS styling is handled via **Tailwind CSS**. HTML elements use `className` exclusively to apply Tailwind utility classes.
- **Refactoring styles**: Tailwind class strings are refactored out into string variables within the component (e.g. `const buttonClass: string = 'mt-4 w-96 p-2 ...';`) when the style can be reused in more than one place, to avoid repeating code and make it cleaner.
- **Functions Structure**: All component and utility functions must strictly be declared as Arrow Functions (`const ComponentName = () => {}`) rather than standard `function ComponentName() {}` blocks.
- **Props Destructuring**: Do not destructure props directly in the component definition signature. Instead, accept the `props` object and destructure it inside the component body to improve readability. (e.g. `const NavItem = (props: NavItemProps) => { const { to, icon, label } = props; ... }`).
- **Typing**: Strict TypeScript typings are enforced. Interfaces and Types for a component's props are usually separated into their own `types.d.ts` or `types.ts` files.
- **File extensions**: Use `.tsx` for files containing JSX/React code and `.ts` for standard TypeScript logic files.

## Localization
- **Handling Strategy**: Localization is managed using `i18next` ecosystem together with `remix-i18next` for seamless SSR support.
- **Location**: Configuration logic lives in `app/localization/` (specifically `i18n.ts` and `i18n.server.ts`).
- **Translation Files**: The actual `.json` dictionaries (dictionaries per language) are stored publicly in `public/locales/{en|es}/`.

## Images
- **Handling Strategy**: Images and static visual assets are handled internally through static serving.
- **Location**: All image assets are placed directly in the `public/` folder natively (e.g. `public/repository-logo.png` or `public/favicon.ico`).

## API / Frontend Separation
- **Separation Concept**: The application embraces the standard React Router v7 Server framework philosophy by using route `loader`s and `action`s as a Backend-For-Frontend (BFF) layer. Direct connections to external APIs happen here.
- **Location**: The actual implementations of remote API calls and SDK integrations reside inside `app/services/api/`.
- **Client vs Server API context**: To explicitly separate server-side execution from browser execution and prevent leaking server secrets (like API keys) to the client bundle, files are strictly suffixed with `.server.ts` or `.client.ts`.
  - **`.server.ts`**: Used for code that must only run on the server, such as connections to external APIs using secret credentials, or logic consumed by React Router `loader`s and `action`s.
  - **`.client.ts`**: Used for code that is intended to be executed in the user's browser (e.g., client-side SDKs or browser-specific logic).
- **Entity Encapsulation**: API services are grouped into folders by entity name (e.g., `app/services/api/auth/`, `app/services/api/users/`). Each entity folder acts as a self-contained module containing its respective server and client implementations.
- **Types**: Within each entity folder, a `types.ts` file is used to define TypeScript interfaces, types, and Data Transfer Objects (DTOs) for that domain. This separates the type definitions from the implementation, allowing both client and server code to import the types safely without risking the inclusion of server-only runtime code in the client bundle.

## Routes
- **Handling Strategy**: Routes are constructed using the `@react-router/fs-routes` pattern internally in `app/routes.ts`.
- **Location**: Route pages are placed directly inside the `app/routes/` folder.
- **File Naming**: We use flat routing conventions via dots logic. Typical route pages end completely with `.tsx` (e.g., `login.tsx` for layout, `login._index.tsx` for the page contents). The root routing configuration connects standard files to URL structures natively.

## Components
- **Handling Strategy**: Components are isolated module blocks used within pages.
- **Location**: They reside inside `app/components/`.
- **File Structure**: Each component has its own dedicated folder generally named with PascalCase (e.g., `app/components/Button/`). Within the folder, the main React export happens from an `index.tsx` file coupled with supplementary files such as typing (`types.d.ts` or `types.ts`) or constants.
- **Subcomponents**: If a component possesses specific subcomponents (e.g. `Sidebar` containing `NavigateItem`), those subcomponents strictly must be housed inside isolated, nested folders belonging to the parent component (e.g. `app/components/Sidebar/NavItem/index.tsx` accompanied by its intrinsic `types.ts`), preserving modular encapsulation.

## Pages
- **Handling Strategy**: Pages are not distinctly decoupled into a `pages/` directory. Instead, they operate as Remix route components. The default export of any matched file inside `app/routes/` operates as a given page. 
- **Location**: The visual layouts and component aggregations that map exactly to URLs form the pages, placed in `app/routes/` (e.g. `signup._index.tsx`, `selection._index.tsx`).
- **Componentization for Clean Pages**: Keep page routes as clean as possible. Because routing mechanisms and server calls (`loader`, `action`) are defined in page files, large blocks of HTML/JSX code make it difficult to follow the logic. Aggressively encapsulate UI sections into subcomponents to maintain high readability on the page level.
