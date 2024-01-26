import { monthMap } from "../data/TIME_MAP";
import { getObjtoStringTime } from "./xAxisUtils";
import {
  drawBarChart,
  drawLineChart,
  drawYAxis,
  getYCoordinate,
} from "./yAxisUtils";

export function calculateSMA(data, period) {
  const smaValues = [];
  for (let i = 0; i < period - 1; i++) {
    smaValues.push({ Date: data[i].Date, Close: 0 });
  }
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, value) => acc + value.Close, 0);
    let average = sum / period;
    smaValues.push({ Date: data[i].Date, Close: average });
  }

  return smaValues;
}

export const calculateSMAHighLowAvg = (data, period) => {
  const smaHighLowValues = [];
  for (let i = 0; i < period; i++)
    smaHighLowValues.push({ Date: data[i].Date, Close: 0 });

  for (let i = period; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, value) => acc + (value.High + value.Low) / 2, 0);
    let average = sum / period;
    smaHighLowValues.push({ Date: data[i].Date, Close: average });
  }
  return smaHighLowValues;
};

export function calculateEMA(data, period) {
  period = parseInt(period);
  const emaValues = [];
  const multiplier = 2 / (period + 1);
  for (let i = 0; i < period - 1; i++) {
    emaValues.push({ Date: data[i].Date, Close: 0 });
  }
  const sma =
    data.slice(0, period - 1).reduce((acc, value) => acc + value.Close, 0) /
    (period - 1);
  emaValues.push({ Date: data[period - 1].Date, Close: sma });
  for (let i = period; i < data.length; i++) {
    const close = data[i].Close;
    const prevEMA = emaValues[i - 1].Close;
    const ema = (close - prevEMA) * multiplier + prevEMA;
    emaValues.push({ Date: data[i].Date, Close: ema });
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
      if (lastPivotPrice <= d.High) {
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
      if (lastPivotPrice >= d.Low) {
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

export const calculateRSI = (data, indicator) => {
  let gains = 0;
  let losses = 0;
  const { period } = indicator;
  const rsiValues = [];
  for (let i = 1; i <= period; i++) {
    const change = data[i]?.Close - data[i - 1]?.Close;
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
    rsiValues.push({ Date: data[i - 1].Date, Close: 0 });
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
    rsiValues.push({ Date: data[i - 1].Date, Close: rsi });
  }
  return [rsiValues];
};

export const calculateMACD = (data, indicator) => {
  const { fastPeriod, slowPeriod, signalPeriod } = indicator;
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  const macdValues = [];

  const minMACDValues = Math.min(fastEMA.length, slowEMA.length);

  for (let i = 0; i < minMACDValues; i++) {
    macdValues.push({
      Date: slowEMA[i].Date,
      Close: fastEMA[i].Close - slowEMA[i].Close,
    });
  }

  const signalEMA = calculateEMA(macdValues, signalPeriod);

  const minHistogramValue = Math.min(signalEMA.length, macdValues.length);

  const histogramValues = [];
  for (let i = 0; i < minHistogramValue; i++) {
    histogramValues.push({
      Date: macdValues[i].Date,
      Close: macdValues[i].Close - signalEMA[i].Close,
    });
  }

  return [macdValues, signalEMA, histogramValues];
};

export const calculateParabolicSAR = (data, acceleration, maximum) => {
  const sarValues = [];
  let trend = "up";
  let ep = data[0].Low;
  let sar = data[0].High;
  let af = acceleration;
  let prevSar = data[0].Low;
  let prevEP = data[0].Low;
  let prevAF = acceleration;
  let prevTrend = "up";

  for (let i = 0; i < data.length; i++) {
    if (trend === "up") {
      if (data[i].Low <= sar) {
        trend = "down";
        sar = ep;
        ep = data[i].High;
        af = acceleration;
      } else {
        sar = prevSar + prevAF * (prevEP - prevSar);
        if (data[i].High > prevEP) {
          ep = data[i].High;
          af = Math.min(af + acceleration, maximum);
        } else {
          ep = prevEP;
          af = prevAF;
        }
      }
    } else {
      if (data[i].High >= sar) {
        trend = "up";
        sar = ep;
        ep = data[i].Low;
        af = acceleration;
      } else {
        sar = prevSar + prevAF * (prevEP - prevSar);
        if (data[i].Low < prevEP) {
          ep = data[i].Low;
          af = Math.min(af + acceleration, maximum);
        } else {
          ep = prevEP;
          af = prevAF;
        }
      }
    }

    sarValues.push({ Date: data[i].Date, Close: sar });
    prevSar = sar;
    prevTrend = trend;
    prevEP = ep;
    prevAF = af;
  }
  return sarValues;
};
export const calculateBB = (data, period, stdDev) => {
  const BB = [];
  function calculateSMA(data, period) {
    return data.reduce((acc, val, index) => {
      if (index < period - 1) {
        acc.push({ Date: val.Date, Close: 0 }); // Placeholder for incomplete data
      } else {
        const sum = data
          .slice(index - period + 1, index + 1)
          .reduce((a, v) => a + v.Close, 0);
        acc.push({ Date: val.Date, Close: sum / period });
      }
      return acc;
    }, []);
  }

  // Step 2: Calculate Standard Deviation
  function calculateStandardDeviation(data, period, sma) {
    return data.reduce((acc, val, index) => {
      if (index < period - 1) {
        acc.push({ Date: val.Date, Close: 0 }); // Placeholder for incomplete data
      } else {
        const variance =
          data
            .slice(index - period + 1, index + 1)
            .reduce((a, v) => a + Math.pow(v.Close - sma[index].Close, 2), 0) /
          period;
        acc.push({ Date: val.Date, Close: Math.sqrt(variance) });
      }
      return acc;
    }, []);
  }

  // Step 3: Calculate Bollinger Bands
  const sma = calculateSMA(data, period);
  const stdDeviation = calculateStandardDeviation(data, period, sma);
  sma.forEach((avg, index) => {
    sma[index] = {
      Date: avg.Date,
      Close: avg.Close,
      UpperBand: avg.Close + stdDev * stdDeviation[index].Close,
      LowerBand: avg.Close - stdDev * stdDeviation[index].Close,
    };
  });
  return sma;
};

export const calculateBBW = (data, indicator) => {
  const { period, stdDev } = indicator;
  const BBData = calculateBB(data, period, stdDev);
  const BBW = [];
  BBData.forEach((bb, i) => {
    if (i < period) {
      BBW.push({ Date: bb.Date, Close: 0 });
    } else {
      BBW.push({
        Date: bb.Date,
        Close: (bb.UpperBand - bb.LowerBand) / bb.Close,
      });
    }
  });
  return [BBW];
};

export const calculateKeltnerChannels = (data, period, multiplier) => {
  const keltnerChannelsValues = [];
  const atr = calculateATR(data, period);
  const sma = calculateSMA(data, period);
  for (let i = 0; i < data.length; i++) {
    const upper = sma[i].Close + multiplier * atr[i].Close;
    const lower = sma[i].Close - multiplier * atr[i].Close;
    keltnerChannelsValues.push({
      Date: data[i].Date,
      Close: sma[i].Close,
      UpperBand: upper,
      LowerBand: lower,
    });
  }
  return keltnerChannelsValues;
};

export const calculateDonchainChannels = (data, period) => {
  const donchianChannelsValues = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      donchianChannelsValues.push({
        Date: data[i].Date,
        Close: 0,
        UpperBand: 0,
        LowerBand: 0,
      });
      continue;
    }

    const high = data
      .slice(i - period + 1, i + 1)
      .reduce((max, b) => Math.max(max, b.High), -Infinity);
    const low = data
      .slice(i - period + 1, i + 1)
      .reduce((min, b) => Math.min(min, b.Low), Infinity);

    donchianChannelsValues.push({
      Date: data[i].Date,
      Close: (high + low) / 2,
      UpperBand: high,
      LowerBand: low,
    });
  }
  return donchianChannelsValues;
};

export function calculateATR(data, period) {
  const trueRanges = [{ Date: data[0].Date, trueRange: 0 }];
  const atrValues = [];
  for (let i = 1; i < data.length; i++) {
    const high = data[i].High;
    const low = data[i].Low;
    const prevClose = data[i - 1].Close;

    const trueRange = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push({ Date: data[i].Date, trueRange });
  }

  // Calculate Average True Range (ATR) using Wilder's smoothing
  let atrSum = 0;
  for (let i = 0; i < period; i++) {
    atrSum += trueRanges[i].trueRange;
    if (i === period - 1) {
      atrValues.push({ Date: data[i].Date, Close: atrSum / period });
    } else {
      atrValues.push({ Date: data[i].Date, Close: 0 });
    }
  }
  for (let i = period; i < trueRanges.length; i++) {
    const currentAtr =
      (atrValues[i - 1].Close * (period - 1) + trueRanges[i].trueRange) /
      period;
    atrValues.push({ Date: data[i].Date, Close: currentAtr });
  }
  return atrValues;
}

export function calculateATRDrawChart(data, indicator) {
  return [calculateATR(data, indicator.period)];
}

export function calculateADX(data, indicator) {
  const { period } = indicator;

  // Smoothed True Range (ATR)
  const smoothedTrueRanges = calculateATR(data, period);

  // Calculate Directional Movement (DM)
  const positiveDMs = [{ Date: data[0].Date, positiveDM: 0 }];
  const negativeDMs = [{ Date: data[0].Date, negativeDM: 0 }];

  for (let i = 1; i < data.length; i++) {
    const highDiff = data[i].High - data[i - 1].High;
    const lowDiff = data[i - 1].Low - data[i].Low;

    const positiveDM = highDiff > lowDiff ? Math.max(highDiff, 0) : 0;
    const negativeDM = lowDiff > highDiff ? Math.max(lowDiff, 0) : 0;

    positiveDMs.push({ Date: data[i].Date, positiveDM });
    negativeDMs.push({ Date: data[i].Date, negativeDM });
  }

  // Smoothed Directional Movement (ADM)
  let smoothedPositiveDMSum = 0,
    smoothedNegativeDMSum = 0;
  const smoothedPositiveDMs = [];
  const smoothedNegativeDMs = [];

  for (let i = 0; i < period; i++) {
    smoothedPositiveDMSum += positiveDMs[i].positiveDM;
    smoothedNegativeDMSum += negativeDMs[i].negativeDM;
    if (i === period - 1) {
      smoothedPositiveDMs.push({
        Date: data[i].Date,
        smoothedPositiveDM: smoothedPositiveDMSum / period,
      });
      smoothedNegativeDMs.push({
        Date: data[i].Date,
        smoothedNegativeDM: smoothedNegativeDMSum / period,
      });
    } else {
      smoothedPositiveDMs.push({ Date: data[i].Date, smoothedPositiveDM: 0 });
      smoothedNegativeDMs.push({ Date: data[i].Date, smoothedNegativeDM: 0 });
    }
  }
  for (let i = period; i < positiveDMs.length; i++) {
    const smoothedPositiveDM =
      (smoothedPositiveDMs[i - 1].smoothedPositiveDM * (period - 1) +
        positiveDMs[i].positiveDM) /
      period;
    const smoothedNegativeDM =
      (smoothedNegativeDMs[i - 1].smoothedNegativeDM * (period - 1) +
        negativeDMs[i].negativeDM) /
      period;

    smoothedPositiveDMs.push({
      Date: data[i].Date,
      smoothedPositiveDM: smoothedPositiveDM,
    });
    smoothedNegativeDMs.push({
      Date: data[i].Date,
      smoothedNegativeDM: smoothedNegativeDM,
    });
  }

  // Directional Indicators (period)
  const positiveDI = smoothedPositiveDMs.map((dm, i) =>
    smoothedTrueRanges[i].Close
      ? (dm.smoothedPositiveDM / smoothedTrueRanges[i].Close) * 100
      : 0
  );
  const negativeDI = smoothedNegativeDMs.map((dm, i) =>
    smoothedTrueRanges[i].Close
      ? (dm.smoothedNegativeDM / smoothedTrueRanges[i].Close) * 100
      : 0
  );

  // Directional Movement Index (DX)
  const DX = positiveDI.map((period, i) =>
    period + negativeDI[i]
      ? (Math.abs(period - negativeDI[i]) / (period + negativeDI[i])) * 100
      : 0
  );
  let DXSum = 0;
  const ADX = [];
  for (let i = 0; i < period; i++) {
    DXSum += DX[i];
    if (i === period - 1) {
      ADX.push({ Date: data[i].Date, Close: DXSum / period });
    } else {
      ADX.push({ Date: data[i].Date, Close: 0 });
    }
  }
  // Average Directional Index (ADX)
  for (let i = period; i < DX.length; i++) {
    const smoothedADX = (ADX[i - 1].Close * (period - 1) + DX[i]) / period;
    ADX.push({ Date: data[i].Date, Close: smoothedADX });
  }
  return [ADX];
}

export const calculateVortex = (data, indicator) => {
  const { period } = indicator;
  const TR = calculateATR(data, period);
  const VMPlus = [{ Date: data[0].Date, positiveMovement: 0 }];
  const VMMinus = [{ Date: data[0].Date, negativeMovement: 0 }];

  // Calculate True Range (TR), Positive Movement (VM+), and Negative Movement (VM-) values
  for (let i = 1; i < data.length; i++) {
    const high = data[i].High;
    const low = data[i].Low;
    const prevHigh = data[i - 1].High;
    const prevLow = data[i - 1].Low;

    const highLowDiff = Math.abs(high - prevLow);
    const highCloseDiff = Math.abs(low - prevHigh);
    // const lowCloseDiff = Math.abs(low - prevClose);

    VMPlus.push({ Date: data[i].Date, positiveMovement: highLowDiff });
    VMMinus.push({ Date: data[i].Date, negativeMovement: highCloseDiff });
  }
  // Calculate the True Range (TR) and Directional Movement (DM) averages
  let sumTR = TR.slice(0, period).reduce((sum, value) => sum + value.Close, 0);
  let sumVMPlus = VMPlus.slice(0, period).reduce(
    (sum, value) => sum + value.positiveMovement,
    0
  );
  let sumVMMinus = VMMinus.slice(0, period).reduce(
    (sum, value) => sum + value.negativeMovement,
    0
  );
  // Calculate the Vortex Indicator (VI) values
  const vortexPlus = [];
  const vortexMinus = [];
  for (let i = 0; i < period; i++) {
    vortexPlus.push({ Date: data[i].Date, Close: 0 });
    vortexMinus.push({ Date: data[i].Date, Close: 0 });
  }
  for (let i = period; i < data.length; i++) {
    const VIPlus = sumVMPlus / sumTR;
    const VIMinus = sumVMMinus / sumTR;

    vortexPlus.push({ Date: data[i].Date, Close: VIPlus });
    vortexMinus.push({ Date: data[i].Date, Close: VIMinus });
    if (i !== data.length - 1) {
      sumTR = sumTR - TR[i - period].Close + TR[i + 1].Close;
      sumVMPlus =
        sumVMPlus -
        VMPlus[i - period].positiveMovement +
        VMPlus[i + 1].positiveMovement;
      sumVMMinus =
        sumVMMinus -
        VMMinus[i - period].negativeMovement +
        VMMinus[i + 1].negativeMovement;
    }
  }
  return [vortexPlus, vortexMinus];
};
export const calculateSMMA = (data, period) => {
  const smmaValues = [];
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].Close;
    if (i === period - 1) {
      smmaValues.push({ Date: data[i].Date, Close: sum / period });
    } else {
      smmaValues.push({ Date: data[i].Date, Close: 0 });
    }
  }
  for (let i = period; i < data.length; i++) {
    let average =
      (smmaValues[i - 1].Close * period -
        smmaValues[i - 1].Close +
        data[i].Close) /
      period;
    smmaValues.push({ Date: data[i].Date, Close: average });
  }

  return smmaValues;
};

export const calculateAlligator = (
  data,
  jawPeriod,
  teethPeriod,
  lipsPeriod
) => {
  const alligatorValues = [];
  const jawValues = calculateSMMA(data, jawPeriod);
  const teethValues = calculateSMMA(data, teethPeriod);
  const lipsValues = calculateSMMA(data, lipsPeriod);

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      alligatorValues.push({
        Date: data[i].Date,
        Jaw: 0,
        Teeth: 0,
        Lips: 0,
      });
      continue;
    } else {
      alligatorValues.push({
        Date: data[i].Date,
        Jaw: jawValues[i].Close,
        Teeth: teethValues[i].Close,
        Lips: lipsValues[i].Close,
      });
    }
  }
  return alligatorValues;
};

export const calculateStochastic = (data, indicator) => {
  const { period, signalPeriod } = indicator;
  const stochasticValues = [];
  const minLow = [];
  const maxHigh = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      minLow.push({ Date: data[i].Date, minLow: 0 });
      maxHigh.push({ Date: data[i].Date, maxHigh: 0 });
    } else {
      const min = data
        .slice(i - period + 1, i + 1)
        .reduce((min, b) => Math.min(min, b.Low), Infinity);
      const max = data
        .slice(i - period + 1, i + 1)
        .reduce((max, b) => Math.max(max, b.High), -Infinity);
      minLow.push({ Date: data[i].Date, minLow: min });
      maxHigh.push({ Date: data[i].Date, maxHigh: max });
    }
  }
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      stochasticValues.push({ Date: data[i].Date, Close: 0 });
    } else {
      const k =
        (data[i].Close - minLow[i].minLow) /
        (maxHigh[i].maxHigh - minLow[i].minLow);
      stochasticValues.push({ Date: data[i].Date, Close: k * 100 });
    }
  }

  const signal = calculateSMA(stochasticValues, signalPeriod);
  return [stochasticValues, signal];
};

export const calculateROC = (data, indicator) => {
  const { period } = indicator;

  // Array to store ROC values
  var rocValues = [];
  for (let i = 0; i < period; i++)
    rocValues.push({ Date: data[i].Date, Close: 0 });

  // Calculate ROC starting from the 15th element
  for (var i = period; i < data.length; i++) {
    var currentValue = data[i].Close;
    var value14PeriodsAgo = data[i - period].Close;

    // Calculate ROC using the formula
    var roc = ((currentValue - value14PeriodsAgo) / value14PeriodsAgo) * 100;

    // Store the ROC value
    rocValues.push({ Date: data[i].Date, Close: roc });
  }

  return [rocValues];
};

export const calculateMomentum = (data, indicator) => {
  const { period } = indicator;
  const mometumValues = [];
  for (let i = 0; i < period; i++)
    mometumValues.push({ Date: data[i].Date, Close: 0 });

  for (let i = period; i < data.length; i++) {
    const momentum = data[i].Close - data[i - period].Close;
    mometumValues.push({ Date: data[i].Date, Close: momentum });
  }
  return [mometumValues];
};

export const calculateBBP = (data, indicator) => {
  const { period } = indicator;
  const ema = calculateEMA(data, period);
  const BBP = [];
  for (let i = 0; i < period; i++) BBP.push({ Date: data[i].Date, Close: 0 });
  for (var i = period; i < data.length; i++) {
    var bullPower = data[i].High - ema[i].Close;
    var bearPower = data[i].Low - ema[i].Close;
    var bbp = bullPower + bearPower;
    BBP.push({ Date: data[i].Date, Close: bbp });
  }
  return [BBP];
};

export const calculateAwesomeOscillator = (data, indicator) => {
  const awesomeValues = [];
  const slowPeriod = 34;
  const fastPeriod = 5;

  const slowSMA = calculateSMAHighLowAvg(data, slowPeriod);
  const fastSMA = calculateSMAHighLowAvg(data, fastPeriod);

  for (let i = 0; i < data.length; i++) {
    awesomeValues.push({
      Date: data[i].Date,
      Close: fastSMA[i].Close - slowSMA[i].Close,
    });
  }
  return [awesomeValues];
};

export const calculateEnvelope = (data, period, percentage) => {
  const Envelope = [];
  const sma = calculateSMA(data, period);
  for (let i = 0; i < period; i++)
    Envelope.push({ Date: data[i].Date, Close: 0, UpperBand: 0, LowerBand: 0 });
  for (var i = period; i < data.length; i++) {
    var UpperBand = sma[i].Close + (sma[i].Close * percentage) / 100;
    var LowerBand = sma[i].Close - (sma[i].Close * percentage) / 100;
    Envelope.push({
      Date: data[i].Date,
      Close: sma[i].Close,
      UpperBand,
      LowerBand,
    });
  }
  return Envelope;
};

export const calculateIchimokuCloud = (
  data,
  conversionPeriod,
  basePeriod,
  spanBPeriod,
  laggingSpanPeriod
) => {
  const ichimokuCloudValues = [];
  const conversionLine = calculateConversionLine(data, conversionPeriod);
  const baseLine = calculateBaseLine(data, basePeriod);

  const spanB = calculateSpanB(data, spanBPeriod);

  const laggingSpan = calculateLaggingSpan(data, laggingSpanPeriod);

  for (let i = 0; i < data.length; i++) {
    ichimokuCloudValues.push({
      Date: data[i].Date,
      Conversion: conversionLine[i].Close,
      Base: baseLine[i].Close,
      SpanA: (conversionLine[i].Close + baseLine[i].Close) / 2,
      SpanB: spanB[i].Close,
      LaggingSpan: laggingSpan[i].Close,
    });
  }
  return ichimokuCloudValues;
};

export const calculateConversionLine = (data, period) => {
  const conversionLineValues = [];
  const minLow = [];
  const maxHigh = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      minLow.push({ Date: data[i].Date, minLow: 0 });
      maxHigh.push({ Date: data[i].Date, maxHigh: 0 });
    } else {
      const min = data
        .slice(i - period + 1, i + 1)
        .reduce((min, b) => Math.min(min, b.Low), Infinity);
      const max = data
        .slice(i - period + 1, i + 1)
        .reduce((max, b) => Math.max(max, b.High), -Infinity);
      minLow.push({ Date: data[i].Date, minLow: min });
      maxHigh.push({ Date: data[i].Date, maxHigh: max });
    }
  }
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      conversionLineValues.push({ Date: data[i].Date, Close: 0 });
    } else {
      const conversionLine = (minLow[i].minLow + maxHigh[i].maxHigh) / 2;
      conversionLineValues.push({ Date: data[i].Date, Close: conversionLine });
    }
  }
  return conversionLineValues;
};

export const calculateBaseLine = (data, period) => {
  const baseLineValues = [];
  const minLow = [];
  const maxHigh = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      minLow.push({ Date: data[i].Date, minLow: 0 });
      maxHigh.push({ Date: data[i].Date, maxHigh: 0 });
    } else {
      const min = data
        .slice(i - period + 1, i + 1)
        .reduce((min, b) => Math.min(min, b.Low), Infinity);
      const max = data
        .slice(i - period + 1, i + 1)
        .reduce((max, b) => Math.max(max, b.High), -Infinity);
      minLow.push({ Date: data[i].Date, minLow: min });
      maxHigh.push({ Date: data[i].Date, maxHigh: max });
    }
  }
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      baseLineValues.push({ Date: data[i].Date, Close: 0 });
    } else {
      const baseLine = (minLow[i].minLow + maxHigh[i].maxHigh) / 2;
      baseLineValues.push({ Date: data[i].Date, Close: baseLine });
    }
  }
  return baseLineValues;
};

export const calculateSpanB = (data, period) => {
  const spanBValues = [];
  const minLow = [];
  const maxHigh = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      minLow.push({ Date: data[i].Date, minLow: 0 });
      maxHigh.push({ Date: data[i].Date, maxHigh: 0 });
      spanBValues.push({ Date: data[i].Date, Close: 0 });
    } else {
      const min = data
        .slice(i - period + 1, i + 1)
        .reduce((min, b) => Math.min(min, b.Low), Infinity);
      const max = data
        .slice(i - period + 1, i + 1)
        .reduce((max, b) => Math.max(max, b.High), -Infinity);

      minLow.push({ Date: data[i].Date, minLow: min });
      maxHigh.push({ Date: data[i].Date, maxHigh: max });

      const spanB = (minLow[i].minLow + maxHigh[i].maxHigh) / 2;
      spanBValues.push({ Date: data[i].Date, Close: spanB });
    }
  }

  return spanBValues;
};

export const calculateLaggingSpan = (data, period) => {
  const laggingSpanValues = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      laggingSpanValues.push({ Date: data[i].Date, Close: 0 });
    } else {
      laggingSpanValues.push({
        Date: data[i].Date,
        Close: data[i - period + 1].Close,
      });
    }
  }

  return laggingSpanValues;
};

export const calculateCCI = (data, indicator) => {
  const { period } = indicator;
  const cciValues = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      cciValues.push({ Date: data[i].Date, CCI: 0 });
    } else {
      const typicalPrice = (data[i].High + data[i].Low + data[i].Close) / 3;

      const smaTP =
        data
          .slice(i - period + 1, i + 1)
          .reduce((sum, d) => sum + (d.High + d.Low + d.Close) / 3, 0) / period;

      const meanDeviation =
        data
          .slice(i - period + 1, i + 1)
          .reduce(
            (sum, d) => sum + Math.abs((d.High + d.Low + d.Close) / 3 - smaTP),
            0
          ) / period;

      const cci = (typicalPrice - smaTP) / (0.015 * meanDeviation);

      cciValues.push({ Date: data[i].Date, Close: cci });
    }
  }

  return [cciValues];
};

export const calculateSuperTrend = (data, period, multiplier) => {
  const superTrendValues = [];
  const atr = calculateATR(data, period);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      superTrendValues.push({
        Date: data[i].Date,
        Close: 0,
        UpperBand: 0,
        LowerBand: 0,
        Trend: 0,
      });
    } else {
      const hl2 = (data[i].High + data[i].Low) / 2;
      const basicUpperBand = hl2 + multiplier * atr[i].Close;
      const basicLowerBand = hl2 - multiplier * atr[i].Close;

      const prev = superTrendValues[i - 1];

      const upperBand =
        basicUpperBand < prev.UpperBand || data[i - 1].Close > prev.UpperBand
          ? basicUpperBand
          : prev.UpperBand;

      const lowerBand =
        basicLowerBand > prev.LowerBand || data[i - 1].Close < prev.LowerBand
          ? basicLowerBand
          : prev.LowerBand;

      const trendDirection =
        i <= period
          ? "isDownTrend"
          : prev.superTrend === prev.UpperBand
            ? data[i].Close > upperBand
              ? "isUpTrend"
              : "isDownTrend"
            : data[i].Close < lowerBand
              ? "isDownTrend"
              : "isUpTrend";

      const trend =
        trendDirection === "isUpTrend"
          ? 1
          : trendDirection === "isDownTrend"
            ? -1
            : superTrendValues[i - 1].Trend;

      const superTrend = trendDirection === "isUpTrend" ? lowerBand : upperBand;

      superTrendValues.push({
        Date: data[i].Date,
        Close: trendDirection === "isUpTrend" ? data[i].Low : data[i].Close,
        superTrend: superTrend,
        UpperBand: upperBand,
        LowerBand: lowerBand,
        Trend: trend,
      });
    }
  }

  return superTrendValues;
};

export const calculateAverageDayRange = (data, indicator) => {
  const { period } = indicator;
  const averageDayRangeValues = [];

  for (let i = 0; i < period; i++) {
    averageDayRangeValues.push({ Date: data[i].Date, Close: 0 });
  }

  for (let i = period; i < data.length; i++) {
    const sumHigh = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, day) => acc + day.High, 0);
    const averageHigh = sumHigh / period;

    const sumLow = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, day) => acc + day.Low, 0);
    const averageLow = sumLow / period;

    const averageDayRange = averageHigh - averageLow;

    averageDayRangeValues.push({ Date: data[i].Date, Close: averageDayRange });
  }

  return [averageDayRangeValues];
};

export const calculateBalanceOfPower = (data, indicator) => {
  const balanceOfPowerValues = [];

  for (let i = 0; i < data.length; i++) {
    const bop = (data[i].Close - data[i].Open) / (data[i].High - data[i].Low);
    balanceOfPowerValues.push({ Date: data[i].Date, Close: bop });
  }

  return [balanceOfPowerValues];
};

export const calculateWilliamsR = (data, indicator) => {
  const { period } = indicator;
  const williamsRValues = [];

  for (let i = 0; i < period; i++) {
    williamsRValues.push({ Date: data[i].Date, Close: 0 });
  }

  for (let i = period; i < data.length; i++) {
    const maxHigh = data
      .slice(i - period + 1, i + 1)
      .reduce((max, day) => Math.max(max, day.High), -Infinity);

    const minLow = data
      .slice(i - period + 1, i + 1)
      .reduce((min, day) => Math.min(min, day.Low), Infinity);

    const williamsR = ((maxHigh - data[i].Close) / (maxHigh - minLow)) * -100;

    williamsRValues.push({ Date: data[i].Date, Close: williamsR });
  }

  return [williamsRValues];
};

export const calculateDoubleEMA = (data, period) => {
  const ema = calculateEMA(data, period);
  const emaOfEma = calculateEMA(ema, period);
  const doubleEMA = [];
  for (let i = 0; i < period; i++) {
    doubleEMA.push({ Date: data[i].Date, Close: 0 });
  }
  for (let i = period; i < data.length; i++) {
    const doubleEma = 2 * ema[i].Close - emaOfEma[i].Close;
    doubleEMA.push({ Date: data[i].Date, Close: doubleEma });
  }

  return doubleEMA;
};

export const calculateTripleEMA = (data, period) => {
  const ema = calculateEMA(data, period);
  const emaOfEma = calculateEMA(ema, period);
  const tripleEMA = [];
  for (let i = 0; i < period; i++) {
    tripleEMA.push({ Date: data[i].Date, Close: 0 });
  }
  for (let i = period; i < data.length; i++) {
    const tripleEma =
      3 * ema[i].Close - 3 * emaOfEma[i].Close + emaOfEma[i].Close;
    tripleEMA.push({ Date: data[i].Date, Close: tripleEma });
  }

  return tripleEMA;
};

export function drawRSIIndicatorChart(state, mode) {
  const {
    yAxisRange,
    yAxisConfig,
    ChartRef,
    yAxisRef,
    chartCanvasSize,
    yAxisCanvasSize,
    data,
    Indicator,
  } = state;
  const { dateConfig, timeRange, xAxisConfig, xAxisRef, chartType } =
    state.ChartWindow;
  if (
    data.peek()[0].length === 0 ||
    yAxisRange.peek().maxPrice === yAxisRange.peek().minPrice ||
    ChartRef.current[1] === undefined
  ) {
    return;
  }
  const canvas = ChartRef.current[0];
  const canvasXAxis = xAxisRef.current[0];
  const canvasYAxis = yAxisRef.current[0];
  const ctx = canvas.getContext("2d");
  const xAxisCtx = canvasXAxis.getContext("2d");
  const yAxisCtx = canvasYAxis.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  xAxisCtx.clearRect(0, 0, canvasXAxis.width, canvasXAxis.height);
  yAxisCtx.clearRect(0, 0, canvasYAxis.width, canvasYAxis.height);
  ctx.font = "12px Arial";
  ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  xAxisCtx.font = "12px Arial";
  xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  yAxisCtx.font = "12px Arial";
  yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  drawYAxis(ctx, yAxisCtx, mode, {
    yAxisConfig,
    yAxisRange,
    chartCanvasSize,
    yAxisCanvasSize,
  });
  const startIndex =
    dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().endTime)];
  const endIndex =
    dateConfig.peek().dateToIndex[
      getObjtoStringTime(timeRange.peek().startTime)
    ];
  if (startIndex === undefined || endIndex === undefined) {
    console.log("Undefined startIndex or endIndex!");
    return;
  }
  let prev = null;
  const resultData = data
    .peek()[0]
    .slice(startIndex, endIndex + 1)
    .reverse();
  if (Indicator.peek().indicatorOptions.peek().label === "Relative Strength Index") {
    ctx.beginPath();
    const y30RSI = getYCoordinate(
      30,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );
    const y70RSI = getYCoordinate(
      70,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );
    ctx.fillStyle = "rgba(0,148,255,0.3)";
    ctx.strokeStyle = "gray";
    ctx.setLineDash([5, 2]);
    ctx.beginPath();
    ctx.fillRect(
      0,
      y70RSI,
      chartCanvasSize.peek().width,
      Math.abs(y70RSI - y30RSI)
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y70RSI);
    ctx.lineTo(chartCanvasSize.peek().width, y70RSI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y30RSI);
    ctx.lineTo(chartCanvasSize.peek().width, y30RSI);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  resultData.forEach((d, i) => {
    const xCoord =
      chartCanvasSize.peek().width -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2 -
      timeRange.peek().scrollDirection * timeRange.peek().scrollOffset;
    if (xCoord < 0) {
      return;
    }
    if (
      i < resultData.length - 1 &&
      d.Date.split("-")[1] !== resultData[i + 1].Date.split("-")[1]
    ) {
      const currentMonth = parseInt(d.Date.split("-")[1]);
      const currentYear = parseInt(d.Date.split("-")[0]);
      xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      if (currentMonth === 1) {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(currentYear, xCoord - 10, 12);
      } else {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(monthMap[currentMonth - 1], xCoord - 10, 12);
      }
    }
    ctx.strokeStyle = "rgba(0,0,255,0.9)";
    prev = drawLineChart(
      d,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      prev,
      Indicator.peek().indicatorOptions.peek().color
    );
  });
}
export function drawMACDIndicatorChart(state, mode) {
  const {
    yAxisRange,
    yAxisConfig,
    ChartRef,
    yAxisRef,
    chartCanvasSize,
    yAxisCanvasSize,
    data,
  } = state;
  const { dateConfig, timeRange, xAxisConfig, xAxisRef, chartType } =
    state.ChartWindow;
  if (
    data.peek()[0].length === 0 ||
    yAxisRange.peek().maxPrice === yAxisRange.peek().minPrice ||
    ChartRef.current[1] === undefined
  ) {
    return;
  }
  const canvas = ChartRef.current[0];
  const canvasXAxis = xAxisRef.current[0];
  const canvasYAxis = yAxisRef.current[0];
  const ctx = canvas.getContext("2d");
  const xAxisCtx = canvasXAxis.getContext("2d");
  const yAxisCtx = canvasYAxis.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  xAxisCtx.clearRect(0, 0, canvasXAxis.width, canvasXAxis.height);
  yAxisCtx.clearRect(0, 0, canvasYAxis.width, canvasYAxis.height);
  ctx.font = "12px Arial";
  ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  xAxisCtx.font = "12px Arial";
  xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  yAxisCtx.font = "12px Arial";
  yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  drawYAxis(ctx, yAxisCtx, mode, {
    yAxisConfig,
    yAxisRange,
    chartCanvasSize,
    yAxisCanvasSize,
  });
  const startIndex =
    dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().endTime)];
  const endIndex =
    dateConfig.peek().dateToIndex[
      getObjtoStringTime(timeRange.peek().startTime)
    ];
  if (startIndex === undefined || endIndex === undefined) {
    console.log("Undefined startIndex or endIndex!");
    return;
  }
  let prev = null;
  let prev1 = null;
  const resultData = data
    .peek()[0]
    .slice(startIndex, endIndex + 1)
    .reverse();
  const resultData1 = data
    .peek()[1]
    .slice(startIndex, endIndex + 1)
    .reverse();
  const resultData2 = data
    .peek()[2]
    .slice(startIndex, endIndex + 1)
    .reverse();
  ctx.beginPath();
  resultData.forEach((d, i) => {
    const xCoord =
      chartCanvasSize.peek().width -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2 -
      timeRange.peek().scrollDirection * timeRange.peek().scrollOffset;
    if (xCoord < 0) {
      return;
    }
    if (
      i < resultData.length - 1 &&
      d.Date.split("-")[1] !== resultData[i + 1].Date.split("-")[1]
    ) {
      const currentMonth = parseInt(d.Date.split("-")[1]);
      const currentYear = parseInt(d.Date.split("-")[0]);
      xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      if (currentMonth === 1) {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(currentYear, xCoord - 10, 12);
      } else {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(monthMap[currentMonth - 1], xCoord - 10, 12);
      }
    }
    ctx.strokeStyle = "rgba(0,0,255,0.9)";
    prev = drawLineChart(
      d,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      prev,
      "blue"
    );
    prev1 = drawLineChart(
      resultData1[i],
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      prev1,
      "orange"
    );
    drawBarChart(
      resultData2[i],
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      xAxisConfig.peek().widthOfOneCS - 2
    );
  });
}
export function drawVortexIndicatorChart(state, mode) {
  const {
    yAxisRange,
    yAxisConfig,
    ChartRef,
    yAxisRef,
    chartCanvasSize,
    yAxisCanvasSize,
    data,
  } = state;
  const { dateConfig, timeRange, xAxisConfig, xAxisRef, chartType } =
    state.ChartWindow;
  if (
    data.peek()[0].length === 0 ||
    yAxisRange.peek().maxPrice === yAxisRange.peek().minPrice ||
    ChartRef.current[1] === undefined
  ) {
    return;
  }
  const canvas = ChartRef.current[0];
  const canvasXAxis = xAxisRef.current[0];
  const canvasYAxis = yAxisRef.current[0];
  const ctx = canvas.getContext("2d");
  const xAxisCtx = canvasXAxis.getContext("2d");
  const yAxisCtx = canvasYAxis.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  xAxisCtx.clearRect(0, 0, canvasXAxis.width, canvasXAxis.height);
  yAxisCtx.clearRect(0, 0, canvasYAxis.width, canvasYAxis.height);
  ctx.font = "12px Arial";
  ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  xAxisCtx.font = "12px Arial";
  xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  yAxisCtx.font = "12px Arial";
  yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  drawYAxis(ctx, yAxisCtx, mode, {
    yAxisConfig,
    yAxisRange,
    chartCanvasSize,
    yAxisCanvasSize,
  });
  const startIndex =
    dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().endTime)];
  const endIndex =
    dateConfig.peek().dateToIndex[
      getObjtoStringTime(timeRange.peek().startTime)
    ];
  if (startIndex === undefined || endIndex === undefined) {
    console.log("Undefined startIndex or endIndex!");
    return;
  }
  let prev = null;
  let prev1 = null;
  const resultData = data
    .peek()[0]
    .slice(startIndex, endIndex + 1)
    .reverse();
  const resultData1 = data
    .peek()[1]
    .slice(startIndex, endIndex + 1)
    .reverse();
  ctx.beginPath();
  resultData.forEach((d, i) => {
    const xCoord =
      chartCanvasSize.peek().width -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2 -
      timeRange.peek().scrollDirection * timeRange.peek().scrollOffset;
    if (xCoord < 0) {
      return;
    }
    if (
      i < resultData.length - 1 &&
      d.Date.split("-")[1] !== resultData[i + 1].Date.split("-")[1]
    ) {
      const currentMonth = parseInt(d.Date.split("-")[1]);
      const currentYear = parseInt(d.Date.split("-")[0]);
      xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      if (currentMonth === 1) {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(currentYear, xCoord - 10, 12);
      } else {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(monthMap[currentMonth - 1], xCoord - 10, 12);
      }
    }
    ctx.strokeStyle = "rgba(0,0,255,0.9)";
    prev = drawLineChart(
      d,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      prev,
      "blue"
    );
    prev1 = drawLineChart(
      resultData1[i],
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      prev1,
      "orange"
    );
  });
}

export function drawBBPIndicatorChart(state, mode) {
  const {
    yAxisRange,
    yAxisConfig,
    ChartRef,
    yAxisRef,
    chartCanvasSize,
    yAxisCanvasSize,
    data,
  } = state;
  const { dateConfig, timeRange, xAxisConfig, xAxisRef, chartType } =
    state.ChartWindow;
  if (
    data.peek()[0].length === 0 ||
    yAxisRange.peek().maxPrice === yAxisRange.peek().minPrice ||
    ChartRef.current[1] === undefined
  ) {
    return;
  }
  const canvas = ChartRef.current[0];
  const canvasXAxis = xAxisRef.current[0];
  const canvasYAxis = yAxisRef.current[0];
  const ctx = canvas.getContext("2d");
  const xAxisCtx = canvasXAxis.getContext("2d");
  const yAxisCtx = canvasYAxis.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  xAxisCtx.clearRect(0, 0, canvasXAxis.width, canvasXAxis.height);
  yAxisCtx.clearRect(0, 0, canvasYAxis.width, canvasYAxis.height);
  ctx.font = "12px Arial";
  ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  xAxisCtx.font = "12px Arial";
  xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  yAxisCtx.font = "12px Arial";
  yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  drawYAxis(ctx, yAxisCtx, mode, {
    yAxisConfig,
    yAxisRange,
    chartCanvasSize,
    yAxisCanvasSize,
  });
  const startIndex =
    dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().endTime)];
  const endIndex =
    dateConfig.peek().dateToIndex[
      getObjtoStringTime(timeRange.peek().startTime)
    ];
  if (startIndex === undefined || endIndex === undefined) {
    console.log("Undefined startIndex or endIndex!");
    return;
  }
  let prev = null;
  let prev1 = null;
  const resultData = data
    .peek()[0]
    .slice(startIndex, endIndex + 1)
    .reverse();
  ctx.beginPath();
  resultData.forEach((d, i) => {
    const xCoord =
      chartCanvasSize.peek().width -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2 -
      timeRange.peek().scrollDirection * timeRange.peek().scrollOffset;
    if (xCoord < 0) {
      return;
    }
    if (
      i < resultData.length - 1 &&
      d.Date.split("-")[1] !== resultData[i + 1].Date.split("-")[1]
    ) {
      const currentMonth = parseInt(d.Date.split("-")[1]);
      const currentYear = parseInt(d.Date.split("-")[0]);
      xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      if (currentMonth === 1) {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(currentYear, xCoord - 10, 12);
      } else {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(monthMap[currentMonth - 1], xCoord - 10, 12);
      }
    }
    ctx.strokeStyle = "rgba(0,0,255,0.9)";
    drawBarChart(
      resultData[i],
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height,
      xCoord,
      ctx,
      xAxisConfig.peek().widthOfOneCS - 2
    );
  });
}

export function drawAwesomeOscillatorIndicator(state, mode) {
  const {
    yAxisRange,
    yAxisConfig,
    ChartRef,
    yAxisRef,
    chartCanvasSize,
    yAxisCanvasSize,
    data,
  } = state;
  const { dateConfig, timeRange, xAxisConfig, xAxisRef, chartType } =
    state.ChartWindow;
  if (
    data.peek()[0].length === 0 ||
    yAxisRange.peek().maxPrice === yAxisRange.peek().minPrice ||
    ChartRef.current[1] === undefined
  ) {
    return;
  }
  const canvas = ChartRef.current[0];
  const canvasXAxis = xAxisRef.current[0];
  const canvasYAxis = yAxisRef.current[0];
  const ctx = canvas.getContext("2d");
  const xAxisCtx = canvasXAxis.getContext("2d");
  const yAxisCtx = canvasYAxis.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  xAxisCtx.clearRect(0, 0, canvasXAxis.width, canvasXAxis.height);
  yAxisCtx.clearRect(0, 0, canvasYAxis.width, canvasYAxis.height);
  ctx.font = "12px Arial";
  ctx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  xAxisCtx.font = "12px Arial";
  xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  yAxisCtx.font = "12px Arial";
  yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
  drawYAxis(ctx, yAxisCtx, mode, {
    yAxisConfig,
    yAxisRange,
    chartCanvasSize,
    yAxisCanvasSize,
  });
  const startIndex =
    dateConfig.peek().dateToIndex[getObjtoStringTime(timeRange.peek().endTime)];
  const endIndex =
    dateConfig.peek().dateToIndex[
      getObjtoStringTime(timeRange.peek().startTime)
    ];
  if (startIndex === undefined || endIndex === undefined) {
    console.log("Undefined startIndex or endIndex!");
    return;
  }
  let prev = null;
  let prev1 = null;
  const resultData = data
    .peek()[0]
    .slice(startIndex, endIndex + 1)
    .reverse();
  ctx.beginPath();
  resultData.forEach((d, i) => {
    const xCoord =
      chartCanvasSize.peek().width -
      i * xAxisConfig.peek().widthOfOneCS -
      xAxisConfig.peek().widthOfOneCS / 2 -
      timeRange.peek().scrollDirection * timeRange.peek().scrollOffset;
    if (xCoord < 0) {
      return;
    }
    if (
      i < resultData.length - 1 &&
      d.Date.split("-")[1] !== resultData[i + 1].Date.split("-")[1]
    ) {
      const currentMonth = parseInt(d.Date.split("-")[1]);
      const currentYear = parseInt(d.Date.split("-")[0]);
      xAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
      if (currentMonth === 1) {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(currentYear, xCoord - 10, 12);
      } else {
        const lineColor = `${
          mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
        }`;
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.moveTo(xCoord, 0);
        ctx.lineTo(xCoord, chartCanvasSize.peek().height);
        ctx.stroke();
        xAxisCtx.fillText(monthMap[currentMonth - 1], xCoord - 10, 12);
      }
    }

    const prevClose = i > 0 ? resultData[i - 1].Close : null;
    const currentClose = d.Close;
    const barColor =
      prevClose !== null && prevClose > currentClose ? "green" : "red";
    const width = xAxisConfig.peek().widthOfOneCS - 2;
    const y = getYCoordinate(
      currentClose,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );
    const yZero = getYCoordinate(
      0,
      yAxisRange.peek().minPrice,
      yAxisRange.peek().maxPrice,
      chartCanvasSize.peek().height
    );

    ctx.fillStyle = barColor;
    ctx.fillRect(xCoord - width / 2, y, width, yZero - y);
  });
}
