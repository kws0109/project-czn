"use client";

import type { Card, Character } from "@/lib/types";
import CardList from "./CardList";

interface DeckBuilderProps {
  character: Character;
  allCards: Card[];
  selectedCards: Card[];
  onCardsChange: (cards: Card[]) => void;
  selectedVariations?: Record<string, number>;
  onVariationChange?: (cardId: string, variationNumber: number) => void;
}

export default function DeckBuilder({
  character,
  allCards,
  selectedCards,
  onCardsChange,
  selectedVariations = {},
  onVariationChange,
}: DeckBuilderProps) {
  const characterCards = character.cardIds
    .map((id) => allCards.find((c) => c.id === id))
    .filter((c): c is Card => c !== undefined);

  const handleToggle = (card: Card) => {
    const isSelected = selectedCards.some((c) => c.id === card.id);
    if (isSelected) {
      onCardsChange(selectedCards.filter((c) => c.id !== card.id));
    } else {
      onCardsChange([...selectedCards, card]);
    }
  };

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
      <div className="mb-3 flex items-center gap-2">
        {character.imageUrl && (
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.imageUrl}
              alt={character.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h3 className="text-sm font-semibold">
          {character.nameKo} 덱 구성
        </h3>
      </div>
      <CardList
        cards={characterCards}
        selectedIds={selectedCards.map((c) => c.id)}
        onToggleCard={handleToggle}
        maxCards={characterCards.length}
        selectedVariations={selectedVariations}
        onVariationChange={onVariationChange}
      />
    </div>
  );
}
