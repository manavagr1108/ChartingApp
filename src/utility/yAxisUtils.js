export const priceToColMap = {
  0.05: 0.005,
  0.1: 0.01,
  0.5: 0.05,
  1: 0.1,
  2: 0.2,
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
  4174: 250,
};

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
  const Low = data[0].Low !== undefined ? "Low" : "Close";
  const High = data[0].High !== undefined ? "High" : "Close";
  const array = Object.values(data);
  let n = array.length;
  for (let i = 0; i < n; i++) {
    const ele = array[i];
    const d = {};
    const date = `${ele.Date}:${ele.Date}`;
    d[`${date}`] = {
      Low: ele[`${Low}`],
      High: ele[`${High}`],
    };
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
    const date = `${getLeftDate(leftEleKey)}:${getRightDate(rightEleKey)}`;
    d[`${date}`] = {
      Low: Math.min(leftEleVal.Low, rightEleVal.Low),
      High: Math.max(leftEleVal.High, rightEleVal.High),
    };
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
      if (r >= 2 * n) r = 2 * n - 1;
      let ele = segmentTree[r];
      ele = Object.values(ele);
      minPrice = Math.min(minPrice, ele[0].Low);
      maxPrice = Math.max(maxPrice, ele[0].High);
    }
  }
  if (
    maxPrice != Number.MIN_SAFE_INTEGER &&
    minPrice != Number.MAX_SAFE_INTEGER
  ) {
    const priceDiff = (maxPrice - minPrice) / 12;
    minPrice = minPrice - priceDiff;
    maxPrice = maxPrice + priceDiff;
  }
  return { minPrice, maxPrice };
}

export const getYCoordinate = (price, minPrice, maxPrice, height) => {
  return height - (height / (maxPrice - minPrice)) * (price - minPrice);
};

export const yAxisMouseDown = (e, state) => {
  const { yAxisMovement } = state;
  yAxisMovement.value.mouseDown = true;
  yAxisMovement.value.prevXCoord = e.pageY;
  const canvas = e.target;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export const yAxisMouseMove = (e, state) => {
  const { yAxisMovement, yAxisRange } = state;
  const { lockUpdatePriceRange } = state.ChartWindow;
  if (
    yAxisMovement.peek().mouseDown &&
    e.pageY - yAxisMovement.peek().prevXCoord !== 0
  ) {
    if (!yAxisMovement.peek().mouseMove) {
      yAxisMovement.value.mouseMove = true;
      lockUpdatePriceRange.value = true;
    }
    const pixelMovement = yAxisMovement.peek().prevXCoord - e.pageY;
    const pDiff = yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice;
    if (pDiff > 4000 && pixelMovement < 0) return;
    if (pDiff < 5 && pixelMovement > 0) return;
    yAxisRange.value = {
      minPrice: yAxisRange.peek().minPrice + pixelMovement / 10,
      maxPrice: yAxisRange.peek().maxPrice - pixelMovement / 10,
    };
    state.setYAxisConfig();
    yAxisMovement.value.prevXCoord = e.pageY;
  }
};

export const yAxisMouseUp = (e, state) => {
  const { yAxisMovement } = state;
  if (yAxisMovement.peek().mouseMove) {
    yAxisMovement.value = { mouseDown: false, mouseMove: false, prevXCoord: 0 };
  } else if (yAxisMovement.peek().mouseDown) {
    yAxisMovement.value.mouseDown = false;
  }
};
