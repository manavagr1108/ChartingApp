import { signal } from "@preact/signals-react";

export const indicatorSignal = signal([]);
export const indicatorConfig = {
  SMA: {
    color: "#FFA500",
    stroke: 1,
    period: 20,
    label: "Moving Average Simple",
  },
  EMA: {
    color: "#FF0000",
    stroke: 1,
    period: 20,
    label: "Moving Average Exponential",
  },
  ZigZag: {
    color: "#00FF00",
    label: "Zig Zag",
    deviation: 10,
    pivotLegs: 5,
  },
};
