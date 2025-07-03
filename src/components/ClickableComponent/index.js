import React, { useState } from "react";

const ClickableComponent = ({ children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleClick = (event) => {
    setPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <div onClick={handleClick}>
      {React.cloneElement(children, { position })}
    </div>
  );
};

export default ClickableComponent;