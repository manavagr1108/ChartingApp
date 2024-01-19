import React from "react";

function PaneSeparator({ mode, ChartWindow }) {
  // todo add code to resize canvases`
  return (
    <div
      className={`${mode !== "Light" ? "bg-gray-300" : "bg-gray-700"} h-[1px] w-full`}
    ></div>
  );
}

export default PaneSeparator;
