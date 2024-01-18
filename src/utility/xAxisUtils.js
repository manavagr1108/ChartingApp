import { updatePriceRange, updateYConfig } from "./yAxisUtils";
export const intervalMap = {
  "1d": "1d",
  "1wk": "1W",
  "1mo": "1M",
};

export const TimeFrames = {
  Year: "Year",
  Month: "Month",
  Date: "Date",
  Hrs: "Hours",
  Min: "Minutes",
  Sec: "Seconds",
};

export function getTime(time) {
  const TIME = new Date(time);
  const result = {};
  result[`${TimeFrames.Year}`] = TIME.getFullYear();
  result[`${TimeFrames.Month}`] = TIME.getMonth() + 1;
  result[`${TimeFrames.Date}`] = TIME.getDate();
  result[`${TimeFrames.Hrs}`] = TIME.getHours();
  result[`${TimeFrames.Min}`] = TIME.getMinutes();
  result[`${TimeFrames.Sec}`] = TIME.getSeconds();
  return result;
}

export function getObjtoStringTime(time) {
  let result = new Date(time.Year + "-" + time.Month + "-" + time.Date);
  if (time.Date < 10 && time.Month < 10) {
    result =
      result.getFullYear() +
      "-0" +
      (result.getMonth() + 1) +
      "-0" +
      result.getDate();
  } else if (time.Date < 10) {
    result =
      result.getFullYear() +
      "-" +
      (result.getMonth() + 1) +
      "-0" +
      result.getDate();
  } else if (time.Month < 10) {
    result =
      result.getFullYear() +
      "-0" +
      (result.getMonth() + 1) +
      "-" +
      result.getDate();
  } else {
    result =
      result.getFullYear() +
      "-" +
      (result.getMonth() + 1) +
      "-" +
      result.getDate();
  }
  return result;
}

export function getNewScrollTime(
  startTime,
  endTime,
  scrollOffset,
  scrollDirection,
  zoomOffset,
  zoomDirection,
  widthOfOneCS,
  noOfPMoved,
  dates
) {
  scrollDirection = noOfPMoved / Math.abs(noOfPMoved);
  if (scrollOffset + scrollDirection * noOfPMoved < widthOfOneCS) {
    scrollOffset += scrollDirection * noOfPMoved;
    return {
      startTime,
      endTime,
      scrollOffset,
      scrollDirection,
      zoomOffset,
      zoomDirection,
    };
  } else {
    const noOfCSMoved =
      scrollDirection *
      Math.floor((scrollOffset + scrollDirection * noOfPMoved) / widthOfOneCS);
    scrollOffset = (scrollOffset + scrollDirection * noOfPMoved) % widthOfOneCS;
    let prevStartTime = startTime;
    let prevEndTime = endTime;
    prevStartTime = getObjtoStringTime(prevStartTime);
    prevEndTime = getObjtoStringTime(prevEndTime);
    const prevStartIndex = dates[prevStartTime];
    const prevEndIndex = dates[prevEndTime];
    if (
      prevStartIndex === -1 ||
      prevEndIndex === -1 ||
      prevStartIndex + noOfCSMoved >= dates.length ||
      prevEndIndex + noOfCSMoved < 0
    ) {
      return {
        startTime,
        endTime,
        scrollOffset,
        scrollDirection,
        zoomOffset,
        zoomDirection,
      };
    } else {
      const values = Object.keys(dates);
      if (
        values[prevStartIndex + noOfCSMoved] !== -1 &&
        values[prevEndIndex + noOfCSMoved] !== -1
      ) {
        const newStartTime = getTime(values[prevStartIndex + noOfCSMoved]);
        const newEndTime = getTime(values[prevEndIndex + noOfCSMoved]);
        if (
          newStartTime &&
          newEndTime &&
          newStartTime.Month &&
          newEndTime.Month
        ) {
          return {
            startTime: newStartTime,
            endTime: newEndTime,
            scrollOffset,
            scrollDirection,
            zoomOffset,
            zoomDirection,
          };
        }
      }
      return {
        startTime,
        endTime,
        scrollOffset,
        scrollDirection,
        zoomOffset,
        zoomDirection,
      };
    }
  }
}
export function getNewZoomTime(
  startTime,
  endTime,
  scrollOffset,
  scrollDirection,
  zoomOffset,
  zoomDirection,
  widthOfOneCS,
  noOfPMoved,
  dates
) {
  if(noOfPMoved === 0){
    return {
      startTime,
      endTime,
      scrollOffset,
      scrollDirection,
      zoomOffset,
      zoomDirection,
    };
  }
  const zoomDirectionNew = noOfPMoved / Math.abs(noOfPMoved);
  zoomDirection = zoomDirectionNew;
  if (zoomOffset + zoomDirection * noOfPMoved < widthOfOneCS) {
    zoomOffset += (zoomDirection * noOfPMoved) / 2;
    // console.log("1");
    return {
      startTime,
      endTime,
      scrollOffset,
      scrollDirection,
      zoomOffset,
      zoomDirection,
    };
  } else {
    const noOfCSMovedLeft =
      zoomDirection *
      Math.floor(
        (zoomOffset + (zoomDirection * noOfPMoved) / 2) / widthOfOneCS
      );
    zoomOffset = (zoomOffset + (zoomDirection * noOfPMoved) / 2) % widthOfOneCS;
    let prevStartTime = getObjtoStringTime(startTime);
    let prevEndTime = getObjtoStringTime(endTime);
    const prevStartIndex = dates[prevStartTime];
    const prevEndIndex = dates[prevEndTime];
    if (prevEndIndex === -1 || prevEndIndex + noOfCSMovedLeft < 0) {
      // console.log("2");
      return {
        startTime,
        endTime,
        scrollOffset,
        scrollDirection,
        zoomOffset,
        zoomDirection,
      };
    } else {
      const values = Object.keys(dates);
      let newEndTime = endTime;
      const noOfCS = prevStartIndex - (prevEndIndex + noOfCSMovedLeft);
      if (noOfCS < 10 || noOfCS > 1500) {
        // console.log("3");
        return {
          startTime,
          endTime,
          scrollOffset,
          scrollDirection,
          zoomOffset,
          zoomDirection,
        };
      }
      if (values[prevEndIndex + noOfCSMovedLeft] !== -1) {
        newEndTime = getTime(values[prevEndIndex + noOfCSMovedLeft]);
        if (!newEndTime || !newEndTime.Month) {
          newEndTime = endTime;
        }
      }
      // console.log("4");
      return {
        startTime,
        endTime: newEndTime,
        scrollOffset,
        scrollDirection,
        zoomOffset,
        zoomDirection,
      };
    }
  }
}

export const xAxisMouseDown = (e, state) => {
  const {xAxisMovement} = state;
  xAxisMovement.value.mouseDown = true;
  xAxisMovement.value.prevXCoord = e.pageX;
  const canvas = e.target;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};
export const xAxisMouseMove = (e, state) => {
  const { xAxisMovement, timeRange, dateConfig, xAxisConfig} = state;
  if (xAxisMovement.peek().mouseDown && e.pageX - xAxisMovement.peek().prevXCoord !== 0) {
    if (!xAxisMovement.peek().mouseMove) {
      xAxisMovement.value.mouseMove = true;
    }
    const pixelMovement = xAxisMovement.peek().prevXCoord - e.pageX;
    timeRange.value = getNewZoomTime(
      timeRange.peek().startTime,
      timeRange.peek().endTime,
      timeRange.peek().scrollOffset,
      timeRange.peek().scrollDirection,
      timeRange.peek().zoomOffset,
      timeRange.peek().zoomDirection,
      xAxisConfig.peek().widthOfOneCS,
      pixelMovement * xAxisConfig.peek().widthOfOneCS,
      dateConfig.peek().dateToIndex
    )
    state.setXAxisConfig();
    state.drawChartObjects.peek()[0].setYRange();
    state.drawChartObjects.peek()[0].setYAxisConfig();
    xAxisMovement.value.prevXCoord = e.pageX;
  }
};
export const xAxisMouseUp = (e, state) => {
  const {xAxisMovement} = state;
  if (xAxisMovement.peek().mouseMove) {
    xAxisMovement.value = { mouseDown: false, mouseMove: false, prevXCoord: 0 }
  } else if (xAxisMovement.peek().mouseDown) {
    xAxisMovement.value.mouseDown = false;
  }
};
export const getXCoordinate = (
  width,
  widthOfOneCS,
  multiplier,
  offset,
  nthCS
) => {
  return width - nthCS * widthOfOneCS - widthOfOneCS / 2 - multiplier * offset;
};
