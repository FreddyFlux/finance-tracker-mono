import { createFileRoute, Link } from "@tanstack/react-router";
import cover from "../../public/save-money.jpg";
import { ChartColumnBigIcon } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/tanstack-react-start";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-[400px] h-[calc(100vh-80px)] flex items-center justify-center relative">
      <img
        src={cover}
        className="absolute top-0 left-0 size-full object-cover object-center opacity-40"
        alt="cover image"
      />
      <div className="flex flex-col text-center gap-4 relative z-10">
        <h1 className="text-4xl font-bold flex gap-1 items-center justify-center">
          <ChartColumnBigIcon size={50} className="text-lime-500" />{" "}
          Sparemaskin{" "}
        </h1>
        <p className="text-2xl">Overview of your finance and spending</p>
        <SignedIn>
          <Button asChild size="lg">
            <Link to="/dashboard">Go to your Dashboard</Link>
          </Button>
        </SignedIn>
        <SignedOut>
          <div className="flex gap-2 items-center justify-center">
            <Button asChild size="lg" className="bg-lime-600 hover:bg-lime-700">
              <SignInButton />
            </Button>
            <Button asChild size="lg">
              <SignUpButton />
            </Button>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}
