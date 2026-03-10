#!/bin/bash
CHARS="renoa nine mika chizuru haru hugo kayron khalipe luke magna mei-lin narja orlea rin sereniel tiphera veronica yuki amir beryl cassius lucas maribell nia owen rei selena tressa"
for char in $CHARS; do
  # Try with and without trailing slash
  html=$(curl -sL "https://www.prydwen.gg/chaos-zero-nightmare/characters/$char/" \
    -H "User-Agent: Mozilla/5.0" -H "Accept-Encoding: identity")
  # Find _full srcSet - get the 800w variant
  full_url=$(echo "$html" | grep -aoE 'static/[a-f0-9]+/[a-f0-9]+/[a-zA-Z_0-9]+_full\.webp 800w' | head -1 | sed 's/ 800w//')
  if [ -n "$full_url" ]; then
    echo "$char|https://www.prydwen.gg/$full_url"
  else
    # Fallback: find largest _card or _c variant  
    card_url=$(echo "$html" | grep -aoE 'static/[a-f0-9]+/[a-f0-9]+/[a-zA-Z_0-9]+_(card|c)\.webp 262w' | head -1 | sed 's/ 262w//')
    if [ -n "$card_url" ]; then
      echo "$char|https://www.prydwen.gg/$card_url|CARD_ONLY"
    else
      echo "$char|MISSING"
    fi
  fi
done
