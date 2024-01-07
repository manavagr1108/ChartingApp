import testData from "../data/testData.json";
import { canvasSize, chartCanvasSize, xAxisConfig } from "../signals/stockSignals";
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
  offset,
  multiplier,
  widthOfOneCS,
  noOfPMoved,
  dates
) {
  multiplier = noOfPMoved / Math.abs(noOfPMoved);
  if (offset + multiplier * noOfPMoved < widthOfOneCS) {
    offset += multiplier * noOfPMoved;
    return {
      startTime,
      endTime,
      offset,
      multiplier,
    };
  } else {
    const noOfCSMoved =
      multiplier *
      Math.floor((offset + multiplier * noOfPMoved) / widthOfOneCS);
    offset = (offset + multiplier * noOfPMoved) % widthOfOneCS;
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
      return { startTime, endTime, offset, multiplier };
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
            offset,
            multiplier,
          };
        }
      }
      return { startTime, endTime, offset, multiplier };
    }
  }
}
export function getNewZoomTime(
  startTime,
  endTime,
  offset,
  multiplier,
  noOfCSMovedLeft,
  dates
) {
  let prevStartTime = getObjtoStringTime(startTime);
  let prevEndTime = getObjtoStringTime(endTime);
  const prevStartIndex = dates[prevStartTime];
  const prevEndIndex = dates[prevEndTime];
  if (prevEndIndex === -1 || prevEndIndex + noOfCSMovedLeft < 0) {
    return { startTime, endTime, offset, multiplier };
  } else {
    const values = Object.keys(dates);
    let newEndTime = endTime;
    const noOfCS = prevStartIndex - (prevEndIndex + noOfCSMovedLeft);
    if (noOfCS < 10 || noOfCS > 2500) {
      return { startTime, endTime, offset, multiplier };
    }
    if (values[prevEndIndex + noOfCSMovedLeft] !== -1) {
      newEndTime = getTime(values[prevEndIndex + noOfCSMovedLeft]);
      if (!newEndTime || !newEndTime.Month) {
        newEndTime = endTime;
      }
    }
    return { startTime, endTime: newEndTime, offset, multiplier };
  }
}

export const updateXAxisConfig = (startTime, endTime, datesToIndex) => {
    const noOfDataPoints =
      datesToIndex[getObjtoStringTime(startTime)] -
      datesToIndex[getObjtoStringTime(endTime)];
    const widthOfOneCS = chartCanvasSize.peek().width / noOfDataPoints;
    xAxisConfig.value.noOfDataPoints = noOfDataPoints;
    xAxisConfig.value.widthOfOneCS = widthOfOneCS;
  };
  
