import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/context/AuthContext";
import { applyMotion, readMotion } from "@/lib/useUiSettings";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Monark" },
      { name: "description", content: "Monark Foundations provides a robust foundation for a PC hardware market intelligence SaaS for French professional resellers." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Monark" },
      { property: "og:description", content: "Monark Foundations provides a robust foundation for a PC hardware market intelligence SaaS for French professional resellers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Monark" },
      { name: "twitter:description", content: "Monark Foundations provides a robust foundation for a PC hardware market intelligence SaaS for French professional resellers." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/mfags37bJDas7giyFHAwMtSR3vi1/social-images/social-1779462230297-Color_logo_with_background.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/mfags37bJDas7giyFHAwMtSR3vi1/social-images/social-1779462230297-Color_logo_with_background.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-motion="auto">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    applyMotion(readMotion());
  }, []);

  return (
    <AuthProvider>
      <div
        style={{
          background: "#F59E0B",
          color: "#1F2937",
          fontSize: 12,
          fontWeight: 600,
          textAlign: "center",
          padding: "6px 12px",
          letterSpacing: "0.05em",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        🚧 Site en cours de développement — certaines fonctionnalités peuvent être incomplètes.
      </div>
      <Outlet />
    </AuthProvider>
  );
}
