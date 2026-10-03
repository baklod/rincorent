import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/server/actions";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 flex-col bg-[#f3efe6] text-[#1c1915] dark:bg-[#12110f] dark:text-[#f3efe6]">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <p className="text-sm font-semibold tracking-[0.18em] uppercase">Practice</p>
        <form action={logout}>
          <button
            type="submit"
            className="h-10 rounded-full border border-black/10 px-4 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Sign out
          </button>
        </form>
      </header>
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-16">
        <p className="text-sm font-medium text-[#1f6b4a] dark:text-[#86efac]">Signed in</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Hello, {user.name}</h1>
        <p className="mt-3 text-lg text-[#5c564c] dark:text-[#b7b0a4]">{user.email}</p>
      </section>
    </main>
  );
}
