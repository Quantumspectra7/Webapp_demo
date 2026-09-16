"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Globe2, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";

export default function GoogleLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setError("");
    setIsSigningIn(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) setError(authError.message);
    setIsSigningIn(false);
  };

  const handlePasswordAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSigningIn(true);

    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setError(result.error.message);
    } else if (mode === "signup" && !result.data.session) {
      setMessage("Account created. Check your email to confirm your account, then sign in.");
    } else {
      router.replace("/onboarding");
    }
    setIsSigningIn(false);
  };

  return (
    <main className="min-h-screen bg-[#fff8f2] px-4 py-10 text-[#241b16] flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-[#ede3d8] bg-white p-8 shadow-xl sm:p-10">
        <div className="mb-8 text-center">
          <Image
            src="/gramvest_logo3.png"
            alt="GramVest"
            width={160}
            height={54}
            className="mx-auto h-12 w-auto object-contain"
            priority
          />
          <h1 className="mt-3 font-serif text-3xl font-bold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#786d65]">
            Use your Google account to save your business analysis and return to it anytime.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSigningIn}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#d9cec4] bg-white px-4 py-3.5 text-sm font-bold text-[#241b16] transition hover:bg-[#faf4ee] disabled:cursor-wait disabled:opacity-70"
        >
          {isSigningIn ? <LoaderCircle size={18} className="animate-spin" /> : <Globe2 size={18} />}
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-[#a0958e]">
          <span className="h-px flex-1 bg-[#ede3d8]" />
          <span>OR</span>
          <span className="h-px flex-1 bg-[#ede3d8]" />
        </div>

        <form onSubmit={handlePasswordAuth} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#786d65]">
            Email address
            <div className="relative mt-1.5">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#786d65]" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="w-full rounded-xl border border-[#ede3d8] py-3 pl-10 pr-3 text-sm text-[#241b16] outline-none focus:border-[#c75d3e] focus:ring-1 focus:ring-[#c75d3e]/20"
              />
            </div>
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-[#786d65]">
            Password
            <div className="relative mt-1.5">
              <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#786d65]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="w-full rounded-xl border border-[#ede3d8] py-3 pl-10 pr-11 text-sm text-[#241b16] outline-none focus:border-[#c75d3e] focus:ring-1 focus:ring-[#c75d3e]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#786d65]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && <p className="text-xs text-red-600">{error}</p>}
          {message && <p className="text-xs text-[#3a6b4c]">{message}</p>}

          <button
            type="submit"
            disabled={isSigningIn}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c75d3e] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#b34f32] disabled:cursor-wait disabled:opacity-70"
          >
            {isSigningIn && <LoaderCircle size={17} className="animate-spin" />}
            {mode === "signin" ? "Sign in with email" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}
          className="mt-5 block w-full text-center text-xs font-bold text-[#c75d3e] hover:underline"
        >
          {mode === "signin" ? "New to GramVest? Create an account" : "Already have an account? Sign in"}
        </button>

        <p className="mt-6 text-center text-xs leading-5 text-[#786d65]">
          Your password is securely hashed and stored by Supabase Auth. GramVest never sees it.
        </p>
      </section>
    </main>
  );
}