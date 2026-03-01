"use client";

import Image from "next/image";
import type { Card } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  Attack: "border-red-500/40 bg-red-500/10",
  Skill: "border-blue-500/40 bg-blue-500/10",
  Defense: "border-green-500/40 bg-green-500/10",
  Upgrade: "border-yellow-500/40 bg-yellow-500/10",
};

const TYPE_LABEL: Record<string, string> = {
  Attack: "공격",
  Skill: "스킬",
  Defense: "방어",
  Upgrade: "업그레이드",
};

interface CardListProps {
  cards: Card[];
  selectedIds: string[];
  onToggleCard: (card: Card) => void;
  maxCards?: number;
}

export default function CardList({
  cards,
  selectedIds,
  onToggleCard,
  maxCards = 5,
}: CardListProps) {
  if (cards.length === 0) {
    return (
      <p className="py-2 text-sm text-[var(--color-text-secondary)]">
        카드가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
        <span>카드 목록</span>
        <span>
          {selectedIds.length} / {maxCards} 선택
        </span>
      </div>
      {cards.map((card) => {
        const isSelected = selectedIds.includes(card.id);
        const isFull = selectedIds.length >= maxCards && !isSelected;
        return (
          <button
            key={card.id}
            disabled={isFull}
            onClick={() => onToggleCard(card)}
            className={`w-full rounded-lg border p-3 text-left transition-all ${
              isSelected
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                : isFull
                  ? "cursor-not-allowed border-[var(--color-border)] opacity-40"
                  : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Card Art */}
              {card.imageUrl && (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{card.nameKo}</span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-xs ${TYPE_COLORS[card.type] || ""}`}
                  >
                    {TYPE_LABEL[card.type] || card.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {card.description}
                </p>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-1 rounded bg-[var(--color-bg-primary)] px-2 py-1">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  AP
                </span>
                <span className="font-mono text-sm font-bold text-amber-400">
                  {card.apCost}
                </span>
              </div>
            </div>

            {/* Effect Tags */}
            <div className="mt-2 flex flex-wrap gap-1">
              {card.effects.map((eff, i) => (
                <span
                  key={i}
                  className="rounded bg-[var(--color-bg-primary)] px-1.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
                >
                  {eff.type} {eff.value}%
                  {eff.hits && eff.hits > 1 ? ` ×${eff.hits}` : ""}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
