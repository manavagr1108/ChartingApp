import {
  calculateMACD,
  calculateRSI,
  drawMACDIndicatorChart,
  drawRSIIndicatorChart,
} from "../utility/indicatorsUtil";
export const indicatorConfig = {
  SMA: {
    color: "#FFA500",
    stroke: 1,
    period: 20,
    label: "Simple Moving Average",
    chartRequired: false,
  },
  EMA: {
    color: "#FF0000",
    stroke: 1,
    period: 20,
    label: "Expontential Moving Average",
    chartRequired: false,
  },
  ZigZag: {
    color: "#00FF00",
    label: "Zig Zag",
    deviation: 10,
    pivotLegs: 5,
    chartRequired: false,
  },
  RSI: {
    color: "#FFA500",
    stroke: 1,
    period: 14,
    label: "Relative Strength Index",
    chartRequired: true,
    drawChartFunction: drawRSIIndicatorChart,
    getChartData: calculateRSI,
  },
  MACD: {
    color: "#FFA500",
    stroke: 1,
    label: "Moving Average Convergence Divergence",
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    chartRequired: true,
    drawChartFunction: drawMACDIndicatorChart,
    getChartData: calculateMACD,
  },
  ParabolicSAR: {
    color: "#FFA500",
    stroke: 2,
    label: "Parabolic SAR",
    acceleration: 0.02,
    maximum: 0.2,
    chartRequired: false,
  },
  BB: {
    color: "#FFA500",
    stroke: 1,
    label: "Bollinger Bands",
    period: 20,
    stdDev: 2,
    chartRequired: false,
  },
  DonchainChannels: {
    color: "#FFA500",
    stroke: 2,
    label: "Donchain Channels",
    period: 20,
    chartRequired: false,
  },
};
