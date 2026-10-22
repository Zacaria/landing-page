# Local font provenance

The Uncommon Web-inspired homepage uses licensed fonts, not copied site code or a downloaded theme. No public font service is contacted at runtime. Reference inspected on 22 October 2026: `https://webdev.teknium.io/` (desktop and mobile hero captures retained with local review evidence).

## Instrument Serif — regular and italic

The reference exposes these Latin WOFF2 subsets. Both were retrieved from the exact same-origin font declarations and verified by their WOFF2 signatures:

| Local file | Source | SHA-256 |
| --- | --- | --- |
| `client/assets/fonts/instrument-serif-regular.woff2` | `https://webdev.teknium.io/fonts/InstrumentSerif-normal-jizBRFtNs2.woff2` | `5eb09b5ac0e28b67c2f041c8ba6d244604ca0c0980d65912ab2d47fed84ddc31` |
| `client/assets/fonts/instrument-serif-italic.woff2` | `https://webdev.teknium.io/fonts/InstrumentSerif-italic-jizHRFtNs2.woff2` | `5a51946dfffa82972bc98745359c46761515641fda557c25116459a9f83da4a7` |

The official Google Fonts family license was retrieved from `https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentserif/OFL.txt`. Copyright 2022 The Instrument Serif Project Authors; SIL OFL 1.1 permits redistribution with the notice. Retained full text: `licenses/instrument-serif-OFL.txt`, SHA-256 `129ed7618959716959f2941fdd5b49e0ad6e6c1d78726761786a00253d865521`. The subsets are redistributed unchanged.

## Geist — reuse existing CV assets

Reuse the independently retained CV fonts rather than downloading duplicates. Their recorded upstream sources are the Vercel Geist repository:

- Regular: `https://raw.githubusercontent.com/vercel/geist-font/main/fonts/Geist/webfonts/Geist-Regular.woff2`; local `geist-regular.woff2`; SHA-256 `12e7c80de776bc74044973a26bb96842ca4bfe9e16fc6128fa5c6420e8e1d8fc`.
- Bold: `https://raw.githubusercontent.com/vercel/geist-font/main/fonts/Geist/webfonts/Geist-Bold.woff2`; local `geist-bold.woff2`; SHA-256 `25c8b03dbf9668157bfb8448c0a8aa234d8c85222499295845035acbae184870`.
- Full SIL OFL 1.1 text: `licenses/geist-OFL.txt`, originally `https://raw.githubusercontent.com/vercel/geist-font/main/LICENSE.txt`; SHA-256 `930853ee1daa68554d9e35c8a9175affb74f699fad9a5da6ee5ebe76379d9137`.

The pre-existing `geist-mono.woff2` and `licenses/geist-mono-OFL.txt` remain unchanged. The static build copies all license notices into `/assets/fonts/licenses/`. The local standalone preview embeds the font bytes and retains their notices inside its stylesheet; it does not embed the attached CV.
