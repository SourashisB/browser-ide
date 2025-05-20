import React, { useRef, useState } from "react";

type Props = {
  direction: "horizontal" | "vertical";
  minSize?: number;
  maxSize?: number;
  initialSize?: number;
  children: [React.ReactNode, React.ReactNode];
};

const ResizablePane: React.FC<Props> = ({
  direction,
  minSize = 100,
  maxSize = 800,
  initialSize = 300,
  children
}) => {
  const [size, setSize] = useState(initialSize);
  const dragging = useRef(false);

  const onMouseDown = () => { dragging.current = true; };
  const onMouseUp = () => { dragging.current = false; };
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    if (direction === "vertical") {
      let newSize = e.clientY;
      if (newSize < minSize) newSize = minSize;
      if (newSize > maxSize) newSize = maxSize;
      setSize(newSize);
    } else {
      let newSize = e.clientX;
      if (newSize < minSize) newSize = minSize;
      if (newSize > maxSize) newSize = maxSize;
      setSize(newSize);
    }
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });

  if (direction === "vertical") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ height: size, minHeight: minSize, maxHeight: maxSize, flexShrink: 0 }}>
          {children[0]}
        </div>
        <div
          style={{
            height: 6,
            background: "#444",
            cursor: "row-resize",
            width: "100%",
            zIndex: 10,
          }}
          onMouseDown={onMouseDown}
        />
        <div style={{ flex: 1, minHeight: minSize }}>
          {children[1]}
        </div>
      </div>
    );
  } else {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row" }}>
        <div style={{ width: size, minWidth: minSize, maxWidth: maxSize, flexShrink: 0 }}>
          {children[0]}
        </div>
        <div
          style={{
            width: 6,
            background: "#444",
            cursor: "col-resize",
            height: "100%",
            zIndex: 10,
          }}
          onMouseDown={onMouseDown}
        />
        <div style={{ flex: 1, minWidth: minSize }}>
          {children[1]}
        </div>
      </div>
    );
  }
};

export default ResizablePane;