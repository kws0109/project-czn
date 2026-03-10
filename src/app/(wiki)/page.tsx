import Link from "next/link";

const navLinks = [
  { href: "/characters", label: "캐릭터" },
  { href: "/cards", label: "카드" },
  { href: "/glossary", label: "용어집" },
  { href: "/combat", label: "전투 시스템" },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="mb-2 text-4xl font-bold tracking-tight">
        <span className="text-[var(--color-accent)]">CZN</span> 위키
      </h2>
      <p className="mb-10 text-[var(--color-text-secondary)]">
        카오스 제로 나이트메어 한글 위키
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-8 py-4 text-lg font-medium transition-colors hover:border-[var(--color-accent-hover)] hover:text-[var(--color-accent)]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
