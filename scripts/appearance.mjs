import catalogue from "../appearance/catalogue.json" with { type: "json" };

export const DEFAULT_APPEARANCE = Object.freeze({
  theme: "teknium",
  band: "soft",
  type: "uncommon",
});

export function validateChoice(choice) {
  if (
    !choice ||
    typeof choice !== "object" ||
    Array.isArray(choice) ||
    Object.keys(choice).sort().join(",") !== "band,theme,type" ||
    !catalogue.some((entry) => entry.id === choice.theme) ||
    !["soft", "accent", "contrast"].includes(choice.band) ||
    !["geist", "uncommon"].includes(choice.type)
  )
    throw new TypeError("Invalid appearance choice");
  return { theme: choice.theme, band: choice.band, type: choice.type };
}

export function validateTarget(target) {
  if (!["site", "cv"].includes(target))
    throw new TypeError("Invalid appearance target");
  return target;
}

const sans = '"Geist Sans",Arial,sans-serif';
const mono = '"Geist Mono",monospace';
const serif = '"Instrument Serif",Georgia,serif';
const declarations = (tokens) =>
  Object.entries(tokens)
    .map(([key, value]) => `--${key}:${value}!important;`)
    .join("");
const fontFace = (family, file, weight, style = "normal") =>
  `@font-face{font-family:"${family}";src:url("/appearance-fonts/${file}") format("woff2");font-weight:${weight};font-style:${style};font-display:swap;}`;

export function appearanceCss(choice, target = "site") {
  validateTarget(target);
  choice = validateChoice(choice);
  const theme = catalogue.find((entry) => entry.id === choice.theme);
  const heading = choice.type === "uncommon" ? serif : sans;
  const rules = (palette, selector) => {
    const band =
      choice.band === "soft"
        ? [palette.muted, palette.foreground, palette.border]
        : choice.band === "accent"
          ? [
              palette.primary,
              palette["primary-foreground"],
              palette["primary-foreground"],
            ]
          : [palette.foreground, palette.background, palette.background];
    const vars =
      target === "site"
        ? {
            bg: palette.background,
            fg: palette.foreground,
            link: palette.primary,
            muted: palette["muted-foreground"],
            border: palette.border,
            surface: palette.muted,
            "font-sans": sans,
            "font-serif": heading,
            "font-mono": mono,
            "appearance-band": band[0],
            "appearance-band-fg": band[1],
            "appearance-band-line": band[2],
          }
        : {
            "resume-paper": palette.background,
            "resume-surface": palette.background,
            "resume-ink": palette.foreground,
            "resume-text": palette.foreground,
            "resume-muted": palette["muted-foreground"],
            "resume-green": palette.primary,
            "resume-green-light": palette.muted,
            "resume-clay": palette.primary,
            "resume-line": palette.border,
            "resume-serif": heading,
            "resume-sans": sans,
            "resume-mono": mono,
            "resume-banner": band[0],
            "resume-banner-fg": band[1],
            "resume-banner-line": band[2],
          };
    const scope =
      target === "cv"
        ? selector
            .split(",")
            .map((s) => `${s} body.resume-app`)
            .join(",")
        : selector;
    return `${scope}{${declarations(vars)}}`;
  };
  const light = ':root[data-theme="light"]';
  const dark = ':root[data-theme="dark"]';
  const auto = ':root:not([data-theme="light"]):not([data-theme="dark"])';
  const fonts =
    fontFace("Geist Sans", "geist-regular.woff2", "400") +
    fontFace("Geist Sans", "geist-bold.woff2", "700") +
    fontFace("Geist Mono", "geist-mono.woff2", "100 900") +
    fontFace(
      "Instrument Serif",
      "InstrumentSerif-normal-jizBRFtNs2.woff2",
      "400",
    ) +
    fontFace(
      "Instrument Serif",
      "InstrumentSerif-italic-jizHRFtNs2.woff2",
      "400",
      "italic",
    );
  const typography =
    target === "site"
      ? `html{background:var(--bg)!important;color:var(--fg)!important;}body{font-family:${sans}!important;color:var(--fg)!important;}h1,h2,h3,.brand-line{font-family:${heading}!important;}.announcement{background:var(--appearance-band);--fg:var(--appearance-band-fg)!important;--link:var(--appearance-band-fg)!important;--muted:var(--appearance-band-fg)!important;--border:var(--appearance-band-line)!important;color:var(--fg);}`
      : `body.resume-app .resume-header{background:var(--resume-banner);--resume-ink:var(--resume-banner-fg)!important;--resume-text:var(--resume-banner-fg)!important;--resume-muted:var(--resume-banner-fg)!important;--resume-green:var(--resume-banner-fg)!important;--resume-clay:var(--resume-banner-fg)!important;--resume-line:var(--resume-banner-line)!important;color:var(--resume-ink);}`;
  return `@media screen{${fonts}${rules(theme.light, `${auto},${light}`)}${rules(theme.dark, dark)}@media(prefers-color-scheme: dark){${rules(theme.dark, auto)}}${typography}}\n`;
}
