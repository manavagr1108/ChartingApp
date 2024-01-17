import { effect, signal } from "@preact/signals-react";
import { calculateRSI } from "../utility/indicatorsUtil";
import useDrawChart from "./useDrawChart";
import { indicatorConfig } from "../signals/indicatorsSignal";
import { useEffect, useState } from "react";

const initialState = {
  indicatorOptions: signal({
    color: "",
    stroke: 0,
    period: 0,
    label: "",
    isChartRequired: true,
  }),

  drawChart: null,
};

class Indicator {
  constructor(){
    this.indicatorOptions = signal({
      color: "",
      stroke: 0,
      period: 0,
      label: "",
      isChartRequired: true,
    });
  
    this.drawChart= [];
  }
}
const useIndicator = (xAxisRef, mode, indicator) => {
  const state = { ...new Indicator() };
  state.indicatorOptions.value = {
    color: indicator.color,
    stroke: indicator.stroke,
    period: indicator.period,
    label: indicator.label,
    isChartRequired: indicator.chartRequired,
  };
  state.drawChart = useDrawChart(xAxisRef, mode, true);
  return state;
};

export default useIndicator;
