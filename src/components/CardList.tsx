"use client";

import type { Card } from "@/lib/types";
import { resolveCardVariation } from "@/lib/cardUtils";

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

const CATEGORY_STYLE: Record<string, string> = {
  Starting: "border-slate-400/40 bg-slate-400/10 text-slate-300",
  Epiphany: "border-purple-400/40 bg-purple-400/10 text-purple-300",
};

interface CardListProps {
  cards: Card[];
  selectedIds: string[];
  onToggleCard: (card: Card) => void;
  maxCards?: number;
  selectedVariations?: Record<string, number>;
  onVariationChange?: (cardId: string, variationNumber: number) => void;
}

export default function CardList({
  cards,
  selectedIds,
  onToggleCard,
  maxCards = 5,
  selectedVariations = {},
  onVariationChange,
}: CardListProps) {
  if (cards.length === 0) {
    return (
      <p className="py-2 text-sm text-[var(--color-text-secondary)]">
        카드가 없습니다.
      </p>
    );
  }

  const startingCards = cards.filter((c) => c.category === "Starting");
  const epiphanyCards = cards.filter((c) => c.category === "Epiphany");

  const renderCard = (card: Card) => {
    const isSelected = selectedIds.includes(card.id);
    const isFull = selectedIds.length >= maxCards && !isSelected;
    const hasVariations = card.variations && card.variations.length > 0;
    const activeVariation = selectedVariations[card.id] || 1;
    const resolved = hasVariations
      ? resolveCardVariation(card, activeVariation)
      : card;

    return (
      <div key={card.id} className="space-y-0">
        {/* Variation Tabs */}
        {hasVariations && (
          <div className="flex gap-0.5 px-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={(e) => {
                  e.stopPropagation();
                  onVariationChange?.(card.id, num);
                }}
                className={`rounded-t px-2 py-1 text-xs font-medium transition-colors ${
                  activeVariation === num
                    ? "bg-purple-500/30 text-purple-200 border border-b-0 border-purple-500/50"
                    : "bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:bg-purple-500/10 hover:text-purple-300"
                }`}
              >
                #{num}
              </button>
            ))}
          </div>
        )}

        <button
          disabled={isFull}
          onClick={() => onToggleCard(card)}
          className={`w-full rounded-lg border p-3 text-left transition-all ${
            hasVariations ? "rounded-tl-none" : ""
          } ${
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{card.nameKo}</span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-xs ${TYPE_COLORS[resolved.type] || ""}`}
                >
                  {TYPE_LABEL[resolved.type] || resolved.type}
                </span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-xs ${CATEGORY_STYLE[card.category] || ""}`}
                >
                  {card.category === "Starting" ? "기본" : "번뜩임"}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                {resolved.description}
              </p>
            </div>
            <div className="ml-2 flex shrink-0 items-center gap-1 rounded bg-[var(--color-bg-primary)] px-2 py-1">
              <span className="text-xs text-[var(--color-text-secondary)]">
                AP
              </span>
              <span className="font-mono text-sm font-bold text-amber-400">
                {resolved.apCost}
              </span>
            </div>
          </div>

          {/* Effect Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {resolved.effects.map((eff, i) => (
              <span
                key={i}
                className="rounded bg-[var(--color-bg-primary)] px-1.5 py-0.5 text-xs text-[var(--color-text-secondary)]"
              >
                {eff.type} {eff.value}%
                {eff.hits && eff.hits > 1 ? ` ×${eff.hits}` : ""}
              </span>
            ))}
            {resolved.tags.length > 0 && resolved.tags.map((tag, i) => (
              <span
                key={`tag-${i}`}
                className="rounded bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 text-xs text-purple-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
        <span>카드 목록</span>
        <span>
          {selectedIds.length} / {maxCards} 선택
        </span>
      </div>

      {/* Starting Cards */}
      {startingCards.length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-400">기본 카드</span>
            <div className="h-px flex-1 bg-slate-700" />
          </div>
          {startingCards.map(renderCard)}
        </>
      )}

      {/* Epiphany Cards */}
      {epiphanyCards.length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-purple-400">번뜩임 카드</span>
            <div className="h-px flex-1 bg-purple-900/50" />
          </div>
          {epiphanyCards.map(renderCard)}
        </>
      )}
    </div>
  );
}
