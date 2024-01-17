import { signal } from "@preact/signals-react";

class Indicator{
    constructor(){
        this.indicatorOptions = signal({
            color: "",
            stroke: 0,
            period: 0,
            label: "",
            isChartRequired: true,
        });
        
        this.drawChart= {};
    }
}