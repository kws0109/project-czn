import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CZN 위키 — 카오스 제로 나이트메어",
  description:
    "카오스 제로 나이트메어 한글 위키 · 캐릭터 · 카드 · 용어집",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-screen">
        {children}
      </body>
    </html>
  );
}
