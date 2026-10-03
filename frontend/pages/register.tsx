import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/frontend/components/register-form";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;

  try {
    user = await getCurrentUser();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach MySQL.";
    return (
      <main className="flex flex-1 items-center justify-center bg-[#f3efe6] px-6 py-16 text-[#1c1915] dark:bg-[#12110f] dark:text-[#f3efe6]">
        <section className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-[#1a1916]">
          <h1 className="text-3xl font-semibold tracking-tight">Registration is unavailable</h1>
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
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Create an account</h1>
        <p className="mt-3 leading-7 text-[#5c564c] dark:text-[#b7b0a4]">
          Save a name, email, and password in MySQL, then continue into the app.
        </p>
        <div className="mt-8 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#1a1916]">
          <RegisterForm />
          <p className="mt-6 text-sm leading-6 text-[#5c564c] dark:text-[#b7b0a4]">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-[#1f6b4a] dark:text-[#86efac]">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
