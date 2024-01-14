import { chartCanvasSize, dateConfig, lockUpdatePriceRange, priceRange, stockData, timeRange, yAxisCanvasSize, yAxisConfig, yAxisMovement } from "../signals/stockSignals";
import { getObjtoStringTime } from "./xAxisUtils";

export const priceToColMap = {
  5: 0.5,
  10: 1,
  20: 2,
  40: 2.5,
  55: 4,
  85: 5,
  105: 10,
  210: 20,
  415: 25,
  520: 40,
  840: 50,
  1140: 100,
  2085: 200,
  4174: 250
}

function getLeftDate(date) {
  return date.slice(0, 10);
}

function getRightDate(date) {
  return date.slice(11, 21);
}

export function buildSegmentTree(data) {
  if (!data.length) return;
  const segmentTree = [];
  const datesToIndex = {};
  const indexToDates = {};
  const array = Object.values(data);
  let n = array.length;
  for (let i = 0; i < n; i++) {
    const ele = array[i];
    const d = {};
    const date = `${ele.Date}:${ele.Date}`
    d[`${date}`] = {
      'Low': ele.Low,
      'High': ele.High
    }
    datesToIndex[`${ele.Date}`] = i;
    indexToDates[`${i}`] = ele.Date;
    segmentTree[n + i] = d;
  }
  for (let i = n - 1; i > 0; i--) {
    const leftEleKey = Object.keys(segmentTree[2 * i])[0];
    const leftEleVal = Object.values(segmentTree[2 * i])[0];
    const rightEleKey = Object.keys(segmentTree[2 * i + 1])[0];
    const rightEleVal = Object.values(segmentTree[2 * i + 1])[0];
    const d = {};
    const date = `${getLeftDate(leftEleKey)}:${getRightDate(rightEleKey)}`
    d[`${date}`] = {
      'Low': Math.min(leftEleVal.Low, rightEleVal.Low),
      'High': Math.max(leftEleVal.High, rightEleVal.High)
    }
    segmentTree[i] = d;
  }
  return { segmentTree, datesToIndex, indexToDates };
}

export function getMinMaxPrices(segmentTree, datesToIndex, left, right, n) {
  if (!segmentTree) return;
  let l = datesToIndex[`${left}`] + n;
  let r = datesToIndex[`${right}`] + n + 1;
  let minPrice = Number.MAX_SAFE_INTEGER;
  let maxPrice = Number.MIN_SAFE_INTEGER;
  for (l, r; l < r; l >>= 1, r >>= 1) {
    if (l & 1) {
      let ele = segmentTree[l];
      ele = Object.values(ele);
      minPrice = Math.min(minPrice, ele[0].Low);
      maxPrice = Math.max(maxPrice, ele[0].High);
      l = l + 1;
    }

    if (r & 1) {
      r = r - 1;
      let ele = segmentTree[r];
      ele = Object.values(ele);
      minPrice = Math.min(minPrice, ele[0].Low);
      maxPrice = Math.max(maxPrice, ele[0].High);
    }
  }
  if (maxPrice != Number.MIN_SAFE_INTEGER && minPrice != Number.MAX_SAFE_INTEGER) {
    const priceDiff = (maxPrice - minPrice) / 12;
    minPrice = minPrice - priceDiff;
    maxPrice = maxPrice + priceDiff;
  }
  return { minPrice, maxPrice };
}

export const getYCoordinate = (price, minPrice, maxPrice, height) => {
  return height - ((height) / (maxPrice - minPrice)) * (price - minPrice);
}

export const drawCandleStick = (data, minPrice, maxPrice, height, x, context, width) => {
  let fillColor, borderColor;
  if (data["Close"] > data["Open"]) {
    fillColor = "green";
    borderColor = "green";
  } else {
    borderColor = "red";
    fillColor = "red";
  }
  const open = getYCoordinate(data["Open"], minPrice, maxPrice, height);
  const close = getYCoordinate(data["Close"], minPrice, maxPrice, height);
  const high = getYCoordinate(data["High"], minPrice, maxPrice, height);
  const low = getYCoordinate(data["Low"], minPrice, maxPrice, height);
  const bodyHeight = Math.abs(open - close);
  const bodyY = Math.min(open, close);
  // Draw candlestick body
  context.fillStyle = fillColor;
  context.fillRect(x - width / 2, bodyY, width, bodyHeight);

  // Draw candlestick wicks
  context.strokeStyle = borderColor;
  context.lineWidth = 0.5;
  context.beginPath();
  context.moveTo(x, high);
  context.lineTo(x, Math.min(open, close));
  context.moveTo(x, low);
  context.lineTo(x, Math.max(open, close));
  context.stroke();
};

export const drawLineChart = (
  data,
  minPrice,
  maxPrice,
  height,
  x,
  context,
  prev
) => {
  const y = getYCoordinate(
    data["AdjClose"],
    minPrice,
    maxPrice,
    height
  );
  if (prev === null) {
    context.beginPath();
    context.moveTo(x, y);
    context.moveTo(x, y);
    context.stroke();
  } else {
    context.beginPath();
    context.moveTo(prev.x, prev.y);
    context.lineTo(x, y);
    context.stroke();
  }
  return { x, y };
};

export function updatePriceRange({ timeRange, yAxisConfig, dateConfig, priceRange, lockUpdatePriceRange }) {
  const result = getMinMaxPrices(
    yAxisConfig.peek().segmentTree,
    dateConfig.peek().dateToIndex,
    getObjtoStringTime(timeRange.value.endTime),
    getObjtoStringTime(timeRange.value.startTime),
    stockData.peek().length
  );
  if (!lockUpdatePriceRange.peek() && priceRange.peek().maxPrice > result.maxPrice && priceRange.peek().minPrice < result.minPrice) return;
  if (
    result &&
    (result.maxPrice !== priceRange.peek().maxPrice ||
      result.minPrice !== priceRange.peek().minPrice) &&
    (result.maxPrice !== Number.MIN_SAFE_INTEGER ||
      result.minPrice !== Number.MAX_SAFE_INTEGER)
  ) {
    priceRange.value = result;
  }
}

export const updateYConfig = ({ priceRange, yAxisConfig }) => {
  const priceDiff = priceRange.peek().maxPrice - priceRange.peek().minPrice;
  let colDiff = yAxisConfig.peek().colDiff;
  const priceMap = Object.keys(priceToColMap);
  priceMap.forEach((price, i) => {
    if (parseInt(price) > priceDiff && priceDiff > parseInt(priceMap[i - 1])) {
      colDiff = parseFloat(priceToColMap[priceMap[i - 1]]);
    }
  });
  yAxisConfig.value = { ...yAxisConfig.value, colDiff, priceDiff };
}

export const drawYAxis = (ctx, yAxisCtx, mode, { yAxisConfig, priceRange, chartCanvasSize, yAxisCanvasSize }) => {
  const colDiff = yAxisConfig.peek().colDiff;
  const minPrice = priceRange.peek().minPrice;
  const maxPrice = priceRange.peek().maxPrice;
  const noOfCols = Math.floor((maxPrice - minPrice) / colDiff);
  for (let i = noOfCols + 3; i >= 0; i--) {
    const text = (Math.floor(priceRange.peek().minPrice / colDiff)) * colDiff + (i - 1) * colDiff;
    const yCoord = getYCoordinate(text, minPrice, maxPrice, yAxisCanvasSize.peek().height);
    yAxisCtx.fillStyle = `${mode === "Light" ? "black" : "white"}`;
    yAxisCtx.fillText(text.toFixed(2), 15, yCoord + 4);
    const lineColor = `${mode === "Light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`;
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.moveTo(0, yCoord);
    ctx.lineTo(chartCanvasSize.peek().width, yCoord);
    ctx.stroke();
  }
}

export const yAxisMouseDown = ({ e, yAxisMovement }) => {
  yAxisMovement.value.mouseDown = true;
  yAxisMovement.value.prevXCoord = e.pageY;
  const canvas = e.target;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export const yAxisMouseMove = ({ e, yAxisMovement, priceRange, lockUpdatePriceRange, yAxisConfig }) => {
  if (yAxisMovement.peek().mouseDown && e.pageY - yAxisMovement.peek().prevXCoord !== 0) {
    if (!yAxisMovement.peek().mouseMove) {
      yAxisMovement.value.mouseMove = true;
      lockUpdatePriceRange.value = true;
    }
    const pixelMovement = yAxisMovement.peek().prevXCoord - e.pageY;
    const pDiff = priceRange.peek().maxPrice - priceRange.peek().minPrice;
    if (pDiff > 4000 && pixelMovement < 0) return;
    if (pDiff < 5 && pixelMovement > 0) return;
    priceRange.value = {
      minPrice: priceRange.peek().minPrice + pixelMovement,
      maxPrice: priceRange.peek().maxPrice - pixelMovement
    }
    updateYConfig({ priceRange, yAxisConfig });
    yAxisMovement.value.prevXCoord = e.pageY;
  }
};

export const yAxisMouseUp = ({ e, yAxisMovement }) => {
  if (yAxisMovement.peek().mouseMove) {
    yAxisMovement.value = { mouseDown: false, mouseMove: false, prevXCoord: 0 }
  } else if (yAxisMovement.peek().mouseDown) {
    yAxisMovement.value.mouseDown = false;
  }
};