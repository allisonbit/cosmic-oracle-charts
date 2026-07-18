// Oracle Bull daily digest — branded HTML template + data fetcher.
// Shared by send-daily-digest and preview-daily-digest.

const SITE = "https://oraclebull.com";
const BRAND = "#2563eb";
const BRAND_DARK = "#1d4ed8";
const GREEN = "#16a34a";
const RED = "#dc2626";
const INK = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";
const CARD = "#ffffff";
const BG = "#f8fafc";

export interface Coin {
  id?: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  image?: string;
}

export interface PredictionRow {
  coin_id: string;
  symbol: string | null;
  timeframe: string;
  bias: string | null;
  confidence: number | null;
}

export interface DigestData {
  gainers: Coin[];
  losers: Coin[];
  btc: Coin | null;
  eth: Coin | null;
  predictions: PredictionRow[];
  narrative: string;
}

function fmtPrice(n: number) {
  if (!isFinite(n)) return "—";
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}
function fmtPct(n: number) {
  if (!isFinite(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
function esc(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export async function fetchDigestData(supabase: any): Promise<DigestData> {
  const r = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&price_change_percentage=24h",
    { headers: { accept: "application/json" } },
  ).catch(() => null);
  const markets: any[] = r && r.ok ? await r.json().catch(() => []) : [];

  const toCoin = (c: any): Coin => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    price: c.current_price,
    change24h: c.price_change_percentage_24h ?? 0,
    image: c.image,
  });

  const sorted = [...markets].filter((c) => typeof c.price_change_percentage_24h === "number");
  const gainers = [...sorted].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5).map(toCoin);
  const losers = [...sorted].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5).map(toCoin);
  const btc = markets.find((c) => c.id === "bitcoin");
  const eth = markets.find((c) => c.id === "ethereum");

  const { data: predRows } = await supabase
    .from("predictions_cache")
    .select("coin_id, symbol, timeframe, bias, confidence, expires_at")
    .gt("expires_at", new Date().toISOString())
    .order("confidence", { ascending: false })
    .limit(3);

  const upCount = sorted.filter((c) => c.price_change_percentage_24h > 0).length;
  const downCount = sorted.length - upCount;
  const tone = upCount > downCount * 1.5 ? "risk-on" : downCount > upCount * 1.5 ? "risk-off" : "mixed";
  const narrative =
    `Markets are ${tone} today: ${upCount} of the top ${sorted.length} assets are green, ` +
    `led by ${gainers[0]?.symbol?.toUpperCase() ?? "—"} (${fmtPct(gainers[0]?.change24h ?? 0)}). ` +
    `Bitcoin is ${btc ? fmtPct(btc.price_change_percentage_24h) : "flat"}.`;

  return {
    gainers,
    losers,
    btc: btc ? toCoin(btc) : null,
    eth: eth ? toCoin(eth) : null,
    predictions: (predRows ?? []) as PredictionRow[],
    narrative,
  };
}

function spotlightCard(coin: Coin | null, label: string) {
  if (!coin) return "";
  const up = coin.change24h >= 0;
  return `
    <td width="50%" valign="top" style="padding:0 6px">
      <div style="background:${CARD};border:1px solid ${BORDER};border-radius:12px;padding:16px">
        <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};font-weight:600">${esc(label)}</div>
        <div style="font-size:22px;font-weight:700;color:${INK};margin-top:4px">${esc(coin.symbol.toUpperCase())}</div>
        <div style="font-size:20px;font-weight:600;color:${INK};margin-top:8px">$${fmtPrice(coin.price)}</div>
        <div style="font-size:14px;font-weight:600;color:${up ? GREEN : RED};margin-top:2px">${fmtPct(coin.change24h)} <span style="color:${MUTED};font-weight:400">24h</span></div>
      </div>
    </td>`;
}

function moverRow(c: Coin, up: boolean) {
  return `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK}">
        <strong>${esc(c.symbol.toUpperCase())}</strong>
        <span style="color:${MUTED}">&nbsp;${esc(c.name)}</span>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid ${BORDER};text-align:right;font-size:14px;color:${INK}">$${fmtPrice(c.price)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid ${BORDER};text-align:right;font-size:14px;font-weight:600;color:${up ? GREEN : RED}">${fmtPct(c.change24h)}</td>
    </tr>`;
}

function predictionRow(p: PredictionRow) {
  const bias = (p.bias ?? "neutral").toLowerCase();
  const color = bias === "bullish" ? GREEN : bias === "bearish" ? RED : MUTED;
  return `
    <tr>
      <td style="padding:12px 14px;border-bottom:1px solid ${BORDER}">
        <a href="${SITE}/price-prediction/${esc(p.coin_id)}/${esc(p.timeframe)}" style="color:${BRAND};text-decoration:none;font-weight:600;font-size:14px">
          ${esc((p.symbol ?? p.coin_id).toUpperCase())} · ${esc(p.timeframe)}
        </a>
        <div style="color:${MUTED};font-size:12px;margin-top:2px">
          Bias: <strong style="color:${color};text-transform:capitalize">${esc(bias)}</strong>
          &nbsp;·&nbsp; Confidence ${p.confidence ?? "—"}%
        </div>
      </td>
    </tr>`;
}

export function buildDigestHtml(input: DigestData & { unsubscribeUrl: string; date: string }) {
  const { gainers, losers, btc, eth, predictions, narrative, unsubscribeUrl, date } = input;
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Oracle Bull · Daily Digest</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${INK};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Your Oracle Bull daily crypto brief — BTC, ETH, top movers and AI forecasts for ${esc(date)}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- Header -->
  <tr><td style="padding:0 6px 20px 6px">
    <table role="presentation" width="100%"><tr>
      <td style="font-size:20px;font-weight:800;letter-spacing:-0.3px;color:${INK}">
        <span style="display:inline-block;width:10px;height:10px;background:${BRAND};border-radius:50%;margin-right:8px;vertical-align:middle"></span>
        Oracle Bull
      </td>
      <td align="right" style="font-size:12px;color:${MUTED}">${esc(date)}</td>
    </tr></table>
    <div style="margin-top:16px;font-size:22px;font-weight:700;color:${INK};line-height:1.3">Your daily crypto brief</div>
    <div style="margin-top:6px;font-size:14px;color:${MUTED};line-height:1.5">${esc(narrative)}</div>
  </td></tr>

  <!-- BTC / ETH spotlight -->
  <tr><td style="padding:0 0 8px 0"><table role="presentation" width="100%"><tr>
    ${spotlightCard(btc, "Bitcoin")}
    ${spotlightCard(eth, "Ethereum")}
  </tr></table></td></tr>

  <!-- Movers -->
  <tr><td style="padding:16px 6px 0 6px"><div style="background:${CARD};border:1px solid ${BORDER};border-radius:12px;overflow:hidden">
    <div style="padding:14px 16px;font-size:13px;font-weight:700;color:${INK};letter-spacing:0.3px;text-transform:uppercase;border-bottom:1px solid ${BORDER};background:#fbfcfe">Top Gainers · 24h</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${gainers.map((c) => moverRow(c, true)).join("")}</table>
  </div></td></tr>

  <tr><td style="padding:12px 6px 0 6px"><div style="background:${CARD};border:1px solid ${BORDER};border-radius:12px;overflow:hidden">
    <div style="padding:14px 16px;font-size:13px;font-weight:700;color:${INK};letter-spacing:0.3px;text-transform:uppercase;border-bottom:1px solid ${BORDER};background:#fbfcfe">Top Losers · 24h</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${losers.map((c) => moverRow(c, false)).join("")}</table>
  </div></td></tr>

  ${predictions.length ? `
  <tr><td style="padding:12px 6px 0 6px"><div style="background:${CARD};border:1px solid ${BORDER};border-radius:12px;overflow:hidden">
    <div style="padding:14px 16px;font-size:13px;font-weight:700;color:${INK};letter-spacing:0.3px;text-transform:uppercase;border-bottom:1px solid ${BORDER};background:#fbfcfe">AI Forecast Highlights</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${predictions.map(predictionRow).join("")}</table>
  </div></td></tr>` : ""}

  <!-- CTA -->
  <tr><td align="center" style="padding:24px 6px 8px 6px">
    <a href="${SITE}" style="display:inline-block;padding:12px 22px;background:${BRAND};color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">Open Oracle Bull</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 6px 6px 6px;text-align:center;font-size:12px;color:${MUTED};line-height:1.6">
    You're receiving this because you subscribed to Oracle Bull's daily digest.<br/>
    <a href="${esc(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline">Unsubscribe instantly</a>
    &nbsp;·&nbsp; <a href="${SITE}" style="color:${MUTED};text-decoration:underline">oraclebull.com</a><br/>
    Not financial advice. Crypto markets are volatile — always do your own research.
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}
