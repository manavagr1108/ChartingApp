import { useEffect, useRef } from "react";
import ChartWindow from "../classes/ChartWindow";
import useDrawChart from "./useDrawChart";
import {
  xAxisMouseDown,
  xAxisMouseMove,
  xAxisMouseUp,
} from "../utility/xAxisUtils";
import { updateCursorValue } from "../utility/chartUtils";
import { effect } from "@preact/signals-react";
import { getStocksList } from "../utility/stockApi";

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
  effect(() => {
    if (
      state.dateCursor.value !== null &&
      state.dateCursor.peek().x !== null &&
      state.dateCursor.peek().y !== null &&
      state.xAxisRef.current[1] !== undefined
    ) {
      updateCursorValue(state, mode);
    }
  });
  useEffect(async () => {
    if (localStorage.getItem("stocksList") === null) {
      const stocksList = await getStocksList();
      state.stocksList.value = stocksList;
      localStorage.setItem("stocksList", JSON.stringify(stocksList));
    } else {
      const stocksList = localStorage.getItem("stocksList");
      state.stocksList.value = JSON.parse(stocksList).stocksList;
    }
    console.log(state.stocksList.value);
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
