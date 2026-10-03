"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/server/actions";

const initialState: LoginState = {
  error: null,
};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="demo@practice.local"
          className="h-11 rounded-xl border border-black/10 bg-white px-3 text-base outline-none ring-[#1f6b4a] focus:ring-2 dark:border-white/15 dark:bg-[#1a1916]"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 rounded-xl border border-black/10 bg-white px-3 text-base outline-none ring-[#1f6b4a] focus:ring-2 dark:border-white/15 dark:bg-[#1a1916]"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-[#5c564c] dark:text-[#b7b0a4]">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(event) => setShowPassword(event.target.checked)}
          className="size-4 accent-[#1f6b4a]"
        />
        Show password
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-[#9a3412] dark:text-[#fdba74]">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-11 rounded-full bg-[#1f6b4a] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
