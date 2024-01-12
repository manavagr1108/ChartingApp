import React, { useState } from "react";
import { BiCross } from "react-icons/bi";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { FaArrowPointer } from "react-icons/fa6";
import { cursorConfig, selectedCursor } from "../../signals/toolbarSignals";
import { useOutsideClick } from "../nav_bar/nav_bar";

function ToolItems({
  toogleToolItemsIndex,
  setToogleToolItemsIndex,
  items,
  onClickHandler,
  mode
}) {
  const outsideClickRef = useOutsideClick(() => setToogleToolItemsIndex(-1));
  return (
    <div
      ref={outsideClickRef}
      className={`absolute left-[100%] mx-2 gap-y-1 shadow-md flex flex-col ${
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

function ToolbarItems({ mode }) {
  const [toogleToolItemsIndex, setToogleToolItemsIndex] = useState(-1);
  function cursorOnClickHandler(index) {
    const canvas = document.querySelectorAll("canvas")[1];
    canvas.classList.remove(`cursor-${cursorConfig[selectedCursor.value]}`);
    canvas.classList.add(`cursor-${cursorConfig[index]}`);
    setToogleToolItemsIndex(-1);
    selectedCursor.value = index;
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
  ];
  return (
    <div className="flex w-full justify-start relative">
      {items.map((item, index) => {
        return (
          <div key={index}>
            <div
              className={`${
                mode === "Light" ? "hover:bg-gray-300" : "hover:bg-gray-700"
              } p-[0.3rem] group rounded-md`}
            >
              {items[index].toolItemsEle[selectedCursor]}
            </div>
            <div
              onClick={() =>
                toogleToolItemsIndex === -1
                  ? setToogleToolItemsIndex(index)
                  : setToogleToolItemsIndex(-1)
              }
              className={`flex hidden group-hover:block justify-start items-start absolute left-[90%] py-2 w-[40%] ${
                mode === "Light" ? "hover:bg-gray-300" : "hover:bg-gray-700"
              } rounded-l-md top-[50%] translate-y-[-50%]`}
            >
              {toogleToolItemsIndex === -1 ? (
                <MdKeyboardArrowRight color={`${mode === "Light" ? "black" : "white"}`} size={15} />
              ) : (
                <MdKeyboardArrowLeft color={`${mode === "Light" ? "black" : "white"}`} size={15} />
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
