import Indicator from "../classes/Indicator";

const useIndicator = (indicator, drawChart, mode) => {
  if (indicator === undefined) return [null, null];
  const state = new Indicator(drawChart.ChartWindow);
  state.indicatorOptions.value = indicator;
  const data = indicator.getChartData(
    drawChart.ChartWindow.stockData.peek(),
    indicator
  );
  return [state, data];
};

export default useIndicator;
