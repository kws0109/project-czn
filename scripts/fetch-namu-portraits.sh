#!/bin/bash
# Fetch default character portrait from namu wiki
# Strategy: first webp image >30KB in page order = default standing portrait
# (largest image is often trauma/scene art)

OUTDIR="public/characters"

CHARS=(
  "renoa|레노아(카오스 제로 나이트메어)"
  "nine|나인(카오스 제로 나이트메어)"
  "mika|미카(카오스 제로 나이트메어)"
  "chizuru|치즈루(카오스 제로 나이트메어)"
  "haru|하루(카오스 제로 나이트메어)"
  "hugo|휴고(카오스 제로 나이트메어)"
  "kayron|카일론(카오스 제로 나이트메어)"
  "khalipe|칼리페(카오스 제로 나이트메어)"
  "luke|루크(카오스 제로 나이트메어)"
  "magna|마그나(카오스 제로 나이트메어)"
  "mei-lin|메이린(카오스 제로 나이트메어)"
  "narja|나르쟈"
  "orlea|오를레아(카오스 제로 나이트메어)"
  "rin|린(카오스 제로 나이트메어)"
  "sereniel|세레니엘"
  "tiphera|티페라"
  "veronica|베로니카(카오스 제로 나이트메어)"
  "yuki|유키(카오스 제로 나이트메어)"
  "amir|아미르(카오스 제로 나이트메어)"
  "beryl|베릴(카오스 제로 나이트메어)"
  "cassius|카시우스(카오스 제로 나이트메어)"
  "lucas|루카스(카오스 제로 나이트메어)"
  "maribell|마리벨(카오스 제로 나이트메어)"
  "nia|니아(카오스 제로 나이트메어)"
  "owen|오웬(카오스 제로 나이트메어)"
  "rei|레이(카오스 제로 나이트메어)"
  "selena|셀레나(카오스 제로 나이트메어)"
  "tressa|트리사(카오스 제로 나이트메어)"
)

for entry in "${CHARS[@]}"; do
  IFS='|' read -r id name <<< "$entry"
  encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$name'))")
  url="https://namu.wiki/w/$encoded"

  # Get FIRST image >30KB in page order (= default portrait, not trauma)
  first_url=$(curl -sL "$url" -H "User-Agent: Mozilla/5.0" -H "Accept-Encoding: identity" \
    | grep -aoE "data-filesize='[0-9]+'[^>]*data-src='//i\.namu\.wiki/i/[^']+\.webp'" \
    | while read line; do
        size=$(echo "$line" | grep -oE "data-filesize='[0-9]+'" | grep -oE "[0-9]+")
        if [ "$size" -gt 30000 ]; then
          echo "$line" | grep -oE "//i\.namu\.wiki/i/[^']+"
          break
        fi
      done)

  if [ -n "$first_url" ]; then
    curl -sL -o "$OUTDIR/$id.webp" "https:$first_url"
    size=$(wc -c < "$OUTDIR/$id.webp")
    echo "OK $id → ${size} bytes"
  else
    echo "FAIL $id"
  fi
done
