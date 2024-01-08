import { signal } from "@preact/signals-react";

export const selectedStock = signal("AAPL");
export const interval = signal("1d");
export const chartType = signal("Candles");
export const stockData = signal([]);

export const timeRange = signal({
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
export const chartCanvasSize = signal({
  width: 0,
  height: 0,
});
export const xAxisCanvasSize = signal({
  width: 0,
  height: 0,
});
export const yAxisCanvasSize = signal({
  width: 0,
  height: 0,
});
export const priceRange = signal({
  minPrice: 0,
  maxPrice: 0,
});
export const xAxisConfig = signal({
  noOfDataPoints: 0,
  noOfColumns: 12,
  widthOfOneCS: 0,
});
export const dateConfig = signal({
  dateToIndex: {},
  indexToDate: {},
});
export const yAxisConfig = signal({
  priceDiff: 0,
  noOfColumns: 12,
  segmentTree: [],
});

export const dateCursor = signal(null);

export const xAxisMovement = signal({
  mouseDown: false,
  mouseMove: false,
  prevXCoord: 0,
});