/**
 * Parse namu wiki neutral card page text and output KO_EFFECTS mapping.
 * Usage: node scripts/parse-namu-effects.mjs
 */

const namuText = `0
압도
공격
[ 소멸 ]
모든 적 피해 100% × 3
뽑을 카드에 과부하 2장 생성
직업: 스트라이커, 뱅가드
0
퀵드로우
공격
[ 개전 / 소멸 ]
피해 150%
표식 1
직업: 레인저, 헌터
0
비장의 한 발
공격
[ 보존 / 소멸 ]
피해 100%
보존: 피해량 +50%
직업: 레인저, 헌터
1
도약 공격
공격
피해 200%
영감: 비용 1 감소, 드로우 1
직업: 레인저, 헌터
1
두개골 강타
공격
피해 200%
약점 공격: 피해량 +50%
직업: 레인저, 헌터
1
연속 공격
공격
피해 50% x 3
직업: 레인저, 헌터
1
파멸
공격
[ 소멸 ]
피해 300%
버리기 1
직업: 레인저, 헌터
1
가시 방패
공격
모든 적 방어 기반 피해 100%
파괴: 타격 1회 추가
직업: 스트라이커, 뱅가드
2
무거운 강타
공격
피해 200%
취약 2, 약화 2
직업: 스트라이커, 뱅가드
2
충격
공격
모든 적 피해 200%
취약 2
직업: 레인저, 헌터
2
혼신
공격
방어 기반 피해 100% x 2
결의 수만큼 피해량 +20%
직업: 스트라이커, 뱅가드
2
격분
공격
피해 300%
핸드에 다른 전투원의 카드가 없다면 이 카드 비용 2 감소
직업: 스트라이커, 뱅가드
3
태클
공격
[ 분쇄 ]
방어 기반 피해 400%
체력이 가득 찬 상태라면 이 카드 비용 1 감소
직업: 스트라이커, 뱅가드
0
공격하라!
스킬
뽑을 카드의 공격 카드 1장 선택, 그 카드 핸드로 이동
직업: 사이오닉, 컨트롤러
조건: 심판의 늪 탐사도 레벨 10 달성
0
집결
스킬
[ 신속 / 소멸 2 ]
드로우 1
모든 적 행동 카운트 3 증가
직업: 사이오닉, 컨트롤러
1
보호의 외침
스킬
실드 130%
실드가 없다면 실드 100% 증가
직업: 스트라이커, 뱅가드
1
반격 준비
스킬
[ 소멸 ]
에고 스킬 슬롯을 다른 에고 스킬들로 교체
직업: 사이오닉, 컨트롤러
1
참회
스킬
[ 소멸 ]
사기 1 감소
결의 1 감소
직업: 사이오닉, 컨트롤러
조건: 안개의 도시 탐사도 레벨 10 달성
1
전략의 재구성
스킬
[ 소멸 ]
다음 사용하는 에고 스킬의 비용 1 감소
직업: 사이오닉, 컨트롤러
1
견고함
스킬
실드 150%
연속 : 다음 턴 시작 시 실드 150%
직업: 스트라이커, 뱅가드
1
협상
스킬
[ 보존 / 소멸 ]
사기 2
모든 적 사기 2
직업: 레인저, 헌터
0
산성 가스
스킬
[ 회수 / 소멸 ]
모든 적 손상 3
직업: 레인저, 헌터
1
해소의 바람
스킬
모든 적 고통 2
핸드의 상태이상, 저주 카드 2장 까지 선택 소멸
직업: 사이오닉, 컨트롤러
1
금융 치료
스킬
[ 소멸 ]
치유 200%
체력이 가득 찬 상태라면 크레딧 30 획득
직업: 사이오닉, 컨트롤러
1
가학성
스킬
[ 주도 ]
모든 적 취약 1
핸드의 무작위 공격 카드 1장 1턴간 비용 1 감소
직업: 사이오닉, 컨트롤러
2
집요한 인내
스킬
[ 보존 ]
실드 350%
직업: 스트라이커, 뱅가드
2
구급 키트
스킬
[ 천상 / 소멸 ]
치유 200%
직업: 사이오닉, 컨트롤러
1
마력 폭주
강화
면역 2
직업: 스트라이커, 뱅가드
조건: 쌍성의 그림자 탐사도 레벨 10 달성
1
직감 점화
강화
카드 생성 시 무작위 번뜩임 부여
(턴당 1회)
직업: 사이오닉, 컨트롤러
2
각오
강화
턴 시작 시 핸드의 무작위 공격 카드 1장 1턴간 피해량 +50%
직업: 레인저, 헌터
3
영광의 저항
강화
턴 시작 시 아군에게 최대 체력 10% 고정 피해
행동 포인트 1 획득
직업: 사이오닉, 컨트롤러
0
빠른 연사
공격
피해 80%
드로우 1
직업: 레인저, 헌터
조건: 푸른 항아리 탐사도 레벨 10 달성
0
기동 사격
공격
[ 개전 / 소멸 ]
모든 적 피해 200%
직업: 레인저, 헌터
0
기습
공격
피해 80%
격파 시 이 카드를 무덤에서 핸드로 이동
직업: 레인저, 헌터
1
육탄전
공격
[ 소멸 ]
방어 기반 피해 200%
결정화 2
직업: 스트라이커, 뱅가드
1
신성한 일격
공격
[ 소멸 ]
피해 200%
강인도 피해 2
직업: 스트라이커, 뱅가드
1
근육 강화 진화체
공격
피해 80% × 2
영감 : 타격 2회 추가
직업: 레인저, 헌터
기타 사항: 은하계 재해 시즌 1 기간 동안 제 0 연구소 에서 습득 가능
2
원자 분해
공격
모든 적 관통 피해 230%
직업: 사이오닉, 컨트롤러
2
필살의 사격
공격
피해 350%
다음 턴 시작 시 드로우 1
직업: 레인저, 헌터
조건: 도래된 혼돈 탐사도 레벨 10 달성
2
증식형 바이러스
공격
피해 120% x 1
감응 : 타격 1회 추가 (최대 5 중첩)
직업: 레인저, 헌터
기타 사항: 은하계 재해 시즌 1 기간 동안 제 0 연구소 에서 습득 가능
0
공허의 방랑자
스킬
[ 소멸 ]
1턴간 대상의 행동 카운트 감소하지 않음
직업: 사이오닉, 컨트롤러
0
에너지 보호막
스킬
[ 소멸 ]
실드 100%
행동 포인트 1 획득
직업: 스트라이커, 뱅가드
0
재활용
스킬
에고 포인트 2 이상일 시 행동 포인트 1 획득, 에고 포인트 2 감소
직업: 사이오닉, 컨트롤러
0
공격성 돌연변이
스킬
[ 소멸 ]
자신의 공격 카드 드로우 1, 1턴간 그 카드 피해량 +50%
직업: 스트라이커, 뱅가드
기타 사항: 은하계 재해 시즌 1 기간 동안 제 0 연구소 에서 습득 가능
0
껍질 형성 세포
스킬
[ 보존 ]
실드 70%
핸드의 카드 수만큼 실드 +25%
직업: 스트라이커, 뱅가드
기타 사항: 은하계 재해 시즌 1 기간 동안 제 0 연구소 에서 습득 가능
1
전략의 시작점
스킬
[ 소멸 ]
에고 포인트 2 획득
직업: 사이오닉, 컨트롤러
1
어둠의 지식
스킬
[ 종극 / 소멸 ]
드로우 1
그 카드 발동
직업: 사이오닉, 컨트롤러
1
수면 열매
스킬
[ 종극 / 소멸 ]
무작위 전투원 스트레스 5 감소
2
카모플라쥬
스킬
[ 소멸 ]
회피 1
다음 턴 드로우 2
직업: 스트라이커, 뱅가드
1
철벽
강화
[ 개전 ]
결의 1
불굴 1
직업: 스트라이커, 뱅가드
1
전술 대응
강화
[ 개전 ]
실드를 보유한 대상에게 피해량 25% 증가 (최대 1)
직업: 레인저, 헌터
2
자가 발전 실험
강화
[ 주도 ]
핸드의 카드가 6장 이상일 시 핸드의 무작위 카드 1장 1턴간 비용 0으로 변경
(턴당 1회)
직업: 사이오닉, 컨트롤러
기타 사항: 은하계 재해 시즌 1 기간 동안 제 0 연구소 에서 습득 가능
2
강제 학습 장치
강화
[ 주도 ]
카드 4장 사용 시 드로우 1 (턴 당 1회)
직업: 사이오닉, 컨트롤러
기타 사항: 은하계 재해 시즌 1 기간 동안 제 0 연구소 에서 습득 가능
0
정밀 조준
공격
피해 120%
드로우 1
핸드의 카드 1장 선택, 그 카드 뽑을 카드 맨 위로 이동
직업: 레인저, 헌터
조건: 쌍성의 그림자 탐사도 레벨 25 달성
2
조준 사격
공격
피해 400%
처치 : 크레딧 20 획득
직업: 레인저, 헌터
2
짓이기기
공격
[ 약점 공격 ]
피해 150% × 2
드로우 1
직업: 스트라이커, 뱅가드
0
호전성
스킬
핸드에 공격 카드가 없을 시 드로우 2
직업: 스트라이커, 뱅가드
조건: 안개의 도시 탐사도 레벨 25 달성
0
압류
스킬
드로우 1
뽑을 카드 혹은 버린 카드에서 무작위 금기 카드 1장 핸드로 이동
기타 사항: 은하계 재해 시즌 1 기간 동안 제 0 연구소 에서 습득 가능
1
전투 준비
스킬
무작위 델랑 상점 카드 1장 생성
1턴간 그 카드의 비용 0으로 변경
조건: 심판의 늪 탐사도 레벨 25 달성
1
장비 가방
스킬
[ 소멸 / 연계 ]
드로우 2
직업: 사이오닉, 컨트롤러
1
재정비
스킬
[ 소멸 ]
드로우 3
직업: 사이오닉, 컨트롤러
조건: 도래된 혼돈 탐사도 레벨 25 달성
3
금지된 알고리즘
스킬
[ 소멸 / 주도 ]
핸드에 무작위 금기 카드 1장 생성
기타 사항: 은하계 재해 시즌 1 기간 동안 제 0 연구소 에서 습득 가능
1
금기 : 분노의 초상
공격
피해 70% × 1
핸드의 카드 4 장당 타격 1회 추가
타격횟수 만큼 드로우 1
9
금기 : 폭력의 환희
공격
[ 보존 ]
피해 150% × 4
능력으로 드로우 시 이 카드 비용 1 감소
0
금기 : 자유의 손짓
스킬
[ 소멸 / 개전 ]
핸드의 무작위 카드 1장 비용 1 감소
0
금기 : 영생의 허기
스킬
[ 보존 / 소멸 ]
감응 : 드로우 1, 행동 포인트 1 획득
1
금기 : 일회용 자아
스킬
드로우 1, 그 카드 비용만큼 드로우
2
금기 : 새겨진 악의
스킬
[ 주도 ]
드로우 1
핸드의 무작위 카드 발동 2
1
금기 : 허무의 인도
강화
[ 개전 ]
능력으로 드로우 시 치유 40%, 무작위 전투원 스트레스 1 감소
1
수줍은 정원사
공격
피해 50% × 4
표식 3
1
음울한 대부
공격
피해 50% x 4
고통 6
2
슬로터
스킬
[ 소멸 ]
실드 200%
획득한 실드만큼 모든 적 피해
3
빔슈터
공격
피해 350%
대상이 실드를 보유하면 피해량 +50%
1
날개 인면수
공격
무작위 적들에게 피해 50% × 5
1
울브즈 베인
공격
모든 적 피해 120%
약화 2
손상 2
1
어둠 손아귀
공격
피해 120% × 2
처치 : 무작위 적들에게 약화 120% × 2
2
고통의 치천사
공격
피해 250%
핸드에 이 카드만 있다면 비용 2 감소
0
나락충
스킬
[ 소멸 ]
사기 1 감소
결의 3 감소
1
트래퍼
스킬
실드 120%, 취약 1
대상이 행동하지 않았다면 실드 획득량 +120%, 취약 1 추가
1
컬티스트 아비터
스킬
실드 140%
다음 턴 시작 시 모든 적 행동 카운트 2 증가
1
로튼 리퍼
공격
[ 신속 ]
피해 160%
행동 카운트 1 증가
0
서늘한 대부
스킬
뽑을 카드 맨 아래의 카드 1장 발동
핸드의 카드 1장 선택, 그 카드 뽑을 카드 맨 아래로 이동
0
공허의 굶주림
스킬
[ 소멸 ]
사기 2
사기 2 감소
1
음산한 대모
강화
턴 종료 시 무작위 적들에게 피해 200%
1
오토마타 카발리
공격
피해 150%
취약 4
1
악령 샐러맨더
스킬
[ 소멸 2 ]
드로우 4
1
정령 피닉스
스킬
[ 소멸 ]
결의 2
감소한 체력만큼 실드 획득
1
정령 캐폭스
스킬
[ 소멸 ]
뽑을 카드에서 1장 선택 드로우, 그 카드에 회수 부여
0
알비툼
강화
받는 피해량 -15% (턴당 1회)
1
갑각충
강화
결정화 5
2
솔저 프라임
공격
피해 300%
격파 시 행동 포인트 2 획득
1
상실의 굶주림
스킬
[ 소멸 ]
드로우 1
핸드의 카드가 없다면 드로우 4 추가
2
도미니온
강화
턴 시작 시 사기 1
1
악령 듀라한
강화
타게팅 공격 카드 사용 시 대상에게 고통 1
1
세븐 암즈
공격
[ 신속 ]
피해 120%
대상의 행동 카운트 5 이상일 시 행동 포인트 2 획득
2
HA-00
공격
무작위 적들에게 피해 100% x 4
타격한 대상에게 취약 1 또는 약화 1`;

// Korean → English name mapping (reverse of KO_NAMES)
const KO_TO_EN = {
  '압도': 'Overwhelm', '퀵드로우': 'Quickdraw', '비장의 한 발': 'Hidden Bullet',
  '도약 공격': 'Leap Attack', '두개골 강타': 'Skull Bash', '연속 공격': 'Consecutive Attack',
  '파멸': 'Destruction', '가시 방패': 'Spiked Shield', '무거운 강타': 'Heavy Bash',
  '충격': 'Shock', '혼신': 'Devotion', '격분': 'Rage', '태클': 'Tackle',
  '공격하라!': 'Attack!', '집결': 'Rally', '보호의 외침': 'Protective Shout',
  '반격 준비': 'Counterattack Preparation', '참회': 'Repent',
  '전략의 재구성': 'Tactical Reformation', '견고함': 'Fortitude', '협상': 'Negotiate',
  '산성 가스': 'Acid Gas', '해소의 바람': 'Wind of Relief', '금융 치료': 'Financial Therapy',
  '가학성': 'Sadism', '집요한 인내': 'Relentless Endurance', '구급 키트': 'First Aid Kit',
  '마력 폭주': 'Arcane Rush', '직감 점화': 'Instinct Ignition', '각오': 'Determination',
  '영광의 저항': 'Glorious Resistance',
  '빠른 연사': 'Quick Shelling', '기동 사격': 'Maneuvering Fire', '기습': 'Ambush',
  '육탄전': 'Hand-to-Hand Combat', '신성한 일격': 'Sacred Strike',
  '근육 강화 진화체': 'Muscle-Enhanced Evolver', '원자 분해': 'Atomic Decomposition',
  '필살의 사격': 'Deadly Shot', '증식형 바이러스': 'Propagative Virus',
  '공허의 방랑자': 'Wanderer of the Void', '에너지 보호막': 'Energy Barrier',
  '재활용': 'Recycling', '공격성 돌연변이': 'Aggressive Mutant',
  '껍질 형성 세포': 'Shell-Forming Cell', '전략의 시작점': 'Strategic Starting Point',
  '어둠의 지식': 'Knowledge of Darkness', '수면 열매': 'Somnolent Fruit',
  '카모플라쥬': 'Camouflage', '철벽': 'Iron Wall', '전술 대응': 'Tactical Action',
  '자가 발전 실험': 'Self-Generating Experiment', '강제 학습 장치': 'Forced Learning Apparatus',
  '정밀 조준': 'Precision Aim', '조준 사격': 'Aimed Fire', '짓이기기': 'Pulverize',
  '호전성': 'Belligerence', '압류': 'Confiscation', '전투 준비': 'Prepare for Battle',
  '장비 가방': 'Gear Bag', '재정비': 'Reorganize', '금지된 알고리즘': 'Forbidden Algorithm',
  '금기 : 분노의 초상': 'Forbidden: Portrait of Fury',
  '금기 : 폭력의 환희': 'Forbidden: Ecstasy of Violence',
  '금기 : 자유의 손짓': 'Forbidden: Gesture of Freedom',
  '금기 : 영생의 허기': 'Forbidden: Eternal Hunger',
  '금기 : 일회용 자아': 'Forbidden: Disposable Ego',
  '금기 : 새겨진 악의': 'Forbidden: Engraved Malice',
  '금기 : 허무의 인도': 'Forbidden: Guidance of Falling',
  '수줍은 정원사': 'Shy Gardener', '음울한 대부': 'Sorrowful Godfather',
  '슬로터': 'Slaughter', '빔슈터': 'Beam Shooter', '날개 인면수': 'Winged Humanoid Beast',
  '울브즈 베인': 'Wolves Bane', '어둠 손아귀': 'Dark Grip',
  '고통의 치천사': 'Seraphim of Pain', '나락충': 'Abyssal Bug', '트래퍼': 'Trapper',
  '컬티스트 아비터': 'Cultist Arbiter', '로튼 리퍼': 'Rotten Ripper',
  '서늘한 대부': 'Chilling Godfather', '공허의 굶주림': 'Hunger of the Void',
  '음산한 대모': 'Gloomy Godmother', '오토마타 카발리': 'Automata Cavalry',
  '악령 샐러맨더': 'Evil Spirit Salamander', '정령 피닉스': 'Elemental Phoenix',
  '정령 캐폭스': 'Spirit Kefox', '알비툼': 'Arbitum', '갑각충': 'Shell Bug',
  '솔저 프라임': 'Soldier Prime', '상실의 굶주림': 'Hunger of Loss',
  '도미니온': 'Dominion', '악령 듀라한': 'Evil Spirit Dullahan',
  '세븐 암즈': 'Seven Arms', 'HA-00': 'HA-00',
};

const types = ['공격', '스킬', '강화'];
const lines = namuText.split('\n');
const cards = {};
let i = 0;

while (i < lines.length) {
  const line = lines[i].trim();
  // Check if this is an AP cost line (number or -)
  if (/^[0-9-]+$/.test(line) && i + 2 < lines.length) {
    const nameKo = lines[i + 1].trim();
    const typeLine = lines[i + 2].trim();

    if (types.includes(typeLine)) {
      i += 3; // skip AP, name, type
      const effectLines = [];

      // Check for tag line (e.g. [ 소멸 ])
      if (i < lines.length && lines[i].trim().startsWith('[')) {
        i++; // skip tag line
      }

      // Collect effect lines until we hit a stop marker or next card
      while (i < lines.length) {
        const l = lines[i].trim();
        if (l === '' || l.startsWith('직업:') || l.startsWith('조건:') || l.startsWith('기타 사항:')) {
          break;
        }
        // Check if next card starts
        if (/^[0-9-]+$/.test(l) && i + 2 < lines.length && types.includes(lines[i + 2].trim())) {
          break;
        }
        effectLines.push(l);
        i++;
      }

      const enName = KO_TO_EN[nameKo];
      if (enName && effectLines.length > 0) {
        cards[enName] = effectLines.join('\n');
      } else if (!enName && effectLines.length > 0) {
        console.error(`  UNMAPPED: "${nameKo}" → ${effectLines.join(' | ')}`);
      }
      continue;
    }
  }
  i++;
}

// Output as JSON
console.log(JSON.stringify(cards, null, 2));
console.log(`\nTotal parsed: ${Object.keys(cards).length}`);
