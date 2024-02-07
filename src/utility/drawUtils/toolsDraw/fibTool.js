import { getCoordsArray } from "../../toolsUtils";
import { drawPoint, drawTrendLineUsingPoints } from "./lineTool";

export const drawFib = (
  state,
  i,
  lineSelected = false,
  fromDrawChart = false
) => {
  const { fibData, ChartRef } = state;
  const canvas = ChartRef.current[0];
  const canvas1 = ChartRef.current[1];
  const ctx1 = canvas1.getContext("2d");
  const lineData = fibData.peek()[i];
  switch (lineData.toolItemNo) {
    case 0:
      drawFibUsingPoints(
        state,
        canvas,
        lineData.points,
        lineSelected,
        fromDrawChart,
        ctx1
      );
      break;
    case 1:
      drawTrendFibUsingPoints(
        state,
        canvas,
        lineData.points,
        lineSelected,
        fromDrawChart,
        ctx1
      );
      break;
    case 2:
      drawFibChannelUsingPoints(
        state,
        canvas,
        lineData.points,
        lineSelected,
        fromDrawChart,
        ctx1
      );
      break;
    case 3:
      drawFibTimeZoneUsingPoints(
        state,
        canvas,
        lineData.points,
        lineSelected,
        fromDrawChart,
        ctx1
      );
      break;
    case 4:
      drawTrendFibTimeUsingPoints(
        state,
        canvas,
        lineData.points,
        lineSelected,
        fromDrawChart,
        ctx1
      );
      break;
  }
};

export const drawFibUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [startCoords, endCoords] = getCoordsArray(state, points);
  if (lineSelected) {
    drawPoint(ctx1, startCoords.x, startCoords.y);
    drawPoint(ctx1, endCoords.x, endCoords.y);
    if (startCoords.y < endCoords.y) {
      const temp = startCoords.y;
      startCoords.y = endCoords.y;
      endCoords.y = temp;
    }
    if (startCoords.x > endCoords.x) {
      const temp = startCoords.x;
      startCoords.x = endCoords.x;
      endCoords.x = temp;
    }
    const fibValues = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
    const fibColors = [
      "rgba(255, 90, 71,1)",
      "rgba(126, 255, 71,1)",
      "rgba(50, 129, 168,1)",
      "rgba(76, 50, 168,1)",
      "rgba(168, 50, 146,1)",
      "rgba(189, 186, 55,1)",
      "rgba(189, 186, 55,1)",
    ];
    fibValues.forEach((val, i) => {
      const yi = Math.abs(val * (endCoords.y - startCoords.y));
      ctx1.beginPath();
      ctx1.strokeStyle = fibColors[i];
      ctx1.moveTo(startCoords.x, endCoords.y + yi);
      ctx1.lineTo(endCoords.x, endCoords.y + yi);
      ctx1.stroke();
    });
  } else {
    drawTrendLineUsingPoints(state, canvas, points);
    if (startCoords.y < endCoords.y) {
      const temp = startCoords.y;
      startCoords.y = endCoords.y;
      endCoords.y = temp;
    }
    if (startCoords.x > endCoords.x) {
      const temp = startCoords.x;
      startCoords.x = endCoords.x;
      endCoords.x = temp;
    }
    const ctx = canvas.getContext("2d");
    const fibValues = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
    const fibColors = [
      "rgba(255, 90, 71,0.3)",
      "rgba(126, 255, 71,0.3)",
      "rgba(50, 129, 168,0.3)",
      "rgba(76, 50, 168,0.3)",
      "rgba(168, 50, 146,0.3)",
      "rgba(189, 186, 55,0.3)",
    ];
    let prevY = 0;
    fibValues.forEach((val, i) => {
      const yi = Math.abs(val * (endCoords.y - startCoords.y));
      ctx.beginPath();
      ctx.fillStyle = fibColors[i];
      ctx.rect(
        startCoords.x,
        endCoords.y + prevY,
        Math.abs(endCoords.x - startCoords.x),
        yi - prevY
      );
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.fillStyle = "Black";
      ctx.fillText(val, startCoords.x - 20, endCoords.y + yi);
      ctx.fill();
      ctx.closePath();
      prevY = yi;
    });
  }
};
export const drawFibRevUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, fibEndCoords] = getCoordsArray(
    state,
    points
  );
  drawTrendLineUsingPoints(
    state,
    canvas,
    [lineEndCoords, fibEndCoords],
    lineSelected,
    ctx1
  );
  if (lineSelected) {
    drawPoint(ctx1, fibEndCoords.x, fibEndCoords.y);
  } else {
    if (fibEndCoords.x > lineEndCoords.x) {
      const temp = fibEndCoords.x;
      fibEndCoords.x = lineEndCoords.x;
      lineEndCoords.x = temp;
    }
    const ctx = canvas.getContext("2d");
    const fibValues = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
    const fibColors = [
      "rgba(255, 90, 71,0.3)",
      "rgba(126, 255, 71,0.3)",
      "rgba(50, 129, 168,0.3)",
      "rgba(76, 50, 168,0.3)",
      "rgba(168, 50, 146,0.3)",
      "rgba(189, 186, 55,0.3)",
    ];
    let prevY = 0;
    fibValues.forEach((val, i) => {
      const yi = Math.abs(val * (lineEndCoords.y - lineStartCoords.y));
      ctx.beginPath();
      ctx.fillStyle = fibColors[i];
      ctx.rect(
        fibEndCoords.x,
        fibEndCoords.y - yi,
        Math.abs(lineEndCoords.x - fibEndCoords.x),
        yi - prevY
      );
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.fillStyle = "Black";
      ctx.fillText(val, fibEndCoords.x - 20, fibEndCoords.y - yi);
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.strokeStyle = fibColors[i];
      ctx.lineWidth = 2;
      ctx.moveTo(fibEndCoords.x, fibEndCoords.y - yi);
      ctx.lineTo(lineEndCoords.x, fibEndCoords.y - yi);
      ctx.stroke();
      ctx.lineWidth = 1;
      prevY = yi;
    });
    ctx.lineWidth = 1;
  }
};
export const drawFibAngledUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, fibEndCoords] = getCoordsArray(
    state,
    points
  );
  if (lineSelected) {
    drawPoint(ctx1, fibEndCoords.x, fibEndCoords.y);
  } else {
    if (fibEndCoords.x > lineEndCoords.x) {
      const temp = fibEndCoords.x;
      fibEndCoords.x = lineEndCoords.x;
      lineEndCoords.x = temp;
    }
    const ctx = canvas.getContext("2d");
    const fibValues = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
    const fibColors = [
      "rgba(255, 90, 71,0.3)",
      "rgba(126, 255, 71,0.3)",
      "rgba(50, 129, 168,0.3)",
      "rgba(76, 50, 168,0.3)",
      "rgba(168, 50, 146,0.3)",
      "rgba(189, 186, 55,0.3)",
    ];
    let prevStart = {
      x: lineStartCoords.x,
      y: lineStartCoords.y,
    };
    let prevEnd = {
      x: lineEndCoords.x,
      y: lineEndCoords.y,
    };
    fibValues.forEach((val, i) => {
      const len = Math.sqrt(
        (fibEndCoords.y - lineStartCoords.y) ** 2 +
          (fibEndCoords.x - lineStartCoords.x) ** 2
      );
      const yi = Math.abs(val * len);
      const cos0 = (fibEndCoords.x - lineStartCoords.x) / len;
      const sin0 = (fibEndCoords.y - lineStartCoords.y) / len;
      const x3 = yi * cos0 + lineStartCoords.x;
      const y3 = yi * sin0 + lineStartCoords.y;

      const slope1 =
        (fibEndCoords.y - lineStartCoords.y) /
        (fibEndCoords.x - lineStartCoords.x);
      const constant1 = lineEndCoords.y - slope1 * lineEndCoords.x;

      const slope2 =
        (lineEndCoords.y - lineStartCoords.y) /
        (lineEndCoords.x - lineStartCoords.x);
      const constant2 = y3 - slope2 * x3;

      const x4 = (constant2 - constant1) / (slope1 - slope2);
      const y4 = slope1 * x4 + constant1;

      ctx.fillStyle = fibColors[i];
      ctx.beginPath();
      ctx.moveTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.lineTo(prevEnd.x, prevEnd.y);
      ctx.lineTo(prevStart.x, prevStart.y);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "Black";
      ctx.fillText(val, x3 - 20, y3);
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.strokeStyle = fibColors[i];
      ctx.lineWidth = 2;
      ctx.moveTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.stroke();
      ctx.lineWidth = 1;
      prevStart = {
        x: x3,
        y: y3,
      };
      prevEnd = {
        x: x4,
        y: y4,
      };
    });
    ctx.lineWidth = 1;
  }
};

export const drawFibTimeTrendUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, fibEndCoords] = getCoordsArray(
    state,
    points
  );
  drawTrendLineUsingPoints(
    state,
    canvas,
    [lineEndCoords, fibEndCoords],
    lineSelected,
    ctx1
  );
  const { chartCanvasSize } = state;
  if (lineSelected) {
    drawPoint(ctx1, fibEndCoords.x, fibEndCoords.y);
  } else {
    const ctx = canvas.getContext("2d");
    const fibValues = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
    const fibColors = [
      "rgba(255, 90, 71,0.3)",
      "rgba(126, 255, 71,0.3)",
      "rgba(50, 129, 168,0.3)",
      "rgba(76, 50, 168,0.3)",
      "rgba(168, 50, 146,0.3)",
      "rgba(189, 186, 55,0.3)",
    ];
    let prevX = 0;
    fibValues.forEach((val, i) => {
      const len = lineEndCoords.x - lineStartCoords.x;
      const yi = Math.abs(val * len);
      ctx.fillStyle = fibColors[i];
      ctx.beginPath();
      ctx.moveTo(fibEndCoords.x + prevX, 0);
      ctx.lineTo(fibEndCoords.x + yi, 0);
      ctx.lineTo(fibEndCoords.x + yi, canvas.height);
      ctx.lineTo(fibEndCoords.x + prevX, canvas.height);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "Black";
      ctx.fillText(
        val,
        fibEndCoords.x + yi - 30,
        chartCanvasSize.peek().height - 20
      );
      ctx.fill();
      ctx.closePath();
      prevX = yi;
    });
    ctx.lineWidth = 1;
  }
};

export const drawTrendFibUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, fibEndCoords] = getCoordsArray(
    state,
    points
  );
  drawTrendLineUsingPoints(state, canvas, points, lineSelected, ctx1);
  if (fibEndCoords !== undefined) {
    drawFibRevUsingPoints(
      state,
      canvas,
      points,
      lineSelected,
      fromDrawChart,
      ctx1
    );
  } else {
    drawFibRevUsingPoints(
      state,
      canvas,
      [lineStartCoords, lineEndCoords, lineEndCoords],
      lineSelected,
      fromDrawChart,
      ctx1
    );
  }
};

export const drawFibChannelUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, fibEndCoords] = getCoordsArray(
    state,
    points
  );
  drawTrendLineUsingPoints(state, canvas, points, lineSelected, ctx1);
  if (fibEndCoords !== undefined) {
    drawFibAngledUsingPoints(
      state,
      canvas,
      points,
      lineSelected,
      fromDrawChart,
      ctx1
    );
  }
};

export const drawFibTimeZoneUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords] = getCoordsArray(state, points);
  drawTrendLineUsingPoints(
    state,
    canvas,
    [lineStartCoords, lineEndCoords],
    lineSelected,
    ctx1
  );
  const { chartCanvasSize } = state;
  const ctx = canvas.getContext("2d");
  const fibValues = [0, 1, 2, 3, 5, 8, 13, 21];
  ctx.strokeStyle = "Blue";
  ctx.lineWidth = 3;
  fibValues.forEach((val, i) => {
    const width = val * (lineEndCoords.x - lineStartCoords.x);
    ctx.beginPath();
    ctx.moveTo(lineStartCoords.x + width, 0);
    ctx.lineTo(lineStartCoords.x + width, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = "Black";
    ctx.fillText(
      val,
      lineStartCoords.x + width - 10,
      chartCanvasSize.peek().height - 20
    );
    ctx.fill();
    ctx.closePath();
  });
  ctx.lineWidth = 1;
};

export const drawTrendFibTimeUsingPoints = (
  state,
  canvas,
  points,
  lineSelected = false,
  fromDrawChart = false,
  ctx1 = null
) => {
  if (!fromDrawChart) return;
  const [lineStartCoords, lineEndCoords, fibEndCoords] = getCoordsArray(
    state,
    points
  );
  drawTrendLineUsingPoints(state, canvas, points, lineSelected, ctx1);
  if (fibEndCoords !== undefined) {
    drawFibTimeTrendUsingPoints(
      state,
      canvas,
      points,
      lineSelected,
      fromDrawChart,
      ctx1
    );
  }
};

export const drawFibs = (state, fromDrawChart = false) => {
  const { fibData } = state;
  fibData.peek().forEach((lineData, i) => {
    drawFib(state, i, false, fromDrawChart);
  });
};
