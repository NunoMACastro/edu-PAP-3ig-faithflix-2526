# Fixtures sintéticas de media

Estas fixtures são geradas localmente a partir de um `canvas` animado e não
contêm filmes, séries, áudio, pessoas ou qualquer outro conteúdo real do
FaithFlix. Validam apenas a integração técnica do player.

## Geração

```bash
node scripts/generate-synthetic-media.mjs
```

O script usa o Chromium local do Playwright e `MediaRecorder`, sem Internet,
para codificar cerca de 1,7 segundos de vídeo H.264 baseline, 320×180, 12 fps.
Produz um fMP4 completo e separa a inicialização dos fragmentos de media:

- `synthetic-progressive.mp4`: MP4 progressivo/fMP4 completo;
- `synthetic-init.mp4`: caixas `ftyp` e `moov` usadas pelos manifests;
- `synthetic-segment.m4s`: caixas `moof`/`mdat` da fixture;
- `synthetic.m3u8`: HLS VOD local com `EXT-X-MAP`;
- `synthetic.mpd`: DASH estático local com `SegmentList`.

O encoder pode produzir bytes diferentes entre versões de browser/OS. Uma
regeneração é uma alteração intencional de fixture e exige atualizar e rever os
checksums abaixo.

## Checksums auditados em 2026-07-10

```text
8275def5ed2b836720880da54bce49f8de0aeb137f85b6ded5543e5883a93e20  synthetic-progressive.mp4
a310f52c490f9b3b04dfbd8c355265c4f918bc92207bbf36e574a72cc5e5e917  synthetic-init.mp4
50c9b1272b5f225c244a405a06ba7a41b18a3a7c30e034138ee396df5e5ca004  synthetic-segment.m4s
```

`tests/e2e/network-policy.js` serve estes ficheiros por route interception,
incluindo pedidos HTTP Range, e bloqueia pedidos fora de loopback.

O seed demo reutiliza `synthetic-progressive.mp4` apenas como origem auditada e
cria cópias com storage keys opacas dentro de `MEDIA_STORAGE_ROOT`. Nenhuma
fixture de playback é copiada para `real_dev/frontend/public`.

## Limite probatório

`loadedmetadata`/`canplay` nestas fixtures prova apenas o adapter local. Não
prova vídeo real, 4K real, CDN, DRM, latência de produção, RNF08, RNF10 ou cem
streams concorrentes. RNF23 pode ficar, no máximo, `PARCIAL_VALIDADO`.
