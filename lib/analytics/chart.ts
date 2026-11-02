// What the question box can draw. Safe for the browser: it holds no data access.
export const CHART_TYPES = ['number', 'bars', 'columns', 'line', 'pie', 'table'] as const
export type ChartType = typeof CHART_TYPES[number]
export type ChartRow = { key: string; value: number; projected?: boolean }
/** What was asked for, so the AI can redraw it differently on a follow-up. */
export type ChartSource = Record<string, unknown>
export type ChartSpec = { title: string; rows: ChartRow[]; valueLabel: string; type: ChartType; overTime: boolean; total: number; more?: number; source: ChartSource }

export const CHART_NAMES: Record<ChartType, string> = { number: 'Number', bars: 'Bars', columns: 'Columns', line: 'Line', pie: 'Pie', table: 'Table' }

const TOO_MANY_FOR_BARS = 20

/** The clearest form for this data: a figure for one value, a line for time, ranked bars for comparing, a table for long lists. */
export function bestChart(rows: ChartRow[], overTime: boolean): ChartType {
  if (rows.length <= 1) return 'number'
  if (overTime) return 'line'
  return rows.length > TOO_MANY_FOR_BARS ? 'table' : 'bars'
}

const WORDS: [RegExp, ChartType][] = [
  [/\b(pie|donut|doughnut)\b/, 'pie'], [/\bline\b/, 'line'], [/\bcolumns?\b|\bvertical\b/, 'columns'], [/\bbars?\b|\bhistogram\b/, 'bars'],
  [/\b(table|list|spreadsheet|rows)\b/, 'table'], [/\b(number|figure|total)\b/, 'number'],
]
export const chartWord = (text: string) => WORDS.find(([re]) => re.test(text.toLowerCase()))?.[1] ?? null

// Words that mean new data is wanted, not just a new look at the same data
const NEW_DATA = /\b(from|in|last|past|this|next|by|per|for|only|instead of|countr\w*|cit(y|ies)|sources?|visitors?|visits?|sales?|orders?|members?|sign.?ups?|pages?|puzzles?|weeks?|months?|years?|today|why|how many|who|which|what)\b/

/** "make it a pie" or "as a table": just redraw the last chart, with no need to ask anyone. */
export function formatRequest(text: string): ChartType | null {
  const q = text.toLowerCase().trim()
  if (q.length > 60) return null
  const type = chartWord(q)
  if (!type) return null
  const rest = q.replace(/\b(pie|donut|doughnut|line|columns?|vertical|bars?|histogram|table|list|spreadsheet|rows|number|figure|total)\b/g, '')
  // "this" can mean the chart ("change this to") or a period ("this month")
  return NEW_DATA.test(rest.replace(/\bin\b/g, '').replace(/\bthis (to|as|into|a|one)\b/g, '')) ? null : type
}

/** Visits, sign-ups and so on, in a form a spreadsheet can open. */
export function chartCsv(chart: ChartSpec) {
  const safe = (s: string) => `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`
  return [[safe(chart.title), safe(chart.valueLabel)].join(','), ...chart.rows.map(r => [safe(r.key + (r.projected ? ' (projected)' : '')), r.value].join(','))].join('\r\n')
}
