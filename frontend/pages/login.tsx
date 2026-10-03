import Link from "next/link";
import { redirect } from "next/navigation";
import { demoAccount, getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/frontend/components/login-form";

export default async function LoginPage() {
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;

  try {
    user = await getCurrentUser();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach MySQL.";
    return (
      <main className="flex flex-1 items-center justify-center bg-[#f3efe6] px-6 py-16 text-[#1c1915] dark:bg-[#12110f] dark:text-[#f3efe6]">
        <section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-[#1a1916]">
          <h1 className="text-3xl font-semibold tracking-tight">Sign in is unavailable</h1>
          <p className="mt-3 leading-7 text-[#5c564c] dark:text-[#b7b0a4]">{message}</p>
        </section>
      </main>
    );
  }

  if (user) {
    redirect("/home");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-[#f3efe6] px-6 py-16 text-[#1c1915] dark:bg-[#12110f] dark:text-[#f3efe6]">
      <section className="w-full max-w-md">
        <p className="text-sm font-semibold tracking-[0.18em] uppercase">Practice</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-3 leading-7 text-[#5c564c] dark:text-[#b7b0a4]">
          Use your account to open the app. A demo account is ready in MySQL.
        </p>
        <div className="mt-8 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#1a1916]">
          <LoginForm />
          <p className="mt-6 text-sm leading-6 text-[#5c564c] dark:text-[#b7b0a4]">
            Need an account?{" "}
            <Link href="/register" className="font-medium text-[#1f6b4a] dark:text-[#86efac]">
              Create one
            </Link>
          </p>
          <p className="mt-3 text-sm leading-6 text-[#5c564c] dark:text-[#b7b0a4]">
            Demo email <span className="font-medium text-[#1c1915] dark:text-[#f3efe6]">{demoAccount.email}</span>
            <br />
            Demo password{" "}
            <span className="font-medium text-[#1c1915] dark:text-[#f3efe6]">{demoAccount.password}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
