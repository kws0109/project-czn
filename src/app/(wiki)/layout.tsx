"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/characters", label: "캐릭터" },
  { href: "/cards", label: "카드" },
  { href: "/glossary", label: "용어집" },
  { href: "/combat", label: "전투 시스템" },
] as const;

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Left: Logo */}
          <Link
            href="/"
            className="text-lg font-bold text-[var(--color-accent)]"
          >
            CZN
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? "font-medium text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="text-2xl text-[var(--color-text-secondary)] md:hidden"
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? "\u2715" : "\u2630"}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {isMenuOpen && (
          <nav className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] md:hidden">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "font-medium text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] px-4 py-4">
        <div className="mx-auto max-w-7xl text-center text-xs text-[var(--color-text-secondary)]">
          &copy; 2026 CZN 위키 &middot; 비공식 팬 사이트 &middot; 게임 데이터
          출처: prydwen.gg, 나무위키
        </div>
      </footer>
    </div>
  );
}
