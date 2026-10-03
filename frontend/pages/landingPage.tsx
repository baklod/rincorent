import Link from "next/link";
import { redirect } from "next/navigation";
import { demoAccount, getCurrentUser } from "@/lib/auth";

export default async function LandingPage() {
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;

  try {
    user = await getCurrentUser();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not reach MySQL.";
    return (
      <main className="flex flex-1 items-center justify-center bg-[#f3efe6] px-6 py-16 text-[#1c1915] dark:bg-[#12110f] dark:text-[#f3efe6]">
        <section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-[#1a1916]">
          <h1 className="text-3xl font-semibold tracking-tight">
            Sign in is unavailable
          </h1>
          <p className="mt-3 leading-7 text-[#5c564c] dark:text-[#b7b0a4]">
            {message}
          </p>
        </section>
      </main>
    );
  }

  if (user) {
    redirect("/home");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-[#f3efe6] px-6 py-16 text-[#1c1915] dark:bg-[#12110f] dark:text-[#f3efe6]">
      <section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-[#1a1916]">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to the landing page
        </h1>
        <Link href="/login" className="text-blue-500">
          Login
        </Link>
        <br />
        <Link href="/register" className="text-blue-500">
          Register
        </Link>
      </section>
    </main>
  );
}
