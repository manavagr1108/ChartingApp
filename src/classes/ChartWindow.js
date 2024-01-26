import { signal } from "@preact/signals-react";
import { setCanvasSize } from "../utility/chartUtils";
import { getObjtoStringTime, getTime } from "../utility/xAxisUtils";

class ChartWindow {
  constructor() {
    this.xAxisRef = null;
    this.timeRange = signal({
      startTime: {
        Year: 0,
        Month: 0,
        Date: 0,
        Hrs: 0,
        Min: 0,
        Sec: 0,
      },
      endTime: {
        Year: 0,
        Month: 0,
        Date: 0,
        Hrs: 0,
        Min: 0,
        Sec: 0,
      },
      scrollOffset: 0,
      scrollDirection: 0,
      zoomOffset: 0,
      zoomDirection: 0,
    });
    this.xAxisCanvasSize = signal({
      width: 0,
      height: 0,
    });
    this.xAxisConfig = signal({
      noOfDataPoints: 0,
      widthOfOneCS: 0,
    });
    this.dateConfig = signal({
      dateToIndex: {},
      indexToDate: {},
    });
    this.dateCursor = signal(null);
    this.xAxisMovement = signal({
      mouseDown: false,
      mouseMove: false,
      prevXCoord: 0,
    });
    this.lockUpdatePriceRange = signal(false);
    this.stockData = signal([]);
    this.offChartIndicatorSignal = signal([]);
    this.onChartIndicatorSignal = signal([]);
    this.drawChartObjects = signal([]);
    this.interval = signal("1d");
    this.chartType = signal("Candles");
    this.selectedStock = signal("AAPL");
    this.mode = signal("");

    //tool bar signals;
    this.selectedTool = signal("Cursor");
    this.selectedToolItem = signal(0);
    this.selectedCursor = signal(0);
    this.selectedItem = signal(null);
  }
  setXAxisCanvas() {
    this.xAxisCanvasSize.value = setCanvasSize(this.xAxisRef.current[0]);
    setCanvasSize(this.xAxisRef.current[1]);
  }
  #setDateConfig() {
    const dateToIndex = {};
    const indexToDate = {};
    const array = Object.values(this.stockData.peek());
    for (let i = 0; i < array.length; i++) {
      const ele = array[i];
      dateToIndex[`${ele.Date}`] = i;
      indexToDate[`${i}`] = ele.Date;
    }
    this.dateConfig.value = {
      dateToIndex,
      indexToDate,
    };
  }
  #setTimeRange() {
    this.timeRange.value.startTime = getTime(
      this.stockData.peek()[this.stockData.peek().length - 1].Date
    );
    this.timeRange.value.endTime = getTime(
      this.stockData.peek()[this.stockData.peek().length - 150].Date
    );
  }
  setXAxisConfig() {
    const noOfDataPoints =
        this.dateConfig.peek().dateToIndex[getObjtoStringTime(this.timeRange.peek().startTime)] -
        this.dateConfig.peek().dateToIndex[getObjtoStringTime(this.timeRange.peek().endTime)];
    const widthOfOneCS = this.xAxisCanvasSize.peek().width / noOfDataPoints;
    this.xAxisConfig.value.noOfDataPoints = noOfDataPoints;
    this.xAxisConfig.value.widthOfOneCS = widthOfOneCS;
  }
  setChartWindowSignal() {
    this.setXAxisCanvas();
    this.#setDateConfig();
    this.#setTimeRange();
    this.setXAxisConfig();
  }
}

export default ChartWindow;
