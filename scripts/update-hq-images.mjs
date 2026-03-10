import fs from 'fs';

const chars = JSON.parse(fs.readFileSync('./src/data/characters.json', 'utf8'));

const HQ_IMAGES = {
  renoa: 'https://www.prydwen.gg/static/64f0be3ffd0e4d2ad0163d88eda9ac7a/c1587/renoa_full.webp',
  mika: 'https://www.prydwen.gg/static/951fdda1ebc0cd454f32127118e2ead0/c1587/czn_Mika_full.webp',
  hugo: 'https://www.prydwen.gg/static/cb17dfea6cdcaa343dd134070fc6376d/c1587/czn_Hugo__full.webp',
  kayron: 'https://www.prydwen.gg/static/ae806b295bae23be2f01d2444ad513f2/c1587/czn_Kayron__full.webp',
  khalipe: 'https://www.prydwen.gg/static/5b4fb5b886f21cb7db396bec705c4ea7/c1587/czn_Khalipe_full.webp',
  luke: 'https://www.prydwen.gg/static/4b4138a86abbf30b740d66435bcb61ea/c1587/czn_Luke_full.webp',
  magna: 'https://www.prydwen.gg/static/491e345d33713d940dc90c868db68d13/c1587/czn_Magna_full.webp',
  'mei-lin': 'https://www.prydwen.gg/static/ef37f65e5371ee88ce5f05a93251a038/c1587/czn_Meilin_full.webp',
  orlea: 'https://www.prydwen.gg/static/e168bb92f28bbd83092d419d5c7f94b9/c1587/czn_Orlea__full.webp',
  rin: 'https://www.prydwen.gg/static/b95c549d564f2aa10d0cfda48c97569a/c1587/czn_Rin_full.webp',
  veronica: 'https://www.prydwen.gg/static/9b546603059b6e49446ddd142ec21054/c1587/czn_Veronica__full.webp',
  amir: 'https://www.prydwen.gg/static/8c2c40e817cea387fe540430893eb69a/c1587/czn_Amir_full.webp',
  beryl: 'https://www.prydwen.gg/static/61acb2b641d20bd65d36959b00b4757c/c1587/czn_Beryl_full.webp',
  cassius: 'https://www.prydwen.gg/static/2eb9f77440df9139879e6c21c22b6897/c1587/czn_Cassius_full.webp',
  lucas: 'https://www.prydwen.gg/static/0494b86c9e0530cd4f14136a27ce1d51/c1587/czn_Lucas_full.webp',
  maribell: 'https://www.prydwen.gg/static/c14478cc42b0c4cb131f71fd08c18c2d/c1587/czn_Maribell_full.webp',
  nia: 'https://www.prydwen.gg/static/d0fc4f27c997ba86a4f0c0c108296771/c1587/czn_Nia_full.webp',
  owen: 'https://www.prydwen.gg/static/8a97c4c9261541c5baa4b7863fd4af9a/c1587/czn_Owen_full.webp',
  rei: 'https://www.prydwen.gg/static/111e97b70ec592e3a889c2b5365dcf70/c1587/czn_Rei_full.webp',
  selena: 'https://www.prydwen.gg/static/bb322c9f72b82798d58ea0d1cabdfb8d/c1587/czn_Selena_full.webp',
  tressa: 'https://www.prydwen.gg/static/552c94b2939108a25701fc51c948b46d/c1587/czn_Tressa_full.webp',
};

let updated = 0;
chars.forEach(c => {
  if (HQ_IMAGES[c.id]) {
    const old = c.imageUrl;
    c.imageUrl = HQ_IMAGES[c.id];
    if (old !== c.imageUrl) {
      updated++;
      console.log(`${c.id}: ${old?.split('/').pop()} → ${c.imageUrl.split('/').pop()}`);
    }
  } else {
    console.log(`${c.id}: NO HQ (keeping ${c.imageUrl?.split('/').pop()})`);
  }
});

fs.writeFileSync('./src/data/characters.json', JSON.stringify(chars, null, 2));
console.log(`\nUpdated ${updated} characters to HQ images`);
