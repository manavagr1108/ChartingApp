import { signal } from "@preact/signals-react";
import { calculateRSI } from "../utility/indicatorsUtil";
import useDrawChart from "./useDrawChart";
import { indicatorConfig } from "../signals/indicatorsSignal";

const initialState = {
  indicatorDataState: signal(null),

  indicatorOptions: signal({
    color: "",
    stroke: 0,
    period: 0,
    label: "",
    isChartRequired: true,
  }),

  drawChart: null,
};

const useIndicator = (xAxisRef, mode, stockDataState, indicator) => {
  const state = { ...initialState };

  state.indicatorOptions.value = {
    color: indicator.color,
    stroke: indicator.stroke,
    period: indicator.period,
    label: indicator.label,
    isChartRequired: indicator.chartRequired,
  };

  if (indicator.label === indicatorConfig["RSI"].label) {
    state.indicatorDataState = calculateRSI(stockDataState, indicator.period);
  }

  state.drawChart = useDrawChart(xAxisRef, mode, state.indicatorDataState);

  return state;
};

export default useIndicator;
