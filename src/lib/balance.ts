import type {
  Character,
  Card,
  BalanceAlert,
  AlertSeverity,
} from "./types";
import { calculateCardDamage } from "./calculator";

// 밸런스 이상치 탐지 - QA 차별화 기능
// 모든 캐릭터/카드 데이터를 분석하여 평균 대비 이상치를 찾아냄

interface AnalysisContext {
  characters: Character[];
  cards: Card[];
}

function getSeverity(deviationPct: number): AlertSeverity {
  const abs = Math.abs(deviationPct);
  if (abs >= 50) return "critical";
  if (abs >= 25) return "warning";
  return "info";
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

// 스탯 이상치 분석
function analyzeStats(ctx: AnalysisContext): BalanceAlert[] {
  const alerts: BalanceAlert[] = [];
  const statKeys = ["attack", "defense", "health"] as const;

  for (const stat of statKeys) {
    const values = ctx.characters.map((c) => c.stats[stat].max);
    const avg = mean(values);
    const sd = stdDev(values);

    if (sd === 0) continue;

    for (const char of ctx.characters) {
      const val = char.stats[stat].max;
      const zScore = (val - avg) / sd;

      if (Math.abs(zScore) > 1.5) {
        const deviation = ((val - avg) / avg) * 100;
        alerts.push({
          id: `stat-${stat}-${char.id}`,
          characterId: char.id,
          severity: getSeverity(deviation),
          category: `스탯 이상치 (${stat.toUpperCase()})`,
          message: `${char.nameKo}의 ${stat.toUpperCase()} (${val})이 평균 (${avg.toFixed(0)}) 대비 ${deviation > 0 ? "높음" : "낮음"} (z=${zScore.toFixed(2)})`,
          value: val,
          average: avg,
          deviation,
        });
      }
    }
  }

  return alerts;
}

// 카드 AP 효율 이상치 분석
function analyzeCardEfficiency(ctx: AnalysisContext): BalanceAlert[] {
  const alerts: BalanceAlert[] = [];

  // 전체 공격 카드의 AP 효율을 먼저 계산 (O(n) → 루프 밖으로)
  function cardApEfficiency(c: Card): number {
    let mult = 0;
    for (const e of c.effects) {
      if (e.type === "damage") mult += e.value * (e.hits || 1);
    }
    return c.apCost > 0 ? mult / c.apCost : mult;
  }

  const allAttackCards = ctx.cards.filter((c) =>
    c.effects.some((e) => e.type === "damage")
  );
  const allEfficiencies = allAttackCards.map(cardApEfficiency);
  const avg = mean(allEfficiencies);
  const sd = stdDev(allEfficiencies);

  if (sd === 0) return alerts;

  for (const char of ctx.characters) {
    const charCards = char.cardIds
      .map((id) => ctx.cards.find((c) => c.id === id))
      .filter((c): c is Card => c !== undefined);

    const attackCards = charCards.filter((c) =>
      c.effects.some((e) => e.type === "damage")
    );

    for (const card of attackCards) {
      const apEfficiency = cardApEfficiency(card);
      const zScore = (apEfficiency - avg) / sd;

      if (Math.abs(zScore) > 1.5) {
        const deviation = ((apEfficiency - avg) / avg) * 100;
        alerts.push({
          id: `card-eff-${card.id}`,
          characterId: char.id,
          severity: getSeverity(deviation),
          category: "카드 AP 효율",
          message: `${char.nameKo}의 "${card.nameKo}" AP 효율 (${apEfficiency.toFixed(0)}%/AP)이 평균 (${avg.toFixed(0)}%/AP) 대비 ${deviation > 0 ? "높음" : "낮음"}`,
          value: apEfficiency,
          average: avg,
          deviation,
        });
      }
    }
  }

  return alerts;
}

// 치명타 스탯 분석
function analyzeCritBalance(ctx: AnalysisContext): BalanceAlert[] {
  const alerts: BalanceAlert[] = [];
  const critChances = ctx.characters.map((c) => c.stats.critChance);
  const avgCrit = mean(critChances);

  for (const char of ctx.characters) {
    if (char.stats.critChance !== avgCrit) {
      const deviation =
        ((char.stats.critChance - avgCrit) / avgCrit) * 100;
      if (Math.abs(deviation) > 20) {
        alerts.push({
          id: `crit-${char.id}`,
          characterId: char.id,
          severity: getSeverity(deviation),
          category: "치명타 확률",
          message: `${char.nameKo}의 치명타 확률 (${char.stats.critChance}%)이 평균 (${avgCrit.toFixed(1)}%) 대비 편차 발생`,
          value: char.stats.critChance,
          average: avgCrit,
          deviation,
        });
      }
    }
  }

  return alerts;
}

export function runBalanceAnalysis(ctx: AnalysisContext): BalanceAlert[] {
  const alerts = [
    ...analyzeStats(ctx),
    ...analyzeCardEfficiency(ctx),
    ...analyzeCritBalance(ctx),
  ];

  // 심각도 순으로 정렬
  const severityOrder: Record<AlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return alerts.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );
}
