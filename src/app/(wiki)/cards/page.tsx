"use client";

import { useState, useMemo } from "react";
import GameCard from "@/components/wiki/GameCard";
import characterCardsData from "@/data/cards.json";
import neutralCardsData from "@/data/neutral-cards.json";
import charactersData from "@/data/characters.json";

// ── Types ─────────────────────────────────────────

interface NormalizedCard {
  id: string;
  name: string; // Korean name
  apCost: number;
  type: string; // "Attack" | "Skill" | "Upgrade" | "Defense" | "Curse"
  category: "Starting" | "Epiphany" | "Neutral" | "Monster";
  tags: string[]; // Korean tags
  effect: string; // Korean effect description
  imageUrl?: string;
  attribute?: string; // Owner character's attribute (character cards only)
  ownerName?: string; // Owner character's Korean name (character cards only)
}

// ── Build card-to-character lookup ────────────────

interface CharOwnership {
  attribute: string;
  nameKo: string;
}

const cardOwnerMap = new Map<string, CharOwnership>();
for (const char of charactersData) {
  for (const cardId of char.cardIds) {
    cardOwnerMap.set(cardId, {
      attribute: char.attribute,
      nameKo: char.nameKo,
    });
  }
}

// ── Normalize all cards at module level ───────────

function toKebabCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const allCards: NormalizedCard[] = (() => {
  const result: NormalizedCard[] = [];

  // Character cards (200)
  for (const card of characterCardsData) {
    const owner = cardOwnerMap.get(card.id);
    result.push({
      id: card.id,
      name: card.name,
      apCost: card.apCost,
      type: card.type,
      category: card.category as "Starting" | "Epiphany",
      tags: card.tags ?? [],
      effect: card.description ?? "",
      imageUrl: card.imageUrl,
      attribute: owner?.attribute,
      ownerName: owner?.nameKo,
    });
  }

  // Neutral cards (122)
  for (const card of neutralCardsData.cards) {
    result.push({
      id: toKebabCase(card.nameEn),
      name: card.nameKo || card.nameEn,
      apCost: card.apCost ?? 0,
      type: card.type,
      category: card.category === "Monster" ? "Monster" : "Neutral",
      tags: card.tagsKo ?? [],
      effect: card.effectKo || card.effect || "",
      attribute: undefined,
      ownerName: undefined,
    });
  }

  return result;
})();

// ── Filter options ────────────────────────────────

const TYPE_OPTIONS = ["전체", "공격", "스킬", "강화"] as const;
const TYPE_MAP: Record<string, string | null> = {
  전체: null,
  공격: "Attack",
  스킬: "Skill",
  강화: "Upgrade",
};

const CATEGORY_OPTIONS = [
  "전체",
  "기본",
  "고유",
  "중립",
  "몬스터",
] as const;
const CATEGORY_MAP: Record<string, string | null> = {
  전체: null,
  기본: "Starting",
  고유: "Epiphany",
  중립: "Neutral",
  몬스터: "Monster",
};

const AP_OPTIONS = ["전체", "0", "1", "2", "3+"] as const;

// ── Component ─────────────────────────────────────

export default function CardsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("전체");
  const [categoryFilter, setCategoryFilter] = useState<string>("전체");
  const [apFilter, setApFilter] = useState<string>("전체");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return allCards.filter((card) => {
      // Type filter
      const mappedType = TYPE_MAP[typeFilter];
      if (mappedType && card.type !== mappedType) return false;

      // Category filter
      const mappedCategory = CATEGORY_MAP[categoryFilter];
      if (mappedCategory && card.category !== mappedCategory) return false;

      // AP cost filter
      if (apFilter !== "전체") {
        if (apFilter === "3+") {
          if (card.apCost < 3) return false;
        } else {
          if (card.apCost !== Number(apFilter)) return false;
        }
      }

      // Text search by Korean name
      if (search && !card.name.includes(search)) return false;

      return true;
    });
  }, [typeFilter, categoryFilter, apFilter, search]);

  return (
    <div>
      {/* Page title */}
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">
        카드
        <span className="ml-2 text-base font-normal text-[var(--color-text-secondary)]">
          {allCards.length}장 중 {filtered.length}장
        </span>
      </h1>

      {/* ── Filter bar ──────────────────────────── */}
      <div className="mb-6 space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
        {/* Type filter */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            유형
          </span>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setTypeFilter(label)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  typeFilter === label
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            분류
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setCategoryFilter(label)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  categoryFilter === label
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* AP cost filter */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            AP 코스트
          </span>
          <div className="flex flex-wrap gap-2">
            {AP_OPTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setApFilter(label)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  apFilter === label
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            검색
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="카드 이름 검색..."
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none sm:max-w-xs"
          />
        </div>
      </div>

      {/* ── Card grid ───────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-text-secondary)]">
          조건에 맞는 카드가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-2 justify-items-center gap-4 md:grid-cols-3 lg:grid-cols-5">
          {filtered.map((card) => (
            <GameCard
              key={card.id}
              name={card.name}
              apCost={card.apCost}
              type={card.type}
              attribute={card.attribute}
              imageUrl={card.imageUrl}
              effect={card.effect}
              tags={card.tags}
              compact
              href={`/cards/${card.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
