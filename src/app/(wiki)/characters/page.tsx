"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import characters from "@/data/characters.json";
import type { Attribute, CharacterClass } from "@/lib/types";

// ── Filter options ──────────────────────────────

const attributes: Attribute[] = [
  "Void",
  "Justice",
  "Order",
  "Instinct",
  "Passion",
];

const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  Void: "공허",
  Justice: "정의",
  Order: "질서",
  Instinct: "본능",
  Passion: "열정",
};

const classes: CharacterClass[] = [
  "Hunter",
  "Striker",
  "Vanguard",
  "Ranger",
  "Controller",
  "Psionic",
];

const CLASS_LABELS: Record<CharacterClass, string> = {
  Hunter: "헌터",
  Striker: "스트라이커",
  Vanguard: "뱅가드",
  Ranger: "레인저",
  Controller: "컨트롤러",
  Psionic: "사이오닉",
};

const attributeColorVar: Record<Attribute, string> = {
  Void: "var(--color-void)",
  Justice: "var(--color-justice)",
  Order: "var(--color-order)",
  Instinct: "var(--color-instinct)",
  Passion: "var(--color-passion)",
};

const attributeBgClass: Record<Attribute, string> = {
  Void: "bg-attr-void",
  Justice: "bg-attr-justice",
  Order: "bg-attr-order",
  Instinct: "bg-attr-instinct",
  Passion: "bg-attr-passion",
};

const ATTRIBUTE_ICONS: Record<Attribute, string> = {
  Void: "/icons/attr-void.webp",
  Justice: "/icons/attr-justice.webp",
  Order: "/icons/attr-order.webp",
  Instinct: "/icons/attr-instinct.webp",
  Passion: "/icons/attr-passion.webp",
};

const CLASS_ICONS: Record<CharacterClass, string> = {
  Hunter: "/icons/class-hunter.webp",
  Striker: "/icons/class-striker.webp",
  Vanguard: "/icons/class-vanguard.webp",
  Ranger: "/icons/class-ranger.webp",
  Controller: "/icons/class-controller.webp",
  Psionic: "/icons/class-psionic.png",
};

// ── Component ───────────────────────────────────

export default function CharactersPage() {
  const [attributeFilter, setAttributeFilter] = useState<Attribute | null>(
    null,
  );
  const [classFilter, setClassFilter] = useState<CharacterClass | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      if (attributeFilter && c.attribute !== attributeFilter) return false;
      if (classFilter && c.class !== classFilter) return false;
      if (search && !c.nameKo.includes(search)) return false;
      return true;
    });
  }, [attributeFilter, classFilter, search]);

  return (
    <div>
      {/* Page title */}
      <h1 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">
        캐릭터
        <span className="ml-2 text-base font-normal text-[var(--color-text-secondary)]">
          ({filtered.length}/{characters.length})
        </span>
      </h1>

      {/* ── Filter bar ────────────────────────── */}
      <div className="mb-6 space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
        {/* Attribute filter */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            속성
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAttributeFilter(null)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                attributeFilter === null
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              전체
            </button>
            {attributes.map((attr) => (
              <button
                key={attr}
                type="button"
                onClick={() =>
                  setAttributeFilter(attributeFilter === attr ? null : attr)
                }
                style={
                  attributeFilter === attr
                    ? { backgroundColor: attributeColorVar[attr] }
                    : undefined
                }
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  attributeFilter === attr
                    ? "text-white"
                    : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Image src={ATTRIBUTE_ICONS[attr]} alt={attr} width={16} height={16} className="rounded-sm" unoptimized />
                {ATTRIBUTE_LABELS[attr]}
              </button>
            ))}
          </div>
        </div>

        {/* Class filter */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            클래스
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setClassFilter(null)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                classFilter === null
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              전체
            </button>
            {classes.map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() =>
                  setClassFilter(classFilter === cls ? null : cls)
                }
                className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  classFilter === cls
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Image src={CLASS_ICONS[cls]} alt={cls} width={16} height={16} className="rounded-sm" unoptimized />
                {CLASS_LABELS[cls]}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
            검색
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="캐릭터 이름 검색..."
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none sm:max-w-xs"
          />
        </div>
      </div>

      {/* ── Character grid ────────────────────── */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-text-secondary)]">
          조건에 맞는 캐릭터가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((character) => (
            <Link
              key={character.id}
              href={`/characters/${character.id}`}
              className="group overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-colors hover:border-[var(--color-accent-hover)]"
            >
              {/* Character image + icon overlay */}
              <div className="relative aspect-[5/7] w-full overflow-hidden bg-[var(--color-bg-tertiary)]">
                {character.imageUrl ? (
                  <Image
                    src={character.imageUrl}
                    alt={character.nameKo}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl text-[var(--color-text-secondary)]">
                    ?
                  </div>
                )}
                {/* Top-left: class + attribute icons */}
                <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
                  <Image
                    src={CLASS_ICONS[character.class as CharacterClass]}
                    alt={character.class}
                    width={48}
                    height={48}
                    className="rounded-md drop-shadow-md"
                    unoptimized
                  />
                  <Image
                    src={ATTRIBUTE_ICONS[character.attribute as Attribute]}
                    alt={character.attribute}
                    width={48}
                    height={48}
                    className="rounded-md drop-shadow-md"
                    unoptimized
                  />
                </div>
                {/* Bottom overlay: name + stars */}
                <div
                  className="absolute inset-x-0 bottom-0 z-10 px-2 pb-2 pt-6"
                  style={{ background: "linear-gradient(to top, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.6) 60%, transparent 100%)" }}
                >
                  <h2 className="text-sm font-bold text-white">{character.nameKo}</h2>
                  <div className="text-xs text-[#f5c518]">{"★".repeat(character.rarity)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
