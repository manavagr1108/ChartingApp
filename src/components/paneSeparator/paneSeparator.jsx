import React, { useEffect } from "react";

function PaneSeparator({ mode, ChartWindow, index }) {
  let initialVal = 0;
  function setCharts(e) {
    initialVal = e.pageY;
  }
  function updateValue(e) {
    if (initialVal !== 0) {
      const objs = ChartWindow.drawChartObjects.peek();
      const upperScreen = objs[index].ChartRef;
      const lowerScreen = objs[index + 1].ChartRef;
      const diff = e.pageY - initialVal;
      if (diff !== 0) {
        const currentUp =
          upperScreen.current[1].parentElement.parentElement.getBoundingClientRect();
        const currentLow =
          lowerScreen.current[1].parentElement.parentElement.getBoundingClientRect();
        if (currentUp.height + diff >= 100 && currentLow.height - diff >= 100) {
          upperScreen.current[1].parentElement.parentElement.style.height =
            currentUp.height + diff + "px";
          lowerScreen.current[1].parentElement.parentElement.style.height =
            currentLow.height - diff + "px";
        }
      }
      initialVal = e.pageY;
    }
  }
  function resetValue() {
    initialVal = 0;
    const objs = ChartWindow.drawChartObjects.peek();
    const upperScreen = objs[index].ChartRef;
    const lowerScreen = objs[index + 1].ChartRef;
    objs[index].setCanvasSize(upperScreen.current[1]);
    objs[index + 1].setCanvasSize(lowerScreen.current[1]);
  }
  useEffect(() => {
    window.addEventListener("mousemove", (e) => updateValue(e));
    window.addEventListener("mouseup", (e) => resetValue());
    return () => {
      window.removeEventListener("mousemove", (e) => updateValue(e));
      window.removeEventListener("mouseup", (e) => resetValue());
    };
  });
  return (
    <div
      className={`${mode !== "Light" ? "bg-gray-300" : "bg-gray-700"} relative h-[1px] w-full cursor-ns-resize`}
      onMouseDown={(e) => setCharts(e)}
    >
      <div className="absolute top-[-2px] left-0 h-[4px] w-full bg-gray-30 z-10"></div>
    </div>
  );
}

export default PaneSeparator;
