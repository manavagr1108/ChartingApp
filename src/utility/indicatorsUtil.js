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

export function calculateZigZag(data, deviation, pivotLegs) {
  let trend = null;
  let lastPivotPrice = data[0].Close;
  let lastPivotIndex = 0;
  let lastPivotDate = data[0].Date;
  let zigZagPoints = {};
  let count = -1;

  data.forEach((d, i) => {
    if (trend === "up") {
      if(lastPivotPrice <= d.High){
        lastPivotPrice = d.High;
        lastPivotDate = d.Date;
        lastPivotIndex = i;
      } else if (
        d.Low < lastPivotPrice * (1 - deviation / 100) &&
        i - lastPivotIndex >= pivotLegs
      ) {
        zigZagPoints[lastPivotDate] = {
          index: count,
          value: lastPivotPrice,
          date: lastPivotDate,
        };
        trend = "down";
        lastPivotPrice = d.Low;
        lastPivotIndex = i;
        lastPivotDate = d.Date;
        count++;
      }
    } else if (trend === "down") {
      if(lastPivotPrice >= d.Low){
        lastPivotPrice = d.Low;
        lastPivotDate = d.Date;
        lastPivotIndex = i;
      } else if (
        d.High > lastPivotPrice * (1 + deviation / 100) &&
        i - lastPivotIndex >= pivotLegs
      ) {
        zigZagPoints[lastPivotDate] = {
          index: count,
          value: lastPivotPrice,
          date: lastPivotDate,
        };
        trend = "up";
        lastPivotPrice = d.High;
        lastPivotIndex = i;
        lastPivotDate = d.Date;
        count++;
      }
    } else {
      if (d.High > lastPivotPrice * (1 + deviation / 100)) {
        trend = "up";
        lastPivotPrice = d.High;
        lastPivotIndex = i;
        lastPivotDate = d.Date;
        count++;
      } else if (d.Low < lastPivotPrice * (1 - deviation / 100)) {
        trend = "down";
        lastPivotPrice = d.Low;
        lastPivotIndex = i;
        lastPivotDate = d.Date;
        count++;
      }
    }
  });

  if (data[data.length - 1].Date !== lastPivotDate)
    zigZagPoints[lastPivotDate] = {
      index: count,
      value: lastPivotPrice,
      date: lastPivotDate,
    };

  return zigZagPoints;
}

export function calculateRSI(data, period) {
  let gains = 0;
  let losses = 0;
  const rsiValues = [];

  for (let i = 1; i <= period; i++) {
    const change = data[i]?.Close - data[i - 1]?.Close;
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].Close - data[i - 1].Close;
    let gain = change > 0 ? change : 0;
    let loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    let rs = avgLoss === 0 ? 0 : avgGain / avgLoss;
    let rsi = 100 - 100 / (1 + rs);

    rsiValues.push({ x: data[i].Date, y: rsi });
  }

  return rsiValues;
}