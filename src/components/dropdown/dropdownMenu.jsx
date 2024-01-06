import React from "react";

function dropdownMenu({ children, toggleVal }) {
  return (
    <div
      className={
        toggleVal !== ""
          ? "absolute flex flex-col items-start z-10 bg-gray-100 top-10 w-[300px] h-fit max-h-[300px] overflow-y-auto"
          : "hidden"
      }
    >
      {children}
    </div>
  );
}

export default dropdownMenu;
