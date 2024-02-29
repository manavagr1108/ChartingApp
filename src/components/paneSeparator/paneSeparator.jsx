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
    <div className="w-full relative cursor-ns-resize h-[1px] bg-gray-400">
      <div
        size="xs"
        className={`w-full absolute h-[9px] top-[-4px] hover:border-y-[4px] hover:border-gray-300`}
        onMouseDown={(e) => setCharts(e)}
      ></div>
    </div>
  );
}

export default PaneSeparator;
