import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChartColumnBigIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-[400px] h-[calc(100vh-80px)] flex items-center justify-center relative bg-violet-800">
      <img
        src="/save-money.jpg"
        className="absolute top-0 left-0 size-full object-cover object-center opacity-20"
        alt="Cover"
      />
      <div className="flex flex-col text-center gap-6 relative z-10 max-w-3xl px-4">
        <h1 className="text-display font-display font-semibold flex gap-3 items-center justify-center text-white">
          <ChartColumnBigIcon size={50} className="text-amber-400" />{" "}
          money·saver{" "}
        </h1>
        <p className="font-display text-xl text-violet-200 italic">Overview of your finance and spending</p>
        <SignedIn>
          <div className="mt-4">
            <Button asChild size="lg" variant="amber">
              <Link to="/dashboard">Go to your Dashboard</Link>
            </Button>
          </div>
        </SignedIn>
        <SignedOut>
          <div className="flex gap-3 items-center justify-center mt-4">
            <Button asChild size="lg" variant="amber">
              <SignInButton />
            </Button>
            <Button asChild size="lg" variant="outline">
              <SignUpButton />
            </Button>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}
