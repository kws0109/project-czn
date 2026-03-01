import type { Character, Card, CardEffect, SynergyRule } from "./types";

// CZN 실제 데미지 공식 (prydwen.gg 기반)
// ATK-Based: Final Card Multiplier × Final ATK × 0.35 × modifiers
// DEF-Based: Final Card Multiplier × ((Final ATK × 0.3) + (Final DEF × 2.1)) × 0.35 × modifiers

const ATK_COEFFICIENT = 0.35;
const DEF_ATK_RATIO = 0.3;
const DEF_DEF_RATIO = 2.1;
const BASE_CRIT_DAMAGE = 150; // 기본 치명타 데미지 150%

export interface DamageCalcInput {
  character: Character;
  card: Card;
  synergies: SynergyRule[];
  targetDefMultiplier?: number; // 적 방어 감쇄 (기본 1.0)
}

export interface DamageCalcResult {
  totalDamage: number;
  perHitDamage: number;
  hits: number;
  isCrit: boolean;
  isDefBased: boolean;
}

function getBuffedStats(character: Character, synergies: SynergyRule[]) {
  let attack = character.stats.attack.max;
  let defense = character.stats.defense.max;
  let critChance = character.stats.critChance;
  let critDamage = character.stats.critDamage;

  for (const syn of synergies) {
    const pct = syn.bonus.value / 100;
    switch (syn.bonus.stat) {
      case "attack":
        attack = Math.round(attack * (1 + pct));
        break;
      case "defense":
        defense = Math.round(defense * (1 + pct));
        break;
      case "critChance":
        critChance += syn.bonus.value;
        break;
      case "critDamage":
        critDamage += syn.bonus.value;
        break;
    }
  }

  return { attack, defense, critChance: Math.min(critChance, 100), critDamage };
}

export function calculateCardDamage(input: DamageCalcInput): DamageCalcResult {
  const { character, card, synergies, targetDefMultiplier = 1.0 } = input;
  const stats = getBuffedStats(character, synergies);
  const isDefBased = character.traits?.includes("defBasedDamage") ?? false;

  let totalDamage = 0;
  let totalHits = 0;

  for (const effect of card.effects) {
    if (effect.type !== "damage") continue;

    const multiplier = effect.value / 100;
    const hits = effect.hits || 1;

    let baseDamage: number;
    if (isDefBased) {
      baseDamage =
        multiplier *
        (stats.attack * DEF_ATK_RATIO + stats.defense * DEF_DEF_RATIO) *
        ATK_COEFFICIENT;
    } else {
      baseDamage = multiplier * stats.attack * ATK_COEFFICIENT;
    }

    // 치명타 기대값 적용 (기본 150% + 보너스)
    const totalCritDmg = (BASE_CRIT_DAMAGE + stats.critDamage) / 100;
    const critMultiplier =
      1 + (stats.critChance / 100) * (totalCritDmg - 1);
    const damagePerHit = baseDamage * critMultiplier * targetDefMultiplier;

    totalDamage += damagePerHit * hits;
    totalHits += hits;
  }

  return {
    totalDamage: Math.round(totalDamage),
    perHitDamage: totalHits > 0 ? Math.round(totalDamage / totalHits) : 0,
    hits: totalHits,
    isCrit: false, // 기대값 계산이므로 false
    isDefBased,
  };
}

export function calculateCharacterDps(
  character: Character,
  cards: Card[],
  synergies: SynergyRule[]
): number {
  let totalDamage = 0;
  let totalAp = 0;

  for (const card of cards) {
    const hasDamage = card.effects.some((e) => e.type === "damage");
    if (!hasDamage) continue;

    const result = calculateCardDamage({ character, card, synergies });
    totalDamage += result.totalDamage;
    totalAp += card.apCost || 1; // 0 AP 카드는 1로 취급
  }

  return totalAp > 0 ? Math.round(totalDamage / totalAp) : 0;
}
