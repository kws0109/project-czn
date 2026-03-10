import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import characters from "@/data/characters.json";
import allCards from "@/data/cards.json";
import cardImages from "@/data/card-images.json";
import type { Attribute, CardType } from "@/lib/types";
import GameCard from "@/components/wiki/GameCard";

// ── SSG: generate all 28 character pages at build time ──

export function generateStaticParams() {
  return characters.map((c) => ({ id: c.id }));
}

// ── Metadata ──

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const character = characters.find((c) => c.id === id);
  if (!character) return { title: "캐릭터를 찾을 수 없습니다" };
  return {
    title: `${character.nameKo} (${character.name}) | CZN 위키`,
    description: `${character.nameKo} - ${character.rarity}성 ${CLASS_LABELS[character.class] ?? character.class} / ${ATTRIBUTE_LABELS[character.attribute] ?? character.attribute}`,
  };
}

// ── Constants ──

const ATTRIBUTE_COLORS: Record<string, string> = {
  Void: "var(--color-void)",
  Justice: "var(--color-justice)",
  Order: "var(--color-order)",
  Instinct: "var(--color-instinct)",
  Passion: "var(--color-passion)",
};

const ATTRIBUTE_BG_CLASS: Record<string, string> = {
  Void: "bg-attr-void",
  Justice: "bg-attr-justice",
  Order: "bg-attr-order",
  Instinct: "bg-attr-instinct",
  Passion: "bg-attr-passion",
};

const ATTRIBUTE_LABELS: Record<string, string> = {
  Void: "공허",
  Justice: "정의",
  Order: "질서",
  Instinct: "본능",
  Passion: "열정",
};

const CLASS_LABELS: Record<string, string> = {
  Hunter: "헌터",
  Striker: "스트라이커",
  Vanguard: "뱅가드",
  Ranger: "레인저",
  Controller: "컨트롤러",
  Psionic: "사이오닉",
};

const TYPE_LABELS: Record<string, string> = {
  Attack: "공격",
  Skill: "스킬",
  Upgrade: "강화",
  Defense: "방어",
};

const TYPE_COLORS: Record<string, string> = {
  Attack: "#ef4444",
  Skill: "#3b82f6",
  Upgrade: "#f59e0b",
  Defense: "#10b981",
};

// ── Card data shape from JSON ──

interface CardVariation {
  variationNumber: number;
  name?: string;
  apCost: number;
  type: string;
  effects: unknown[];
  description: string;
  tags: string[];
}

interface CardData {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  apCost: number;
  type: string;
  effects: unknown[];
  tags: string[];
  description?: string;
  imageUrl?: string;
  variations?: CardVariation[];
}

// ── Page Component ──

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const character = characters.find((c) => c.id === id);
  if (!character) notFound();

  // Resolve cards for this character
  const characterCards = character.cardIds
    .map((cardId) => (allCards as CardData[]).find((c) => c.id === cardId))
    .filter((c): c is CardData => c !== undefined);

  const startingCards = characterCards.filter((c) => c.category === "Starting");
  const epiphanyCards = characterCards.filter((c) => c.category === "Epiphany");

  // Resolve card images from prydwen (assign sequentially to character's cards)
  const imageData = (cardImages as Record<string, { cards: string[]; ego: string | null }>)[character.id];
  const prydwenImageUrls = imageData?.cards ?? [];

  // Build image map: index → prydwen image URL
  // The first images correspond to starting cards, then epiphany cards
  const cardImageMap = new Map<string, string>();
  character.cardIds.forEach((cardId, index) => {
    if (index < prydwenImageUrls.length) {
      cardImageMap.set(cardId, prydwenImageUrls[index]);
    }
  });


  return (
    <div>
      {/* Back link */}
      <Link
        href="/characters"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent)]"
      >
        <span aria-hidden="true">&larr;</span> 캐릭터 목록
      </Link>

      {/* ── Character Profile Header ── */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        {/* Character image */}
        <div className="relative aspect-[5/7] w-full shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] md:w-64">
          {character.imageUrl ? (
            <Image
              src={character.imageUrl}
              alt={character.nameKo}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-[var(--color-text-secondary)]">
              ?
            </div>
          )}
        </div>

        {/* Character info */}
        <div className="flex flex-col justify-center">
          {/* Name */}
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {character.nameKo}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {character.name}
          </p>

          {/* Rarity stars */}
          <div className="mt-2 text-lg text-[#f5c518]">
            {"★".repeat(character.rarity)}
          </div>

          {/* Badges: Class + Attribute + Faction */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-1 text-sm text-[var(--color-text-primary)]">
              {CLASS_LABELS[character.class] ?? character.class}
            </span>
            <span
              className={`${ATTRIBUTE_BG_CLASS[character.attribute] ?? ""} rounded-md px-3 py-1 text-sm font-medium text-white`}
            >
              {ATTRIBUTE_LABELS[character.attribute] ?? character.attribute}
            </span>
            <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-1 text-sm text-[var(--color-text-secondary)]">
              {character.faction}
            </span>
          </div>

          {/* Lv60 Stats */}
          <div className="mt-4 flex flex-wrap gap-4">
            <StatBadge label="ATK" value={character.stats.attack.max} />
            <StatBadge label="DEF" value={character.stats.defense.max} />
            <StatBadge label="HP" value={character.stats.health.max} />
          </div>
        </div>
      </div>

      {/* ── 기본 카드 (Starting Cards) ── */}
      {startingCards.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-[var(--color-text-primary)]">
            기본 카드
            <span className="ml-2 text-sm font-normal text-[var(--color-text-secondary)]">
              Starting
            </span>
          </h2>
          <div className="flex flex-wrap gap-4">
            {startingCards.map((card) => (
              <GameCard
                key={card.id}
                name={card.name}
                apCost={card.apCost}
                type={card.type}
                attribute={character.attribute}
                imageUrl={cardImageMap.get(card.id) ?? card.imageUrl}
                effect={card.description}
                tags={card.tags}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── 고유 카드 (Epiphany Cards) with Variations ── */}
      {epiphanyCards.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-[var(--color-text-primary)]">
            고유 카드
            <span className="ml-2 text-sm font-normal text-[var(--color-text-secondary)]">
              Epiphany
            </span>
          </h2>
          <div className="space-y-8">
            {epiphanyCards.map((card) => (
              <EpiphanyCardBlock
                key={card.id}
                card={card}
                attribute={character.attribute}
                imageUrl={cardImageMap.get(card.id) ?? card.imageUrl}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Sub-components ──

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2">
      <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      <p className="text-lg font-bold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
}

interface EpiphanyCardBlockProps {
  card: CardData;
  attribute: string;
  imageUrl?: string;
}

function EpiphanyCardBlock({ card, attribute, imageUrl }: EpiphanyCardBlockProps) {
  const variations = card.variations ?? [];

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
      {/* Row 1: Base card */}
      <div className="mb-1 text-[10px] font-medium text-[var(--color-text-secondary)]">
        기본
      </div>
      <GameCard
        name={card.name}
        apCost={card.apCost}
        type={card.type}
        attribute={attribute}
        imageUrl={imageUrl}
        effect={card.description}
        tags={card.tags}
      />

      {/* Row 2: 5 variation cards */}
      {variations.length > 0 && (
        <>
          <div className="mt-4 mb-1 text-[10px] font-medium text-[var(--color-accent)]">
            번뜩임 바리에이션
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {variations.map((v) => (
              <div key={v.variationNumber} className="relative shrink-0">
                <div className="mb-1 text-center text-[10px] font-medium text-[var(--color-accent)]">
                  #{v.variationNumber}
                </div>
                <GameCard
                  name={v.name ?? card.name}
                  apCost={v.apCost}
                  baseApCost={card.apCost}
                  type={v.type}
                  attribute={attribute}
                  imageUrl={imageUrl}
                  effect={v.description}
                  tags={v.tags}
                  compact
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
