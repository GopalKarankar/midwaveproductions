import { SectionNumber } from "@/components/ui/SectionNumber";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";

export const metadata = {
  title: "Sign In - Midwave Productions",
};

export default function LoginPage() {
  return (
    <main className="min-h-svh bg-bg flex flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-8 text-center max-w-md">
        <SectionNumber n="0" />
        <h1 className="font-display text-5xl md:text-6xl tracking-display uppercase text-highlight">
          SIGN IN
        </h1>
        <p className="font-body text-muted">
          Sign in with your Google account to access your dashboard.
        </p>
        <div className="mt-4">
          <GoogleSignInButton label="SIGN IN WITH GOOGLE" />
        </div>
      </div>
    </main>
  );
}
