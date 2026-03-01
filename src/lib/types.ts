// ──────────────────────────────────────────────
// CZN Combat Tool - Core Type Definitions
// ──────────────────────────────────────────────

// 게임 속성 (Attribute)
export type Attribute = "Void" | "Justice" | "Order" | "Instinct" | "Passion";

// 클래스
export type CharacterClass =
  | "Hunter"
  | "Striker"
  | "Vanguard"
  | "Ranger"
  | "Controller"
  | "Psionic";

// 진영
export type Faction =
  | "Terrascion"
  | "Stella Familia"
  | "Ironrain"
  | "Peltion"
  | "Wanderer"
  | "The Holy Crusaders";

// ──────────────────────────────────────────────
// Card
// ──────────────────────────────────────────────

export type CardType = "Attack" | "Skill" | "Defense" | "Upgrade";

export type EffectType =
  | "damage"
  | "buff"
  | "debuff"
  | "create"
  | "discard"
  | "draw"
  | "heal"
  | "shield";

export type TargetType = "single" | "all" | "random" | "self";

export interface CardEffect {
  type: EffectType;
  value: number; // 데미지% or 버프 수치
  hits?: number; // 다단히트 횟수
  condition?: string; // 조건부 효과 설명
  target?: TargetType;
  duration?: number; // 버프/디버프 지속 턴
  stat?: string; // 버프/디버프 대상 스탯
}

export type CardCategory = "Starting" | "Epiphany";

export interface Card {
  id: string;
  name: string;
  nameKo: string;
  category: CardCategory; // 기본 카드 vs 번뜩임 카드
  apCost: number;
  type: CardType;
  effects: CardEffect[];
  tags: string[];
  description?: string;
  imageUrl?: string; // 카드 아트 이미지 URL
}

// ──────────────────────────────────────────────
// Character
// ──────────────────────────────────────────────

export interface StatBlock {
  base: number;
  max: number; // Lv60 기준
}

export interface CharacterStats {
  attack: StatBlock;
  defense: StatBlock;
  health: StatBlock;
  critChance: number; // 0~100
  critDamage: number; // 기본 150%
}

export interface Character {
  id: string;
  name: string;
  nameKo: string;
  rarity: 5 | 4;
  class: CharacterClass;
  attribute: Attribute;
  faction: Faction;
  stats: CharacterStats;
  imageUrl?: string; // 캐릭터 포트레이트 이미지 URL
  cardIds: string[]; // Card.id 참조
  partnerIds?: string[]; // Partner.id 참조
  traits?: string[]; // 특수 메카닉 (예: "defBasedDamage")
}

// ──────────────────────────────────────────────
// Partner
// ──────────────────────────────────────────────

export interface PartnerPassive {
  description: string;
  stat?: string;
  value?: number;
  condition?: string;
}

export interface Partner {
  id: string;
  name: string;
  nameKo: string;
  passives: PartnerPassive[];
  egoSkill?: {
    name: string;
    description: string;
    effects: CardEffect[];
  };
}

// ──────────────────────────────────────────────
// Synergy
// ──────────────────────────────────────────────

export interface SynergyRule {
  id: string;
  name: string;
  nameKo: string;
  type: "attribute" | "class" | "faction";
  required: {
    value: string; // 속성/클래스/진영 이름
    count: number; // 필요 인원 수
  };
  bonus: {
    stat: string;
    value: number;
    description: string;
  };
}

// ──────────────────────────────────────────────
// Team Builder
// ──────────────────────────────────────────────

export interface TeamSlot {
  character: Character | null;
  selectedCards: Card[];
  partner: Partner | null;
}

export interface Team {
  slots: [TeamSlot, TeamSlot, TeamSlot];
  activeSynergies: SynergyRule[];
}

// ──────────────────────────────────────────────
// Simulation
// ──────────────────────────────────────────────

export interface TurnAction {
  characterId: string;
  cardId: string;
  targets: string[];
}

export interface SimulationResult {
  totalDamage: number;
  damagePerTurn: number[];
  turnsSimulated: number;
  dps: number;
  breakdown: {
    characterId: string;
    damage: number;
    percentage: number;
  }[];
}

// ──────────────────────────────────────────────
// Balance Analysis (QA Feature)
// ──────────────────────────────────────────────

export type AlertSeverity = "info" | "warning" | "critical";

export interface BalanceAlert {
  id: string;
  characterId: string;
  severity: AlertSeverity;
  category: string;
  message: string;
  value: number;
  average: number;
  deviation: number; // 평균 대비 편차 (%)
}
