/* Three structural diagrams for report v1.
 *
 * Each one draws content the report already states in prose, a list, or a
 * table. They re-present existing content; they introduce no new claim, no new
 * value, and no new source. Same two-tone token discipline as the glyphs, plus
 * text in the foreground token. Square corners, hairline rules, no shadows.
 */

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

const n = (v) => {
  const r = Math.round(v * 100) / 100
  return Object.is(r, -0) ? 0 : r
}

const box = (x, y, w, h, c = "dbox") =>
  `<rect class="${c}" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"/>`
const line = (x1, y1, x2, y2, c = "dline") =>
  `<line class="${c}" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"/>`
const text = (x, y, s, c = "dt", anchor = "start") =>
  `<text class="${c}" x="${n(x)}" y="${n(y)}" text-anchor="${anchor}">${esc(s)}</text>`
const dot = (cx, cy, r, c = "dfa") =>
  `<circle class="${c}" cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}"/>`
const poly = (pts, c = "dfs") =>
  `<polygon class="${c}" points="${pts.map(([x, y]) => `${n(x)},${n(y)}`).join(" ")}"/>`
const path = (d, c = "dline") => `<path class="${d ? c : c}" d="${d}"/>`

const arrowRight = (x, y, s = 4, c = "dfs") =>
  poly([[x, y - s], [x + s * 1.5, y], [x, y + s]], c)
const arrowDown = (x, y, s = 4, c = "dfs") =>
  poly([[x - s, y], [x, y + s * 1.5], [x + s, y]], c)

/* a numbered step marker matching the ten-step list in section 1 of the playbook */
const stepMark = (x, y, label) =>
  `<rect class="dfa" x="${n(x)}" y="${n(y - 7)}" width="15" height="14"/>` +
  `<text class="dtn" x="${n(x + 7.5)}" y="${n(y + 4)}" text-anchor="middle">${esc(label)}</text>`

/* small control pill */
const pill = (x, y, w, label, c = "dchip") =>
  box(x, y - 9, w, 18, c) + text(x + 8, y + 4, label, "dtm")

const svg = (viewBox, body, label) =>
  `<svg class="diagram" viewBox="${viewBox}" role="img" aria-label="${esc(label)}" preserveAspectRatio="xMidYMid meet">${body}</svg>`

/* --- 1. The layered chart shell ---------------------------------------- */
/* Draws the ten-step pattern listed in the executive playbook. */

export function layeredChartShell() {
  const X = 14
  const W = 660
  let s = ""

  /* outer shell */
  s += box(X, 10, W, 466, "dshell")

  /* 1 title, metric line, and export actions */
  s += text(X + 14, 36, "Model quality vs price", "dth")
  s += pill(X + W - 176, 30, 52, "copy")
  s += pill(X + W - 118, 30, 56, "image")
  s += pill(X + W - 56, 30, 46, "data")
  s += stepMark(X + W + 10, 30, "1")
  s += stepMark(X + W - 200, 30, "8")
  s += text(X + 14, 54, "Index score · 0–100 · higher is better · Nov 2026 · method v3", "dtm")
  s += line(X, 66, X + W, 66, "drule")

  /* 2 coverage */
  s += text(X + 14, 84, "27 of 597 models shown", "dta")
  s += text(X + 150, 84, "curated default subset, coverage stated up front", "dtm")
  s += stepMark(X + W + 10, 80, "2")
  s += line(X, 96, X + W, 96, "drule")

  /* 3 entity selection kept apart from semantic filters */
  s += pill(X + 14, 116, 132, "Select models  27", "dchipa")
  s += text(X + 14, 138, "entities", "dts")
  s += line(X + 162, 104, X + 162, 150, "drule")
  s += pill(X + 176, 116, 92, "Open filters")
  s += pill(X + 276, 116, 78, "licence")
  s += pill(X + 362, 116, 62, "size")
  s += text(X + 176, 138, "semantic filters, change the denominator", "dts")
  s += stepMark(X + W + 10, 116, "3")
  s += line(X, 158, X + W, 158, "drule")

  /* 4 view tabs */
  s += pill(X + 14, 178, 74, "Quality", "dchipa")
  s += pill(X + 96, 178, 62, "Price")
  s += pill(X + 166, 178, 62, "Speed")
  s += pill(X + 236, 178, 86, "Trade-off")
  s += text(X + 336, 182, "one tab per analytical question", "dts")
  s += stepMark(X + W + 10, 178, "4")

  /* 5 legend as reversible series control */
  s += dot(X + 20, 210, 4.5, "dfa")
  s += text(X + 30, 214, "reasoning", "dtm")
  s += dot(X + 108, 210, 4.5, "dfs")
  s += text(X + 118, 214, "non-reasoning", "dtm")
  s += `<g opacity="0.4">${dot(X + 222, 210, 4.5, "dfs")}${text(X + 232, 214, "open weights  off", "dtm")}</g>`
  s += text(X + 356, 214, "click a series to remove it, click again to restore", "dts")
  s += stepMark(X + W + 10, 210, "5")
  s += line(X, 224, X + W, 224, "drule")

  /* 6 plot area with analytical aids */
  const px = X + 46
  const py = 244
  const pw = W - 76
  const ph = 152
  s += line(px, py, px, py + ph, "daxis")
  s += line(px, py + ph, px + pw, py + ph, "daxis")
  s += text(X + 12, py + 8, "quality", "dts")
  s += text(px + pw / 2, py + ph + 22, "price per million tokens", "dts", "middle")

  /* target region */
  s += box(px + 1, py + 1, pw * 0.34, ph * 0.42, "dregion")
  s += text(px + 8, py + 18, "desired region", "dta")

  /* reference line */
  s += path(`M${n(px)} ${n(py + ph * 0.55)}L${n(px + pw)} ${n(py + ph * 0.55)}`, "ddash")
  s += text(px + pw - 4, py + ph * 0.55 - 6, "human baseline", "dts", "end")

  /* points with a confidence interval on one of them */
  const marks = [
    [0.08, 0.30], [0.16, 0.22], [0.23, 0.44], [0.3, 0.16],
    [0.4, 0.38], [0.48, 0.28], [0.57, 0.55], [0.66, 0.46],
    [0.75, 0.7], [0.86, 0.62], [0.94, 0.82],
  ]
  const front = [0, 1, 3]
  marks.forEach(([fx, fy], i) => {
    const cx = px + pw * fx
    const cy = py + ph * fy
    s += dot(cx, cy, 4, front.includes(i) ? "dfa" : "dfs")
  })
  /* Pareto frontier through the efficient points */
  s += path(
    `M${n(px + pw * 0.08)} ${n(py + ph * 0.3)}L${n(px + pw * 0.16)} ${n(py + ph * 0.22)}L${n(px + pw * 0.3)} ${n(py + ph * 0.16)}`,
    "dfront"
  )
  s += text(px + pw * 0.32, py + ph * 0.16 - 8, "Pareto frontier", "dta")
  /* confidence interval */
  const ix = px + pw * 0.75
  const iy = py + ph * 0.7
  s += line(ix, iy - 14, ix, iy + 14, "dline")
  s += line(ix - 5, iy - 14, ix + 5, iy - 14, "dline")
  s += line(ix - 5, iy + 14, ix + 5, iy + 14, "dline")
  s += text(ix + 10, iy + 4, "95% interval", "dts")
  s += stepMark(X + W + 10, py + 20, "6")

  /* 7 display settings, kept out of the data path */
  s += line(X, py + ph + 34, X + W, py + ph + 34, "drule")
  s += pill(X + 14, py + ph + 52, 140, "Chart display settings")
  s += text(X + 166, py + ph + 56, "appearance only, never the data", "dts")
  s += stepMark(X + W + 10, py + ph + 52, "7")

  /* 9 definitions and caveats */
  s += line(X, py + ph + 70, X + W, py + ph + 70, "drule")
  s += text(X + 14, py + ph + 90, "Definitions, exclusions, method version, data as of", "dtm")
  s += stepMark(X + W + 10, py + ph + 86, "9")

  /* 10 exact table */
  s += line(X, py + ph + 100, X + W, py + ph + 100, "drule")
  s += text(X + 14, py + ph + 120, "Exact table  ·  download data", "dta")
  s += stepMark(X + W + 10, py + ph + 116, "10")

  return svg(
    "0 0 700 486",
    s,
    "The layered chart shell: a chart module built as ten stacked layers, from title and metric definition at the top, through coverage, entity selection kept separate from semantic filters, view tabs, a reversible legend, the plot area with its analytical aids, a separate display-settings panel, and finally definitions and an exact table at the bottom."
  )
}

/* --- 2. What each control family changes ------------------------------- */
/* Draws the seven control families from the control taxonomy, grouped by what
   a reader's click actually alters. */

export function controlFamilies() {
  let s = ""

  /* Left column names the effect, right column holds the families that have
     it. A label column avoids the per-lane height arithmetic that made the
     one-row-per-lane version collapse its shorter lanes. */
  const LABEL_X = 14
  const CHIP_X = 232
  const RIGHT = 686
  const LANE_H = 58
  const GAP = 10

  const lanes = [
    {
      title: "Changes which data is in scope",
      note: ["the denominator moves, so", "coverage has to be restated"],
      items: ["Entity selection", "Semantic filters"],
      accent: true,
    },
    {
      title: "Changes the view of that data",
      note: ["same rows, a different", "question or emphasis"],
      items: ["View changes", "Analytical overlays", "Direct manipulation"],
      accent: true,
    },
    {
      title: "Changes appearance only",
      note: ["nothing about the data", "changes"],
      items: ["Display settings"],
      accent: false,
    },
    {
      title: "Leaves the report",
      note: ["carries the state with it,", "or it is not reproducible"],
      items: ["Share and export"],
      accent: false,
    },
  ]

  lanes.forEach((lane, i) => {
    const y = 12 + i * (LANE_H + GAP)
    if (i) s += line(LABEL_X, y - GAP / 2, RIGHT, y - GAP / 2, "drule")
    s += text(LABEL_X, y + 16, lane.title, "dth")
    lane.note.forEach((row, j) => {
      s += text(LABEL_X, y + 32 + j * 13, row, "dts")
    })
    const width = Math.min(142, (RIGHT - CHIP_X - (lane.items.length - 1) * 10) / lane.items.length)
    lane.items.forEach((item, j) => {
      const x = CHIP_X + j * (width + 10)
      s += box(x, y + 12, width, 30, lane.accent ? "dchipa" : "dchip")
      s += text(x + 12, y + 31, item, "dtm")
    })
  })

  /* the reset every family needs, stated once rather than as a rail that
     collided with the lane labels */
  const footY = 12 + lanes.length * (LANE_H + GAP) + 4
  s += line(LABEL_X, footY - 12, RIGHT, footY - 12, "ddash")
  s += text(LABEL_X, footY + 6, "Every family needs a reset, and a visible state a reader can tell apart from the default.", "dts")

  return svg(
    "0 0 700 296",
    s,
    "The seven control families grouped by effect: entity selection and semantic filters change which data is in scope and therefore require coverage to be restated; view changes, analytical overlays and direct manipulation change only the view of the same data; display settings change appearance alone; share and export carry the state out of the report. Every family needs a reset."
  )
}

/* --- 3. Shareable view state ------------------------------------------- */
/* Draws the state a shareable view has to capture, and what each output path
   must carry with it. */

export function viewState() {
  let s = ""

  /* the state object */
  s += box(14, 22, 258, 264, "dshell")
  s += text(28, 44, "View state", "dth")
  const fields = [
    "selected entities",
    "semantic filters",
    "view / metric",
    "analytical overlays",
    "navigation: zoom, brush",
    "display settings",
    "units",
    "metric version",
    "data as of",
  ]
  fields.forEach((f, i) => {
    const y = 60 + i * 24
    const provenance = i >= 6
    s += box(28, y, 230, 19, provenance ? "dchipa" : "dchip")
    s += text(38, y + 13.5, f, "dtm")
  })
  s += text(28, 300, "the last three are provenance, not preference", "dts")

  /* outputs */
  const outs = [
    ["Deep link", ["reproduces the exact view", "for another reader"]],
    ["Image export", ["carries filters, entities, units,", "metric version, data as of"]],
    ["Data export", ["exact values behind the marks,", "same scope as the chart"]],
  ]
  outs.forEach(([title, notes], i) => {
    const y = 30 + i * 86
    s += line(272, 154, 322, 154, "dline")
    s += line(322, 154, 322, y + 26, "dline")
    s += line(322, y + 26, 386, y + 26, "dline")
    s += arrowRight(386, y + 26, 4, "dfs")
    s += box(396, y, 290, 62, "dchipa")
    s += text(410, y + 22, title, "dth")
    notes.forEach((note, j) => {
      s += text(410, y + 40 + j * 15, note, "dts")
    })
  })

  return svg(
    "0 0 700 312",
    s,
    "Shareable view state: a state object holding selected entities, semantic filters, the chosen view or metric, analytical overlays, navigation, and display settings, plus three provenance fields for units, metric version and data as of. It feeds three outputs: a deep link that reproduces the exact view, an image export, and a data export, each of which must carry the scope and provenance with it."
  )
}

export const diagramCss = `
.figure { margin: .9rem 0 1.1rem; padding: 0; border: 1px solid var(--border); }
.figure .diagram { display: block; width: 100%; height: auto; background: var(--card); }
.figure figcaption { padding: .5rem .65rem; border-top: 1px solid var(--border); color: var(--muted-foreground); font-size: .78rem; }
.diagram text { font-family: var(--font-sans); }
.diagram .dt, .diagram .dth, .diagram .dtm, .diagram .dts, .diagram .dta, .diagram .dtn { stroke: none; }
.diagram .dth { fill: var(--foreground); font-size: 12.5px; font-weight: 750; }
.diagram .dt { fill: var(--foreground); font-size: 11.5px; }
.diagram .dtm { fill: var(--foreground); font-size: 11px; }
.diagram .dts { fill: var(--muted-foreground); font-size: 10px; }
.diagram .dta { fill: var(--primary); font-size: 10.5px; font-weight: 700; }
.diagram .dtn { fill: var(--primary-foreground); font-size: 10px; font-weight: 750; }
.diagram .dshell { fill: none; stroke: var(--border-solid); stroke-width: 1; }
.diagram .dbox { fill: none; stroke: var(--border-solid); stroke-width: 1; }
.diagram .dchip { fill: color-mix(in oklab, var(--muted-foreground) 14%, transparent); stroke: var(--border-solid); stroke-width: 1; }
.diagram .dchipa { fill: color-mix(in oklab, var(--primary) 12%, transparent); stroke: color-mix(in oklab, var(--primary) 45%, transparent); stroke-width: 1; }
.diagram .dregion { fill: color-mix(in oklab, var(--primary) 10%, transparent); stroke: color-mix(in oklab, var(--primary) 40%, transparent); stroke-width: 1; }
.diagram .drule, .diagram .daxis { stroke: var(--border-solid); stroke-width: 1; fill: none; }
.diagram .dline { stroke: var(--muted-foreground); stroke-width: 1.25; fill: none; }
.diagram .ddash { stroke: var(--muted-foreground); stroke-width: 1; stroke-dasharray: 4 3; fill: none; opacity: .7; }
.diagram .dfront { stroke: var(--primary); stroke-width: 2; fill: none; }
.diagram .dfs { fill: var(--muted-foreground); stroke: none; }
.diagram .dfa { fill: var(--primary); stroke: none; }
`
