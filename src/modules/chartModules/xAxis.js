import { xAxisConfig, intervalMap, TimeFrames } from "../../config/chartConfig";
import { monthMap } from "../../data/TIME_MAP";


class Xaxis {
    constructor(){}
    draw(canvasWidth, canvasHeight, interval, startTime, endTime, context, margin){
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.interval = interval;
        this.margin = margin;
        this.noOfDataPoints = this.getDataPointsCount();
        this.noOfColumns = xAxisConfig.columns;
        this.widthOfOneCS = this.getCSWidth();
        this.startTime = this.getTime(startTime);
        this.endTime = this.getTime(endTime);
        if(this.interval === intervalMap["1m"]){

        } else if(this.interval === intervalMap["1h"]){

        } else {
            console.log(this);
            let currentMonth = this.startTime.Month;
            let currentYear = this.startTime.Year;
            for(let i = 0 ; i < this.noOfColumns; i++){
                if(currentMonth === 0){
                    console.log(currentYear);
                    context.fillText(currentYear, this.canvasWidth - (i+1)*this.getColumnWidth(), this.canvasHeight-this.margin);
                    currentYear-=1;
                }
                else{
                    console.log(monthMap[currentMonth]);
                    context.fillText(monthMap[currentMonth], this.canvasWidth - (i+1)*this.getColumnWidth(), this.canvasHeight-this.margin);
                }
                currentMonth = (currentMonth - 1 + 12)%12;
            }
        }
    }

    getDataPointsCount() {
       return this.noOfDays(this.startTime, this.endTime) * intervalMap[this.interval];
    }

    noOfDays(startTime, endTime){
        return 251;
    }

    getCSWidth(){
        return this.noOfDataPoints/(this.noOfColumns * this.getColumnWidth())
    }

    getColumnWidth(){
        return this.canvasWidth / this.noOfColumns;
    }

    getTime(time){
        const TIME = new Date(time);
        const result = {};
        result[`${TimeFrames.Year}`] = TIME.getFullYear();
        result[`${TimeFrames.Month}`] = TIME.getMonth();
        result[`${TimeFrames.Date}`] = TIME.getDate();
        result[`${TimeFrames.Hrs}`] = TIME.getHours();
        result[`${TimeFrames.Min}`] = TIME.getMinutes();
        result[`${TimeFrames.Sec}`] = TIME.getSeconds();
        return result;
    }
};

export default Xaxis;