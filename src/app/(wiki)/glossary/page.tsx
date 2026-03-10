"use client";

import { useState } from "react";
import glossary from "@/data/glossary.json";

type TabId = "statusEffects" | "mechanics" | "cardKeywords";

interface TabConfig {
  id: TabId;
  label: string;
}

const tabs: TabConfig[] = [
  { id: "statusEffects", label: "상태 효과" },
  { id: "mechanics", label: "메커니즘" },
  { id: "cardKeywords", label: "카드 키워드" },
];

interface StatusEffect {
  ko: string;
  type: string;
  stacking: boolean;
  duration: string;
  valuePerStack: string;
  trigger?: string;
  maxStacks?: number;
  desc: string;
  descEn: string;
}

interface SimpleEntry {
  ko: string;
  desc: string;
}

function StatusEffectRow({
  name,
  effect,
}: {
  name: string;
  effect: StatusEffect;
}) {
  const [expanded, setExpanded] = useState(false);
  const isBuff = effect.type === "buff";
  const borderColor = isBuff
    ? "border-l-[var(--color-instinct)]"
    : "border-l-[var(--color-passion)]";

  return (
    <div
      className={`border-l-3 ${borderColor} rounded-r-lg bg-[var(--color-bg-secondary)] transition-colors`}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <span className="font-medium text-[var(--color-text-primary)]">
            {effect.ko}
          </span>
          <span className="ml-2 text-sm text-[var(--color-text-secondary)]">
            ({name})
          </span>
          <span className="ml-3 text-sm text-[var(--color-text-secondary)]">
            &mdash; {effect.valuePerStack}
          </span>
        </div>
        <span
          className={`ml-2 text-xs text-[var(--color-text-secondary)] transition-transform ${
            expanded ? "rotate-90" : ""
          }`}
        >
          &#9654;
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-[var(--color-text-secondary)]">중첩</dt>
            <dd className="text-[var(--color-text-primary)]">
              {effect.stacking ? "가능" : "불가"}
              {effect.maxStacks != null && ` (최대 ${effect.maxStacks})`}
            </dd>

            <dt className="text-[var(--color-text-secondary)]">지속</dt>
            <dd className="text-[var(--color-text-primary)]">
              {effect.duration}
            </dd>

            {effect.trigger && (
              <>
                <dt className="text-[var(--color-text-secondary)]">발동</dt>
                <dd className="text-[var(--color-text-primary)]">
                  {effect.trigger}
                </dd>
              </>
            )}

            <dt className="text-[var(--color-text-secondary)]">설명</dt>
            <dd className="text-[var(--color-text-primary)]">{effect.desc}</dd>

            <dt className="text-[var(--color-text-secondary)]">EN</dt>
            <dd className="text-[var(--color-text-secondary)]">
              {effect.descEn}
            </dd>
          </dl>
        </div>
      )}
    </div>
  );
}

function SimpleEntryRow({ name, entry }: { name: string; entry: SimpleEntry }) {
  return (
    <div className="rounded-lg bg-[var(--color-bg-secondary)] px-4 py-3">
      <span className="font-medium text-[var(--color-text-primary)]">
        {entry.ko}
      </span>
      <span className="ml-2 text-sm text-[var(--color-text-secondary)]">
        ({name})
      </span>
      <span className="ml-3 text-sm text-[var(--color-text-secondary)]">
        &mdash; {entry.desc}
      </span>
    </div>
  );
}

export default function GlossaryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("statusEffects");

  const statusEntries = Object.entries(glossary.statusEffects) as [
    string,
    StatusEffect,
  ][];
  const buffs = statusEntries.filter(([, e]) => e.type === "buff");
  const debuffs = statusEntries.filter(([, e]) => e.type === "debuff");

  const mechanicsEntries = [
    ...(Object.entries(glossary.mechanics) as [string, SimpleEntry][]),
    ...(Object.entries(glossary.coreActions) as [string, SimpleEntry][]),
  ];
  const cardKeywordEntries = Object.entries(glossary.cardKeywords) as [
    string,
    SimpleEntry,
  ][];

  return (
    <div>
      {/* Page title */}
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">
        용어집
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Effects tab */}
      {activeTab === "statusEffects" && (
        <div className="space-y-6">
          {/* Buffs */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[var(--color-instinct)]">
              버프 ({buffs.length})
            </h2>
            <div className="space-y-2">
              {buffs.map(([name, effect]) => (
                <StatusEffectRow key={name} name={name} effect={effect} />
              ))}
            </div>
          </section>

          {/* Debuffs */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[var(--color-passion)]">
              디버프 ({debuffs.length})
            </h2>
            <div className="space-y-2">
              {debuffs.map(([name, effect]) => (
                <StatusEffectRow key={name} name={name} effect={effect} />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Mechanics tab */}
      {activeTab === "mechanics" && (
        <div className="space-y-2">
          {mechanicsEntries.map(([name, entry]) => (
            <SimpleEntryRow key={name} name={name} entry={entry} />
          ))}
        </div>
      )}

      {/* Card Keywords tab */}
      {activeTab === "cardKeywords" && (
        <div className="space-y-2">
          {cardKeywordEntries.map(([name, entry]) => (
            <SimpleEntryRow key={name} name={name} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
