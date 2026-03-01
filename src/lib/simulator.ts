import type {
  Character,
  Card,
  TeamSlot,
  SynergyRule,
  SimulationResult,
  TurnAction,
} from "./types";
import { calculateCardDamage } from "./calculator";

interface SimulationInput {
  slots: TeamSlot[];
  synergies: SynergyRule[];
  allCards: Card[];
  turns: number;
  apPerTurn: number;
}

// 간이 턴 시뮬레이터: 각 턴마다 선택된 카드를 AP 예산 내에서 사용
export function simulateCombat(input: SimulationInput): SimulationResult {
  const { slots, synergies, allCards, turns = 5, apPerTurn = 3 } = input;

  const activeSlots = slots.filter(
    (s): s is TeamSlot & { character: Character } => s.character !== null
  );

  if (activeSlots.length === 0) {
    return {
      totalDamage: 0,
      damagePerTurn: [],
      turnsSimulated: 0,
      dps: 0,
      breakdown: [],
    };
  }

  const damagePerTurn: number[] = [];
  const characterDamage: Record<string, number> = {};

  for (const slot of activeSlots) {
    characterDamage[slot.character.id] = 0;
  }

  for (let turn = 0; turn < turns; turn++) {
    let turnDamage = 0;

    for (const slot of activeSlots) {
      const { character, selectedCards } = slot;
      const cards =
        selectedCards.length > 0
          ? selectedCards
          : character.cardIds
              .map((id) => allCards.find((c) => c.id === id))
              .filter((c): c is Card => c !== undefined);

      // AP 예산 내에서 카드 사용 (그리디: AP 효율 높은 순)
      const attackCards = cards
        .filter((c) => c.effects.some((e) => e.type === "damage"))
        .map((c) => {
          const result = calculateCardDamage({
            character,
            card: c,
            synergies,
          });
          return { card: c, damage: result.totalDamage };
        })
        .sort((a, b) => {
          const effA = a.damage / (a.card.apCost || 1);
          const effB = b.damage / (b.card.apCost || 1);
          return effB - effA;
        });

      let remainingAp = apPerTurn;

      for (const { card, damage } of attackCards) {
        const cost = card.apCost || 1;
        if (cost <= remainingAp) {
          turnDamage += damage;
          characterDamage[character.id] += damage;
          remainingAp -= cost;
        }
      }
    }

    damagePerTurn.push(Math.round(turnDamage));
  }

  const totalDamage = damagePerTurn.reduce((a, b) => a + b, 0);

  const breakdown = activeSlots.map((slot) => ({
    characterId: slot.character.id,
    damage: Math.round(characterDamage[slot.character.id]),
    percentage:
      totalDamage > 0
        ? Math.round((characterDamage[slot.character.id] / totalDamage) * 100)
        : 0,
  }));

  return {
    totalDamage,
    damagePerTurn,
    turnsSimulated: turns,
    dps: turns > 0 ? Math.round(totalDamage / turns) : 0,
    breakdown,
  };
}
