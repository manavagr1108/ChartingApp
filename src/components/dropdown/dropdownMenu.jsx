import React, { useState } from "react";
import { useOutsideClick } from "../navbar/navbar";

function DropdownMenuItems({ itemKey, itemValue, stateToBeUpdated, mode }) {
  return (
    <div
      className={`w-full ${
        mode === "Light"
          ? "hover:bg-gray-300 hover:text-gray-800"
          : "hover:bg-gray-200 hover:text-gray-900"
      } px-2 py-1`}
      value={itemValue}
      key={itemKey}
      onClick={() => (stateToBeUpdated.value = itemKey)}
    >
      {itemValue}
    </div>
  );
}

function DropdownMenu({ menuList, stateToBeUpdated, mode }) {
  const [toogleMenu, setToogleMenu] = useState(false);
  const checkOutsideClick = useOutsideClick(() => setToogleMenu(false));
  return (
    <button
      ref={checkOutsideClick}
      onClick={() => setToogleMenu(!toogleMenu)}
      className={`relative m-1 p-2 ${
        mode === "Light"
          ? "hover:bg-gray-200 text-gray-600"
          : "hover:bg-gray-800 text-gray-200"
      } rounded-md `}
    >
      {menuList[stateToBeUpdated.peek()]}
      {
        <div
          className={
            toogleMenu
              ? `absolute shadow-md rounded-lg cursor-pointer flex flex-col items-start z-10 ${
                  mode === "Light" ? "bg-gray-100" : "bg-gray-800"
                } top-10 left-[-2px] w-fit h-fit max-h-[300px] overflow-y-auto`
              : "hidden"
          }
        >
          {Object.keys(menuList).map((key) => {
            return (
              <DropdownMenuItems
                key={key}
                itemKey={key}
                itemValue={menuList[key]}
                stateToBeUpdated={stateToBeUpdated}
                mode={mode}
              />
            );
          })}
        </div>
      }
    </button>
  );
}

export default DropdownMenu;
