"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  Character,
  Card,
  Partner,
  TeamSlot,
  SynergyRule,
} from "@/lib/types";

const emptySlot: TeamSlot = {
  character: null,
  selectedCards: [],
  partner: null,
  selectedVariations: {},
};

export function useTeamBuilder(synergies: SynergyRule[]) {
  const [slots, setSlots] = useState<[TeamSlot, TeamSlot, TeamSlot]>([
    { ...emptySlot },
    { ...emptySlot },
    { ...emptySlot },
  ]);

  const setCharacter = useCallback(
    (slotIndex: number, character: Character | null) => {
      setSlots((prev) => {
        const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
        next[slotIndex] = {
          ...next[slotIndex],
          character,
          selectedCards: [], // 캐릭터 변경 시 카드 초기화
          selectedVariations: {}, // 바리에이션도 초기화
        };
        return next;
      });
    },
    []
  );

  const setSelectedCards = useCallback(
    (slotIndex: number, cards: Card[]) => {
      setSlots((prev) => {
        const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
        next[slotIndex] = { ...next[slotIndex], selectedCards: cards };
        return next;
      });
    },
    []
  );

  const setPartner = useCallback(
    (slotIndex: number, partner: Partner | null) => {
      setSlots((prev) => {
        const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
        next[slotIndex] = { ...next[slotIndex], partner };
        return next;
      });
    },
    []
  );

  const setVariation = useCallback(
    (slotIndex: number, cardId: string, variationNumber: number) => {
      setSlots((prev) => {
        const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
        next[slotIndex] = {
          ...next[slotIndex],
          selectedVariations: {
            ...next[slotIndex].selectedVariations,
            [cardId]: variationNumber,
          },
        };
        return next;
      });
    },
    []
  );

  const clearSlot = useCallback((slotIndex: number) => {
    setSlots((prev) => {
      const next = [...prev] as [TeamSlot, TeamSlot, TeamSlot];
      next[slotIndex] = { ...emptySlot };
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSlots([{ ...emptySlot }, { ...emptySlot }, { ...emptySlot }]);
  }, []);

  // 현재 팀에서 활성화된 시너지 계산
  const activeSynergies = useMemo(() => {
    const characters = slots
      .map((s) => s.character)
      .filter((c): c is Character => c !== null);

    if (characters.length < 2) return [];

    return synergies.filter((syn) => {
      const matchCount = characters.filter((c) => {
        switch (syn.type) {
          case "attribute":
            return c.attribute === syn.required.value;
          case "class":
            return c.class === syn.required.value;
          case "faction":
            return c.faction === syn.required.value;
          default:
            return false;
        }
      }).length;
      return matchCount >= syn.required.count;
    });
  }, [slots, synergies]);

  return {
    slots,
    setCharacter,
    setSelectedCards,
    setPartner,
    setVariation,
    clearSlot,
    clearAll,
    activeSynergies,
  };
}
