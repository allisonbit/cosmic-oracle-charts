// Real technical-indicator math, computed from an actual price series.
// These replace the previous Math.random() "indicators" so every value shown to
// users is a genuine function of real market data, not a fabricated number.
//
// All functions are pure and return arrays aligned to the input (index i in the
// output corresponds to index i in `values`); positions without enough lookback
// are filled with `null` so callers can render gaps honestly instead of faking.

export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

export function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    if (prev === null) {
      // Seed the EMA with the SMA of the first `period` values.
      let s = 0;
      for (let j = i - period + 1; j <= i; j++) s += values[j];
      prev = s / period;
    } else {
      prev = values[i] * k + prev * (1 - k);
    }
    out.push(prev);
  }
  return out;
}

// Wilder's RSI (0–100). Returns null until there is enough lookback.
export function rsi(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = new Array(values.length).fill(null);
  if (values.length <= period) return out;
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) avgGain += diff;
    else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

// MACD line + signal + histogram, all derived from real EMAs.
export function macd(values: number[], fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  const macdLine = values.map((_, i) =>
    emaFast[i] !== null && emaSlow[i] !== null ? (emaFast[i] as number) - (emaSlow[i] as number) : null,
  );
  const macdDefined = macdLine.map((v) => (v === null ? 0 : v));
  const signalRaw = ema(macdDefined, signalPeriod);
  const signal = macdLine.map((v, i) => (v === null ? null : signalRaw[i]));
  const histogram = macdLine.map((v, i) =>
    v !== null && signal[i] !== null ? v - (signal[i] as number) : null,
  );
  return { macdLine, signal, histogram };
}

export function stddev(values: number[], period: number): (number | null)[] {
  const means = sma(values, period);
  return values.map((_, i) => {
    if (i < period - 1 || means[i] === null) return null;
    const mean = means[i] as number;
    let acc = 0;
    for (let j = i - period + 1; j <= i; j++) acc += (values[j] - mean) ** 2;
    return Math.sqrt(acc / period);
  });
}

// Bollinger bands from real SMA ± mult * stddev.
export function bollinger(values: number[], period = 20, mult = 2) {
  const mid = sma(values, period);
  const sd = stddev(values, period);
  const upper = values.map((_, i) => (mid[i] !== null && sd[i] !== null ? (mid[i] as number) + mult * (sd[i] as number) : null));
  const lower = values.map((_, i) => (mid[i] !== null && sd[i] !== null ? (mid[i] as number) - mult * (sd[i] as number) : null));
  return { mid, upper, lower };
}
