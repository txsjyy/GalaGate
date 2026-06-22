import { Suspense } from "react";
import { RadioTower } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth/auth-options";
import { SignInForm } from "./sign-in-form";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-12">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex size-10 items-center justify-center rounded-md bg-zinc-950 text-white">
          <RadioTower className="size-5" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-zinc-950">Sign in to GalaGate</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Development credentials are prefilled so the organizer workflow can run locally without an external auth provider.
        </p>
        <Suspense>
          <SignInForm />
        </Suspense>
      </section>
    </main>
  );
}
