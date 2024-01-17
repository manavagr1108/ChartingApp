import { useEffect, useRef } from "react";
import ChartWindow from "../classes/ChartWindow"
import DrawChart from "../classes/DrawChart";
import useDrawChart from "./useDrawChart";
import { xAxisMouseDown, xAxisMouseMove, xAxisMouseUp } from "../utility/xAxisUtils";

export const useCanavsSplitRef = () => {
  const ref = useRef([]);
  ref.current = ref.current.slice(0,2);
  return ref;
}

const useChartWindow = (mode) => {
  const state = new ChartWindow();
  const mainChartObject = useDrawChart(state, false, mode);
  state.xAxisRef = useCanavsSplitRef();
  state.drawChartObjects.value.push(mainChartObject);
  useEffect(() => {
    state.setXAxisCanvas();
    window.addEventListener("resize", state.setXAxisCanvas());
    console.log(state.xAxisRef);
    state.xAxisRef.current[1].addEventListener("mousedown", (e) =>
      xAxisMouseDown(e, state)
    );
    window.addEventListener("mousemove", (e) =>
      xAxisMouseMove(e, state)
    );
    window.addEventListener("mouseup", (e) =>
      xAxisMouseUp(e, state)
    );
    return () => {
      window.removeEventListener("resize", state.setXAxisCanvas());
      // xAxisRef.current[1].removeEventListener("mousedown", (e) =>
      //   xAxisMouseDown(e, state)
      // );
      window.removeEventListener("mousemove", (e) =>
        xAxisMouseMove(e, state)
      );
      window.removeEventListener("mouseup", (e) =>
        xAxisMouseUp(e, state)
      );
    };
  });
  return state;
}

export default useChartWindow;