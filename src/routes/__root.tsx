/* @refresh reset */
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/tanstack-react-start";

import appCss from "../styles.css?url";
import poppins100 from "@fontsource/poppins/100.css?url";
import poppins200 from "@fontsource/poppins/200.css?url";
import poppins300 from "@fontsource/poppins/300.css?url";
import poppins400 from "@fontsource/poppins/400.css?url";
import poppins500 from "@fontsource/poppins/500.css?url";
import poppins600 from "@fontsource/poppins/600.css?url";
import poppins700 from "@fontsource/poppins/700.css?url";
import poppins800 from "@fontsource/poppins/800.css?url";
import poppins900 from "@fontsource/poppins/900.css?url";
import { ChartColumnBigIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSignedInUserId } from "@/data/getSignedInUserId";
import { Toaster } from "sonner";

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
      {
        rel: "stylesheet",
        href: poppins100,
      },
      {
        rel: "stylesheet",
        href: poppins200,
      },
      {
        rel: "stylesheet",
        href: poppins300,
      },
      {
        rel: "stylesheet",
        href: poppins400,
      },
      {
        rel: "stylesheet",
        href: poppins500,
      },
      {
        rel: "stylesheet",
        href: poppins600,
      },
      {
        rel: "stylesheet",
        href: poppins700,
      },
      {
        rel: "stylesheet",
        href: poppins800,
      },
      {
        rel: "stylesheet",
        href: poppins900,
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-4">
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
      <html lang="en" suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        <body suppressHydrationWarning>
          <nav className="bg-primary p-4 h-20 w-full text-white flex items-center justify-between">
            <Link to="/" className="flex gap-1 items-center font-bold text-2xl">
              <ChartColumnBigIcon className="text-lime-500 w-6 h-6" />{" "}
              TanTracker
            </Link>
            <div>
              <SignedOut>
                <div className="text-white flex items-center">
                  <Button asChild variant="link" className="text-white">
                    <SignInButton />
                  </Button>
                  <div className="text-white flex items-center">
                    <Button asChild variant="link" className="text-white">
                      <SignUpButton />
                    </Button>
                  </div>
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton
                  showName
                  appearance={{
                    elements: {
                      userButtonAvatarBox: { border: "1px solid white" },
                      userButtonOuterIdentifier: {
                        color: "white",
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

          {children}
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
    </ClerkProvider>
  );
}
