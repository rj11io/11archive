/* Chart-form glyph library for report v1.
 *
 * One 64x28 inline SVG silhouette per named chart form in the taxonomy of
 * section 1. A glyph is a silhouette, not a miniature chart: no axes labels,
 * no legend, no tick text, no data values. Two tones only, both from the house
 * token set:
 *   - structure  -> var(--muted-foreground)
 *   - accent     -> var(--primary), reserved for the one feature that tells
 *                   this form apart from its neighbours in the same group
 *
 * Colour carries no data here, so no categorical palette applies. Identity is
 * carried by the form name in the adjacent text of the same cell, which is
 * also the nonvisual equivalent required by the house datavis reference. Every
 * glyph is therefore aria-hidden.
 *
 * Everything is deterministic: fixed value arrays, no randomness, no locale
 * formatting, coordinates rounded through n().
 */

const W = 64
const H = 28
const LEFT = 3
const RIGHT = 61
const TOP = 3
const BASE = 25

const n = (v) => {
  const r = Math.round(v * 100) / 100
  return Object.is(r, -0) ? 0 : r
}

/* --- primitives ------------------------------------------------------- */

const R = (x, y, w, h, c = "fs") =>
  `<rect class="${c}" x="${n(x)}" y="${n(y)}" width="${n(Math.max(0, w))}" height="${n(Math.max(0, h))}"/>`
const L = (x1, y1, x2, y2, c = "ss") =>
  `<line class="${c}" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"/>`
const P = (d, c = "ss") => `<path class="${c}" d="${d}"/>`
const C = (cx, cy, r, c = "fs") =>
  `<circle class="${c}" cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}"/>`
const PL = (pts, c = "ss") =>
  `<polyline class="${c}" points="${pts.map(([x, y]) => `${n(x)},${n(y)}`).join(" ")}"/>`
const PG = (pts, c = "fs") =>
  `<polygon class="${c}" points="${pts.map(([x, y]) => `${n(x)},${n(y)}`).join(" ")}"/>`

/* baseline and left rule, drawn at reduced weight so marks stay dominant */
const axisB = (y = BASE, x0 = LEFT, x1 = RIGHT) => L(x0, y, x1, y, "ax")
const axisL = (x = LEFT, y0 = TOP, y1 = BASE) => L(x, y0, x, y1, "ax")
const axes = () => axisL() + axisB()

/* vertical bars from a baseline; vals are 0..1 */
const vbars = (vals, o = {}) => {
  const { accent = [], gap = 1.6, base = BASE, top = TOP, x0 = LEFT + 1.5, x1 = RIGHT, muted = [] } = o
  const w = (x1 - x0 - gap * (vals.length - 1)) / vals.length
  return vals
    .map((v, i) => {
      const h = v * (base - top)
      const cls = accent.includes(i) ? "fa" : muted.includes(i) ? "fsm" : "fs"
      return R(x0 + i * (w + gap), base - h, w, h, cls)
    })
    .join("")
}

/* horizontal bars growing right; vals are 0..1 */
const hbars = (vals, o = {}) => {
  const { accent = [], gap = 1.6, x0 = LEFT, y0 = TOP + 0.5, y1 = BASE, x1 = RIGHT } = o
  const h = (y1 - y0 - gap * (vals.length - 1)) / vals.length
  return vals
    .map((v, i) =>
      R(x0, y0 + i * (h + gap), v * (x1 - x0), h, accent.includes(i) ? "fa" : "fs")
    )
    .join("")
}

/* evenly spaced points across the plot for a 0..1 series */
const pts = (vals, o = {}) => {
  const { x0 = LEFT, x1 = RIGHT, base = BASE, top = TOP } = o
  return vals.map((v, i) => [
    x0 + ((x1 - x0) * i) / (vals.length - 1),
    base - v * (base - top),
  ])
}
const lineOf = (vals, c = "sa", o = {}) => PL(pts(vals, o), c)

/* filled area under a 0..1 series */
const areaOf = (vals, c = "fa", o = {}) => {
  const base = o.base ?? BASE
  const p = pts(vals, o)
  return P(
    `M${n(p[0][0])} ${n(base)}L` +
      p.map(([x, y]) => `${n(x)} ${n(y)}`).join("L") +
      `L${n(p.at(-1)[0])} ${n(base)}Z`,
    c
  )
}

/* step path through a 0..1 series */
const stepOf = (vals, c = "sa", o = {}) => {
  const p = pts(vals, o)
  const out = [p[0]]
  for (let i = 1; i < p.length; i += 1) {
    out.push([p[i][0], p[i - 1][1]], p[i])
  }
  return PL(out, c)
}

/* smooth bell shape, used for densities and violins */
const bell = (cx, halfWidth, base, peak, scale = 1) => {
  const k = halfWidth * scale
  return `M${n(cx - k)} ${n(base)}C${n(cx - k * 0.45)} ${n(base)} ${n(cx - k * 0.55)} ${n(peak)} ${n(cx)} ${n(peak)}C${n(cx + k * 0.55)} ${n(peak)} ${n(cx + k * 0.45)} ${n(base)} ${n(cx + k)} ${n(base)}`
}

/* grid of cells; fills is a row-major array of "fs" | "fa" | "fsm" | null */
const grid = (cols, rows, fills, o = {}) => {
  const { x0 = LEFT, x1 = RIGHT, y0 = TOP, y1 = BASE, gap = 1 } = o
  const w = (x1 - x0 - gap * (cols - 1)) / cols
  const h = (y1 - y0 - gap * (rows - 1)) / rows
  let out = ""
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cls = fills[r * cols + c]
      if (cls) out += R(x0 + c * (w + gap), y0 + r * (h + gap), w, h, cls)
    }
  }
  return out
}

/* dots at explicit coordinates */
const dots = (list, r = 1.6, c = "fs") => list.map(([x, y]) => C(x, y, r, c)).join("")

/* circular arc, used for gauges, pies, donuts and sunbursts */
const arc = (cx, cy, r, a0, a1, c = "ss") => {
  const rad = (a) => ((a - 90) * Math.PI) / 180
  const x0 = cx + r * Math.cos(rad(a0))
  const y0 = cy + r * Math.sin(rad(a0))
  const x1 = cx + r * Math.cos(rad(a1))
  const y1 = cy + r * Math.sin(rad(a1))
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0
  return P(`M${n(x0)} ${n(y0)}A${n(r)} ${n(r)} 0 ${large} 1 ${n(x1)} ${n(y1)}`, c)
}

/* filled pie/donut wedge */
const wedge = (cx, cy, rOuter, rInner, a0, a1, c = "fa") => {
  const rad = (a) => ((a - 90) * Math.PI) / 180
  const p = (r, a) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))]
  const [ax, ay] = p(rOuter, a0)
  const [bx, by] = p(rOuter, a1)
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0
  if (!rInner) {
    return P(
      `M${n(cx)} ${n(cy)}L${n(ax)} ${n(ay)}A${n(rOuter)} ${n(rOuter)} 0 ${large} 1 ${n(bx)} ${n(by)}Z`,
      c
    )
  }
  const [dx, dy] = p(rInner, a1)
  const [ex, ey] = p(rInner, a0)
  return P(
    `M${n(ax)} ${n(ay)}A${n(rOuter)} ${n(rOuter)} 0 ${large} 1 ${n(bx)} ${n(by)}L${n(dx)} ${n(dy)}A${n(rInner)} ${n(rInner)} 0 ${large} 0 ${n(ex)} ${n(ey)}Z`,
    c
  )
}

/* regular hexagon centred at cx,cy with circumradius r (flat-top) */
const hex = (cx, cy, r, c = "fs") => {
  const p = []
  for (let i = 0; i < 6; i += 1) {
    const a = ((60 * i + 30) * Math.PI) / 180
    p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return PG(p, c)
}

/* short arrowhead at the end of a horizontal or vertical run */
const arrowR = (x, y, s = 2.2, c = "fs") =>
  PG([[x, y - s], [x + s * 1.4, y], [x, y + s]], c)
const arrowD = (x, y, s = 2.2, c = "fs") =>
  PG([[x - s, y], [x, y + s * 1.4], [x + s, y]], c)

/* an abstract land outline reused by every map form */
const landmass = (c = "ax") =>
  P(
    "M8 8L20 5L31 8L42 5L54 9L57 15L52 22L40 24L28 22L16 24L8 18Z",
    c
  )

/* --- glyph definitions ------------------------------------------------ */
/* Keys must match the Form cell text in report-v0.html exactly. */

const G = {}

/* 1. Exact lookup, status, and summary --------------------------------- */

G["Data table"] =
  R(LEFT, TOP, RIGHT - LEFT, 5, "fa") +
  grid(3, 3, Array(9).fill("fsm"), { y0: TOP + 6.5 })

G["Pivot table"] =
  R(LEFT, TOP, RIGHT - LEFT, 5, "fa") +
  R(LEFT, TOP + 6.5, 12, BASE - TOP - 6.5, "fa") +
  grid(3, 3, Array(9).fill("fsm"), { x0: LEFT + 13.5, y0: TOP + 6.5 })

G["KPI card"] =
  R(LEFT, TOP + 1, 30, 13, "fa") +
  R(LEFT, TOP + 17, 22, 2.5, "fsm") +
  R(LEFT, TOP + 21.5, 14, 2.5, "fsm") +
  arrowR(RIGHT - 8, TOP + 7, 3, "fs")

G["Scorecard"] = [0, 1, 2]
  .map(
    (i) =>
      R(LEFT, TOP + 1 + i * 7.5, 34, 3, "fsm") +
      R(LEFT + 38, TOP + 0.5 + i * 7.5, 4, 4, i === 1 ? "fa" : "fs")
  )
  .join("")

G["Sparkline"] = lineOf([0.35, 0.5, 0.3, 0.55, 0.45, 0.7, 0.62, 0.9], "sa", {
  top: TOP + 4,
  base: BASE - 3,
}) + C(RIGHT, BASE - 3 - 0.9 * (BASE - 3 - TOP - 4), 2, "fa")

G["Bullet chart"] =
  R(LEFT, TOP + 6, RIGHT - LEFT, 10, "fsm") +
  R(LEFT, TOP + 6, 34, 10, "fs") +
  R(LEFT, TOP + 9, 42, 4, "fa") +
  L(LEFT + 48, TOP + 4, LEFT + 48, TOP + 18, "ss")

G["Gauge"] =
  arc(32, 22, 15, -90, 90, "ax") +
  arc(32, 22, 15, -90, 35, "sa") +
  L(32, 22, 40, 12, "ss") +
  C(32, 22, 1.8, "fs")

/* 2. Comparison and ranking -------------------------------------------- */

G["Horizontal bar"] = axisL() + hbars([1, 0.78, 0.6, 0.42, 0.25], { accent: [0] })

G["Vertical bar/column"] = axes() + vbars([0.45, 0.7, 0.55, 1, 0.62, 0.35], { accent: [3] })

G["Grouped bar"] = axes() + (() => {
  const groups = [[0.85, 0.55], [0.6, 0.9], [0.7, 0.4]]
  let out = ""
  groups.forEach(([a, b], g) => {
    const x = LEFT + 3 + g * 18
    out += R(x, BASE - a * 22, 6.5, a * 22, "fs")
    out += R(x + 7.5, BASE - b * 22, 6.5, b * 22, "fa")
  })
  return out
})()

G["Stacked bar"] = axes() + (() => {
  const stacks = [[0.3, 0.4], [0.45, 0.3], [0.25, 0.5], [0.4, 0.35]]
  let out = ""
  stacks.forEach(([a, b], i) => {
    const x = LEFT + 2 + i * 13.5
    const ha = a * 22
    const hb = b * 22
    out += R(x, BASE - ha, 10, ha, "fa")
    out += R(x, BASE - ha - hb - 0.8, 10, hb, "fsm")
  })
  return out
})()

G["100% stacked bar"] = (() => {
  const splits = [0.55, 0.35, 0.7, 0.45]
  let out = ""
  splits.forEach((s, i) => {
    const x = LEFT + 2 + i * 13.5
    const total = BASE - TOP
    out += R(x, BASE - total * s, 10, total * s, "fa")
    out += R(x, TOP, 10, total * (1 - s) - 0.8, "fsm")
  })
  return out
})()

G["Diverging bar"] = (() => {
  const rows = [[-0.7, 0.0], [0, 0.85], [-0.4, 0], [0, 0.55], [-0.55, 0]]
  const mid = 32
  let out = axisL(mid, TOP, BASE)
  rows.forEach(([neg, pos], i) => {
    const y = TOP + 0.5 + i * 4.6
    if (neg) out += R(mid + neg * 27, y, -neg * 27, 3.2, "fs")
    if (pos) out += R(mid, y, pos * 27, 3.2, "fa")
  })
  return out
})()

G["Dot plot"] =
  axisL() +
  dots([[52, 6], [38, 11], [45, 16], [26, 21]], 2.2, "fs") +
  C(52, 6, 2.2, "fa")

G["Lollipop chart"] = axes() + (() => {
  const vals = [0.5, 0.85, 0.35, 0.7, 0.55]
  let out = ""
  vals.forEach((v, i) => {
    const x = LEFT + 5 + i * 12
    const y = BASE - v * 20
    out += L(x, BASE, x, y, "ss")
    out += C(x, y, 2.4, i === 1 ? "fa" : "fs")
  })
  return out
})()

G["Cleveland dot plot"] = axisL() + (() => {
  const rows = [[0.35, 0.8], [0.5, 0.9], [0.25, 0.6]]
  return rows
    .map(([a, b], i) => {
      const y = TOP + 4 + i * 7
      return C(LEFT + a * 50, y, 2.2, "fs") + C(LEFT + b * 50, y, 2.2, "fa")
    })
    .join("")
})()

G["Dumbbell chart"] = axisL() + (() => {
  const rows = [[0.3, 0.85], [0.45, 0.7], [0.2, 0.95]]
  return rows
    .map(([a, b], i) => {
      const y = TOP + 4 + i * 7
      const x0 = LEFT + a * 50
      const x1 = LEFT + b * 50
      return L(x0, y, x1, y, "ss") + C(x0, y, 2.2, "fs") + C(x1, y, 2.2, "fa")
    })
    .join("")
})()

G["Slopegraph"] = (() => {
  const pairs = [[0.85, 0.35], [0.6, 0.7], [0.3, 0.9]]
  let out = axisL(LEFT + 6, TOP, BASE) + axisL(RIGHT - 6, TOP, BASE)
  pairs.forEach(([a, b], i) => {
    const y0 = BASE - a * 20
    const y1 = BASE - b * 20
    out += L(LEFT + 6, y0, RIGHT - 6, y1, i === 2 ? "sa" : "ss")
  })
  return out
})()

G["Bump chart"] = (() => {
  const series = [
    [0.9, 0.55, 0.55, 0.2],
    [0.55, 0.9, 0.2, 0.55],
    [0.2, 0.2, 0.9, 0.9],
  ]
  let out = ""
  series.forEach((s, i) => {
    const cls = i === 2 ? "sa" : "ss"
    out += lineOf(s, cls, { x0: LEFT + 3, x1: RIGHT - 3, top: TOP + 2, base: BASE - 2 })
    out += pts(s, { x0: LEFT + 3, x1: RIGHT - 3, top: TOP + 2, base: BASE - 2 })
      .map(([x, y]) => C(x, y, 1.5, i === 2 ? "fa" : "fs"))
      .join("")
  })
  return out
})()

G["Pareto chart"] =
  axes() +
  vbars([1, 0.72, 0.48, 0.3, 0.18], { x1: RIGHT - 2 }) +
  lineOf([0.34, 0.58, 0.75, 0.88, 0.98], "sa", { x0: LEFT + 5, x1: RIGHT - 4, top: TOP, base: BASE })

G["Pictogram/isotype"] = (() => {
  const on = [0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 12]
  let out = ""
  for (let i = 0; i < 15; i += 1) {
    const c = i % 5
    const r = Math.floor(i / 5)
    out += R(LEFT + 1 + c * 11.5, TOP + 1 + r * 7.5, 8, 5.5, on.includes(i) ? "fa" : "fsm")
  }
  return out
})()

/* 3. Time and change --------------------------------------------------- */

G["Line chart"] = axes() + lineOf([0.25, 0.45, 0.35, 0.6, 0.5, 0.8, 0.72, 0.95])

G["Multi-series line"] =
  axes() +
  lineOf([0.2, 0.35, 0.3, 0.5, 0.45, 0.62], "ss") +
  lineOf([0.55, 0.5, 0.68, 0.6, 0.75, 0.7], "ss") +
  lineOf([0.35, 0.62, 0.5, 0.85, 0.72, 0.95], "sa")

G["Step chart"] = axes() + stepOf([0.25, 0.55, 0.4, 0.75, 0.6, 0.95])

G["Area chart"] =
  axes() +
  areaOf([0.25, 0.5, 0.38, 0.7, 0.55, 0.9], "fam") +
  lineOf([0.25, 0.5, 0.38, 0.7, 0.55, 0.9], "sa")

G["Stacked area"] =
  axes() +
  areaOf([0.85, 0.7, 0.9, 0.75, 0.95, 0.88], "fsm") +
  areaOf([0.4, 0.3, 0.5, 0.38, 0.55, 0.45], "fa")

G["Streamgraph"] = (() => {
  const mid = 14
  const up = [0.2, 0.45, 0.75, 0.55, 0.85, 0.6]
  const dn = [0.3, 0.6, 0.4, 0.8, 0.5, 0.7]
  const p = (vals, dir) =>
    vals.map((v, i) => [LEFT + ((RIGHT - LEFT) * i) / (vals.length - 1), mid + dir * v * 10])
  const top = p(up, -1)
  const bot = p(dn, 1)
  return P(
    `M${n(top[0][0])} ${n(top[0][1])}L` +
      top.slice(1).map(([x, y]) => `${n(x)} ${n(y)}`).join("L") +
      `L${n(bot.at(-1)[0])} ${n(bot.at(-1)[1])}L` +
      bot.slice(0, -1).reverse().map(([x, y]) => `${n(x)} ${n(y)}`).join("L") +
      "Z",
    "fa"
  )
})()

G["Horizon chart"] = [0, 1, 2]
  .map((band) => {
    const vals = [
      [0.3, 0.7, 0.45, 0.9, 0.6],
      [0.6, 0.35, 0.8, 0.5, 0.75],
      [0.45, 0.85, 0.3, 0.65, 0.9],
    ][band]
    const y1 = TOP + 6.5 + band * 6.5
    return areaOf(vals, band === 2 ? "fa" : "fsm", { base: y1, top: y1 - 6 })
  })
  .join("")

G["Small-multiple line"] = [0, 1, 2]
  .map((panel) => {
    const x0 = LEFT + panel * 19.7
    const x1 = x0 + 17
    const vals = [
      [0.2, 0.6, 0.4, 0.85],
      [0.7, 0.4, 0.6, 0.3],
      [0.35, 0.5, 0.8, 0.65],
    ][panel]
    return (
      axisB(BASE, x0, x1) +
      lineOf(vals, panel === 0 ? "sa" : "ss", { x0, x1, top: TOP + 2, base: BASE })
    )
  })
  .join("")

G["Connected scatterplot"] = (() => {
  const p = [[8, 20], [17, 12], [26, 17], [36, 7], [46, 14], [56, 6]]
  return axes() + PL(p, "sa") + p.map(([x, y]) => C(x, y, 1.9, "fa")).join("")
})()

G["Timeline"] = (() => {
  let out = axisB(14, LEFT, RIGHT)
  const at = [10, 22, 34, 47, 58]
  at.forEach((x, i) => {
    out += L(x, 14, x, i % 2 ? 20 : 8, "ss")
    out += C(x, i % 2 ? 20 : 8, 2.1, i === 2 ? "fa" : "fs")
  })
  return out
})()

G["Gantt chart"] = [
  [0, 26, "fa"],
  [10, 30, "fs"],
  [22, 24, "fs"],
  [34, 24, "fs"],
]
  .map(([x, w, c], i) => R(LEFT + x, TOP + 1 + i * 5.8, w, 4, c))
  .join("")

G["Calendar heatmap"] = (() => {
  const fills = [
    "fsm", "fs", "fa", "fsm", "fs", "fa", "fs", "fsm", "fa", "fs",
    "fs", "fa", "fsm", "fs", "fsm", "fa", "fs", "fa", "fsm", "fs",
    "fa", "fsm", "fs", "fsm", "fa", "fs", "fsm", "fa",
  ]
  return grid(7, 4, fills, { gap: 1.2 })
})()

G["Candlestick/OHLC"] = (() => {
  const bars = [
    [0.28, 0.80, 0.40, 0.68],
    [0.45, 0.98, 0.88, 0.56],
    [0.18, 0.70, 0.30, 0.60],
    [0.40, 1.0, 0.52, 0.92],
  ]
  return bars
    .map(([lo, hi, o, c], i) => {
      const x = LEFT + 7 + i * 13.5
      const y = (v) => BASE - v * 21
      const up = c >= o
      const top = Math.min(y(o), y(c))
      const h = Math.max(3, Math.abs(y(o) - y(c)))
      return L(x, y(lo), x, y(hi), "ss") + R(x - 3.5, top, 7, h, up ? "fa" : "fs")
    })
    .join("")
})()

G["Control chart"] =
  L(LEFT, 14, RIGHT, 14, "ax") +
  P(`M${LEFT} 7L${RIGHT} 7`, "axd") +
  P(`M${LEFT} 21L${RIGHT} 21`, "axd") +
  lineOf([0.5, 0.6, 0.42, 0.55, 0.95, 0.48], "ss", { top: TOP + 1, base: BASE - 1 }) +
  C(LEFT + ((RIGHT - LEFT) * 4) / 5, BASE - 1 - 0.95 * (BASE - 1 - TOP - 1), 2.3, "fa")

G["Fan chart"] = (() => {
  const split = LEFT + 24
  const bands = [
    [0.62, 0.62, 0.9, 0.34],
    [0.62, 0.62, 0.78, 0.46],
  ]
  let out = axes()
  bands.forEach(([a, b, hi, lo], i) => {
    out += P(
      `M${n(split)} ${n(BASE - b * 22)}L${n(RIGHT)} ${n(BASE - hi * 22)}L${n(RIGHT)} ${n(BASE - lo * 22)}Z`,
      i === 0 ? "fsm" : "fam"
    )
  })
  out += lineOf([0.3, 0.5, 0.62], "sa", { x0: LEFT, x1: split, top: TOP, base: BASE })
  out += L(split, BASE - 0.62 * 22, RIGHT, BASE - 0.62 * 22, "sa")
  return out
})()

/* 4. Distribution and uncertainty -------------------------------------- */

G["Histogram"] =
  axes() +
  vbars([0.2, 0.45, 0.75, 1, 0.8, 0.5, 0.25], { accent: [3], gap: 0.6 })

G["Frequency polygon"] =
  axes() +
  lineOf([0.15, 0.4, 0.72, 1, 0.78, 0.45, 0.2], "sa")

G["KDE/density plot"] = axisB() + P(bell(32, 24, BASE, TOP + 2) + "Z", "fa")

G["ECDF"] = axes() + stepOf([0.1, 0.25, 0.5, 0.7, 0.85, 0.95, 1])

G["Boxplot"] = (() => {
  const y = 14
  return (
    L(8, y, 20, y, "ss") +
    L(8, y - 4, 8, y + 4, "ss") +
    L(44, y, 56, y, "ss") +
    L(56, y - 4, 56, y + 4, "ss") +
    R(20, y - 7, 24, 14, "fsm") +
    R(20, y - 7, 24, 14, "sso") +
    L(33, y - 7, 33, y + 7, "sa")
  )
})()

G["Violin plot"] = (() => {
  const cx = 32
  const top = TOP
  const bot = BASE + 1
  const w = 13
  const d =
    `M${cx} ${top}` +
    `C${cx + w} ${top + 6} ${cx + w} ${bot - 6} ${cx} ${bot}` +
    `C${cx - w} ${bot - 6} ${cx - w} ${top + 6} ${cx} ${top}Z`
  return P(d, "fa") + R(cx - 2.5, 10, 5, 8, "fsm") + L(cx - 4, 14, cx + 4, 14, "sso")
})()

G["Strip/jitter plot"] =
  axisB() +
  dots(
    [
      [16, 20], [16, 14], [16, 8], [32, 21], [32, 16], [32, 11], [32, 6],
      [48, 19], [48, 13], [48, 8],
    ],
    1.7,
    "fs"
  ) +
  dots([[32, 16], [48, 13]], 1.7, "fa")

G["Beeswarm"] = (() => {
  const y = 14
  const cols = [
    [10, [0]],
    [18, [-4, 4]],
    [26, [-7, 0, 7]],
    [34, [-9, -3, 3, 9]],
    [42, [-6, 0, 6]],
    [50, [-3, 3]],
    [58, [0]],
  ]
  let out = L(LEFT, y, RIGHT, y, "ax")
  cols.forEach(([x, offs], i) => {
    offs.forEach((o) => {
      out += C(x, y + o, 1.6, i === 3 ? "fa" : "fs")
    })
  })
  return out
})()

G["Ridgeline"] = [0, 1, 2]
  .map((i) => {
    const base = TOP + 9 + i * 6
    const cx = 22 + i * 10
    return P(bell(cx, 20, base, base - 9) + "Z", i === 2 ? "fa" : "fsm")
  })
  .join("")

G["Raincloud"] =
  P(bell(32, 22, 13, TOP + 1) + "Z", "fa") +
  R(22, 15.5, 20, 5, "fsm") +
  L(32, 15.5, 32, 20.5, "sso") +
  dots([[20, 23], [26, 23], [32, 23], [38, 23], [45, 23]], 1.5, "fs")

G["Q–Q plot"] =
  axes() +
  L(LEFT + 2, BASE - 2, RIGHT - 2, TOP + 2, "axd") +
  dots([[9, 21], [17, 18], [24, 15], [32, 13], [40, 10], [48, 7], [55, 5]], 1.8, "fa")

G["Error bar"] = (() => {
  const vals = [
    [14, 12, 5],
    [32, 16, 4],
    [50, 9, 6],
  ]
  return (
    axes() +
    vals
      .map(([x, y, e]) =>
        L(x, y - e, x, y + e, "ss") +
        L(x - 3, y - e, x + 3, y - e, "ss") +
        L(x - 3, y + e, x + 3, y + e, "ss") +
        C(x, y, 2.2, "fa")
      )
      .join("")
  )
})()

G["Error band"] = (() => {
  const mid = [0.3, 0.5, 0.42, 0.68, 0.6, 0.88]
  const hi = mid.map((v) => Math.min(1, v + 0.16))
  const lo = mid.map((v) => Math.max(0, v - 0.16))
  const top = pts(hi)
  const bot = pts(lo)
  return (
    axes() +
    P(
      `M${n(top[0][0])} ${n(top[0][1])}L` +
        top.slice(1).map(([x, y]) => `${n(x)} ${n(y)}`).join("L") +
        `L` +
        bot.reverse().map(([x, y]) => `${n(x)} ${n(y)}`).join("L") +
        "Z",
      "fam"
    ) +
    lineOf(mid, "sa")
  )
})()

G["Forest plot"] = (() => {
  let out = L(38, TOP, 38, BASE, "axd")
  const rows = [
    [26, 7, 9],
    [44, 14, 10],
    [32, 21, 7],
  ]
  rows.forEach(([x, y, e], i) => {
    out += L(x - e, y, x + e, y, "ss")
    out += L(x - e, y - 3, x - e, y + 3, "ss")
    out += L(x + e, y - 3, x + e, y + 3, "ss")
    out += PG([[x, y - 3.4], [x + 3.4, y], [x, y + 3.4], [x - 3.4, y]], i === 1 ? "fa" : "fs")
  })
  return out
})()

G["Quantile dotplot"] = (() => {
  const cols = [1, 2, 4, 5, 4, 2, 1]
  let out = axisB()
  cols.forEach((count, c) => {
    for (let i = 0; i < count; i += 1) {
      out += C(LEFT + 5 + c * 8.5, BASE - 2.4 - i * 4.2, 1.8, c === 3 ? "fa" : "fs")
    }
  })
  return out
})()

G["Hypothetical outcome plot"] =
  axes() +
  lineOf([0.3, 0.55, 0.4, 0.72, 0.58, 0.8], "ssf") +
  lineOf([0.35, 0.42, 0.6, 0.5, 0.78, 0.66], "ssf") +
  lineOf([0.25, 0.6, 0.48, 0.62, 0.5, 0.9], "ssf") +
  lineOf([0.32, 0.52, 0.5, 0.65, 0.62, 0.82], "sa")

G["Gradient interval"] = (() => {
  const steps = [
    ["fam", 4],
    ["fa", 12],
    ["fam", 4],
  ]
  let x = 10
  let out = L(LEFT, 14, RIGHT, 14, "ax")
  const shades = [0.25, 0.5, 1, 1, 0.5, 0.25]
  const w = 8
  shades.forEach((s, i) => {
    out += `<rect class="fa" x="${n(8 + i * w)}" y="8" width="${n(w)}" height="12" opacity="${s}"/>`
  })
  out += L(32, 5, 32, 23, "ss")
  return out
})()

/* 5. Relationship and correlation -------------------------------------- */

const SCATTER = [
  [9, 21], [14, 17], [19, 19], [23, 13], [28, 16], [32, 10],
  [37, 14], [42, 8], [47, 11], [52, 6], [57, 9],
]

G["Scatterplot"] = axes() + dots(SCATTER, 1.8, "fa")

G["Bubble chart"] =
  axes() +
  [[12, 19, 2], [24, 13, 3.6], [36, 17, 2.6], [46, 8, 4.6], [56, 14, 1.8]]
    .map(([x, y, r], i) => C(x, y, r, i === 3 ? "fa" : "fs"))
    .join("")

G["Hexbin plot"] = (() => {
  const cells = [
    [12, 19, "fsm"], [20, 19, "fs"], [28, 19, "fsm"],
    [16, 13, "fs"], [24, 13, "fa"], [32, 13, "fs"],
    [28, 7, "fsm"], [36, 7, "fs"], [44, 13, "fsm"],
    [40, 19, "fsm"], [48, 7, "fsm"],
  ]
  return cells.map(([x, y, c]) => hex(x, y, 4.4, c)).join("")
})()

G["2D density/contour"] =
  axes() +
  `<ellipse class="ss" cx="32" cy="14" rx="24" ry="9.5"/>` +
  `<ellipse class="ss" cx="32" cy="14" rx="15" ry="6"/>` +
  `<ellipse class="fa" cx="32" cy="14" rx="6" ry="2.6"/>`

G["Regression plot"] = axes() + dots(SCATTER, 1.7, "fs") + L(7, 22, 58, 6, "sa")

G["Residual plot"] = (() => {
  const p = [[10, 9], [19, 18], [28, 11], [37, 19], [46, 10], [55, 17]]
  let out = L(LEFT, 14, RIGHT, 14, "ss")
  p.forEach(([x, y]) => {
    out += L(x, 14, x, y, "ax")
    out += C(x, y, 1.9, "fa")
  })
  return out
})()

G["Correlogram"] = (() => {
  const fills = [
    "fa", "fs", "fsm", "fs",
    "fs", "fa", "fs", "fsm",
    "fsm", "fs", "fa", "fs",
    "fs", "fsm", "fs", "fa",
  ]
  return grid(4, 4, fills, { x0: 18, x1: 46, gap: 1.2 })
})()

G["Scatterplot matrix/SPLOM"] = (() => {
  const panels = [
    [[4, 8], [9, 4], [13, 9]],
    [[3, 9], [8, 6], [12, 3]],
    [[4, 4], [8, 9], [13, 6]],
    [[3, 6], [9, 8], [12, 4]],
  ]
  let out = ""
  for (let i = 0; i < 4; i += 1) {
    const cx = 18 + (i % 2) * 15
    const cy = TOP + Math.floor(i / 2) * 11.5
    out += R(cx, cy, 13.5, 10, "box")
    panels[i].forEach(([x, y]) => {
      out += C(cx + x, cy + y * 0.9, 1.3, i % 3 === 0 ? "fa" : "fs")
    })
  }
  return out
})()

G["Parallel coordinates"] = (() => {
  let out = ""
  const xs = [10, 28, 46, 58]
  xs.forEach((x) => {
    out += axisL(x, TOP, BASE)
  })
  const lines = [
    [0.8, 0.35, 0.7, 0.2],
    [0.5, 0.75, 0.3, 0.6],
    [0.2, 0.5, 0.9, 0.85],
  ]
  lines.forEach((s, i) => {
    out += PL(
      s.map((v, j) => [xs[j], BASE - v * 21]),
      i === 2 ? "sa" : "ss"
    )
  })
  return out
})()

G["Radar/spider chart"] = (() => {
  const cx = 32
  const cy = 14
  const ring = (r) => {
    const p = []
    for (let i = 0; i < 5; i += 1) {
      const a = ((72 * i - 90) * Math.PI) / 180
      p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
    }
    return p
  }
  const outer = ring(11)
  let out = PG(outer, "boxc") + PG(ring(5.5), "box")
  outer.forEach(([x, y]) => {
    out += L(cx, cy, x, y, "ax")
  })
  const vals = [0.85, 0.45, 0.7, 0.3, 0.6]
  const shape = vals.map((v, i) => {
    const a = ((72 * i - 90) * Math.PI) / 180
    return [cx + 10 * v * Math.cos(a), cy + 10 * v * Math.sin(a)]
  })
  out += PG(shape, "fam") + PG(shape, "sa")
  return out
})()

G["Ternary plot"] =
  PG([[32, TOP], [RIGHT - 8, BASE], [LEFT + 8, BASE]], "box") +
  dots([[32, 16], [26, 21], [39, 20], [34, 11]], 1.8, "fa")

G["Bland–Altman plot"] =
  L(LEFT, 14, RIGHT, 14, "ss") +
  P(`M${LEFT} 7L${RIGHT} 7`, "axd") +
  P(`M${LEFT} 21L${RIGHT} 21`, "axd") +
  dots([[10, 12], [18, 16], [26, 11], [34, 17], [42, 13], [50, 18], [57, 10]], 1.7, "fa")

/* 6. Composition and contribution -------------------------------------- */

G["Pie chart"] =
  wedge(32, 14, 11, 0, 0, 250, "fsm") +
  wedge(32, 14, 11, 0, 250, 360, "fa")

G["Donut chart"] =
  wedge(32, 14, 11, 5.5, 0, 240, "fsm") +
  wedge(32, 14, 11, 5.5, 240, 360, "fa")

G["Waffle chart"] = (() => {
  const on = 7
  const fills = []
  for (let i = 0; i < 15; i += 1) fills.push(i < on ? "fa" : "fsm")
  return grid(5, 3, fills, { x0: 18, x1: 46, gap: 1.3 })
})()

G["Treemap"] =
  R(LEFT, TOP, 26, 13, "fa") +
  R(LEFT, TOP + 14, 26, 8, "fsm") +
  R(LEFT + 27, TOP, 16, 22, "fs") +
  R(LEFT + 44, TOP, 14, 10, "fsm") +
  R(LEFT + 44, TOP + 11, 14, 11, "fsm")

G["Sunburst"] =
  wedge(32, 14, 11, 7, 0, 150, "fsm") +
  wedge(32, 14, 11, 7, 150, 260, "fs") +
  wedge(32, 14, 11, 7, 260, 360, "fsm") +
  wedge(32, 14, 6, 2.5, 0, 210, "fa") +
  wedge(32, 14, 6, 2.5, 210, 360, "fs")

G["Icicle chart"] =
  R(LEFT, TOP, RIGHT - LEFT, 5, "fa") +
  R(LEFT, TOP + 6, 34, 5, "fs") +
  R(LEFT + 35, TOP + 6, 23, 5, "fsm") +
  R(LEFT, TOP + 12, 18, 5, "fsm") +
  R(LEFT + 19, TOP + 12, 15, 5, "fsm") +
  R(LEFT + 35, TOP + 12, 23, 5, "fs") +
  R(LEFT, TOP + 18, 18, 4, "fs")

G["Mosaic plot"] = (() => {
  const cols = [
    [20, [0.55, 0.45]],
    [14, [0.35, 0.65]],
    [24, [0.7, 0.3]],
  ]
  let x = LEFT
  let out = ""
  cols.forEach(([w, splits], i) => {
    let y = TOP
    splits.forEach((s, j) => {
      const h = (BASE - TOP) * s - 0.7
      out += R(x, y, w, h, j === 0 ? (i === 1 ? "fa" : "fs") : "fsm")
      y += h + 1.4
    })
    x += w + 1.4
  })
  return out
})()

G["Marimekko"] = (() => {
  const cols = [
    [24, [0.6, 0.4]],
    [16, [0.4, 0.6]],
    [17, [0.75, 0.25]],
  ]
  let x = LEFT
  let out = ""
  cols.forEach(([w, splits]) => {
    let y = TOP
    splits.forEach((s, j) => {
      const h = (BASE - TOP) * s - 0.7
      out += R(x, y, w, h, j === 0 ? "fa" : "fsm")
      y += h + 1.4
    })
    x += w + 1.4
  })
  return out
})()

G["Waterfall"] = (() => {
  const steps = [
    [0, 12],
    [12, 6],
    [18, -4],
    [14, 8],
  ]
  let out = axisB()
  let x = LEFT + 2
  steps.forEach(([from, delta], i) => {
    const y0 = BASE - from
    const y1 = BASE - (from + delta)
    out += R(x, Math.min(y0, y1), 11, Math.abs(delta), delta < 0 ? "fsm" : "fa")
    if (i < steps.length - 1) out += L(x + 11, y1, x + 13.5, y1, "ax")
    x += 13.5
  })
  return out
})()

G["Funnel chart"] = [
  [0, 58, 5],
  [7, 44, 5],
  [15, 30, 5],
  [22, 16, 5],
]
  .map(([i, w, h], k) =>
    PG(
      [
        [32 - w / 2, TOP + i],
        [32 + w / 2, TOP + i],
        [32 + (w - 14) / 2, TOP + i + h],
        [32 - (w - 14) / 2, TOP + i + h],
      ],
      k === 3 ? "fa" : "fsm"
    )
  )
  .join("")

G["Population pyramid"] = (() => {
  const rows = [
    [0.55, 0.6],
    [0.75, 0.8],
    [0.9, 0.85],
    [0.65, 0.7],
    [0.4, 0.45],
  ]
  const mid = 32
  let out = axisL(mid, TOP, BASE)
  rows.forEach(([l, r], i) => {
    const y = TOP + 0.5 + i * 4.6
    out += R(mid - l * 26, y, l * 26, 3.4, "fs")
    out += R(mid + 1, y, r * 26, 3.4, "fa")
  })
  return out
})()

/* 7. Hierarchy, network, and flow -------------------------------------- */

G["Node-link graph"] = (() => {
  const nodes = [[12, 8], [12, 21], [32, 14], [50, 7], [52, 20]]
  const edges = [[0, 2], [1, 2], [2, 3], [2, 4], [3, 4]]
  let out = edges.map(([a, b]) => L(...nodes[a], ...nodes[b], "ax")).join("")
  nodes.forEach(([x, y], i) => {
    out += C(x, y, i === 2 ? 3.4 : 2.4, i === 2 ? "fa" : "fs")
  })
  return out
})()

G["Adjacency matrix"] = (() => {
  const on = new Set(["0,1", "1,0", "1,2", "2,1", "0,3", "3,0", "2,3", "3,2"])
  const diag = new Set(["0,0", "1,1", "2,2", "3,3"])
  const fills = []
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      const k = `${r},${c}`
      fills.push(diag.has(k) ? "fa" : on.has(k) ? "fs" : "fsm")
    }
  }
  return grid(4, 4, fills, { x0: 18, x1: 46, gap: 1.2 })
})()

G["Force-directed graph"] = (() => {
  const nodes = [[9, 14], [20, 6], [22, 21], [34, 12], [45, 20], [48, 6], [58, 13]]
  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6]]
  let out = edges.map(([a, b]) => L(...nodes[a], ...nodes[b], "ax")).join("")
  nodes.forEach(([x, y], i) => {
    out += C(x, y, i === 3 ? 3.2 : 2.1, i === 3 ? "fa" : "fs")
  })
  return out
})()

G["Arc diagram"] = (() => {
  const at = [8, 19, 30, 41, 52, 60]
  let out = axisB(21, LEFT, RIGHT)
  const arcs = [[0, 2], [1, 4], [2, 3], [3, 5]]
  arcs.forEach(([a, b], i) => {
    const x0 = at[a]
    const x1 = at[b]
    const r = (x1 - x0) / 2
    out += P(`M${x0} 21A${n(r)} ${n(r)} 0 0 1 ${x1} 21`, i === 1 ? "sa" : "ss")
  })
  at.forEach((x) => {
    out += C(x, 21, 1.9, "fs")
  })
  return out
})()

G["Chord diagram"] = (() => {
  const cx = 32
  const cy = 14
  const r = 11
  const at = (deg) => {
    const a = ((deg - 90) * Math.PI) / 180
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }
  let out = ""
  ;[[10, 130], [140, 250], [260, 360]].forEach(([a, b], i) => {
    out += arc(cx, cy, r, a, b, i === 0 ? "sat" : "sst")
  })
  const chords = [[40, 200], [110, 300], [170, 340]]
  chords.forEach(([a, b], i) => {
    const [x0, y0] = at(a)
    const [x1, y1] = at(b)
    out += P(`M${n(x0)} ${n(y0)}Q${cx} ${cy} ${n(x1)} ${n(y1)}`, i === 0 ? "sa" : "ss")
  })
  return out
})()

G["Sankey diagram"] =
  R(3, 4, 4, 20, "fs") +
  R(57, 3, 4, 10, "fa") +
  R(57, 15, 4, 8, "fs") +
  P("M7 4C25 4 39 3 57 3L57 13C39 13 25 13 7 13Z", "fam") +
  P("M7 14C25 14 39 15 57 15L57 23C39 23 25 24 7 24Z", "fsm")

G["Alluvial diagram"] = (() => {
  const col = (x) => R(x, TOP, 3.5, BASE - TOP, "fs")
  let out = col(LEFT) + col(30) + col(RIGHT - 3.5)
  out += P(`M${LEFT + 3.5} 5C18 5 20 8 30 8L30 14C20 14 18 11 ${LEFT + 3.5} 11Z`, "fam")
  out += P(`M${LEFT + 3.5} 14C18 14 20 18 30 18L30 24C20 24 18 20 ${LEFT + 3.5} 20Z`, "fsm")
  out += P(`M33.5 6C44 6 48 12 ${RIGHT - 3.5} 12L${RIGHT - 3.5} 18C48 18 44 11 33.5 11Z`, "fam")
  return out
})()

G["Parallel sets"] = (() => {
  let out = ""
  const bands = [
    [TOP, 7, "fa"],
    [TOP + 8, 5, "fs"],
    [TOP + 14, 8, "fsm"],
  ]
  bands.forEach(([y, h, c]) => {
    out += R(LEFT, y, 10, h, c)
    out += R(RIGHT - 10, y === TOP ? TOP + 4 : y === TOP + 8 ? TOP : TOP + 12, h, h, c)
  })
  out += P(`M${LEFT + 10} ${TOP}L${RIGHT - 10} ${TOP + 4}L${RIGHT - 10} ${TOP + 11}L${LEFT + 10} ${TOP + 7}Z`, "fam")
  out += P(`M${LEFT + 10} ${TOP + 14}L${RIGHT - 10} ${TOP + 12}L${RIGHT - 10} ${TOP + 20}L${LEFT + 10} ${TOP + 22}Z`, "fsm")
  return out
})()

G["Tree diagram"] = (() => {
  const root = [32, TOP + 2]
  const mid = [[18, 14], [46, 14]]
  const leaf = [[10, BASE - 1], [26, BASE - 1], [38, BASE - 1], [54, BASE - 1]]
  let out = ""
  mid.forEach((m) => {
    out += L(root[0], root[1], m[0], m[1], "ax")
  })
  leaf.forEach((l, i) => {
    out += L(mid[Math.floor(i / 2)][0], mid[Math.floor(i / 2)][1], l[0], l[1], "ax")
  })
  out += C(root[0], root[1], 2.6, "fa")
  mid.forEach(([x, y]) => {
    out += C(x, y, 2.2, "fs")
  })
  leaf.forEach(([x, y]) => {
    out += R(x - 2, y - 2, 4, 4, "fs")
  })
  return out
})()

G["Dendrogram"] = (() => {
  const leaves = [8, 20, 32, 44, 56]
  let out = leaves.map((x) => L(x, BASE, x, BASE - 3, "ss")).join("")
  const join = (x0, x1, y) => L(x0, y, x1, y, "ss") + L(x0, y, x0, BASE - 3, "ax") + L(x1, y, x1, BASE - 3, "ax")
  out += L(8, 17, 20, 17, "ss") + L(8, 17, 8, BASE - 3, "ss") + L(20, 17, 20, BASE - 3, "ss")
  out += L(44, 19, 56, 19, "ss") + L(44, 19, 44, BASE - 3, "ss") + L(56, 19, 56, BASE - 3, "ss")
  out += L(14, 11, 32, 11, "ss") + L(14, 11, 14, 17, "ss") + L(32, 11, 32, BASE - 3, "ss")
  out += L(23, TOP + 2, 50, TOP + 2, "sa") + L(23, TOP + 2, 23, 11, "sa") + L(50, TOP + 2, 50, 19, "sa")
  return out
})()

G["Dependency graph"] = (() => {
  const box = (x, y, c = "fs") => R(x, y, 12, 7, c)
  let out =
    box(LEFT, TOP + 1) +
    box(24, TOP + 1) +
    box(24, TOP + 14) +
    box(46, TOP + 7, "fa")
  out += L(LEFT + 12, TOP + 4.5, 21.5, TOP + 4.5, "ax") + arrowR(21.5, TOP + 4.5, 2, "fs")
  out += L(LEFT + 12, TOP + 4.5, 18, TOP + 17.5, "ax") + L(18, TOP + 17.5, 21.5, TOP + 17.5, "ax") + arrowR(21.5, TOP + 17.5, 2, "fs")
  out += L(36, TOP + 4.5, 43.5, TOP + 9, "ax") + arrowR(43.5, TOP + 9, 2, "fs")
  out += L(36, TOP + 17.5, 43.5, TOP + 13, "ax") + arrowR(43.5, TOP + 13, 2, "fs")
  return out
})()

/* 8. Geography and spatial data ---------------------------------------- */

G["Choropleth"] = (() => {
  const cells = [
    [8, 6, 14, 8, "fsm"], [23, 6, 12, 8, "fa"], [36, 5, 13, 9, "fs"], [50, 7, 8, 7, "fsm"],
    [9, 15, 11, 8, "fs"], [21, 15, 15, 8, "fsm"], [37, 15, 10, 8, "fa"], [48, 15, 10, 8, "fs"],
  ]
  return cells.map(([x, y, w, h, c]) => R(x, y, w, h, c)).join("")
})()

G["Proportional-symbol map"] =
  landmass() +
  [[17, 15, 3.2], [30, 11, 4.8], [42, 17, 2.4], [50, 13, 3.8]]
    .map(([x, y, r], i) => C(x, y, r, i === 1 ? "fa" : "fs"))
    .join("")

G["Dot-density map"] =
  landmass() +
  dots(
    [
      [14, 12], [17, 16], [20, 13], [23, 18], [26, 11], [28, 15],
      [31, 19], [34, 12], [37, 16], [40, 13], [43, 18], [46, 14],
      [49, 11], [52, 16], [22, 9], [35, 20], [44, 10],
    ],
    1.15,
    "fa"
  )

G["Cartogram"] = (() => {
  const cells = [
    [6, 4, 20, 12, "fa"], [27, 6, 9, 8, "fsm"], [37, 3, 14, 14, "fs"], [52, 8, 6, 6, "fsm"],
    [7, 17, 12, 7, "fs"], [20, 17, 6, 5, "fsm"], [28, 16, 16, 8, "fsm"], [45, 18, 11, 6, "fs"],
  ]
  return cells.map(([x, y, w, h, c]) => R(x, y, w, h, c)).join("")
})()

G["Flow map"] = (() => {
  let out = landmass()
  const origin = [17, 17]
  const targets = [[36, 8], [46, 15], [40, 21]]
  targets.forEach(([x, y], i) => {
    out += P(
      `M${origin[0]} ${origin[1]}Q${n((origin[0] + x) / 2)} ${n(Math.min(origin[1], y) - 5)} ${x} ${y}`,
      i === 0 ? "sa" : "ss"
    )
    out += C(x, y, 1.6, i === 0 ? "fa" : "fs")
  })
  out += C(origin[0], origin[1], 2.4, "fa")
  return out
})()

G["Hexbin/grid map"] = (() => {
  const cells = [
    [14, 8, "fsm"], [23, 8, "fs"], [32, 8, "fa"], [41, 8, "fsm"],
    [18, 15, "fs"], [27, 15, "fsm"], [36, 15, "fs"], [45, 15, "fa"],
    [23, 22, "fsm"], [32, 22, "fs"], [41, 22, "fsm"],
  ]
  return cells.map(([x, y, c]) => hex(x, y, 4.3, c)).join("")
})()

G["Contour/isoline map"] =
  PG([[5, 15], [12, 8], [24, 4], [36, 6], [48, 3], [58, 10], [59, 18], [50, 24], [37, 26], [25, 23], [13, 25], [6, 20]], "ss") +
  PG([[15, 15], [21, 10], [30, 8], [40, 10], [48, 8], [52, 14], [46, 20], [37, 22], [28, 20], [19, 20]], "ss") +
  PG([[26, 15], [31, 11], [39, 12], [44, 15], [39, 19], [30, 19]], "sa")

G["Raster/heat map"] = (() => {
  const fills = [
    "fsm", "fs", "fs", "fa", "fa", "fs", "fsm", "fsm",
    "fs", "fa", "fa", "fa", "fs", "fsm", "fsm", "fs",
    "fsm", "fs", "fa", "fs", "fsm", "fs", "fs", "fsm",
  ]
  return grid(8, 3, fills, { gap: 0.7 })
})()

G["Isochrone map"] =
  `<ellipse class="ss" cx="32" cy="14" rx="26" ry="10.5"/>` +
  `<ellipse class="ss" cx="32" cy="14" rx="17" ry="7"/>` +
  `<ellipse class="sa" cx="32" cy="14" rx="8" ry="3.5"/>` +
  C(32, 14, 2, "fa")

G["Bivariate choropleth"] = (() => {
  const cells = [
    [8, 6, 14, 8, "fa"], [23, 6, 12, 8, "fsm"], [36, 5, 13, 9, "fa"], [50, 7, 8, 7, "fs"],
    [9, 15, 11, 8, "fsm"], [21, 15, 15, 8, "fa"], [37, 15, 10, 8, "fs"], [48, 15, 10, 8, "fsm"],
  ]
  let out = cells.map(([x, y, w, h, c]) => R(x, y, w, h, c)).join("")
  out += grid(2, 2, ["fsm", "fs", "fs", "fa"], { x0: 52, x1: 61, y0: 1, y1: 10, gap: 0.6 })
  return out
})()

/* 9. Process, architecture, and explanatory diagrams ------------------- */

G["Flowchart"] = (() => {
  let out = R(LEFT, 10, 12, 8, "fs")
  out += PG([[28, 14], [35, 8], [42, 14], [35, 20]], "fa")
  out += R(RIGHT - 12, 10, 12, 8, "fs")
  out += L(LEFT + 12, 14, 25.5, 14, "ax") + arrowR(25.5, 14, 2, "fs")
  out += L(42, 14, RIGHT - 14.5, 14, "ax") + arrowR(RIGHT - 14.5, 14, 2, "fs")
  return out
})()

G["Swimlane diagram"] =
  L(LEFT, 14, RIGHT, 14, "ax") +
  axisL(LEFT + 6, TOP, BASE) +
  R(LEFT + 9, TOP + 1, 14, 7, "fa") +
  R(30, TOP + 1, 14, 7, "fs") +
  R(LEFT + 20, TOP + 15, 14, 7, "fs") +
  R(44, TOP + 15, 14, 7, "fsm")

G["BPMN diagram"] =
  C(LEFT + 4, 14, 3.6, "boxc") +
  R(16, 10, 14, 8, "fs") +
  R(34, 10, 14, 8, "fa") +
  C(RIGHT - 4, 14, 3.6, "boxcf") +
  L(LEFT + 8, 14, 15, 14, "ax") +
  L(30, 14, 33.5, 14, "ax") +
  L(48, 14, RIGHT - 8, 14, "ax")

G["Sequence diagram"] = (() => {
  let out = R(10, TOP, 12, 4, "fs") + R(42, TOP, 12, 4, "fs")
  out += L(16, TOP + 4, 16, BASE, "axd") + L(48, TOP + 4, 48, BASE, "axd")
  out += L(16, 12, 45.5, 12, "ss") + arrowR(45.5, 12, 2, "fs")
  out += L(48, 17, 18.5, 17, "ss") + PG([[18.5, 15], [17.1, 17], [18.5, 19]], "fs")
  out += L(16, 22, 45.5, 22, "sa") + arrowR(45.5, 22, 2, "fa")
  return out
})()

G["State diagram"] = (() => {
  let out = R(LEFT + 2, 12, 14, 9, "fs") + R(40, 12, 14, 9, "fa")
  out += L(LEFT + 16, 16.5, 39.5, 16.5, "ax") + arrowR(39.5, 16.5, 2, "fs")
  out += P("M44 12C44 5 54 5 54 12", "ss") + arrowD(54, 10, 1.8, "fs")
  return out
})()

G["Architecture diagram"] =
  R(LEFT, TOP, RIGHT - LEFT, 6, "fa") +
  R(LEFT, TOP + 7.5, RIGHT - LEFT, 6, "fs") +
  R(LEFT, TOP + 15, 27, 7, "fsm") +
  R(LEFT + 31, TOP + 15, 27, 7, "fsm")

G["Entity-relationship diagram"] = (() => {
  let out = R(LEFT, 9, 16, 10, "fs") + R(RIGHT - 16, 9, 16, 10, "fa")
  out += L(LEFT + 16, 14, RIGHT - 16, 14, "ss")
  out += L(RIGHT - 16, 14, RIGHT - 21, 10, "ss")
  out += L(RIGHT - 16, 14, RIGHT - 21, 18, "ss")
  out += L(LEFT + 16, 14, LEFT + 21, 14, "ss")
  return out
})()

G["Decision tree"] = (() => {
  let out = PG([[32, TOP], [37, TOP + 4], [32, TOP + 8], [27, TOP + 4]], "fa")
  out += L(29, TOP + 7, 18, 13, "ax") + L(35, TOP + 7, 46, 13, "ax")
  out += PG([[18, 13], [22, 16.5], [18, 20], [14, 16.5]], "fs")
  out += R(42, 13, 9, 6, "fs")
  out += L(16, 20, 10, BASE - 1, "ax") + L(20, 20, 27, BASE - 1, "ax")
  out += R(7, BASE - 4, 7, 4, "fsm") + R(24, BASE - 4, 7, 4, "fsm")
  return out
})()

G["Causal diagram/DAG"] = (() => {
  const a = [10, 20]
  const b = [32, 6]
  const c = [54, 20]
  let out = ""
  out += L(a[0] + 3, a[1] - 2, b[0] - 3, b[1] + 2, "ax") + arrowR(b[0] - 3.5, b[1] + 2.5, 1.8, "fs")
  out += L(b[0] + 3, b[1] + 2, c[0] - 3, c[1] - 2, "ax") + arrowR(c[0] - 3.5, c[1] - 2.5, 1.8, "fs")
  out += L(a[0] + 4, a[1], c[0] - 4, c[1], "ax") + arrowR(c[0] - 4.5, c[1], 1.8, "fs")
  out += C(a[0], a[1], 3, "fs") + C(b[0], b[1], 3, "fa") + C(c[0], c[1], 3, "fs")
  return out
})()

G["Mind map"] = (() => {
  const cx = 30
  const cy = 14
  const spokes = [[10, 6], [10, 22], [50, 5], [52, 14], [48, 23]]
  let out = spokes.map(([x, y]) => L(cx, cy, x, y, "ax")).join("")
  out += R(cx - 7, cy - 4, 14, 8, "fa")
  spokes.forEach(([x, y]) => {
    out += R(x - 4, y - 2.5, 8, 5, "fs")
  })
  return out
})()

/* 10. Specialized analytical forms ------------------------------------- */

G["Heatmap"] = (() => {
  const fills = [
    "fsm", "fs", "fa", "fs", "fsm", "fs",
    "fs", "fa", "fa", "fsm", "fs", "fsm",
    "fa", "fs", "fsm", "fs", "fa", "fs",
  ]
  return grid(6, 3, fills, { gap: 1 })
})()

G["Calendar/cohort retention matrix"] = (() => {
  let out = ""
  const cols = 6
  const rows = 4
  const w = (RIGHT - LEFT - 1 * (cols - 1)) / cols
  const h = (BASE - TOP - 1 * (rows - 1)) / rows
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols - r; c += 1) {
      const cls = c === 0 ? "fa" : c < 3 ? "fs" : "fsm"
      out += R(LEFT + c * (w + 1), TOP + r * (h + 1), w, h, cls)
    }
  }
  return out
})()

G["Confusion matrix"] =
  grid(2, 2, ["fa", "fsm", "fsm", "fa"], { x0: 20, x1: 44, y0: TOP + 1, y1: BASE - 1, gap: 1.2 })

G["ROC curve"] =
  axes() +
  L(LEFT, BASE, RIGHT, TOP, "axd") +
  P(`M${LEFT} ${BASE}C${LEFT + 6} ${TOP + 6} ${LEFT + 22} ${TOP} ${RIGHT} ${TOP}`, "sa")

G["Precision–recall curve"] =
  axes() +
  P(`M${LEFT} ${TOP + 1}C${LEFT + 20} ${TOP + 2} ${LEFT + 34} ${TOP + 8} ${RIGHT} ${BASE - 2}`, "sa")

G["Calibration plot"] =
  axes() +
  L(LEFT, BASE, RIGHT, TOP, "axd") +
  P(`M${LEFT} ${BASE}C${LEFT + 16} ${BASE - 4} ${LEFT + 30} ${TOP + 10} ${RIGHT} ${TOP}`, "sa") +
  dots([[14, 20], [26, 15], [38, 10], [50, 6]], 1.7, "fa")

G["Kaplan–Meier curve"] = axes() + stepOf([1, 0.88, 0.72, 0.6, 0.52, 0.44, 0.4])

G["Funnel plot"] =
  axisL(32, TOP, BASE) +
  L(32, TOP, LEFT + 2, BASE, "axd") +
  L(32, TOP, RIGHT - 2, BASE, "axd") +
  dots([[32, 6], [27, 11], [37, 12], [22, 17], [42, 18], [17, 22], [46, 22]], 1.7, "fa")

G["Volcano plot"] = (() => {
  let out = axes()
  out += P(`M${LEFT} 20L${RIGHT} 20`, "axd")
  const mid = [[28, 22], [32, 21], [36, 22], [30, 19], [34, 20]]
  const left = [[9, 8], [12, 12], [15, 6]]
  const right = [[52, 7], [56, 11], [49, 5]]
  out += dots(mid, 1.5, "fsm")
  out += dots([...left, ...right], 1.7, "fa")
  return out
})()

G["Manhattan plot"] = (() => {
  const cols = [
    [7, [22, 18]], [12, [21, 16, 12]], [17, [23, 19]], [22, [20, 14, 9]],
    [27, [22, 17]], [32, [21, 15]], [37, [23, 20, 16]], [42, [22, 18]],
    [47, [20, 13, 7]], [52, [22, 19]], [57, [21, 17]],
  ]
  let out = P(`M${LEFT} 11L${RIGHT} 11`, "axd") + axisB()
  cols.forEach(([x, ys]) => {
    ys.forEach((y) => {
      out += C(x, y, 1.3, y < 11 ? "fa" : "fs")
    })
  })
  return out
})()

G["Nomogram"] = (() => {
  const xs = [12, 32, 52]
  let out = xs.map((x) => L(x, TOP, x, BASE, "ss")).join("")
  xs.forEach((x) => {
    for (let i = 0; i <= 4; i += 1) {
      out += L(x - 2, TOP + i * 5.5, x + 2, TOP + i * 5.5, "ax")
    }
  })
  out += L(12, 20, 52, 8, "sa")
  out += C(12, 20, 1.8, "fa") + C(32, 14, 1.8, "fa") + C(52, 8, 1.8, "fa")
  return out
})()

/* --- export ----------------------------------------------------------- */

/* Normalize dash variants and whitespace so lookup survives en dash vs
   hyphen differences between the table text and these keys. */
export const normalizeFormKey = (value) =>
  value
    .replace(/[‐-―−]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

const INDEX = new Map(
  Object.entries(G).map(([key, body]) => [normalizeFormKey(key), body])
)

export const glyphCount = Object.keys(G).length

export const glyphNames = Object.keys(G)

export function glyphFor(formName) {
  const body = INDEX.get(normalizeFormKey(formName))
  if (!body) return null
  return `<svg class="glyph" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true" focusable="false">${body}</svg>`
}

export const glyphCss = `
.glyph { flex: none; width: 64px; height: 28px; display: block; }
.glyph .ss, .glyph .sa, .glyph .ax, .glyph .axd, .glyph .ssf, .glyph .sso,
.glyph .box, .glyph .boxc, .glyph .sst, .glyph .sat { fill: none; stroke-linecap: butt; stroke-linejoin: miter; }
.glyph .ss { stroke: var(--muted-foreground); stroke-width: 1.5; }
.glyph .sa { stroke: var(--primary); stroke-width: 1.5; }
.glyph .sst { stroke: var(--muted-foreground); stroke-width: 3; }
.glyph .sat { stroke: var(--primary); stroke-width: 3; }
.glyph .ssf { stroke: var(--muted-foreground); stroke-width: 1; opacity: .45; }
.glyph .sso { stroke: var(--primary); stroke-width: 1.5; }
.glyph .ax { stroke: var(--muted-foreground); stroke-width: 1; opacity: .4; }
.glyph .axd { stroke: var(--muted-foreground); stroke-width: 1; opacity: .4; stroke-dasharray: 2.5 2; }
.glyph .box { stroke: var(--muted-foreground); stroke-width: 1; opacity: .55; }
.glyph .boxc { stroke: var(--muted-foreground); stroke-width: 1.5; }
.glyph .fs { fill: var(--muted-foreground); stroke: none; }
.glyph .fa { fill: var(--primary); stroke: none; }
.glyph .fsm { fill: var(--muted-foreground); stroke: none; opacity: .38; }
.glyph .fam { fill: var(--primary); stroke: none; opacity: .38; }
.glyph .boxcf { fill: none; stroke: var(--primary); stroke-width: 2.5; }
`
