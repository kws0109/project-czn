"use client";

import type { Character, SynergyRule } from "@/lib/types";

const SYNERGY_TYPE_ICONS: Record<string, string> = {
  attribute: "속성",
  class: "클래스",
  faction: "진영",
};

const SYNERGY_TYPE_COLORS: Record<string, string> = {
  attribute: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  class: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  faction: "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

const ATTR_DOT: Record<string, string> = {
  Void: "bg-purple-400",
  Justice: "bg-amber-400",
  Order: "bg-blue-400",
  Instinct: "bg-emerald-400",
  Passion: "bg-red-400",
};

interface SynergyPanelProps {
  characters: (Character | null)[];
  activeSynergies: SynergyRule[];
  allSynergies: SynergyRule[];
}

export default function SynergyPanel({
  characters,
  activeSynergies,
  allSynergies,
}: SynergyPanelProps) {
  const activeChars = characters.filter(
    (c): c is Character => c !== null
  );

  if (activeChars.length === 0) return null;

  // 잠재 시너지 (1명만 충족, 1명 더 필요)
  const potentialSynergies = allSynergies.filter((syn) => {
    if (activeSynergies.some((a) => a.id === syn.id)) return false;
    const matchCount = activeChars.filter((c) => {
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
    return matchCount === syn.required.count - 1 && activeChars.length < 3;
  });

  // 속성/클래스/진영 구성 요약
  const attrCounts: Record<string, number> = {};
  const classCounts: Record<string, number> = {};
  const factionCounts: Record<string, number> = {};
  for (const c of activeChars) {
    attrCounts[c.attribute] = (attrCounts[c.attribute] || 0) + 1;
    classCounts[c.class] = (classCounts[c.class] || 0) + 1;
    factionCounts[c.faction] = (factionCounts[c.faction] || 0) + 1;
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
      <h3 className="mb-3 text-sm font-semibold">팀 구성 분석</h3>

      {/* Composition Summary */}
      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--color-text-secondary)]">속성:</span>
          {Object.entries(attrCounts).map(([attr, count]) => (
            <span key={attr} className="flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${ATTR_DOT[attr] || "bg-gray-400"}`} />
              <span>{attr}</span>
              {count > 1 && (
                <span className="font-bold text-white">×{count}</span>
              )}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--color-text-secondary)]">클래스:</span>
          {Object.entries(classCounts).map(([cls, count]) => (
            <span key={cls}>
              {cls}
              {count > 1 && (
                <span className="font-bold text-white"> ×{count}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Active Synergies */}
      {activeSynergies.length > 0 && (
        <div className="mb-3">
          <div className="mb-1.5 text-xs font-medium text-green-400">
            활성 시너지
          </div>
          <div className="space-y-1.5">
            {activeSynergies.map((syn) => (
              <div
                key={syn.id}
                className={`flex items-center justify-between rounded-lg border p-2 ${SYNERGY_TYPE_COLORS[syn.type] || ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-black/20 px-1.5 py-0.5 text-xs font-medium">
                    {SYNERGY_TYPE_ICONS[syn.type]}
                  </span>
                  <span className="text-sm font-medium">{syn.nameKo}</span>
                </div>
                <span className="text-xs opacity-80">
                  +{syn.bonus.value}% {syn.bonus.stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Potential Synergies */}
      {potentialSynergies.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
            잠재 시너지 (1명 더 필요)
          </div>
          <div className="space-y-1">
            {potentialSynergies.map((syn) => (
              <div
                key={syn.id}
                className="flex items-center justify-between rounded-lg border border-dashed border-[var(--color-border)] p-2 opacity-60"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[var(--color-bg-primary)] px-1.5 py-0.5 text-xs">
                    {SYNERGY_TYPE_ICONS[syn.type]}
                  </span>
                  <span className="text-sm">{syn.nameKo}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    ({syn.required.value} +1)
                  </span>
                </div>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  +{syn.bonus.value}% {syn.bonus.stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSynergies.length === 0 && potentialSynergies.length === 0 && (
        <p className="text-xs text-[var(--color-text-secondary)]">
          같은 속성/클래스/진영의 캐릭터를 2명 이상 배치하면 시너지가 활성화됩니다.
        </p>
      )}
    </div>
  );
}
