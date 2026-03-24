/* @refresh reset */

import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/tanstack-react-start";
// Fonts are loaded via Google Fonts in styles.css
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ChartColumnBigIcon } from "lucide-react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { AppProvider } from "@/contexts/app-context";
import { getSignedInUserId } from "@/data/getSignedInUserId";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const userId = await getSignedInUserId();
    return {
      userId,
    };
  },
  pendingMinMs: 0,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Tutorial",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-violet-800">
      <div className="text-center">
        <h1 className="font-display text-2xl font-medium mb-4 text-white">404 - Page Not Found</h1>
        <p className="text-violet-200 mb-4">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider>
      <AppProvider>
        <html lang="en" suppressHydrationWarning>
          <head>
            <HeadContent />
          </head>
          <body suppressHydrationWarning>
            <nav className="sticky top-0 z-50 bg-violet-800/95 backdrop-blur-md border-b border-violet-700/30 px-6 py-4 w-full flex items-center justify-between">
              <Link
                to="/"
                className="flex gap-2 items-center font-display text-xl hover:opacity-90 transition-opacity"
              >
                <ChartColumnBigIcon className="text-amber-400 w-7 h-7" />
                <span className="text-white font-semibold">money</span>
                <span className="text-amber-400 text-2xl leading-none">·</span>
                <span className="text-white font-semibold">saver</span>
              </Link>
              <div className="flex items-center gap-3">
                <SignedOut>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" className="text-violet-200 hover:text-white hover:bg-violet-700/50 transition-colors">
                      <SignInButton />
                    </Button>
                    <Button asChild className="bg-amber-500 text-violet-900 hover:bg-amber-400 font-medium rounded-full px-5 shadow-md">
                      <SignUpButton />
                    </Button>
                  </div>
                </SignedOut>
                <SignedIn>
                  <UserButton
                    showName
                    appearance={{
                      elements: {
                        userButtonAvatarBox: {
                          border: "2px solid rgba(255, 190, 77, 0.3)",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                        },
                        userButtonOuterIdentifier: {
                          color: "white",
                          fontWeight: "500",
                        },
                      },
                    }}
                  >
                    <UserButton.MenuItems>
                      <UserButton.Action
                        label="Dashboard"
                        labelIcon={<ChartColumnBigIcon className="w-4 h-4" />}
                        onClick={() => navigate({ to: "/dashboard" })}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                </SignedIn>
              </div>
            </nav>

            <main className="min-h-screen">
              {children}
            </main>
            <Toaster />
            {import.meta.env.DEV && (
              <TanStackDevtools
                config={{
                  position: "bottom-right",
                }}
                plugins={[
                  {
                    name: "Tanstack Router",
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
            )}
            <Scripts />
          </body>
        </html>
      </AppProvider>
    </ClerkProvider>
  );
}
