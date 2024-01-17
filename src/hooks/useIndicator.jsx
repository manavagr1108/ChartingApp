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

const useIndicator = (xAxisRef, mode, indicatorDataState, indicator) => {
  const state = { ...initialState };
  state.indicatorOptions.value = {
    color: indicator.color,
    stroke: indicator.stroke,
    period: indicator.period,
    label: indicator.label,
    isChartRequired: indicator.chartRequired,
  };
  // effect(() => {
  //   if(data.length !== indicatorDataState.length){
  //     setData(state.indicatorDataState);
  //   }
  // })
  state.drawChart = useDrawChart(xAxisRef, mode, true);
  // console.log(state.drawChart)
  return state;
};

export default useIndicator;
