"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type {
  Character,
  Attribute,
  CharacterClass,
  Faction,
} from "@/lib/types";

const ATTRIBUTES: Attribute[] = [
  "Void",
  "Justice",
  "Order",
  "Instinct",
  "Passion",
];
const CLASSES: CharacterClass[] = [
  "Hunter",
  "Striker",
  "Vanguard",
  "Ranger",
  "Controller",
  "Psionic",
];

const ATTR_BADGE: Record<string, string> = {
  Void: "bg-purple-500/30 text-purple-300",
  Justice: "bg-amber-500/30 text-amber-300",
  Order: "bg-blue-500/30 text-blue-300",
  Instinct: "bg-emerald-500/30 text-emerald-300",
  Passion: "bg-red-500/30 text-red-300",
};

const ATTR_AVATAR: Record<string, string> = {
  Void: "bg-purple-600 text-purple-100",
  Justice: "bg-amber-600 text-amber-100",
  Order: "bg-blue-600 text-blue-100",
  Instinct: "bg-emerald-600 text-emerald-100",
  Passion: "bg-red-600 text-red-100",
};

type SortKey = "name" | "rarity" | "attack" | "health";

interface CharacterSelectProps {
  characters: Character[];
  selectedIds: string[];
  onSelect: (character: Character) => void;
  onClose: () => void;
}

export default function CharacterSelect({
  characters,
  selectedIds,
  onSelect,
  onClose,
}: CharacterSelectProps) {
  const [filterAttr, setFilterAttr] = useState<Attribute | "all">("all");
  const [filterClass, setFilterClass] = useState<CharacterClass | "all">(
    "all"
  );
  const [filterRarity, setFilterRarity] = useState<5 | 4 | 0>(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("rarity");

  // 진영 목록을 데이터에서 동적으로 추출
  const factions = useMemo(() => {
    const set = new Set(characters.map((c) => c.faction));
    return Array.from(set).sort();
  }, [characters]);
  const [filterFaction, setFilterFaction] = useState<string>("all");

  const filtered = useMemo(() => {
    const list = characters.filter((c) => {
      if (filterAttr !== "all" && c.attribute !== filterAttr) return false;
      if (filterClass !== "all" && c.class !== filterClass) return false;
      if (filterRarity !== 0 && c.rarity !== filterRarity) return false;
      if (filterFaction !== "all" && c.faction !== filterFaction) return false;
      if (
        search &&
        !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.nameKo.includes(search)
      )
        return false;
      return true;
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case "rarity":
          return b.rarity - a.rarity || a.name.localeCompare(b.name);
        case "attack":
          return b.stats.attack.max - a.stats.attack.max;
        case "health":
          return b.stats.health.max - a.stats.health.max;
        case "name":
          return a.nameKo.localeCompare(b.nameKo, "ko");
        default:
          return 0;
      }
    });

    return list;
  }, [characters, filterAttr, filterClass, filterRarity, filterFaction, search, sortBy]);

  const activeFilterCount = [
    filterAttr !== "all",
    filterClass !== "all",
    filterRarity !== 0,
    filterFaction !== "all",
  ].filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-2xl flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-2xl" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">캐릭터 선택</h3>
            <span className="rounded-full bg-[var(--color-bg-primary)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
              {filtered.length}명
              {activeFilterCount > 0 && ` (필터 ${activeFilterCount}개)`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-primary)] hover:text-white"
          >
            닫기
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex gap-2 px-4 pt-3">
          <input
            type="text"
            placeholder="이름 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-2 text-xs text-[var(--color-text-secondary)] outline-none"
          >
            <option value="rarity">레어리티순</option>
            <option value="attack">ATK순</option>
            <option value="health">HP순</option>
            <option value="name">이름순</option>
          </select>
        </div>

        {/* Filters */}
        <div className="space-y-2 px-4 py-3">
          {/* Rarity */}
          <div className="flex items-center gap-1">
            <span className="w-10 text-xs text-[var(--color-text-secondary)]">등급</span>
            <FilterButton active={filterRarity === 0} onClick={() => setFilterRarity(0)}>
              전체
            </FilterButton>
            <FilterButton active={filterRarity === 5} onClick={() => setFilterRarity(5)}>
              ★5
            </FilterButton>
            <FilterButton active={filterRarity === 4} onClick={() => setFilterRarity(4)}>
              ★4
            </FilterButton>
          </div>

          {/* Attribute */}
          <div className="flex items-center gap-1">
            <span className="w-10 text-xs text-[var(--color-text-secondary)]">속성</span>
            <FilterButton
              active={filterAttr === "all"}
              onClick={() => setFilterAttr("all")}
            >
              전체
            </FilterButton>
            {ATTRIBUTES.map((a) => (
              <FilterButton
                key={a}
                active={filterAttr === a}
                onClick={() => setFilterAttr(a)}
              >
                {a}
              </FilterButton>
            ))}
          </div>

          {/* Class */}
          <div className="flex items-center gap-1">
            <span className="w-10 text-xs text-[var(--color-text-secondary)]">클래스</span>
            <FilterButton
              active={filterClass === "all"}
              onClick={() => setFilterClass("all")}
            >
              전체
            </FilterButton>
            {CLASSES.map((c) => (
              <FilterButton
                key={c}
                active={filterClass === c}
                onClick={() => setFilterClass(c)}
              >
                {c}
              </FilterButton>
            ))}
          </div>

          {/* Faction */}
          {factions.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="w-10 text-xs text-[var(--color-text-secondary)]">진영</span>
              <FilterButton
                active={filterFaction === "all"}
                onClick={() => setFilterFaction("all")}
              >
                전체
              </FilterButton>
              {factions.map((f) => (
                <FilterButton
                  key={f}
                  active={filterFaction === f}
                  onClick={() => setFilterFaction(f)}
                >
                  {f}
                </FilterButton>
              ))}
            </div>
          )}
        </div>

        {/* Character List */}
        <div className="flex-1 space-y-1.5 overflow-y-auto px-4 pb-4">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
              조건에 맞는 캐릭터가 없습니다.
            </p>
          )}
          {filtered.map((char) => {
            const isSelected = selectedIds.includes(char.id);
            return (
              <button
                key={char.id}
                disabled={isSelected}
                onClick={() => onSelect(char)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? "cursor-not-allowed border-[var(--color-border)] opacity-40"
                    : "border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)]"
                }`}
              >
                {/* Avatar */}
                {char.imageUrl ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={char.imageUrl}
                      alt={char.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${ATTR_AVATAR[char.attribute] || "bg-gray-600 text-gray-200"}`}
                  >
                    {char.nameKo.charAt(0)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">
                      {char.nameKo}
                    </span>
                    <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                      {char.name}
                    </span>
                    <span className="shrink-0 text-xs text-yellow-400">
                      {"★".repeat(char.rarity)}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs ${ATTR_BADGE[char.attribute] || ""}`}
                    >
                      {char.attribute}
                    </span>
                    <span className="rounded bg-[var(--color-bg-primary)] px-1.5 py-0.5 text-xs text-[var(--color-text-secondary)]">
                      {char.class}
                    </span>
                    <span className="rounded bg-[var(--color-bg-primary)] px-1.5 py-0.5 text-xs text-[var(--color-text-secondary)]">
                      {char.faction}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="shrink-0 text-right text-xs">
                  <div>
                    <span className="text-[var(--color-text-secondary)]">ATK </span>
                    <span className="font-mono text-red-400">{char.stats.attack.max}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-secondary)]">DEF </span>
                    <span className="font-mono text-blue-400">{char.stats.defense.max}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-secondary)]">HP </span>
                    <span className="font-mono text-green-400">{char.stats.health.max}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
        active
          ? "bg-[var(--color-accent)] text-white"
          : "bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
