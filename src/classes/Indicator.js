import { signal } from "@preact/signals-react";

class Indicator{
    constructor(ChartWindow){
        this.indicatorOptions = signal({});
        this.ChartWindow = ChartWindow;
    }
}

export default Indicator;