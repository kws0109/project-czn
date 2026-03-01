/**
 * 나무위키 CZN 캐릭터 데이터 스크래핑 스크립트
 * Playwright로 28캐릭터 페이지를 순회하며 카드 데이터 + 이미지 URL 추출
 *
 * Usage: node scripts/scrape-namu.mjs
 * Output: scripts/namu-data.json
 */

// 28캐릭터 매핑: { id, nameKo(나무위키 이름), name(영문) }
const CHARACTERS = [
  { id: "renoa", nameKo: "레노아", name: "Renoa" },
  { id: "nine", nameKo: "나인", name: "Nine" },
  { id: "mika", nameKo: "미카", name: "Mika" },
  { id: "chizuru", nameKo: "치즈루", name: "Chizuru" },
  { id: "haru", nameKo: "하루", name: "Haru" },
  { id: "hugo", nameKo: "휴고", name: "Hugo" },
  { id: "kayron", nameKo: "카이론", name: "Kayron" },
  { id: "khalipe", nameKo: "칼리오페", name: "Khalipe" },
  { id: "luke", nameKo: "루크", name: "Luke" },
  { id: "magna", nameKo: "마그나", name: "Magna" },
  { id: "mei-lin", nameKo: "메이린", name: "Mei Lin" },
  { id: "narja", nameKo: "나르자", name: "Narja" },
  { id: "orlea", nameKo: "올레아", name: "Orlea" },
  { id: "rin", nameKo: "린", name: "Rin" },
  { id: "sereniel", nameKo: "세레니엘", name: "Sereniel" },
  { id: "tiphera", nameKo: "티페라", name: "Tiphera" },
  { id: "veronica", nameKo: "베로니카", name: "Veronica" },
  { id: "yuki", nameKo: "유키", name: "Yuki" },
  { id: "amir", nameKo: "아미르", name: "Amir" },
  { id: "beryl", nameKo: "베릴", name: "Beryl" },
  { id: "cassius", nameKo: "캐시어스", name: "Cassius" },
  { id: "lucas", nameKo: "루카스", name: "Lucas" },
  { id: "maribell", nameKo: "마리벨", name: "Maribell" },
  { id: "nia", nameKo: "니아", name: "Nia" },
  { id: "owen", nameKo: "오웬", name: "Owen" },
  { id: "rei", nameKo: "레이", name: "Rei" },
  { id: "selena", nameKo: "셀레나", name: "Selena" },
  { id: "tressa", nameKo: "트레사", name: "Tressa" },
];

function namuUrl(nameKo) {
  return `https://namu.wiki/w/${encodeURIComponent(nameKo + "(카오스 제로 나이트메어)")}`;
}

// This is a data-only script - outputs JSON for manual integration
// The actual scraping is done via Playwright MCP in the main session

console.log(JSON.stringify(CHARACTERS.map(c => ({
  ...c,
  url: namuUrl(c.nameKo)
})), null, 2));
