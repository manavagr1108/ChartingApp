import testData from "../data/testData.json"
export const intervalMap = {
    "1m": 375,
    "1h": 6.25,
    "1d": 1,
}

export const TimeFrames = {
    Year: "Year",
    Month: "Month",
    Date: "Date",
    Hrs: "Hours",
    Min: "Minutes",
    Sec: "Seconds",
}

export function getDataPointsCount(startTime, endTime, interval, dates) {
    return noOfDays(startTime, endTime, dates) * intervalMap[interval];
}

export function noOfDays(startDate, endDate, dates) {
    let index1, index2;
    if(startDate.Date < 10){
        index1 = dates.indexOf(startDate.Year + "-" + startDate.Month + "-0" + startDate.Date);
    }else{
        index1 = dates.indexOf(startDate.Year + "-" + startDate.Month + "-" + startDate.Date);
    }
    if(endDate.Date < 10){
        index2 = dates.indexOf(endDate.Year + "-" + endDate.Month + "-0" + endDate.Date);
    } else{
        index2 = dates.indexOf(endDate.Year + "-" + endDate.Month + "-" + endDate.Date);
    }
    return Math.abs(index1 - index2) + 1;
}

export function getCSWidth(noOfDataPoints, noOfColumns, canvasWidth) {
    return noOfDataPoints / (noOfColumns * getColumnWidth(canvasWidth, noOfColumns));
}

export function getColumnWidth(canvasWidth, noOfColumns) {
    return canvasWidth / noOfColumns;
}

export function getTime(time) {
    const TIME = new Date(time);
    const result = {};
    result[`${TimeFrames.Year}`] = TIME.getFullYear();
    result[`${TimeFrames.Month}`] = TIME.getMonth()+1;
    result[`${TimeFrames.Date}`] = TIME.getDate();
    result[`${TimeFrames.Hrs}`] = TIME.getHours();
    result[`${TimeFrames.Min}`] = TIME.getMinutes();
    result[`${TimeFrames.Sec}`] = TIME.getSeconds();
    return result;
}

export function getCandleSticksMoved(scrollOffset, widthOfOneCS) {
    const result = scrollOffset / widthOfOneCS;
    return Math.floor(result/2);
}

export function getObjtoStringTime(time){
    let result = new Date(time.Year + "-" + time.Month + "-" + time.Date);
    if(time.Date < 10){
        result = result.getFullYear() + '-' + (result.getMonth()+1) + '-0' + result.getDate();
    } else {
        result = result.getFullYear() + '-' + (result.getMonth()+1) + '-' + result.getDate();
    }
    return result;
}

// rename the func
export function getNewTime(time, noOfCSMoved, dates) {
    const prevTime = time;
    time = getObjtoStringTime(time);
    const currInd = dates.indexOf(time) === -1 ? dates.length : dates.indexOf(time);
    return getTime(dates[currInd + noOfCSMoved]).Date ? getTime(dates[currInd + noOfCSMoved]) : prevTime;
}

export function getWeekDates(startDate, endDate) {
    const weekDates = [];
    let currentDate = new Date(endDate.Year + "-" + endDate.Month + "-" + endDate.Date);
    endDate = new Date(startDate.Year + "-" + startDate.Month + "-" + startDate.Date);
    let index = 0;
    while (currentDate <= endDate) {
        if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
            if(currentDate.getDate() < 10){
                weekDates.push(currentDate.getFullYear() + '-' + (currentDate.getMonth()+1) + '-0' + currentDate.getDate());
            }else{
                weekDates.push(currentDate.getFullYear() + '-' + (currentDate.getMonth()+1) + '-' + currentDate.getDate());
            }
            index += 1;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    Object.values(testData).forEach((date) => {
        let index = weekDates.indexOf(date.date);
        if (index!= -1) {
            weekDates.splice(index, 1);
        }
    });
    return weekDates;
}
export function getFirstMonthStart(startTime, dates) {
    let index = 1;
    while (true) {
        let result = startTime.Year + "-" + startTime.Month + "-0" + index;
        if (dates.includes(result)) {
            return getTime(result);
        }
        index += 1;
    }
}