import { calculateRSI, drawRSIIndicatorChart } from "../utility/indicatorsUtil";
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
};
