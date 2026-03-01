"use client";

import type { TeamSlot, SynergyRule, Card, Character } from "@/lib/types";

interface StatPanelProps {
  slots: [TeamSlot, TeamSlot, TeamSlot];
  activeSynergies: SynergyRule[];
  allCards: Card[];
}

interface ComputedStat {
  characterName: string;
  attack: number;
  defense: number;
  health: number;
  critChance: number;
  critDamage: number;
  estimatedDps: number;
}

function computeCharacterStats(
  slot: TeamSlot,
  synergies: SynergyRule[],
  allCards: Card[]
): ComputedStat | null {
  const { character, selectedCards } = slot;
  if (!character) return null;

  let attack = character.stats.attack.max;
  let defense = character.stats.defense.max;
  let health = character.stats.health.max;
  let critChance = character.stats.critChance;
  let critDamage = character.stats.critDamage;

  // 시너지 보너스 적용
  for (const syn of synergies) {
    const bonus = syn.bonus;
    const pct = bonus.value / 100;
    switch (bonus.stat) {
      case "attack":
        attack = Math.round(attack * (1 + pct));
        break;
      case "defense":
        defense = Math.round(defense * (1 + pct));
        break;
      case "health":
        health = Math.round(health * (1 + pct));
        break;
      case "critChance":
        critChance += bonus.value;
        break;
      case "critDamage":
        critDamage += bonus.value;
        break;
    }
  }

  // 선택된 카드의 버프 효과 적용 (1턴 기준)
  const cards =
    selectedCards.length > 0
      ? selectedCards
      : character.cardIds
          .map((id) => allCards.find((c) => c.id === id))
          .filter((c): c is Card => c !== undefined);

  for (const card of cards) {
    for (const eff of card.effects) {
      if (eff.type === "buff" && eff.target === "self") {
        const pct = eff.value / 100;
        switch (eff.stat) {
          case "attack":
            attack = Math.round(attack * (1 + pct));
            break;
          case "defense":
            defense = Math.round(defense * (1 + pct));
            break;
          case "critChance":
            critChance += eff.value;
            break;
          case "critDamage":
            critDamage += eff.value;
            break;
        }
      }
    }
  }

  // 간이 DPS 계산: 모든 공격 카드의 데미지 합산 / AP 합산
  let totalDamage = 0;
  let totalAp = 0;
  for (const card of cards) {
    for (const eff of card.effects) {
      if (eff.type === "damage") {
        const rawDmg = (attack * eff.value) / 100;
        const hits = eff.hits || 1;
        const totalCritDmg = (150 + critDamage) / 100; // 기본 150% + 보너스
        const critMultiplier =
          1 + (critChance / 100) * (totalCritDmg - 1);
        totalDamage += rawDmg * hits * critMultiplier;
        totalAp += card.apCost;
      }
    }
  }

  const estimatedDps = totalAp > 0 ? Math.round(totalDamage / totalAp) : 0;

  return {
    characterName: character.nameKo,
    attack,
    defense,
    health,
    critChance: Math.min(critChance, 100),
    critDamage,
    estimatedDps,
  };
}

export default function StatPanel({
  slots,
  activeSynergies,
  allCards,
}: StatPanelProps) {
  const stats = slots.map((slot) =>
    computeCharacterStats(slot, activeSynergies, allCards)
  );
  const hasAny = stats.some((s) => s !== null);

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
      <h3 className="mb-3 font-semibold">스탯 계산 결과</h3>

      {!hasAny && (
        <p className="text-sm text-[var(--color-text-secondary)]">
          캐릭터를 선택하면 계산된 스탯이 표시됩니다.
        </p>
      )}

      {hasAny && (
        <div className="space-y-4">
          {/* Synergies */}
          {activeSynergies.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-medium text-[var(--color-accent)]">
                활성 시너지
              </h4>
              <div className="flex flex-wrap gap-1">
                {activeSynergies.map((syn) => (
                  <span
                    key={syn.id}
                    className="rounded-full bg-[var(--color-accent)]/20 px-2 py-0.5 text-xs text-[var(--color-accent)]"
                  >
                    {syn.nameKo} (+{syn.bonus.value}% {syn.bonus.stat})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Per-character stats */}
          <div className="grid gap-3 md:grid-cols-3">
            {stats.map(
              (stat, i) =>
                stat && (
                  <div
                    key={i}
                    className="rounded-lg bg-[var(--color-bg-primary)] p-3"
                  >
                    <h4 className="mb-2 text-sm font-medium">
                      {stat.characterName}
                    </h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div>
                        <span className="text-[var(--color-text-secondary)]">
                          ATK{" "}
                        </span>
                        <span className="font-mono text-red-400">
                          {stat.attack}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-secondary)]">
                          DEF{" "}
                        </span>
                        <span className="font-mono text-blue-400">
                          {stat.defense}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-secondary)]">
                          HP{" "}
                        </span>
                        <span className="font-mono text-green-400">
                          {stat.health}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-secondary)]">
                          Crit{" "}
                        </span>
                        <span className="font-mono text-yellow-400">
                          {stat.critChance}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 border-t border-[var(--color-border)] pt-2">
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        예상 DPS (AP당)
                      </div>
                      <div className="font-mono text-lg font-bold text-amber-400">
                        {stat.estimatedDps.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>

          {/* Team Total */}
          {stats.filter((s) => s !== null).length > 1 && (
            <div className="border-t border-[var(--color-border)] pt-3">
              <div className="text-xs text-[var(--color-text-secondary)]">
                팀 총 예상 DPS
              </div>
              <div className="font-mono text-2xl font-bold text-[var(--color-accent)]">
                {stats
                  .filter((s): s is ComputedStat => s !== null)
                  .reduce((sum, s) => sum + s.estimatedDps, 0)
                  .toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
