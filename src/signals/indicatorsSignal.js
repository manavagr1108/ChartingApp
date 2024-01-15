import { signal } from "@preact/signals-react";

export const onChartIndicatorSignal = signal([]);
export const offChartIndicatorSignal = signal([]);
export const indicatorChartCanvasSize = signal([]);
export const indicatorYAxisCanvasSize = signal([]);
export const indicatorConfig = {
  SMA: {
    color: "#FFA500",
    stroke: 1,
    period: 20,
    label: "SMA",
    chartRequired: false,
  },
  EMA: {
    color: "#FF0000",
    stroke: 1,
    period: 20,
    label: "EMA",
    chartRequired: false,
  },
  ZigZag: {
    color: "#00FF00",
    label: "ZigZag",
    deviation: 10,
    pivotLegs: 5,
    chartRequired: false,
  },
  RSI: {
    color: "#FFA500",
    stroke: 1,
    period: 14,
    label: "RSI",
    chartRequired: true,
  },
};
