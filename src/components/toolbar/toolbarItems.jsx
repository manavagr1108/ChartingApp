import React, { useState } from "react";
import { BiCross } from "react-icons/bi";
import {
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdOutlineHorizontalSplit,
} from "react-icons/md";
import { FaArrowPointer } from "react-icons/fa6";
import { cursorConfig } from "../../signals/toolbarSignals";
import { useOutsideClick } from "../navbar/navbar";
import { PiLineSegmentFill } from "react-icons/pi";

function ToolItems({
  toogleToolItemsIndex,
  setToogleToolItemsIndex,
  items,
  onClickHandler,
  mode,
}) {
  const outsideClickRef = useOutsideClick(() => setToogleToolItemsIndex(-1));
  return (
    <div
      ref={outsideClickRef}
      className={`absolute left-[100%] top-[0px] w-max mx-3 gap-y-1 shadow-md flex flex-col ${
        mode === "Light" ? "bg-gray-300 text-black" : "bg-gray-700 text-white"
      } z-10 cursor-pointer rounded-md`}
    >
      {items[toogleToolItemsIndex].toolItemsEle.map((item, index) => {
        return (
          <div
            key={index}
            onClick={() => onClickHandler(index)}
            className="flex items-center px-2 py-1 justify-start hover:bg-blue-300 w-full rounded-md"
          >
            <>
              {item} {items[toogleToolItemsIndex].toolLabels[index]}
            </>
          </div>
        );
      })}
    </div>
  );
}

function ToolbarItems({ mode, ChartWindow }) {
  const [toogleToolItemsIndex, setToogleToolItemsIndex] = useState(-1);
  const { drawChartObjects, selectedTool, selectedToolItem, selectedCursor } =
    ChartWindow;
  function cursorOnClickHandler(index) {
    drawChartObjects.peek().forEach((drawChartObject) => {
      const canvas = drawChartObject.ChartRef.current[1];
      canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
      canvas.classList.add(`cursor-${cursorConfig[index]}`);
    });
    setToogleToolItemsIndex(-1);
    selectedTool.value = items[0].toolName;
    selectedToolItem.value = index;
    selectedCursor.value = index;
  }
  function linesOnClickHandler(index) {
    setToogleToolItemsIndex(-1);
    selectedTool.value = items[1].toolName;
    selectedToolItem.value = index;
  }
  function fibOnClickHandler(index) {
    setToogleToolItemsIndex(-1);
    selectedTool.value = items[2].toolName;
    selectedToolItem.value = index;
  }
  const items = [
    {
      toolName: "Cursor",
      toolItemsEle: [
        <BiCross color={`${mode === "Light" ? "black" : "white"}`} size={20} />,
        <FaArrowPointer
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
      ],
      toolLabels: ["Cross", "Arrow"],
      onClickFunction: cursorOnClickHandler,
    },
    {
      toolName: "Line",
      toolItemsEle: [
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <PiLineSegmentFill
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
      ],
      toolLabels: [
        "Trend Line",
        "Ray",
        "Info Line",
        "Extended Line",
        "Trend Angle",
        "Horizontal Line",
        "Horizontal Ray",
        "Vertical Line",
        "Cross Line",
        "Parallel Channel",
        "Flat Top/Bottom",
      ],
      onClickFunction: linesOnClickHandler,
    },
    {
      toolName: "Fib",
      toolItemsEle: [
        <MdOutlineHorizontalSplit
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <MdOutlineHorizontalSplit
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <MdOutlineHorizontalSplit
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <MdOutlineHorizontalSplit
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
        <MdOutlineHorizontalSplit
          color={`${mode === "Light" ? "black" : "white"}`}
          size={20}
        />,
      ],
      toolLabels: [
        "Fibonacci Retracement",
        "Trend Based Fibonacci Retracement",
        "Fib Channel",
        "Fib Time Zone",
        "Trend-Based Fib Time",
      ],
      onClickFunction: fibOnClickHandler,
    },
  ];
  return (
    <div className="flex flex-col w-full justify-start relative">
      {items.map((item, index) => {
        return (
          <div className="relative" key={index}>
            <div
              className={`${
                mode === "Light" ? "hover:bg-gray-300" : "hover:bg-gray-700"
              } flex p-[0.3rem] peer/item rounded-md`}
            >
              {selectedTool.peek() === item.toolName
                ? items[index].toolItemsEle[selectedToolItem.peek()]
                : items[index].toolItemsEle[0]}
            </div>
            <div
              onClick={() =>
                toogleToolItemsIndex === -1
                  ? setToogleToolItemsIndex(index)
                  : setToogleToolItemsIndex(-1)
              }
              className={`hidden peer-hover/item:block hover:block justify-start items-start absolute left-[90%] top-[0px] py-2 w-[40%] ${
                mode === "Light" ? "hover:bg-gray-300" : "hover:bg-gray-700"
              } rounded-l-md`}
            >
              {toogleToolItemsIndex === -1 ? (
                <MdKeyboardArrowRight
                  color={`${mode === "Light" ? "black" : "white"}`}
                  size={15}
                />
              ) : (
                <MdKeyboardArrowLeft
                  color={`${mode === "Light" ? "black" : "white"}`}
                  size={15}
                />
              )}
            </div>
            {toogleToolItemsIndex === index && (
              <ToolItems
                toogleToolItemsIndex={toogleToolItemsIndex}
                setToogleToolItemsIndex={setToogleToolItemsIndex}
                items={items}
                onClickHandler={item.onClickFunction}
                mode={mode}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ToolbarItems;
