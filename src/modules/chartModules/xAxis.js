import { xAxisConfig, intervalMap, TimeFrames } from "../../config/chartConfig";
import { monthMap } from "../../data/TIME_MAP";
import testData from "../../testData.json";

class Xaxis {
  constructor() {
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.interval = 0;
    this.margin = 0;
    this.noOfDataPoints = 0;
    this.noOfColumns = 0;
    this.widthOfOneCS = 0;
    this.startTime = {};
    this.endTime = {};
  }

  draw(
    canvasWidth,
    canvasHeight,
    interval,
    startTime,
    endTime,
    context,
    margin,
    scrollOffset
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.interval = interval;
    this.margin = margin;

    if (this.startTime == {} || this.endTime == {}) {
      this.startTime = this.getTime(startTime);
      this.endTime = this.getTime(endTime);
    }
    // else {
    //   const noOfCSMoved = this.getCandleSticksMoved(scrollOffset);
    //   this.startTime = this.getNewTime(this.startTime, noOfCSMoved);
    //   this.endTime = this.getNewTime(this.endTime, -noOfCSMoved);
    // }

    this.noOfDataPoints = this.getDataPointsCount(this.startTime, this.endTime);
    this.noOfColumns = xAxisConfig.columns;
    this.widthOfOneCS = this.getCSWidth();

    if (this.interval === intervalMap["1m"]) {
    } else if (this.interval === intervalMap["1h"]) {
    } else {
      let currentMonth = this.startTime.Month;
      let currentYear = this.startTime.Year;
      let firstMonthStart = this.getTime("2023-12-01");
      const firstMonthCSCount = this.getDataPointsCount(
        firstMonthStart,
        this.startTime
      );
      for (let i = 0; i < this.noOfColumns; i++) {
        if (currentMonth === 0) {
          console.log(currentYear);
          context.fillText(
            currentYear,
            this.canvasWidth - (i + 1) * this.getColumnWidth(),
            this.canvasHeight - this.margin
          );
          currentYear -= 1;
        } else {
          //   console.log(monthMap[currentMonth]);
          context.fillText(
            monthMap[currentMonth],
            this.canvasWidth -
              this.margin -
              (this.getCSWidth() * firstMonthCSCount - this.getCSWidth() / 2) -
              i * this.getColumnWidth(),
            this.canvasHeight - this.margin
          );
        }
        currentMonth = (currentMonth - 1 + 12) % 12;
      }
    }
    this.getWeekDates(this.startTime, this.endTime);
  }

  getDataPointsCount(startTime, endTime) {
    return this.noOfDays(startTime, endTime) * intervalMap[this.interval];
  }

  noOfDays(startTime, endTime) {
    return 251;
  }

  getCSWidth() {
    return this.noOfDataPoints / (this.noOfColumns * this.getColumnWidth());
  }

  getColumnWidth() {
    return this.canvasWidth / this.noOfColumns;
  }

  getTime(time) {
    const TIME = new Date(time);
    console.log(TIME, " ---", time);
    const result = {};
    result[`${TimeFrames.Year}`] = TIME.getFullYear();
    result[`${TimeFrames.Month}`] = TIME.getMonth();
    result[`${TimeFrames.Date}`] = TIME.getDate();
    result[`${TimeFrames.Hrs}`] = TIME.getHours();
    result[`${TimeFrames.Min}`] = TIME.getMinutes();
    result[`${TimeFrames.Sec}`] = TIME.getSeconds();
    return result;
  }

  getCandleSticksMoved(scrollOffset) {
    return scrollOffset / this.widthOfOneCS;
  }

  getNewTime(time, noOfCSMoved) {}

  getWeekDates(startDate, endDate) {
    const weekDates = [];
    let currentDate = new Date(startDate);

    // Iterate over each day
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay()); // Set to the first day of the week

      const weekEnd = new Date(currentDate);
      weekEnd.setDate(currentDate.getDate() + (6 - currentDate.getDay())); // Set to the last day of the week
      weekDates.push(weekStart.toISOString().slice(0, 10));

      // Move to the next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    Object.values(testData).forEach((date) => {
      console.log(date.date);
      if (weekDates.includes(date.date)) {
        weekDates.pop(date.date);
      }
    });
    return weekDates;
  }
}

export default Xaxis;
