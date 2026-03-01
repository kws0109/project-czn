"use client";

import { useState, useMemo } from "react";
import type { Character, Card, SynergyRule } from "@/lib/types";
import { useTeamBuilder } from "@/hooks/useTeamBuilder";
import { runBalanceAnalysis } from "@/lib/balance";
import { simulateCombat } from "@/lib/simulator";
import TeamSlot from "@/components/TeamSlot";
import CharacterSelect from "@/components/CharacterSelect";
import DeckBuilder from "@/components/DeckBuilder";
import StatPanel from "@/components/StatPanel";
import SynergyPanel from "@/components/SynergyPanel";
import BalanceAlert from "@/components/BalanceAlert";

import charactersData from "@/data/characters.json";
import cardsData from "@/data/cards.json";
import synergiesData from "@/data/synergies.json";

const characters = charactersData as Character[];
const cards = cardsData as Card[];
const synergies = synergiesData as SynergyRule[];

export default function Home() {
  const team = useTeamBuilder(synergies);
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"deck" | "sim" | "balance">(
    "deck"
  );
  const [simTurns, setSimTurns] = useState(5);
  const [simAp, setSimAp] = useState(3);

  const selectedCharacterIds = team.slots
    .map((s) => s.character?.id)
    .filter((id): id is string => id !== undefined);

  // 밸런스 분석
  const balanceAlerts = useMemo(
    () => runBalanceAnalysis({ characters, cards }),
    []
  );

  // 시뮬레이션
  const simResult = useMemo(
    () =>
      simulateCombat({
        slots: team.slots,
        synergies: team.activeSynergies,
        allCards: cards,
        turns: simTurns,
        apPerTurn: simAp,
      }),
    [team.slots, team.activeSynergies, simTurns, simAp]
  );

  const handleSelectCharacter = (char: Character) => {
    if (selectingSlot !== null) {
      team.setCharacter(selectingSlot, char);
      setSelectingSlot(null);
    }
  };

  const activeSlots = team.slots.filter((s) => s.character !== null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <h2 className="mb-1 text-xl font-semibold">팀 빌더</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          3인 파티를 구성하고, 카드를 선택하여 전투를 시뮬레이션하세요.
        </p>
      </section>

      {/* Team Slots */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {team.slots.map((slot, i) => (
          <TeamSlot
            key={i}
            slot={slot}
            slotIndex={i}
            onSelectCharacter={() => setSelectingSlot(i)}
            onClear={() => team.clearSlot(i)}
          />
        ))}
      </div>

      {/* Synergy Panel */}
      <SynergyPanel
        characters={team.slots.map((s) => s.character)}
        activeSynergies={team.activeSynergies}
        allSynergies={synergies}
      />

      {/* Team Actions */}
      {selectedCharacterIds.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={team.clearAll}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            전체 초기화
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {(
          [
            { key: "deck", label: "덱 구성", count: activeSlots.length > 0 ? activeSlots.reduce((sum, s) => sum + s.selectedCards.length, 0) : undefined },
            { key: "sim", label: "시뮬레이션", count: simResult.totalDamage > 0 ? simResult.dps : undefined },
            { key: "balance", label: "밸런스 분석", count: balanceAlerts.length > 0 ? balanceAlerts.length : undefined },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[var(--color-accent)] font-medium text-white"
                : "text-[var(--color-text-secondary)] hover:text-white"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-[var(--color-bg-primary)] px-1.5 py-0.5 text-xs font-mono">
                {typeof tab.count === "number" && tab.key === "sim"
                  ? tab.count.toLocaleString()
                  : tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "deck" && (
        <div className="space-y-4">
          {activeSlots.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
              캐릭터를 선택하면 덱을 구성할 수 있습니다.
            </p>
          ) : (
            team.slots.map(
              (slot, i) =>
                slot.character && (
                  <DeckBuilder
                    key={slot.character.id}
                    character={slot.character}
                    allCards={cards}
                    selectedCards={slot.selectedCards}
                    onCardsChange={(c) => team.setSelectedCards(i, c)}
                  />
                )
            )
          )}
        </div>
      )}

      {activeTab === "sim" && (
        <div className="space-y-4">
          {/* Simulation Controls */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--color-text-secondary)]">
                시뮬레이션 턴
              </label>
              <input
                type="range"
                min={1}
                max={15}
                value={simTurns}
                onChange={(e) => setSimTurns(Number(e.target.value))}
                className="w-24 accent-[var(--color-accent)]"
              />
              <span className="w-6 text-center font-mono text-sm font-bold">
                {simTurns}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--color-text-secondary)]">
                턴당 AP
              </label>
              <input
                type="range"
                min={1}
                max={6}
                value={simAp}
                onChange={(e) => setSimAp(Number(e.target.value))}
                className="w-24 accent-[var(--color-accent)]"
              />
              <span className="w-6 text-center font-mono text-sm font-bold">
                {simAp}
              </span>
            </div>
            {activeSlots.some((s) => s.selectedCards.length > 0) && (
              <span className="rounded bg-[var(--color-accent)]/20 px-2 py-0.5 text-xs text-[var(--color-accent)]">
                선택된 카드 기반 시뮬레이션
              </span>
            )}
          </div>

          <StatPanel
            slots={team.slots}
            activeSynergies={team.activeSynergies}
            allCards={cards}
          />

          {/* Simulation Results */}
          {simResult.totalDamage > 0 && (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
              <h3 className="mb-3 font-semibold">전투 시뮬레이션 결과</h3>
              <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    총 데미지 ({simResult.turnsSimulated}턴)
                  </div>
                  <div className="font-mono text-2xl font-bold text-amber-400">
                    {simResult.totalDamage.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    턴당 DPS
                  </div>
                  <div className="font-mono text-2xl font-bold text-[var(--color-accent)]">
                    {simResult.dps.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    AP 효율 (데미지/AP)
                  </div>
                  <div className="font-mono text-2xl font-bold text-green-400">
                    {simAp > 0
                      ? Math.round(
                          simResult.dps / simAp
                        ).toLocaleString()
                      : 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-secondary)]">
                    시뮬레이션 설정
                  </div>
                  <div className="font-mono text-lg font-bold text-[var(--color-text-secondary)]">
                    {simResult.turnsSimulated}턴 / AP{simAp}
                  </div>
                </div>
              </div>

              {/* Per-turn damage bar */}
              <div className="space-y-1">
                <div className="text-xs text-[var(--color-text-secondary)]">
                  턴별 데미지
                </div>
                {simResult.damagePerTurn.map((dmg, i) => {
                  const maxDmg = Math.max(...simResult.damagePerTurn);
                  const pct = maxDmg > 0 ? (dmg / maxDmg) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-8 text-xs text-[var(--color-text-secondary)]">
                        T{i + 1}
                      </span>
                      <div className="h-4 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-primary)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-mono text-xs">
                        {dmg.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Character Breakdown */}
              {simResult.breakdown.length > 1 && (
                <div className="mt-4 border-t border-[var(--color-border)] pt-3">
                  <div className="mb-2 text-xs text-[var(--color-text-secondary)]">
                    캐릭터별 기여도
                  </div>
                  <div className="space-y-1">
                    {simResult.breakdown.map((b) => {
                      const char = characters.find(
                        (c) => c.id === b.characterId
                      );
                      return (
                        <div
                          key={b.characterId}
                          className="flex items-center gap-2"
                        >
                          <span className="w-20 truncate text-xs">
                            {char?.nameKo || b.characterId}
                          </span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-primary)]">
                            <div
                              className="h-full rounded-full bg-amber-500 transition-all"
                              style={{ width: `${b.percentage}%` }}
                            />
                          </div>
                          <span className="w-20 text-right font-mono text-xs">
                            {b.damage.toLocaleString()} ({b.percentage}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {simResult.totalDamage === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
              캐릭터를 선택하면 시뮬레이션 결과가 표시됩니다.
            </p>
          )}
        </div>
      )}

      {activeTab === "balance" && (
        <div className="space-y-4">
          <BalanceAlert alerts={balanceAlerts} />
          {balanceAlerts.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
              현재 데이터에서 탐지된 밸런스 이상치가 없습니다.
            </p>
          )}
        </div>
      )}

      {/* Character Select Modal */}
      {selectingSlot !== null && (
        <CharacterSelect
          characters={characters}
          selectedIds={selectedCharacterIds}
          onSelect={handleSelectCharacter}
          onClose={() => setSelectingSlot(null)}
        />
      )}
    </div>
  );
}
