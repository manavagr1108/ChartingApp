import { useEffect, useRef } from "react";
import ChartWindow from "../classes/ChartWindow";
import useDrawChart from "./useDrawChart";
import {
  xAxisMouseDown,
  xAxisMouseMove,
  xAxisMouseUp,
} from "../utility/xAxisUtils";
import { batch } from "@preact/signals-react";

export const useCanavsSplitRef = () => {
  const ref = useRef([]);
  ref.current = ref.current.slice(0, 2);
  return ref;
};

const useChartWindow = (mode) => {
  const state = new ChartWindow();
  const mainChartObject = useDrawChart(state, false, mode);
  state.xAxisRef = useCanavsSplitRef();
  state.drawChartObjects.value.push(mainChartObject);
  batch(() => {
    if( JSON.parse(localStorage.getItem("stockData")) !== null && localStorage.getItem("selectedStock") !== null) {
      state.selectedStock.value = localStorage.getItem("selectedStock")
      state.stockData.value = JSON.parse(localStorage.getItem("stockData"))
    }
  })
  useEffect(() => {
    state.setXAxisCanvas();
    window.addEventListener("resize", state.setXAxisCanvas());
    state.xAxisRef.current[1].addEventListener("mousedown", (e) =>
      xAxisMouseDown(e, state)
    );
    window.addEventListener("mousemove", (e) => xAxisMouseMove(e, state));
    window.addEventListener("mouseup", (e) => xAxisMouseUp(e, state));
    return () => {
      window.removeEventListener("resize", state.setXAxisCanvas());
      window.removeEventListener("mousemove", (e) => xAxisMouseMove(e, state));
      window.removeEventListener("mouseup", (e) => xAxisMouseUp(e, state));
    };
  });
  return state;
};

export default useChartWindow;
