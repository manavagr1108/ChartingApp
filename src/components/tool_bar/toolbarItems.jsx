import React, { useState } from "react";
import { BiCross } from "react-icons/bi";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { FaArrowPointer } from "react-icons/fa6";
import { cursorConfig, selectedCursor, selectedLine } from "../../signals/toolbarSignals";
import { useOutsideClick } from "../nav_bar/nav_bar";
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
  const { drawChartObjects } = ChartWindow;
  function cursorOnClickHandler(index) {
    drawChartObjects.peek().forEach((drawChartObject) => {
      console.log(drawChartObject);
      const canvas = drawChartObject.ChartRef.current[1];
      canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
      canvas.classList.add(`cursor-${cursorConfig[index]}`);
    });
    setToogleToolItemsIndex(-1);
    if(selectedLine.peek() !== -1){
      selectedLine.value = -1;
    }
    selectedCursor.value = index;
  }
  function linesOnClickHandler(index) {
    setToogleToolItemsIndex(-1);
    selectedLine.value = index;
  }
  const items = [
    {
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
      ],
      toolLabels: ["Trend Line", "Ray", "Info Line", "Extended Line"],
      onClickFunction: linesOnClickHandler,
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
              {items[index].toolItemsEle[selectedCursor]}
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
