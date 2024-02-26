import { getCoordsArray } from "../../toolsUtils";

export const drawTrendLine = (
  state,
  i,
  lineSelected = false,
  fromDrawChart = false
) => {
  const { trendLinesData, ChartRef } = state;
  const { selectedItem } = state.ChartWindow;
  const canvas = ChartRef.current[0];
  const canvas1 = ChartRef.current[1];
  const lineData = trendLinesData.peek()[i];
  const points = getCoordsArray(state, lineData.points);
  let ctx1;
  ctx1 = canvas1.getContext("2d");
  if (selectedItem.peek() !== null && selectedItem.peek().toolItemNo === lineData.toolItemNo) {
    const selectedPoints = getCoordsArray(state, selectedItem.peek().points);
    let temp = 0;
    selectedPoints.forEach((point, i) => {
      if (point.x !== points[i].x && point.y !== points[i].y) {
        temp = 1;
      }
    })
    if (temp === 0) {
      ctx1 = canvas.getContext("2d");
      lineSelected = true;
    } else {
      ctx1 = canvas1.getContext("2d");
    }
  } else {
    ctx1 = canvas1.getContext("2d");
  }
  switch (lineData.toolItemNo) {
    case 0:
      drawTrendLineUsingPoints(state, canvas, points, lineSelected, ctx1);
      break;
    case 1:
      drawRayLineUsingPoints(state, canvas, points, lineSelected, ctx1);
      break;
    case 2:
      drawInfoLineUsingPoints(state, canvas, points, lineSelected, ctx1);
      break;
    case 3:
      drawExtendedLineUsingPoints(state, canvas, points, lineSelected, ctx1);
      break;
    case 4:
      drawTrendAngleUsingPoints(state, canvas, points, lineSelected, ctx1);
      break;
    case 5:
      drawHorizontalLineUsingPoints(state, canvas, points, lineSelected, ctx1);
      break;
    case 6:
      drawHorizontalRayUsingPoints(state, canvas, points, lineSelected, ctx1);
      break;
    case 7:
      drawVerticalLineUsingPoints(state, canvas, points, lineSelected, ctx1);
      break;
    case 8:
      drawCrossLineUsingPoints(state, canvas, points, lineSelected, ctx1);
      break;
    case 9:
      drawParallelChannelUsingPoints(
        state,
        canvas,
        points,
        lineSelected,
        fromDrawChart,
        ctx1
      );
      break;
    case 10:
      drawFlatTopBottomChannelUsingPoints(
        state,
        canvas,
        points,
        lineSelected,
        fromDrawChart,
        ctx1
      );
      break;
    case 11:
      drawDisjointChannelUsingPoints(
        state,
        canvas,
        points,
        lineSelected,
        fromDrawChart,
        ctx1
      );
      break;
  }
};

export const drawTrendLineUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  ctx1 = null
) => {
  const [startCoords, endCoords] = getCoordsArray(state, points);
  const ctx = canvas.getContext("2d");
  ctx1 = ctx1 === null ? ctx : ctx1;
  ctx.strokeStyle = "Black";
  ctx.beginPath();
  ctx.moveTo(startCoords.x, startCoords.y);
  ctx.lineTo(endCoords.x, endCoords.y);
  ctx.stroke();
  if (lineSelected) {
    drawPoint(ctx1, startCoords.x, startCoords.y);
    drawPoint(ctx1, endCoords.x, endCoords.y);
  }
};
export const drawRayLineUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  ctx1 = null
) => {
  const [startCoords, endCoords] = getCoordsArray(state, points);
  const ctx = canvas.getContext("2d");
  ctx1 = ctx1 === null ? ctx : ctx1;
  const slope = (endCoords.y - startCoords.y) / (endCoords.x - startCoords.x);
  const constant = endCoords.y - slope * endCoords.x;
  const newEndYCoord =
    endCoords.x > startCoords.x
      ? slope * canvas.width + constant
      : slope * 0 + constant;
  const newEndXCoord = (newEndYCoord - constant) / slope;
  if (ctx1 !== null) {
    drawPoint(ctx1, endCoords.x, endCoords.y);
  }
  drawTrendLineUsingPoints(
    state,
    canvas,
    [startCoords, { x: newEndXCoord, y: newEndYCoord }],
    false,
    ctx1
  );
};

export const drawExtendedLineUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  ctx1 = null
) => {
  const [startCoords, endCoords] = getCoordsArray(state, points);
  const ctx = canvas.getContext("2d");
  ctx1 = ctx1 === null ? ctx : ctx1;
  const slope = (endCoords.y - startCoords.y) / (endCoords.x - startCoords.x);
  const constant = endCoords.y - slope * endCoords.x;
  const newStartYCoord =
    endCoords.x < startCoords.x
      ? slope * canvas.width + constant
      : slope * 0 + constant;
  const newStartXCoord = (newStartYCoord - constant) / slope;
  const newEndYCoord =
    endCoords.x > startCoords.x
      ? slope * canvas.width + constant
      : slope * 0 + constant;
  const newEndXCoord = (newEndYCoord - constant) / slope;
  if (ctx1 !== null) {
    drawPoint(ctx1, startCoords.x, startCoords.y);
    drawPoint(ctx1, endCoords.x, endCoords.y);
  }
  drawTrendLineUsingPoints(
    state,
    canvas,
    [
      { x: newStartXCoord, y: newStartYCoord },
      { x: newEndXCoord, y: newEndYCoord },
    ],
    false,
    ctx1
  );
};

export const drawInfoLineUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  ctx1 = null
) => {
  const [startCoords, endCoords] = getCoordsArray(state, points);
  const { yAxisRange, chartCanvasSize } = state;
  const { xAxisConfig } = state.ChartWindow;
  const ctx = canvas.getContext("2d");
  ctx1 = ctx1 === null ? ctx : ctx1;
  let price1 =
    yAxisRange.peek().minPrice +
    ((chartCanvasSize.peek().height - startCoords.y) *
      (yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice)) /
    chartCanvasSize.peek().height;
  let price2 =
    yAxisRange.peek().minPrice +
    ((chartCanvasSize.peek().height - endCoords.y) *
      (yAxisRange.peek().maxPrice - yAxisRange.peek().minPrice)) /
    chartCanvasSize.peek().height;
  const dateIndex1 = Math.floor(
    (chartCanvasSize.peek().width - startCoords.x) /
    xAxisConfig.peek().widthOfOneCS
  );
  const dateIndex2 = Math.floor(
    (chartCanvasSize.peek().width - endCoords.x) /
    xAxisConfig.peek().widthOfOneCS
  );
  drawTrendLineUsingPoints(state, canvas, points, lineSelected, ctx1);
  ctx.beginPath();
  ctx.clearRect(
    (startCoords.x + endCoords.x) / 2 + 10,
    (startCoords.y + endCoords.y) / 2 + 10,
    200,
    50
  );
  ctx.fillStyle = "rgba(58,220,255,0.3)";
  ctx.rect(
    (startCoords.x + endCoords.x) / 2 + 10,
    (startCoords.y + endCoords.y) / 2 + 10,
    200,
    50
  );
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillText(
    `↕ ${(price2 - price1).toFixed(2)} (${(((price2 - price1) / price1) * 100).toFixed(2)}%)`,
    (startCoords.x + endCoords.x) / 2 + 20,
    (startCoords.y + endCoords.y) / 2 + 30
  );
  ctx.fillText(
    `↔ ${Math.abs(dateIndex1 - dateIndex2)} Number of Bars; ${Math.abs(startCoords.x - endCoords.x).toFixed(2)}px`,
    (startCoords.x + endCoords.x) / 2 + 20,
    (startCoords.y + endCoords.y) / 2 + 50
  );
  ctx.stroke();
};

export const drawTrendAngleUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  ctx1 = null
) => {
  let [startCoords, endCoords] = getCoordsArray(state, points);

  const ctx = canvas.getContext("2d");
  ctx1 = ctx1 === null ? ctx : ctx1;

  ctx.strokeStyle = "Black";
  ctx.beginPath();
  ctx.moveTo(startCoords.x, startCoords.y);
  ctx.lineTo(endCoords.x, endCoords.y);
  ctx.stroke();

  const angleRadians = Math.atan2(
    endCoords.y - startCoords.y,
    endCoords.x - startCoords.x
  );
  const horizontalLineLength = 100;
  const horizontalLineEndX = startCoords.x + horizontalLineLength;

  const angleRadius = Math.abs(horizontalLineEndX - startCoords.x) / 2;
  const arcCenterX = startCoords.x;
  const arcCenterY = startCoords.y;

  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(70, 130, 180, 0.8)";
  ctx.beginPath();
  ctx.arc(
    arcCenterX,
    arcCenterY,
    angleRadius,
    angleRadians,
    0,
    angleRadians > 0
  );
  ctx.stroke();

  const midPointX = (startCoords.x + horizontalLineEndX) / 2;
  const midPointY = startCoords.y;

  const angleDegrees = Math.round((angleRadians * 180) / Math.PI);

  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  ctx.fillText(`${-angleDegrees}°`, midPointX + 60, midPointY + 5);

  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "rgba(70, 130, 180, 0.8)";
  ctx.beginPath();
  ctx.moveTo(startCoords.x, startCoords.y);
  ctx.quadraticCurveTo(midPointX, midPointY, horizontalLineEndX, startCoords.y);
  ctx.stroke();
  ctx.setLineDash([]);

  drawPoint(ctx1, startCoords.x, startCoords.y);
  drawPoint(ctx1, endCoords.x, endCoords.y);
};

export const drawPoint = (ctx, x, y) => {
  ctx.fillStyle = "White";
  ctx.strokeStyle = "blue";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
};
export const drawHorizontalLineUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  ctx1 = null
) => {
  const [startCoords] = getCoordsArray(state, points);
  const { chartCanvasSize } = state;
  drawTrendLineUsingPoints(
    state,
    canvas,
    [
      { x: 0, y: startCoords.y },
      { x: chartCanvasSize.peek().width, y: startCoords.y },
    ],
    false,
    ctx1
  );
  if (lineSelected && ctx1 !== null) {
    drawPoint(ctx1, startCoords.x, startCoords.y);
  }
};

export const drawVerticalLineUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  ctx1 = null
) => {
  const [startCoords] = getCoordsArray(state, points);
  const { chartCanvasSize } = state;
  drawTrendLineUsingPoints(
    state,
    canvas,
    [
      { x: startCoords.x, y: 0 },
      { x: startCoords.x, y: chartCanvasSize.peek().height },
    ],
    false,
    ctx1
  );
  if (lineSelected && ctx1 !== null) {
    drawPoint(ctx1, startCoords.x, startCoords.y);
  }
};

export const drawHorizontalRayUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  ctx1 = null
) => {
  const [startCoords] = getCoordsArray(state, points);
  const { chartCanvasSize } = state;
  drawTrendLineUsingPoints(
    state,
    canvas,
    [
      { x: startCoords.x, y: 0 },
      { x: startCoords.x, y: chartCanvasSize.peek().height },
    ],
    false,
    ctx1
  );
  if (lineSelected && ctx1 !== null) {
    drawPoint(ctx1, startCoords.x, startCoords.y);
  }
};

export const drawCrossLineUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  ctx1 = null
) => {
  const [startCoords] = getCoordsArray(state, points);
  const { chartCanvasSize } = state;
  drawTrendLineUsingPoints(
    state,
    canvas,
    [
      { x: startCoords.x, y: 0 },
      { x: startCoords.x, y: chartCanvasSize.peek().height },
    ],
    false,
    ctx1
  );
  drawTrendLineUsingPoints(
    state,
    canvas,
    [
      { x: 0, y: startCoords.y },
      { x: chartCanvasSize.peek().width, y: startCoords.y },
    ],
    false,
    ctx1
  );
  if (lineSelected && ctx1 !== null) {
    drawPoint(ctx1, startCoords.x, startCoords.y);
  }
};

export const drawParallelChannel = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, channelEndCoords] = getCoordsArray(
    state,
    points
  );
  const slope =
    (lineEndCoords.y - lineStartCoords.y) /
    (lineEndCoords.x - lineStartCoords.x);
  const contant = channelEndCoords.y - lineEndCoords.x * slope;
  const newY = lineStartCoords.x * slope + contant;
  if (lineSelected) {
    drawPoint(ctx1, lineEndCoords.x, channelEndCoords.y);
  } else {
    drawTrendLineUsingPoints(state, canvas, points, false, ctx1);
    drawTrendLineUsingPoints(
      state,
      canvas,
      [
        { x: lineStartCoords.x, y: newY },
        { x: lineEndCoords.x, y: channelEndCoords.y },
      ],
      false,
      ctx1
    );
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0,148,256,0.5)";
    ctx.beginPath();
    ctx.moveTo(lineStartCoords.x, lineStartCoords.y);
    ctx.lineTo(lineEndCoords.x, lineEndCoords.y);
    ctx.lineTo(lineEndCoords.x, channelEndCoords.y);
    ctx.lineTo(lineStartCoords.x, newY);
    ctx.fill();
    ctx.closePath();
    ctx.setLineDash([5, 2]);
    ctx.moveTo(lineStartCoords.x, (lineStartCoords.y + newY) / 2);
    ctx.lineTo(lineEndCoords.x, (lineEndCoords.y + channelEndCoords.y) / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

export const drawParallelChannelUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, channelEndCoords] = getCoordsArray(
    state,
    points
  );
  // const { chartCanvasSize } = state;
  if (channelEndCoords === undefined) {
    drawTrendLineUsingPoints(state, canvas, points, false, ctx1);
  }
  if (channelEndCoords !== undefined) {
    drawParallelChannel(
      state,
      canvas,
      points,
      lineSelected,
      fromDrawChart,
      ctx1
    );
  }
  if (lineSelected && ctx1 !== null) {
    drawPoint(ctx1, lineStartCoords.x, lineStartCoords.y);
    drawPoint(ctx1, lineEndCoords.x, lineEndCoords.y);
  }
};

export const drawFlatTopBottomChannel = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, channelEndCoords] = getCoordsArray(
    state,
    points
  );
  const newY = channelEndCoords.y;
  if (lineSelected) {
    drawPoint(ctx1, lineEndCoords.x, channelEndCoords.y);
  } else {
    drawTrendLineUsingPoints(state, canvas, points, false, ctx1);
    drawTrendLineUsingPoints(
      state,
      canvas,
      [
        { x: lineStartCoords.x, y: newY },
        { x: lineEndCoords.x, y: channelEndCoords.y },
      ],
      false,
      ctx1
    );
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(245,176,65,0.5)";
    ctx.beginPath();
    ctx.moveTo(lineStartCoords.x, lineStartCoords.y);
    ctx.lineTo(lineEndCoords.x, lineEndCoords.y);
    ctx.lineTo(lineEndCoords.x, channelEndCoords.y);
    ctx.lineTo(lineStartCoords.x, newY);
    ctx.fill();
    ctx.closePath();
    ctx.setLineDash([5, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

export const drawFlatTopBottomChannelUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, channelEndCoords] = getCoordsArray(
    state,
    points
  );
  if (channelEndCoords === undefined) {
    drawTrendLineUsingPoints(state, canvas, points, false, ctx1);
  }
  if (channelEndCoords !== undefined) {
    drawFlatTopBottomChannel(
      state,
      canvas,
      points,
      lineSelected,
      fromDrawChart,
      ctx1
    );
  }
  if (lineSelected && ctx1 !== null) {
    drawPoint(ctx1, lineStartCoords.x, lineStartCoords.y);
    drawPoint(ctx1, lineEndCoords.x, lineEndCoords.y);
  }
};

export const drawDisjointChannel = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, channelEndCoords] = getCoordsArray(
    state,
    points
  );
  const slope =
    -(lineEndCoords.y - lineStartCoords.y) /
    (lineEndCoords.x - lineStartCoords.x);
  const contant = channelEndCoords.y - lineEndCoords.x * slope;
  const newY = lineStartCoords.x * slope + contant;
  if (lineSelected) {
    drawPoint(ctx1, lineEndCoords.x, channelEndCoords.y);
  } else {
    drawTrendLineUsingPoints(state, canvas, points, false, ctx1);
    drawTrendLineUsingPoints(
      state,
      canvas,
      [
        { x: lineStartCoords.x, y: newY },
        { x: lineEndCoords.x, y: channelEndCoords.y },
      ],
      false,
      ctx1
    );
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(69,179,157,0.5)";
    ctx.beginPath();
    ctx.moveTo(lineStartCoords.x, lineStartCoords.y);
    ctx.lineTo(lineEndCoords.x, lineEndCoords.y);
    ctx.lineTo(lineEndCoords.x, channelEndCoords.y);
    ctx.lineTo(lineStartCoords.x, newY);
    ctx.fill();
    ctx.closePath();
    ctx.setLineDash([5, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

export const drawDisjointChannelUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, channelEndCoords] = getCoordsArray(
    state,
    points
  );
  if (channelEndCoords === undefined) {
    drawTrendLineUsingPoints(state, canvas, points, false, ctx1);
  }
  if (channelEndCoords !== undefined) {
    drawDisjointChannel(
      state,
      canvas,
      points,
      lineSelected,
      fromDrawChart,
      ctx1
    );
  }
  if (lineSelected && ctx1 !== null) {
    drawPoint(ctx1, lineStartCoords.x, lineStartCoords.y);
    drawPoint(ctx1, lineEndCoords.x, lineEndCoords.y);
  }
};

export const drawTrendLines = (state, fromDrawChart = false) => {
  const { trendLinesData } = state;
  trendLinesData.peek().forEach((lineData, i) => {
    drawTrendLine(state, i, false, fromDrawChart);
  });
};
