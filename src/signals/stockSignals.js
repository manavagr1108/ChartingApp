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
  offset: 0,
  multiplier: 0,
});
export const canvasSize = signal({
  width: 0,
  height: 0,
});
export const priceRange = signal({
  minPrice: 0,
  maxPrice: 0,
});
export const xAxisConfig = signal({
  margin: 10,
  noOfDataPoints: 0,
  noOfColumns: 12,
  widthOfOneCS: 0,
});
export const dateConfig = signal({
  dateToIndex: {},
  indexToDate: {},
});
export const yAxisConfig = signal({
  margin: 55,
  priceDiff: 0,
  noOfColumns: 12,
  segmentTree: [],
});

export const dateCursor = signal(null);
