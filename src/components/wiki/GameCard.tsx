"use client";

import Image from "next/image";
import Link from "next/link";

// ──────────────────────────────────────────────
// GameCard — CZN card display component with game icons
// ──────────────────────────────────────────────

interface GameCardProps {
  name: string; // Korean card name
  apCost: number;
  baseApCost?: number; // Base card AP cost (for variation cost comparison glow)
  type: string; // "Attack" | "Skill" | "Upgrade" | "Defense"
  attribute?: string; // "Void" | "Order" | "Justice" | "Instinct" | "Passion"
  imageUrl?: string; // prydwen CDN card artwork URL
  effect?: string; // Effect description text
  tags?: string[]; // Korean tag strings like ["소멸", "보존"]
  compact?: boolean; // Smaller version for grid lists
  href?: string; // Optional link wrapping
}

/** Attribute → CSS variable color */
const ATTRIBUTE_COLORS: Record<string, string> = {
  Void: "var(--color-void)",
  Justice: "var(--color-justice)",
  Order: "var(--color-order)",
  Instinct: "var(--color-instinct)",
  Passion: "var(--color-passion)",
};

/** Card type → color (Attack=red, Skill=blue, Upgrade=gold, Defense=green) */
const TYPE_COLORS: Record<string, string> = {
  Attack: "#ef4444",
  Skill: "#3b82f6",
  Upgrade: "#f59e0b",
  Defense: "#10b981",
};

/** AP cost glow colors: default=blue, decreased=green, increased=red */
const AP_GLOW = {
  default: "#0055ff",
  decreased: "#7bc21c",
  increased: "#ff523e",
};

/** Card type → Korean label */
const TYPE_LABELS: Record<string, string> = {
  Attack: "공격",
  Skill: "스킬",
  Upgrade: "강화",
  Defense: "방어",
};

/** Card type → icon path */
const TYPE_ICONS: Record<string, string> = {
  Attack: "/icons/type-attack.webp",
  Skill: "/icons/type-skill.webp",
  Upgrade: "/icons/type-upgrade.webp",
};


export default function GameCard({
  name,
  apCost,
  baseApCost,
  type,
  attribute,
  imageUrl,
  effect,
  tags = [],
  compact = false,
  href,
}: GameCardProps) {
  const attrColor = attribute ? ATTRIBUTE_COLORS[attribute] : "var(--color-accent)";
  const typeColor = TYPE_COLORS[type] || "var(--color-text-secondary)";
  const typeLabel = TYPE_LABELS[type] || type;
  const apGlow =
    baseApCost != null && apCost < baseApCost ? AP_GLOW.decreased
    : baseApCost != null && apCost > baseApCost ? AP_GLOW.increased
    : AP_GLOW.default;

  // Dimensions
  const width = compact ? 160 : 200;
  const height = compact ? 240 : 300;

  const card = (
    <div
      className="group relative overflow-hidden rounded-lg"
      style={{
        width,
        height,
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-secondary)",
      }}
    >
      {/* Left border strip — attribute color */}
      <div
        className="absolute top-0 left-0 z-10 h-full"
        style={{
          width: 3,
          backgroundColor: attrColor,
        }}
      />

      {/* Card artwork background */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={width}
          height={height}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "var(--color-bg-tertiary)" }}
        >
          {TYPE_ICONS[type] ? (
            <Image
              src={TYPE_ICONS[type]}
              alt={type}
              width={compact ? 40 : 56}
              height={compact ? 40 : 56}
              className="opacity-25"
              unoptimized
            />
          ) : (
            <span className="text-3xl opacity-20" style={{ color: typeColor }}>
              {"\u26E8"}
            </span>
          )}
        </div>
      )}

      {/* Top overlay — AP badge + name + type */}
      <div
        className="absolute inset-x-0 top-0 z-20"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,15,0.92) 0%, rgba(10,10,15,0.7) 70%, transparent 100%)",
          padding: compact ? "6px 6px 16px 6px" : "8px 8px 20px 8px",
        }}
      >
        <div className="flex items-start gap-1.5">
          {/* AP cost — namu wiki glow style */}
          <div
            className="flex shrink-0 items-center justify-center font-bold text-white"
            style={{
              width: compact ? 26 : 32,
              height: compact ? 26 : 32,
              fontSize: compact ? 18 : 24,
              fontFamily: "sans-serif",
              textShadow: `${apGlow} 2px 0px 5px, ${apGlow} -2px 0px 5px, ${apGlow} 0px 2px 5px, ${apGlow} 0px -2px 5px`,
            }}
          >
            {apCost}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate font-semibold text-white"
              style={{ fontSize: compact ? 11 : 13, lineHeight: "1.3" }}
              title={name}
            >
              {name}
            </p>
            {/* Type icon + label */}
            <div className="mt-0.5 flex items-center gap-1">
              {TYPE_ICONS[type] && (
                <Image
                  src={TYPE_ICONS[type]}
                  alt={typeLabel}
                  width={compact ? 12 : 14}
                  height={compact ? 12 : 14}
                  className="rounded-sm"
                  unoptimized
                />
              )}
              <span
                className="font-medium"
                style={{
                  fontSize: compact ? 9 : 10,
                  color: typeColor,
                }}
              >
                {typeLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom overlay — tags + effect text */}
      {(effect || tags.length > 0) && (
        <div
          className="absolute inset-x-0 bottom-0 z-20"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.8) 60%, transparent 100%)",
            padding: compact ? "20px 8px 8px 8px" : "24px 10px 10px 10px",
          }}
        >
          {tags.length > 0 && (
            <p
              className="mb-1 text-center font-medium"
              style={{
                fontSize: compact ? 10 : 11,
                color: "#fbbf24",
              }}
            >
              [{tags.join(", ")}]
            </p>
          )}
          {effect && (
            <p
              className="whitespace-pre-line text-center font-bold leading-snug"
              style={{
                fontSize: compact ? 11 : 13,
                color: "var(--color-text-primary)",
              }}
            >
              {effect}
            </p>
          )}
        </div>
      )}

      {/* Hover glow border effect */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${attrColor}60, 0 0 12px ${attrColor}20`,
        }}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-transform duration-200 hover:scale-[1.02]">
        {card}
      </Link>
    );
  }

  return card;
}
