import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { UserMenu } from "@/components/layout/UserMenu";
import { getSocialLinks } from "@/lib/settings/getSocialLinks";

export async function Navbar() {
  const socialLinks = await getSocialLinks();
  return (
    <header className="flex items-center justify-between border-b border-border bg-bg px-6 md:px-12 py-4">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/images/Midwave productions logo (without caption).png"
          alt=""
          width={80}
          height={32}
          priority
          className="h-8 w-auto md:h-9"
        />
        <span className="font-display uppercase tracking-display text-highlight">
          MIDWAVE
        </span>
        <span className="font-display uppercase tracking-display text-accent">
          PRODUCTIONS
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <MobileMenu socialLinks={socialLinks} />
        <div className="hidden min-[489px]:inline-flex">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
