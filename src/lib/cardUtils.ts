import type { Card } from "./types";

/**
 * 선택된 바리에이션을 카드에 오버레이하여 반환.
 * variationNumber가 1이거나 undefined면 원본 카드를 그대로 반환.
 * variations 배열이 없거나 해당 번호가 없으면 원본 반환.
 */
export function resolveCardVariation(
  card: Card,
  variationNumber?: number
): Card {
  if (
    !variationNumber ||
    variationNumber === 1 ||
    !card.variations ||
    card.variations.length === 0
  ) {
    return card;
  }

  const variation = card.variations.find(
    (v) => v.variationNumber === variationNumber
  );
  if (!variation) return card;

  return {
    ...card,
    apCost: variation.apCost,
    type: variation.type,
    effects: variation.effects,
    description: variation.description,
    tags: variation.tags,
  };
}
