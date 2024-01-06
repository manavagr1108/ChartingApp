import testData from "../data/testData.json";
export const intervalMap = {
    "1d": "1d",
    "1wk": "1W",
    "1mo": "1M",
}

export const TimeFrames = {
    Year: "Year",
    Month: "Month",
    Date: "Date",
    Hrs: "Hours",
    Min: "Minutes",
    Sec: "Seconds",
};

export function getDataPointsCount(startTime, endTime, interval, dates) {
    if (!dates) return 0;
    return noOfDays(startTime, endTime, dates) * intervalMap[interval];
}

export function noOfDays(startDate, endDate, dates) {
    let index1 = 0,
        index2 = 0;
    if (startDate.Date < 10) {
        const key =
            startDate.Year +
            (startDate.Month < 10 ? "-0" + startDate.Month : "-" + startDate.Month) +
            "-0" +
            startDate.Date;
        index1 = dates[key];
    } else {
        const key =
            startDate.Year +
            (startDate.Month < 10 ? "-0" + startDate.Month : "-" + startDate.Month) +
            "-" +
            startDate.Date;
        index1 = dates[key];
    }
    if (endDate.Date < 10) {
        const key =
            endDate.Year +
            (endDate.Month < 10 ? "-0" + endDate.Month : "-" + endDate.Month) +
            "-0" +
            endDate.Date;
        index2 = dates[key];
    } else {
        const key =
            endDate.Year +
            (endDate.Month < 10 ? "-0" + endDate.Month : "-" + endDate.Month) +
            "-" +
            endDate.Date;
        index2 = dates[key];
    }
    return Math.abs(index1 - index2) + 1;
}

export function getCSWidth(noOfDataPoints, canvasWidth) {
    return canvasWidth / noOfDataPoints;
}

export function getColumnWidth(canvasWidth, noOfColumns) {
    return canvasWidth / noOfColumns;
}

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

export function getCandleSticksMoved(scrollOffset, widthOfOneCS) {
    if (Math.abs(scrollOffset) > 25) {
        scrollOffset = 25 * (scrollOffset / Math.abs(scrollOffset));
    }
    const result = scrollOffset / widthOfOneCS;
    return Math.floor(result);
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

export function getNewScrollTime(startTime, endTime, offset, multiplier, widthOfOneCS, noOfPMoved, dates) {
    multiplier = noOfPMoved / Math.abs(noOfPMoved);
    if (offset + multiplier * noOfPMoved < widthOfOneCS) {
        offset += multiplier * noOfPMoved;
        return {
            startTime,
            endTime,
            offset,
            multiplier
        }
    } else {
        const noOfCSMoved = multiplier * Math.floor((offset + multiplier * noOfPMoved) / widthOfOneCS);
        offset = (offset + multiplier * noOfPMoved) % widthOfOneCS;
        let prevStartTime = startTime;
        let prevEndTime = endTime;
        prevStartTime = getObjtoStringTime(prevStartTime);
        prevEndTime = getObjtoStringTime(prevEndTime);
        const prevStartIndex = dates[prevStartTime];
        const prevEndIndex = dates[prevEndTime];
        if (prevStartIndex === -1 || prevEndIndex === -1 || prevStartIndex + noOfCSMoved >= dates.length || prevEndIndex + noOfCSMoved < 0) {
            return { startTime, endTime, offset, multiplier };
        } else {
            const values = Object.keys(dates);
            if (values[prevStartIndex + noOfCSMoved] !== -1 && values[prevEndIndex + noOfCSMoved] !== -1) {
                const newStartTime = getTime(values[prevStartIndex + noOfCSMoved]);
                const newEndTime = getTime(values[prevEndIndex + noOfCSMoved]);
                if (newStartTime && newEndTime && newStartTime.Month && newEndTime.Month) {
                    return { startTime: newStartTime, endTime: newEndTime, offset, multiplier };
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

export function getWeekDates(startDate, endDate) {
    const weekDates = [];
    let currentDate = new Date(
        endDate.Year + "-" + endDate.Month + "-" + endDate.Date
    );
    endDate = new Date(
        startDate.Year + "-" + startDate.Month + "-" + startDate.Date
    );
    let index = 0;
    while (currentDate <= endDate) {
        if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
            if (currentDate.getDate() < 10) {
                weekDates.push(
                    currentDate.getFullYear() +
                    "-" +
                    (currentDate.getMonth() < 9
                        ? "0" + (currentDate.getMonth() + 1)
                        : currentDate.getMonth() + 1) +
                    "-0" +
                    currentDate.getDate()
                );
            } else {
                weekDates.push(
                    currentDate.getFullYear() +
                    "-" +
                    (currentDate.getMonth() < 9
                        ? "0" + (currentDate.getMonth() + 1)
                        : currentDate.getMonth() + 1) +
                    "-" +
                    currentDate.getDate()
                );
            }
            index += 1;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    Object.values(testData).forEach((date) => {
        let index = weekDates.indexOf(date.date);
        if (index != -1) {
            weekDates.splice(index, 1);
        }
    });
    return weekDates;
}
export function getFirstMonthStart(startTime, dates) {
    let index = 1;
    while (true) {
        let result =
            startTime.Year +
            (startTime.Month < 10 ? "-0" + startTime.Month : "-" + startTime.Month) +
            "-0" +
            index;
        if (dates.includes(result)) {
            return getTime(result);
        }
        index += 1;
    }
}
