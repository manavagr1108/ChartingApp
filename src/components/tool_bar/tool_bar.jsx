import React from "react";
import ToolbarItems from "./toolbarItems";

function ToolBar({ mode }) {
  return (
    <div
      className={`flex flex-col w-full justify-start items-center border-b-2 ${
        mode === "Light"
          ? "border-gray-300 bg-gray-100"
          : "border-gray-800  bg-gray-900"
      }`}
    >
      <div className="flex items-center justify-start group relative mt-1">
        <ToolbarItems mode={mode} />
      </div>
    </div>
  );
}

export default ToolBar;
