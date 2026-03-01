"use client";

import Image from "next/image";
import type { Character, Card, TeamSlot as TeamSlotType } from "@/lib/types";

const ATTR_COLORS: Record<string, string> = {
  Void: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  Justice: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  Order: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  Instinct: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  Passion: "bg-red-500/20 text-red-300 border-red-500/40",
};

interface TeamSlotProps {
  slot: TeamSlotType;
  slotIndex: number;
  onSelectCharacter: () => void;
  onClear: () => void;
}

export default function TeamSlot({
  slot,
  slotIndex,
  onSelectCharacter,
  onClear,
}: TeamSlotProps) {
  const { character } = slot;

  if (!character) {
    return (
      <button
        onClick={onSelectCharacter}
        className="flex h-56 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)]"
      >
        <span className="text-3xl opacity-40">+</span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          슬롯 {slotIndex + 1} - 캐릭터 선택
        </span>
      </button>
    );
  }

  const attrStyle = ATTR_COLORS[character.attribute] || "";

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
      <div className="mb-3 flex items-start gap-3">
        {/* Character Portrait */}
        {character.imageUrl ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={character.imageUrl}
              alt={character.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${attrStyle}`}>
            {character.nameKo.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{character.nameKo}</h3>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {character.name}
            </span>
            <span className="text-xs text-yellow-400">
              {"★".repeat(character.rarity)}
            </span>
          </div>
          <div className="mt-1 flex gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-xs ${attrStyle}`}
            >
              {character.attribute}
            </span>
            <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
              {character.class}
            </span>
            <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
              {character.faction}
            </span>
          </div>
        </div>

        <button
          onClick={onClear}
          className="shrink-0 text-xs text-[var(--color-text-secondary)] transition-colors hover:text-red-400"
        >
          제거
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <StatItem label="ATK" value={character.stats.attack.max} color="text-red-400" />
        <StatItem label="DEF" value={character.stats.defense.max} color="text-blue-400" />
        <StatItem label="HP" value={character.stats.health.max} color="text-green-400" />
        <StatItem label="Crit%" value={`${character.stats.critChance}%`} color="text-yellow-400" />
        <StatItem label="CritDMG" value={`${150 + character.stats.critDamage}%`} color="text-orange-400" />
        <StatItem label="Cards" value={character.cardIds.length} color="text-purple-400" />
      </div>

      {/* Selected Cards Count */}
      {slot.selectedCards.length > 0 && (
        <div className="mt-2 text-xs text-[var(--color-text-secondary)]">
          선택된 카드: {slot.selectedCards.length}장
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded bg-[var(--color-bg-primary)] px-2 py-1">
      <div className="text-[var(--color-text-secondary)]">{label}</div>
      <div className={`font-mono font-semibold ${color}`}>{value}</div>
    </div>
  );
}
