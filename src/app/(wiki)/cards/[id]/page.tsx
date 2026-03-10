import { notFound } from "next/navigation";
import Link from "next/link";
import allCharacterCards from "@/data/cards.json";
import neutralCardsData from "@/data/neutral-cards.json";
import charactersData from "@/data/characters.json";
import cardImages from "@/data/card-images.json";
import GameCard from "@/components/wiki/GameCard";

// ── Shared helpers & types ──────────────────────

function toKebabCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

const CATEGORY_LABELS: Record<string, string> = {
  Starting: "기본",
  Epiphany: "고유",
  Neutral: "중립",
  Monster: "몬스터",
};

const RARITY_COLORS: Record<string, string> = {
  Common: "var(--color-text-secondary)",
  Rare: "#3b82f6",
  Legendary: "#f5c518",
  Forbidden: "#ef4444",
  Monster: "#f97316",
};

// ── JSON data shapes ────────────────────────────

interface CharCardVariation {
  variationNumber: number;
  name?: string;
  apCost: number;
  type: string;
  effects: unknown[];
  description: string;
  tags: string[];
}

interface CharCardData {
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
  variations?: CharCardVariation[];
}

interface NeutralCardData {
  nameEn: string;
  nameKo: string | null;
  apCost: number | null;
  type: string;
  rarity: string | null;
  category: string;
  isSeason: boolean;
  tags: string[];
  tagsKo: string[];
  effect: string;
  effectKo: string | null;
  effectKeywords: string[];
  classRestriction: string | null;
  classRestrictionKo: string | null;
}

// ── Build lookup maps (module-level, computed once) ──

interface CharOwnership {
  charId: string;
  nameKo: string;
  attribute: string;
}

const cardOwnerMap = new Map<string, CharOwnership>();
for (const char of charactersData) {
  for (const cardId of char.cardIds) {
    cardOwnerMap.set(cardId, {
      charId: char.id,
      nameKo: char.nameKo,
      attribute: char.attribute,
    });
  }
}

// Build card image map from prydwen data
const cardImageLookup = new Map<string, string>();
for (const char of charactersData) {
  const imageData = (
    cardImages as Record<string, { cards: string[]; ego: string | null }>
  )[char.id];
  const urls = imageData?.cards ?? [];
  char.cardIds.forEach((cardId, index) => {
    if (index < urls.length) {
      cardImageLookup.set(cardId, urls[index]);
    }
  });
}

// Index neutral cards by kebab-case ID
const neutralCardMap = new Map<string, NeutralCardData>();
for (const card of neutralCardsData.cards as NeutralCardData[]) {
  neutralCardMap.set(toKebabCase(card.nameEn), card);
}

// ── SSG: generate params for ALL cards ──────────

export function generateStaticParams() {
  const params: { id: string }[] = [];

  // Character cards (200)
  for (const card of allCharacterCards as CharCardData[]) {
    params.push({ id: card.id });
  }

  // Neutral cards (122)
  for (const card of neutralCardsData.cards as NeutralCardData[]) {
    params.push({ id: toKebabCase(card.nameEn) });
  }

  return params;
}

// ── Metadata ────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  // Try character card first
  const charCard = (allCharacterCards as CharCardData[]).find(
    (c) => c.id === id
  );
  if (charCard) {
    const owner = cardOwnerMap.get(charCard.id);
    return {
      title: `${charCard.name} | CZN 카드`,
      description: `${charCard.name} - ${TYPE_LABELS[charCard.type] ?? charCard.type} (AP ${charCard.apCost})${owner ? ` - ${owner.nameKo}` : ""}`,
    };
  }

  // Try neutral card
  const neutralCard = neutralCardMap.get(id);
  if (neutralCard) {
    const name = neutralCard.nameKo || neutralCard.nameEn;
    return {
      title: `${name} | CZN 카드`,
      description: `${name} - ${TYPE_LABELS[neutralCard.type] ?? neutralCard.type} (AP ${neutralCard.apCost ?? 0})`,
    };
  }

  return { title: "카드를 찾을 수 없습니다" };
}

// ── Page Component ──────────────────────────────

export default async function CardDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Try character card first
  const charCard = (allCharacterCards as CharCardData[]).find(
    (c) => c.id === id
  );
  if (charCard) {
    return <CharacterCardDetail card={charCard} />;
  }

  // Try neutral card
  const neutralCard = neutralCardMap.get(id);
  if (neutralCard) {
    return <NeutralCardDetail card={neutralCard} />;
  }

  notFound();
}

// ── Character Card Detail ───────────────────────

function CharacterCardDetail({ card }: { card: CharCardData }) {
  const owner = cardOwnerMap.get(card.id);
  const attribute = owner?.attribute;
  const imageUrl = cardImageLookup.get(card.id) ?? card.imageUrl;
  const typeColor = TYPE_COLORS[card.type] ?? "var(--color-text-secondary)";
  const typeLabel = TYPE_LABELS[card.type] ?? card.type;
  const categoryLabel = CATEGORY_LABELS[card.category] ?? card.category;
  const variations = card.variations ?? [];

  return (
    <div>
      {/* Back link */}
      <Link
        href="/cards"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent)]"
      >
        <span aria-hidden="true">&larr;</span> 카드 목록
      </Link>

      {/* Card display + info panel */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        {/* GameCard (non-compact) */}
        <div className="shrink-0">
          <GameCard
            name={card.name}
            apCost={card.apCost}
            type={card.type}
            attribute={attribute}
            imageUrl={imageUrl}
            effect={card.description}
            tags={card.tags}
          />
        </div>

        {/* Info panel */}
        <div className="flex flex-col justify-center">
          {/* Card name */}
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {card.name}
          </h1>
          {card.nameKo !== card.name && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {card.nameKo}
            </p>
          )}

          {/* AP Cost + Type badge + Category */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-1 text-sm font-medium text-[var(--color-text-primary)]">
              AP {card.apCost}
            </span>
            <span
              className="rounded-md px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: typeColor }}
            >
              {typeLabel}
            </span>
            <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-1 text-sm text-[var(--color-text-secondary)]">
              {categoryLabel}
            </span>
          </div>

          {/* Effect text (full, no truncation) */}
          {card.description && (
            <div className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-3">
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                효과
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-primary)]">
                {card.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {card.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-medium text-[var(--color-accent)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Owner character link */}
          {owner && (
            <div className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
              <span className="text-sm text-[var(--color-text-secondary)]">
                소속 캐릭터:{" "}
              </span>
              <Link
                href={`/characters/${owner.charId}`}
                className="text-sm font-medium text-[var(--color-accent)] transition-colors hover:underline"
              >
                {owner.nameKo}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Variations section (Epiphany cards only) */}
      {variations.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-[var(--color-text-primary)]">
            번뜩임 바리에이션
          </h2>
          <div className="space-y-2">
            {variations.map((v) => (
              <VariationRow
                key={v.variationNumber}
                variation={v}
                baseApCost={card.apCost}
                baseType={card.type}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Neutral Card Detail ─────────────────────────

function NeutralCardDetail({ card }: { card: NeutralCardData }) {
  const apCost = card.apCost ?? 0;
  const typeColor = TYPE_COLORS[card.type] ?? "var(--color-text-secondary)";
  const typeLabel = TYPE_LABELS[card.type] ?? card.type;
  const categoryLabel = CATEGORY_LABELS[card.category] ?? card.category;
  const rarityColor = card.rarity
    ? RARITY_COLORS[card.rarity] ?? "var(--color-text-secondary)"
    : undefined;
  const effectKo = card.effectKo || "";
  const effectEn = card.effect || "";
  const displayName = card.nameKo || card.nameEn;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/cards"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent)]"
      >
        <span aria-hidden="true">&larr;</span> 카드 목록
      </Link>

      {/* Card display + info panel */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        {/* GameCard (non-compact, no image for neutrals) */}
        <div className="shrink-0">
          <GameCard
            name={displayName}
            apCost={apCost}
            type={card.type}
            effect={effectKo || effectEn}
            tags={card.tagsKo}
          />
        </div>

        {/* Info panel */}
        <div className="flex flex-col justify-center">
          {/* Card name (Korean) */}
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {displayName}
          </h1>
          {/* English name (secondary) */}
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {card.nameEn}
          </p>

          {/* AP Cost + Type badge + Category + Rarity */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-1 text-sm font-medium text-[var(--color-text-primary)]">
              AP {apCost}
            </span>
            <span
              className="rounded-md px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: typeColor }}
            >
              {typeLabel}
            </span>
            <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-1 text-sm text-[var(--color-text-secondary)]">
              {categoryLabel}
            </span>
            {card.rarity && (
              <span
                className="rounded-md border px-3 py-1 text-sm font-medium"
                style={{
                  color: rarityColor,
                  borderColor: `${rarityColor}40`,
                  backgroundColor: `${rarityColor}10`,
                }}
              >
                {card.rarity}
              </span>
            )}
          </div>

          {/* Effect text — Korean (full) */}
          <div className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-3">
            <p className="text-xs font-medium text-[var(--color-text-secondary)]">
              효과
            </p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-primary)]">
              {effectKo || effectEn}
            </p>
            {/* English effect (secondary, shown when Korean exists) */}
            {effectKo && effectEn && (
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {effectEn}
              </p>
            )}
          </div>

          {/* Tags */}
          {card.tagsKo.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                태그
              </p>
              <div className="flex flex-wrap gap-2">
                {card.tagsKo.map((tag, i) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-medium text-[var(--color-accent)]"
                  >
                    {tag}
                    {card.tags[i] && card.tags[i] !== tag && (
                      <span className="ml-1 text-[var(--color-text-secondary)]">
                        ({card.tags[i]})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Effect keywords */}
          {card.effectKeywords.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                키워드
              </p>
              <div className="flex flex-wrap gap-1.5">
                {card.effectKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Class restriction */}
          {card.classRestrictionKo && (
            <div className="mt-3 rounded-md border border-[var(--color-passion)]/30 bg-[var(--color-passion)]/5 p-3">
              <p className="text-xs font-medium text-[var(--color-passion)]">
                클래스 제한
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-primary)]">
                {card.classRestrictionKo}
              </p>
              {card.classRestriction && (
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                  {card.classRestriction}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Variation Row Sub-component ─────────────────

interface VariationRowProps {
  variation: CharCardVariation;
  baseApCost: number;
  baseType: string;
}

function VariationRow({ variation, baseApCost, baseType }: VariationRowProps) {
  const apChanged = variation.apCost !== baseApCost;
  const typeChanged = variation.type !== baseType;
  const typeColor =
    TYPE_COLORS[variation.type] ?? "var(--color-text-secondary)";
  const typeLabel = TYPE_LABELS[variation.type] ?? variation.type;

  return (
    <div
      className="rounded-md border-l-2 border-l-[var(--color-accent)] bg-[var(--color-bg-tertiary)] px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Variation number badge */}
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white">
          {variation.variationNumber}
        </span>

        {/* AP cost */}
        <span
          className={`text-sm font-medium ${
            apChanged
              ? "rounded bg-[var(--color-accent)] px-2 py-0.5 text-white"
              : "text-[var(--color-text-secondary)]"
          }`}
        >
          AP {variation.apCost}
        </span>

        {/* Type badge */}
        <span
          className={`rounded px-2 py-0.5 text-sm font-medium ${
            typeChanged ? "text-white" : ""
          }`}
          style={{
            backgroundColor: typeChanged ? typeColor : "transparent",
            color: typeChanged ? "white" : typeColor,
          }}
        >
          {typeLabel}
          {typeChanged && (
            <span className="ml-1 text-xs opacity-75">
              ({TYPE_LABELS[baseType] ?? baseType}에서 변경)
            </span>
          )}
        </span>

        {/* Tags */}
        {variation.tags.length > 0 && (
          <div className="flex gap-1">
            {variation.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-2 py-0.5 text-xs text-[var(--color-accent)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-primary)]">
        {variation.description}
      </p>
    </div>
  );
}
