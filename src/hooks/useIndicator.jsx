import { effect, signal } from "@preact/signals-react";
import { calculateRSI } from "../utility/indicatorsUtil";
import useDrawChart from "./useDrawChart";
import { indicatorConfig } from "../signals/indicatorsSignal";
import { useEffect, useState } from "react";
import Indicator from "../classes/Indicator";

const useIndicator = (indicator, drawChart, mode) => {
  const state = new Indicator(drawChart.ChartWindow);
  let data;
  state.indicatorOptions.value = indicator;
  data = indicator.getChartData(drawChart.ChartWindow.stockData.peek(), indicator.period);
  return [state, data];
};

export default useIndicator;
