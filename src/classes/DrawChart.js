import { signal } from "@preact/signals-react";
import { drawChart, setCanvasSize } from "../utility/chartUtils";
import { getMinMaxPrices, priceToColMap } from "../utility/yAxisUtils";
import ChartWindow from "./ChartWindow";
import { getObjtoStringTime } from "../utility/xAxisUtils";

class DrawChart{
  constructor(ChartWindow) {
    this.ChartRef = null;
    this.yAxisRef = null;
    this.chartCanvasSize = signal({
      width: 0,
      height: 0,
    });
    this.yAxisCanvasSize = signal({
      width: 0,
      height: 0,
    });
    this.yAxisRange = signal({
      minPrice: 0,
      maxPrice: 0,
    });
    this.yAxisConfig = signal({
      colDiff: 2,
      priceDiff: 0,
      segmentTree: [],
    });
    this.yAxisMovement = signal({
      mouseDown: false,
      mouseMove: false,
      prevXCoord: 0,
    });
    this.chartMovement = signal({
      mouseDown: false,
      mouseMove: false,
      prevXCoord: 0,
      prevYCoord: 0,
    });
    this.data = signal([]);
    this.ChartWindow = ChartWindow;
    this.drawChartFunction = drawChart;
    this.isIndicator = signal(false);
    this.Indicator = signal(null);
  }
  #setData(data) {
    this.data.value = data;
  }
  #getLeftDate(date) {
    return date.slice(0, 10);
  }
  
  #getRightDate(date) {
    return date.slice(11, 21);
  }
  #setSegmentTree() {
    if (!this.data.peek().length) return;
    const segmentTree = [];
    const Low = this.data.peek()[0].Low !== undefined ? 'Low' : 'Close';
    const High = this.data.peek()[0].High !== undefined ? 'High' : 'Close';
    const array = Object.values(this.data.peek());
    let n = array.length;
    for (let i = 0; i < n; i++) {
      const ele = array[i];
      const d = {};
      const date = `${ele.Date}:${ele.Date}`
      d[`${date}`] = {
        'Low': ele[`${Low}`],
        'High': ele[`${High}`]
      }
      segmentTree[n + i] = d;
    }
    for (let i = n - 1; i > 0; i--) {
      const leftEleKey = Object.keys(segmentTree[2 * i])[0];
      const leftEleVal = Object.values(segmentTree[2 * i])[0];
      const rightEleKey = Object.keys(segmentTree[2 * i + 1])[0];
      const rightEleVal = Object.values(segmentTree[2 * i + 1])[0];
      const d = {};
      const date = `${this.#getLeftDate(leftEleKey)}:${this.#getRightDate(rightEleKey)}`
      d[`${date}`] = {
        'Low': Math.min(leftEleVal.Low, rightEleVal.Low),
        'High': Math.max(leftEleVal.High, rightEleVal.High)
      }
      segmentTree[i] = d;
    }
    this.yAxisConfig.value.segmentTree = segmentTree;
  }
  #setChartCanvas() {
    this.chartCanvasSize.value = setCanvasSize(this.ChartRef.current[0]);
    setCanvasSize(this.ChartRef.current[1]);
  }
  #setYAxisCanvas() {
    this.yAxisCanvasSize.value = setCanvasSize(this.yAxisRef.current[0]);
    setCanvasSize(this.yAxisRef.current[1]);
  }
  setYRange(){
    const result = getMinMaxPrices(
      this.yAxisConfig.peek().segmentTree,
      this.ChartWindow.dateConfig.peek().dateToIndex,
      getObjtoStringTime(this.ChartWindow.timeRange.peek().endTime),
      getObjtoStringTime(this.ChartWindow.timeRange.peek().startTime),
      this.data.peek().length
    );
    if (this.ChartWindow.lockUpdatePriceRange.peek() && this.yAxisRange.peek().maxPrice > result.maxPrice && this.yAxisRange.peek().minPrice < result.minPrice) return;
    if (
      result &&
      (result.maxPrice !== this.yAxisRange.peek().maxPrice ||
        result.minPrice !== this.yAxisRange.peek().minPrice) &&
      (result.maxPrice !== Number.MIN_SAFE_INTEGER ||
        result.minPrice !== Number.MAX_SAFE_INTEGER)
    ) {
      this.yAxisRange.value = result;
    }
  }
  setYAxisConfig(){
    const priceDiff = this.yAxisRange.peek().maxPrice - this.yAxisRange.peek().minPrice;
    let colDiff = this.yAxisConfig.peek().colDiff;
    const priceMap = Object.keys(priceToColMap);
    priceMap.forEach((price, i) => {
      if (parseInt(price) > priceDiff && priceDiff > parseInt(priceMap[i - 1])) {
        colDiff = parseFloat(priceToColMap[priceMap[i - 1]]);
      }
    })
    this.yAxisConfig.value = { ...this.yAxisConfig.peek(), colDiff, priceDiff };
  }
  setCanvasSize(){
    this.#setYAxisCanvas();
    this.#setChartCanvas();
  }
  setDrawChartSignal(data) {
    this.#setData(data);
    this.setCanvasSize();
    this.#setSegmentTree();
    this.setYRange();
    this.setYAxisConfig();
  }
  getChartData(data){
    if(!this.isIndicator){
      return data;
    } else {
      return this.data;
    }
  }
}

export default DrawChart;