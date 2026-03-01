import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CZN Combat Tool - 카오스 제로 나이트메어 전투 유틸리티",
  description:
    "Path of Building 스타일의 CZN 전투 시뮬레이터 - 덱 빌더, 팀 시너지 분석, 밸런스 이상치 탐지",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-[var(--color-accent)]">CZN</span> Combat
              Tool
            </h1>
            <span className="text-xs text-[var(--color-text-secondary)]">
              카오스 제로 나이트메어 전투 유틸리티
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
