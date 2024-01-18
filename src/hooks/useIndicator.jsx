import Indicator from "../classes/Indicator";

const useIndicator = (indicator, drawChart, mode) => {
  const state = new Indicator(drawChart.ChartWindow);
  let data;
  state.indicatorOptions.value = indicator;
  data = indicator.getChartData(drawChart.ChartWindow.stockData.peek(), indicator.period);
  return [state, data];
};

export default useIndicator;
