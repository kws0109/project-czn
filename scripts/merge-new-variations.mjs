/**
 * Merge newly scraped variation data for 8 missing characters
 * into scripts/variation-data.json.
 *
 * Usage: node scripts/merge-new-variations.mjs
 */
import fs from 'fs';

// Clean description: collapse "\n" between numbers/% patterns
function cleanDescription(desc) {
  return desc
    // "피해\n360\n%" → "피해 360%"
    .replace(/\n(\d+)\n%/g, ' $1%')
    // "실드\n300\n%" → "실드 300%"
    .replace(/\n(\d+)\n/g, ' $1 ')
    // "x\n4" → "x 4"
    .replace(/\n(x\s)/g, ' $1')
    // remaining \n → newline for readability
    .replace(/\n/g, '\n')
    // collapse multiple spaces
    .replace(/  +/g, ' ')
    .trim();
}

// Raw scraped data for each character
const newData = {
  kayron: [
    { cardName: "허무의 잔상", variationNumber: 1, apCost: 1, type: "Attack", description: "피해 360%\n허무 2장 생성" },
    { cardName: "허무의 잔상", variationNumber: 2, apCost: 1, type: "Attack", description: "피해 240%\n허무 2장 생성\n소멸된 허무 수만큼 피해량 +20%" },
    { cardName: "허무의 잔상", variationNumber: 3, apCost: 1, type: "Attack", description: "피해 240%\n허무 2장 생성\n그 카드에 증발 부여" },
    { cardName: "허무의 잔상", variationNumber: 4, apCost: "X", type: "Attack", description: "피해 50%\nX만큼 피해량 +150%\n허무 X+1장 생성" },
    { cardName: "허무의 잔상", variationNumber: 5, apCost: 0, type: "Attack", description: "피해 30%\n허무 2장 생성\n이번 전투 동안 생성한 허무 수만큼 피해량 +30%" },
    { cardName: "소멸의 낙인", variationNumber: 1, apCost: 3, type: "Attack", description: "모든 적 피해 450%\n카드 소멸 시 이 카드 1턴간 사용 시까지 비용 1 감소" },
    { cardName: "소멸의 낙인", variationNumber: 2, apCost: 3, type: "Attack", description: "무작위 적 피해 300% x 2\n카드 소멸 시 이 카드 1턴간 비용 1 감소" },
    { cardName: "소멸의 낙인", variationNumber: 3, apCost: 7, type: "Attack", description: "모든 적 피해 500%\n소멸된 허무 수만큼 비용 감소" },
    { cardName: "소멸의 낙인", variationNumber: 4, apCost: 1, type: "Attack", description: "모든 적 피해 200%\n이번 턴 소멸한 카드 수만큼 피해량 +40%" },
    { cardName: "소멸의 낙인", variationNumber: 5, apCost: 2, type: "Attack", description: "모든 적 피해 300%\n이번 턴에 소멸한 카드가 있다면 모든 적 고통 3" },
    { cardName: "블랙홀", variationNumber: 1, apCost: 2, type: "Attack", description: "피해 360%\n핸드의 허무 2장 발동" },
    { cardName: "블랙홀", variationNumber: 2, apCost: 2, type: "Attack", description: "피해 360%\n소멸된 허무 수만큼 피해량 +60%" },
    { cardName: "블랙홀", variationNumber: 3, apCost: 2, type: "Attack", description: "무작위 적 피해 60%\n소멸된 허무 수만큼 타격 1회 추가(최대 5회)" },
    { cardName: "블랙홀", variationNumber: 4, apCost: 2, type: "Attack", description: "피해 300%\n소멸된 허무 5장당 타격 1회 추가(최대 2회)" },
    { cardName: "블랙홀", variationNumber: 5, apCost: 1, type: "Upgrade", description: "허무 소멸 시 무작위 적 고정 피해 100%" },
    { cardName: "허망의 서약", variationNumber: 1, apCost: 1, type: "Upgrade", description: "허무 생성 시 피해, 치유 150% 효과를 가진 비용 1의 공격 카드로 변경" },
    { cardName: "허망의 서약", variationNumber: 2, apCost: 0, type: "Upgrade", description: "허무 생성 시 피해, 치유 100% 효과를 가진 비용 1의 공격 카드로 변경" },
    { cardName: "허망의 서약", variationNumber: 3, apCost: 1, type: "Upgrade", description: "허무 생성 시 피해 200% 효과를 가진 비용 1의 공격 카드로 변경" },
    { cardName: "허망의 서약", variationNumber: 4, apCost: 0, type: "Skill", description: "핸드의 허무, 상태이상, 저주 카드 모두 소멸\n그 수만큼 드로우" },
    { cardName: "허망의 서약", variationNumber: 5, apCost: 0, type: "Upgrade", description: "허무 카드 2장 소멸 시 모든 적 고통 2" },
  ],
  khalipe: [
    { cardName: "벌쳐 사출", variationNumber: 1, apCost: 3, type: "Attack", description: "모든 적 방어 기반 피해 280%\n은빛 장막 1" },
    { cardName: "벌쳐 사출", variationNumber: 2, apCost: 3, type: "Attack", description: "실드 280%\n은빛 장막 1" },
    { cardName: "벌쳐 사출", variationNumber: 3, apCost: 3, type: "Attack", description: "모든 적 방어 기반 피해 180%\n실드 150%\n은빛 장막 1" },
    { cardName: "벌쳐 사출", variationNumber: 4, apCost: 3, type: "Attack", description: "모든 적 방어 기반 피해 180%\n은빛 장막 1\n보존 : 실드 100%" },
    { cardName: "벌쳐 사출", variationNumber: 5, apCost: 3, type: "Attack", description: "모든 적 방어 기반 피해 180%\n은빛 장막 1\n핸드의 카드 수만큼 실드 40%" },
    { cardName: "대검 아퀼라", variationNumber: 1, apCost: 1, type: "Attack", description: "모든 적 방어 기반 피해 210%\n핸드에 벌쳐 사출이 있다면 비용 1 증가, 피해량 +120%" },
    { cardName: "대검 아퀼라", variationNumber: 2, apCost: 2, type: "Attack", description: "모든 적 방어 기반 피해 220%\n사용 시 피해량 +40%" },
    { cardName: "대검 아퀼라", variationNumber: 3, apCost: 2, type: "Attack", description: "모든 적 방어 기반 피해 220%\n핸드에 벌쳐 사출이 있다면 은빛 장막 1" },
    { cardName: "대검 아퀼라", variationNumber: 4, apCost: 2, type: "Attack", description: "모든 적 방어 기반 피해 220%\n보존: 다음 사용하는 벌쳐 사출의 피해량 60%" },
    { cardName: "대검 아퀼라", variationNumber: 5, apCost: 1, type: "Attack", description: "모든 적 방어 기반 피해 150%\n핸드에 벌쳐 사출이 있다면 비용 1 증가, 피해량 +100%" },
    { cardName: "위압", variationNumber: 1, apCost: 2, type: "Skill", description: "실드 300%\n모든 적 강인도 피해 1\n격파 상태인 적 수만큼 피해감소 1" },
    { cardName: "위압", variationNumber: 2, apCost: 2, type: "Skill", description: "실드 300%\n모든 적 강인도 피해 1\n격파 상태인 적 취약 2\n아닐 시 약화 2" },
    { cardName: "위압", variationNumber: 3, apCost: 2, type: "Skill", description: "실드 300%\n모든 적 강인도 피해 2" },
    { cardName: "위압", variationNumber: 4, apCost: 2, type: "Skill", description: "실드 250%\n모든 적 강인도 피해 1\n핸드의 카드 수만큼 실드 획득량 +40%" },
    { cardName: "위압", variationNumber: 5, apCost: 2, type: "Skill", description: "실드 300%\n모든 적 강인도 피해 1\n모든 적 행동 카운트 5 증가" },
    { cardName: "재집결", variationNumber: 1, apCost: 1, type: "Skill", description: "실드 150%\n비용이 가장 높은 카드 드로우 1\n은빛 장막 1" },
    { cardName: "재집결", variationNumber: 2, apCost: 1, type: "Skill", description: "실드 150%\n천상 카드 드로우 1\n은빛 장막 1" },
    { cardName: "재집결", variationNumber: 3, apCost: 2, type: "Skill", description: "실드 150%\n비용이 가장 높은 카드 드로우 1\n은빛 장막 1" },
    { cardName: "재집결", variationNumber: 4, apCost: 1, type: "Skill", description: "실드 120%\n드로우 1\n그 카드의 비용만큼 실드 60%\n은빛 장막 1" },
    { cardName: "재집결", variationNumber: 5, apCost: 1, type: "Skill", description: "실드 150%\n뽑을 카드에서 비용 2 이상인 카드 1장 선택 드로우" },
  ],
  narja: [
    { cardName: "굶주림의 굴레", variationNumber: 1, apCost: 1, type: "Attack", description: "감응 : 탐식 6\n방어 기반 피해 30% × 4" },
    { cardName: "굶주림의 굴레", variationNumber: 2, apCost: 0, type: "Attack", description: "감응 : 탐식 1\n방어 기반 피해 30% × 2\n턴 시작 시 이전 턴에 탐식을 3회 이상 발동했다면 핸드로 이동" },
    { cardName: "굶주림의 굴레", variationNumber: 3, apCost: 1, type: "Attack", description: "방어 기반 피해 50% × 3\n보유한 탐식 4마다 타격 1회 추가 (최대 3회)" },
    { cardName: "굶주림의 굴레", variationNumber: 4, apCost: 1, type: "Skill", description: "탐식 최대 5 감소\n그 수만큼 다음 사용하는 공격 카드의 피해 +40%\n5 감소했다면 포식 3" },
    { cardName: "굶주림의 굴레", variationNumber: 5, apCost: 0, type: "Skill", description: "실드 60%\n탐식 최대 3 감소\n그 수만큼 반복" },
    { cardName: "무한한 허기", variationNumber: 1, apCost: 0, type: "Skill", description: "탐식 3\n다음 2번의 탐식 발동 시 핸드의 무작위 카드 1장 1턴간 비용 1 감소" },
    { cardName: "무한한 허기", variationNumber: 2, apCost: 0, type: "Skill", description: "핸드의 무작위 카드 2장 1턴간 비용 1 감소" },
    { cardName: "무한한 허기", variationNumber: 3, apCost: 1, type: "Upgrade", description: "1턴간 탐식 3번 발동 시 핸드의 무작위 카드 1장 사용 시까지 비용 1 감소 (턴당 1회)" },
    { cardName: "무한한 허기", variationNumber: 4, apCost: 0, type: "Skill", description: "1턴간 방어 기반 피해 +100%" },
    { cardName: "무한한 허기", variationNumber: 5, apCost: 1, type: "Skill", description: "탐식 7\n1턴간 탐식 발동 시마다 다음 완전한 식사의 피해량 +40%" },
    { cardName: "능동 제어", variationNumber: 1, apCost: 1, type: "Skill", description: "탐식이 6 미만이라면 탐식 9\n6 이상이라면 포식 3" },
    { cardName: "능동 제어", variationNumber: 2, apCost: 0, type: "Skill", description: "완전한 식사가 뽑을 카드에 있다면 핸드로 이동\n무덤에 있다면 1턴간 사기 3" },
    { cardName: "능동 제어", variationNumber: 3, apCost: 1, type: "Skill", description: "2턴간 대상의 행동 카운트가 감소할 때마다 탐식 1" },
    { cardName: "능동 제어", variationNumber: 4, apCost: 1, type: "Upgrade", description: "탐식 10\n공격 카드 1장 선택\n그 카드가 핸드로 이동할 때마다 포식 1" },
    { cardName: "능동 제어", variationNumber: 5, apCost: 1, type: "Upgrade", description: "기본 공격 카드로 타격 시마다 탐식 1\n기본 공격 카드의 피해량 +50%" },
    { cardName: "탐식의 영역", variationNumber: 1, apCost: 1, type: "Attack", description: "모든 적 방어 기반 피해 100%\n대상의 다음 격파 시까지 받는 강인도 피해 100% 증가\n격파 시 탐식 3" },
    { cardName: "탐식의 영역", variationNumber: 2, apCost: 1, type: "Attack", description: "모든 적 방어 기반 피해 100%\n2턴간 대상이 받는 방어 기반 피해 +100%" },
    { cardName: "탐식의 영역", variationNumber: 3, apCost: 1, type: "Attack", description: "모든 적 방어 기반 피해 150%\n다음 5번의 대상 타격시 치유 40%" },
    { cardName: "탐식의 영역", variationNumber: 4, apCost: 3, type: "Attack", description: "모든 적 방어 기반 피해 320%\n탐식과 포식이 있다면 1번 더 발동" },
    { cardName: "탐식의 영역", variationNumber: 5, apCost: 1, type: "Upgrade", description: "완전한 식사 사용 시마다 치유 200%" },
  ],
  orlea: [
    { cardName: "성스러운 향로", variationNumber: 1, apCost: 1, type: "Skill", description: "피조물★ 3장 생성" },
    { cardName: "성스러운 향로", variationNumber: 2, apCost: 2, type: "Upgrade", description: "피조물★ 2장 생성\n턴 시작 시 피조물★ 1장 생성" },
    { cardName: "성스러운 향로", variationNumber: 3, apCost: 1, type: "Skill", description: "말랑이★, 피조물★ 1장씩 생성\n다음 말랑이 사용 시 말랑이★ 생성" },
    { cardName: "성스러운 향로", variationNumber: 4, apCost: 1, type: "Skill", description: "날렵이★, 피조물★ 1장씩 생성\n다음 사용하는 날렵이 피해량 40% 증가" },
    { cardName: "성스러운 향로", variationNumber: 5, apCost: 1, type: "Skill", description: "튼튼이★, 피조물★ 1장씩 생성\n다음 튼튼이 사용 시 실드 150%" },
    { cardName: "성장 촉진", variationNumber: 1, apCost: 0, type: "Skill", description: "치유 100%\n핸드의 카드 1장 선택, 보존 효과 2회 발동" },
    { cardName: "성장 촉진", variationNumber: 2, apCost: 2, type: "Skill", description: "치유 200%\n핸드의 자신의 피조물 1장 선택, 핸드에 복제" },
    { cardName: "성장 촉진", variationNumber: 3, apCost: 1, type: "Skill", description: "치유 150%\n핸드의 자신의 카드 1장 선택, 보존 효과 2회 발동\n그 카드가 말랑이일 시 모든 적 취약 2" },
    { cardName: "성장 촉진", variationNumber: 4, apCost: 1, type: "Skill", description: "치유 150%\n핸드의 자신의 카드 1장 선택, 보존 효과 2회 발동\n그 카드가 날렵이일 시 보존 효과 3회로 발동" },
    { cardName: "성장 촉진", variationNumber: 5, apCost: 1, type: "Skill", description: "치유 150%\n핸드의 자신의 카드 1장 선택, 보존 효과 2회 발동\n그 카드가 튼튼이일 시 아군 스트레스 5 감소" },
    { cardName: "귀찮아", variationNumber: 1, apCost: 0, type: "Attack", description: "핸드의 카드 수만큼 고정 피해 40%\n6장 이상일 시 치유 150%" },
    { cardName: "귀찮아", variationNumber: 2, apCost: 1, type: "Attack", description: "피해 100%\n핸드의 피조물 수만큼 피해량 +100%" },
    { cardName: "귀찮아", variationNumber: 3, apCost: 3, type: "Attack", description: "고정 피해 450%\n보존: 비용 1 감소" },
    { cardName: "귀찮아", variationNumber: 4, apCost: 0, type: "Attack", description: "무작위 적들에게 고정 피해 60% x 3\n타격한 대상 수만큼 피조물★ 1장 생성" },
    { cardName: "귀찮아", variationNumber: 5, apCost: 1, type: "Attack", description: "피해 100%\n이 카드 핸드에 있을 때 피조물 생성한 수만큼 사용 시까지 피해량 +100%" },
    { cardName: "성장하는 피조물", variationNumber: 1, apCost: 1, type: "Skill", description: "피조물★ 1장 생성\n보존: 피조물★ 1장 생성" },
    { cardName: "성장하는 피조물", variationNumber: 2, apCost: 1, type: "Skill", description: "피조물★ 1장 생성\n보존: 이 카드 피조물★★로 변경, 모든 피조물★ 1장씩 생성" },
    { cardName: "성장하는 피조물", variationNumber: 3, apCost: 1, type: "Skill", description: "피조물★ 1장 생성\n보존: 이 카드 말랑이★★★로 변경, 모든 적 취약 2" },
    { cardName: "성장하는 피조물", variationNumber: 4, apCost: 1, type: "Skill", description: "피조물★ 1장 생성\n보존: 이 카드 날렵이★★★로 변경, 보존 효과 2회 발동" },
    { cardName: "성장하는 피조물", variationNumber: 5, apCost: 1, type: "Skill", description: "피조물★ 1장 생성\n보존: 이 카드 튼튼이★★★로 변경, 모든 적 약화 3" },
  ],
  sereniel: [
    { cardName: "호밍 레이저", variationNumber: 1, apCost: 0, type: "Attack", description: "피해 150%\n격파 시 핸드로 이동\n파괴 : 타격 1회 추가" },
    { cardName: "호밍 레이저", variationNumber: 2, apCost: 0, type: "Attack", description: "피해 150%\n잔광 3\n격파 시 핸드로 이동" },
    { cardName: "호밍 레이저", variationNumber: 3, apCost: 1, type: "Attack", description: "피해 150%\n잔광 2\n버린 카드에 호밍 레이저L 2장 생성" },
    { cardName: "호밍 레이저", variationNumber: 4, apCost: 0, type: "Attack", description: "피해 100%\n잔광 1\n격파 혹은 턴 시작 시 핸드로 이동" },
    { cardName: "호밍 레이저", variationNumber: 5, apCost: 0, type: "Attack", description: "피해 150%\n잔광 2\n무덤의 호밍 레이저L 핸드로 이동" },
    { cardName: "플라스마 미사일", variationNumber: 1, apCost: 1, type: "Attack", description: "피해 180%\n강인도 피해 1\n대상이 격파되지 않았다면 1번 더 발동" },
    { cardName: "플라스마 미사일", variationNumber: 2, apCost: 1, type: "Attack", description: "피해 180%\n대상의 감소한 강인도 수만큼 피해량 +60% (최대 10)" },
    { cardName: "플라스마 미사일", variationNumber: 3, apCost: 1, type: "Attack", description: "피해 120%\n본능 약점 2\n1턴간 호밍 레이저 피해량 +60%" },
    { cardName: "플라스마 미사일", variationNumber: 4, apCost: 1, type: "Attack", description: "피해 120%\n뽑을 카드에 호밍 레이저L 3장 생성" },
    { cardName: "플라스마 미사일", variationNumber: 5, apCost: 1, type: "Upgrade", description: "턴 종료 시 무작위 적에게 피해 50%\n1턴간 핸드로 이동된 호밍 레이저 수만큼 피해량 +30%" },
    { cardName: "샤이닝 코어", variationNumber: 1, apCost: 1, type: "Skill", description: "호밍 레이저L 3장 생성" },
    { cardName: "샤이닝 코어", variationNumber: 2, apCost: 1, type: "Skill", description: "호밍 레이저L 2장 생성, 그 카드의 소멸 2 증가" },
    { cardName: "샤이닝 코어", variationNumber: 3, apCost: 1, type: "Upgrade", description: "호밍 레이저L 2장 생성\n격파 시 호밍 레이저L 2장 생성" },
    { cardName: "샤이닝 코어", variationNumber: 4, apCost: "X", type: "Skill", description: "호밍 레이저L X+1장 생성\n그 카드에 신속 부여" },
    { cardName: "샤이닝 코어", variationNumber: 5, apCost: 1, type: "Upgrade", description: "고유 번뜩임이 발생한 호밍 레이저 1장 선택 생성" },
    { cardName: "코발트 라이트", variationNumber: 1, apCost: 3, type: "Attack", description: "무작위 적들에게 피해 180% x 4\n타격당 강인도 피해 1\n격파 : 비용 1 감소" },
    { cardName: "코발트 라이트", variationNumber: 2, apCost: 3, type: "Attack", description: "무작위 적들에게 피해 120% x 4\n타격당 강인도 피해 1\n보존 : 사용 시까지 타격 1회 추가 (최대 5회)" },
    { cardName: "코발트 라이트", variationNumber: 3, apCost: 2, type: "Attack", description: "무작위 적들에게 피해 120% x 4\n타격한 대상 수만큼 호밍 레이저L 1장 생성" },
    { cardName: "코발트 라이트", variationNumber: 4, apCost: 1, type: "Attack", description: "무작위 적들에게 피해 120%\n핸드의 호밍 레이저 수 만큼 타격 1회 추가" },
    { cardName: "코발트 라이트", variationNumber: 5, apCost: 3, type: "Attack", description: "피해 120% x 4\n격파 : 1번 더 발동" },
  ],
  tiphera: [
    { cardName: "퀀텀 시드", variationNumber: 1, apCost: 0, type: "Skill", description: "치유 150%\n뽑을 카드에 창조 카드 3장 생성\n그 중 1장 드로우" },
    { cardName: "퀀텀 시드", variationNumber: 2, apCost: 0, type: "Skill", description: "치유 100%\n창조 카드 1장 선택\n핸드와 뽑을 카드에 1장씩 생성" },
    { cardName: "퀀텀 시드", variationNumber: 3, apCost: 0, type: "Skill", description: "드로우 1\n생성될 창조 카드 예측\n창조 카드 1장 생성\n예측이 맞았다면 뽑을 카드에 나머지 생성" },
    { cardName: "퀀텀 시드", variationNumber: 4, apCost: 1, type: "Skill", description: "뽑을 카드에 창조 카드 3장 생성\n그 중 1장 드로우\n무작위 자신의 카드 1장 보존 효과 2회 발동" },
    { cardName: "퀀텀 시드", variationNumber: 5, apCost: 1, type: "Upgrade", description: "창조 카드 1장 생성\n행동 포인트가 0 일 시 핸드와 뽑을 카드에 창조 카드 1장씩 생성 (턴당 1회)" },
    { cardName: "형상 결집", variationNumber: 1, apCost: 1, type: "Skill", description: "창조 카드 3장 드로우\n그 카드들의 무작위 효과 1턴간 2배" },
    { cardName: "형상 결집", variationNumber: 2, apCost: 1, type: "Skill", description: "창조 카드 4장 드로우\n핸드의 소멸 카드 1장 선택 소멸" },
    { cardName: "형상 결집", variationNumber: 3, apCost: 0, type: "Skill", description: "핸드의 모든 창조 카드 다른 창조 카드로 변경\n보존 : 창조 카드 1장 드로우" },
    { cardName: "형상 결집", variationNumber: 4, apCost: 1, type: "Skill", description: "모든 카드의 소멸 카드 3장까지 선택 소멸\n그 수만큼 소멸 카드 드로우" },
    { cardName: "형상 결집", variationNumber: 5, apCost: 1, type: "Skill", description: "창조 카드 1장 드로우\n같은 카드를 연속해서 뽑을 때까지 반복 (최대 6회)" },
    { cardName: "창조와 파괴", variationNumber: 1, apCost: 1, type: "Attack", description: "방어 기반 피해 180%\n실드 100%\n치유 100%\n조율 : 모든 효과 2배" },
    { cardName: "창조와 파괴", variationNumber: 2, apCost: 5, type: "Attack", description: "방어 기반 피해 550%\n카드 소멸 시 이 카드 1턴간 사용 시까지 비용 1 감소" },
    { cardName: "창조와 파괴", variationNumber: 3, apCost: 2, type: "Attack", description: "방어 기반 피해 160%\n실드 40%\n치유 40%\n보존 : 발동 시까지 모든 효과 100% 증가 (최대 4회)" },
    { cardName: "창조와 파괴", variationNumber: 4, apCost: 1, type: "Upgrade", description: "행동 포인트가 0일 시 창조와 파괴 1장 생성\n그 카드 비용 1 감소, 소멸 부여 (턴당 1회)" },
    { cardName: "창조와 파괴", variationNumber: 5, apCost: 5, type: "Attack", description: "이 카드의 비용만큼 방어 기반 피해 150%\n카드 소멸 시 이 카드 비용 1 ~ 9 무작위로 변경" },
    { cardName: "쌍생성", variationNumber: 1, apCost: 1, type: "Upgrade", description: "창조 카드 2장 생성 시 버린 카드에 동일한 카드 1장 생성" },
    { cardName: "쌍생성", variationNumber: 2, apCost: 1, type: "Upgrade", description: "창조 카드 3장 생성 시 핸드에 동일한 카드 1장 생성\n그 카드에 보존 부여" },
    { cardName: "쌍생성", variationNumber: 3, apCost: 1, type: "Upgrade", description: "창조 : □ 발동 시 버린 카드에 다른 창조 카드 1장 생성" },
    { cardName: "쌍생성", variationNumber: 4, apCost: 1, type: "Skill", description: "창조 카드 1장씩 생성\n다음 소멸하는 창조 카드 1장 생성" },
    { cardName: "쌍생성", variationNumber: 5, apCost: 1, type: "Upgrade", description: "창조 카드 핸드로 이동 시 그 카드 복제, 무작위 효과 제거 (턴당 5회)" },
  ],
  cassius: [
    { cardName: "팝 아이드 파퍼", variationNumber: 1, apCost: 0, type: "Upgrade", description: "4개의 퀘스트 중 무작위 1개 시작" },
    { cardName: "팝 아이드 파퍼", variationNumber: 2, apCost: 0, type: "Upgrade", description: "4개의 퀘스트 중 무작위 1개 시작\n퀘스트 카드 생성 시 증발 제거, 보존 부여" },
    { cardName: "팝 아이드 파퍼", variationNumber: 3, apCost: 0, type: "Upgrade", description: "4개의 퀘스트 중 무작위 1개 시작\n퀘스트 완료 시 한층 더 강한 퀘스트 카드 생성" },
    { cardName: "팝 아이드 파퍼", variationNumber: 4, apCost: 0, type: "Upgrade", description: "4개의 퀘스트 중 1개를 선택하여 시작" },
    { cardName: "팝 아이드 파퍼", variationNumber: 5, apCost: 0, type: "Upgrade", description: "4개의 퀘스트 중 무작위 1개 시작\n퀘스트 완료 시 다른 무작위 퀘스트로 교체" },
    { cardName: "데블 다이스", variationNumber: 1, apCost: 1, type: "Attack", description: "피해 200%\n퀘스트 카드 1장 생성" },
    { cardName: "데블 다이스", variationNumber: 2, apCost: 1, type: "Attack", description: "피해 160%\n드로우 1" },
    { cardName: "데블 다이스", variationNumber: 3, apCost: 1, type: "Attack", description: "모든 적 피해 160%\n타격한 대상 수만큼 드로우" },
    { cardName: "데블 다이스", variationNumber: 4, apCost: 1, type: "Attack", description: "피해 240%\n드로우 2\n버리기 2" },
    { cardName: "데블 다이스", variationNumber: 5, apCost: 0, type: "Attack", description: "드로우 1\n그 카드의 비용만큼 모든 적 피해 80%" },
    { cardName: "카드 섞기", variationNumber: 1, apCost: 1, type: "Skill", description: "핸드의 모든 카드 버리기\n그 수만큼 드로우" },
    { cardName: "카드 섞기", variationNumber: 2, apCost: 1, type: "Skill", description: "핸드의 카드 원하는 만큼 버리기\n그 수만큼 드로우" },
    { cardName: "카드 섞기", variationNumber: 3, apCost: 1, type: "Skill", description: "핸드와 버린 카드의 모든 카드를 뽑을 카드로 이동\n드로우 5" },
    { cardName: "카드 섞기", variationNumber: 4, apCost: 0, type: "Skill", description: "버린 카드에서 카드를 5장까지 선택, 뽑을 카드 맨 위로 이동" },
    { cardName: "카드 섞기", variationNumber: 5, apCost: 0, type: "Skill", description: "드로우 3\n그 카드들의 비용 합이 4 이하라면 모두 버리기" },
    { cardName: "다이스 트릭", variationNumber: 1, apCost: 2, type: "Attack", description: "피해 360%\n1턴간 사기 1 감소\n완료한 퀘스트 수만큼 비용 감소" },
    { cardName: "다이스 트릭", variationNumber: 2, apCost: 2, type: "Attack", description: "모든 적 피해 300%\n1턴간 사기 1 감소\n완료한 퀘스트 수만큼 비용 감소" },
    { cardName: "다이스 트릭", variationNumber: 3, apCost: 0, type: "Attack", description: "피해 80%\n완료한 퀘스트 수만큼 피해량 +80% (최대 5회)" },
    { cardName: "다이스 트릭", variationNumber: 4, apCost: 2, type: "Upgrade", description: "퀘스트 카드 사용 시 치유 100%, 무작위 적 고정 피해 100%" },
    { cardName: "다이스 트릭", variationNumber: 5, apCost: 2, type: "Upgrade", description: "턴 시작 시 강해진 퀘스트 카드 1장 생성" },
  ],
  tressa: [
    { cardName: "단검 꺼내기", variationNumber: 1, apCost: 0, type: "Skill", description: "그림자 단검 2장 생성" },
    { cardName: "단검 꺼내기", variationNumber: 2, apCost: 1, type: "Skill", description: "그림자 단검 3장 생성" },
    { cardName: "단검 꺼내기", variationNumber: 3, apCost: 1, type: "Upgrade", description: "그림자 단검 1장 생성\n턴 시작 시 그림자 단검 1장 생성" },
    { cardName: "단검 꺼내기", variationNumber: 4, apCost: 1, type: "Skill", description: "그림자 단검 2장 생성\n생성된 그림자 단검의 고통 부여 효과가 2 증가" },
    { cardName: "단검 꺼내기", variationNumber: 5, apCost: 1, type: "Skill", description: "그림자 단검 4장 생성" },
    { cardName: "저주 부여", variationNumber: 1, apCost: 0, type: "Skill", description: "1턴간 카드 사용 시 무작위 적 고통 1" },
    { cardName: "저주 부여", variationNumber: 2, apCost: 0, type: "Skill", description: "2턴간 공격 카드 사용 시 대상에게 고통 1" },
    { cardName: "저주 부여", variationNumber: 3, apCost: 1, type: "Skill", description: "무작위 적들에게 고통 4 x 2" },
    { cardName: "저주 부여", variationNumber: 4, apCost: 1, type: "Upgrade", description: "모든 적 고통 2\n턴 시작 시 모든 적 고통 2" },
    { cardName: "저주 부여", variationNumber: 5, apCost: 2, type: "Upgrade", description: "카드로 고통 부여 시 대상에게 고통 1 추가" },
    { cardName: "그림자 장전", variationNumber: 1, apCost: 1, type: "Attack", description: "모든 적 피해 80%\n고통 2\n핸드의 그림자 단검 모두 소멸, 그 수만큼 반복" },
    { cardName: "그림자 장전", variationNumber: 2, apCost: 0, type: "Skill", description: "치유 150%\n상급 그림자 단검 1장 생성" },
    { cardName: "그림자 장전", variationNumber: 3, apCost: "X", type: "Skill", description: "치유 100% x X\n그림자 단검, 상급 그림자 단검 중 무작위 X장 생성" },
    { cardName: "그림자 장전", variationNumber: 4, apCost: 1, type: "Skill", description: "모든 그림자 단검 소멸\n그 수만큼 상급 그림자 단검 생성" },
    { cardName: "그림자 장전", variationNumber: 5, apCost: 1, type: "Skill", description: "카드 모두 버리기\n그 수만큼 그림자 단검 생성" },
    { cardName: "급소 공격", variationNumber: 1, apCost: 2, type: "Attack", description: "피해 150% x 3" },
    { cardName: "급소 공격", variationNumber: 2, apCost: 2, type: "Attack", description: "피해 120% x 3\n대상이 고통 상태라면 피해량 +70%" },
    { cardName: "급소 공격", variationNumber: 3, apCost: 2, type: "Attack", description: "피해 80% x 3\n고통 2 ~ 6" },
    { cardName: "급소 공격", variationNumber: 4, apCost: 2, type: "Attack", description: "피해 200% x 2\n대상의 고통 3 이상일 시 1번 더 발동" },
    { cardName: "급소 공격", variationNumber: 5, apCost: 2, type: "Attack", description: "피해 150% x 3\n대상의 고통 수만큼 피해량 +10%" },
  ],
};

// Load existing data
const existingPath = './scripts/variation-data.json';
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));

// Merge
const merged = { ...existing, ...newData };

// Write
fs.writeFileSync(existingPath, JSON.stringify(merged, null, 2));

const totalChars = Object.keys(merged).length;
const totalVariations = Object.values(merged).reduce(
  (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0
);

console.log(`Merged: ${totalChars} characters, ${totalVariations} total variations`);
console.log(`New characters added: ${Object.keys(newData).join(', ')}`);
console.log('Output:', existingPath);
