export function calculateSMA(data, period) {
  const smaValues = [];

  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, value) => acc + value.Close, 0);
    let average = sum / period;
    smaValues.push({ x: data[i].x, y: average });
  }

  return smaValues;
}

export function calculateEMA(data, period) {
  const emaValues = [];
  const multiplier = 2 / (period + 1);

  if (
    data[period - 1].x !== null &&
    data[period - 1].y !== null &&
    data[period]
  ) {
    const sma =
      data.slice(0, period).reduce((acc, value) => acc + value.Close, 0) /
      period;
    emaValues.push({ x: data[period - 1].x, y: sma });
  }

  for (let i = period; i < data.length; i++) {
    const close = data[i].Close;
    const prevEMA = emaValues[i - period].y;
    const ema = (close - prevEMA) * multiplier + prevEMA;
    emaValues.push({ x: data[i].x, y: ema });
  }

  return emaValues;
}
