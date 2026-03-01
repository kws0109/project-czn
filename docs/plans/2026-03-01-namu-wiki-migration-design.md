# 나무위키 데이터 마이그레이션 설계

## 목표
- 28캐릭터 포트레이트 이미지 → 나무위키 소스로 교체
- 28캐릭터 전체 카드 데이터 → 나무위키에서 수집, placeholder 제거
- 카드 이미지 → 나무위키 소스

## 변경 파일
| 파일 | 변경 |
|------|------|
| next.config.ts | i.namu.wiki remotePattern 추가 |
| characters.json | 28캐릭터 imageUrl 교체 |
| cards.json | 전체 재구성 (28캐릭터 실데이터) |

## 수집 전략
- Playwright 순차 스크래핑 (28 페이지)
- 캐릭터 URL: `https://namu.wiki/w/{nameKo}(카오스 제로 나이트메어)`
- 이미지 URL: `https://i.namu.wiki/i/{hash}.webp`

## 데이터 매핑
- nameKo: 나무위키 한글 이름
- name: 영문 이름 (기존 유지)
- effects: 텍스트 파싱 → CardEffect[]
- imageUrl: namu wiki URL (https:// 접두사)
