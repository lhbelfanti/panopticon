import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import { useLoaderData, useLocation } from "react-router";
import { getProjectsForSidebar } from "~/services/api/projects/index.server";
import type { Project } from "~/services/api/projects/types";
import { LanguageSwitcher } from "~/components/LanguageSwitcher";
import { Sidebar } from "~/components/Sidebar";
import type { Route } from "./+types/root";
import { useTranslation } from "react-i18next";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/x-icon", href: "/panopticon.ico" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

import { getSessionUser } from "~/services/api/auth/session.server";

export const loader = async ({ request }: { request: Request }) => {
  const projects = await getProjectsForSidebar();
  const { user } = await getSessionUser(request);
  return { projects, user };
};

export const Layout = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const { i18n } = useTranslation();
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith("/login");

  // Conditionally hook into useLoaderData in case of early Error Boundaries rendering the Layout before loader runs
  let projects: Pick<Project, "id" | "name" | "subprojects">[] = [];
  let user = null;
  try {
    const data = useLoaderData<typeof loader>();
    projects = data?.projects || [];
    user = data?.user || null;
  } catch (e) {
    // ignore
  }

  return (
    <html lang={i18n.language ?? "en"} className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background-dark text-light-gray font-sans flex relative">
        {!isLoginPage && <Sidebar projects={projects} user={user} />}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-background-dark isolate">
          {children}
        </main>
        <LanguageSwitcher />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

const App = () => {
  return <Outlet />;
};

export default App;

export const ErrorBoundary = (props: Route.ErrorBoundaryProps) => {
  const { error } = props;
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
};
