// draggableNode.js
import { useState } from "react";
import React from "react";
import { useSpring, animated } from "@react-spring/web";
import { springConfigs } from "./animationConfig";

export const DraggableNode = ({ type, label, icon, iconColor }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Spring animation for hover effect
  const springProps = useSpring({
    transform:
      isHovered && !isDragging
        ? "scale(1.05) translateY(-2px)"
        : "scale(1) translateY(0px)",
    boxShadow:
      isHovered && !isDragging
        ? "0 6px 12px rgba(0, 0, 0, 0.25)"
        : "0 2px 4px rgba(0, 0, 0, 0.15)",
    config: springConfigs.smooth,
  });

  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.target.style.cursor = "grabbing";
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(appData)
    );
    event.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const onDragEnd = (event) => {
    event.target.style.cursor = "grab";
    setIsDragging(false);
  };

  return (
    <animated.div
      className={type}
      onDragStart={(event) => onDragStart(event, type)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        minWidth: "70px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        borderRadius: "6px",
        backgroundColor: isHovered ? "#3d2f57" : "#2d1f47",
        border: isHovered ? "1px solid #a78bfa" : "1px solid #4f4860",
        justifyContent: "center",
        flexDirection: "column",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
        padding: "4px 6px",
        ...springProps,
      }}
      draggable
    >
      {icon && (
        <div
          style={{
            marginBottom: "3px",
            pointerEvents: "none",
            filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {typeof icon === "string" ? (
            <span style={{ fontSize: "22px" }}>{icon}</span>
          ) : (
            React.createElement(icon, {
              size: 22,
              strokeWidth: 2,
              style: { color: isHovered ? "#e9d5ff" : "#c4b5fd" },
            })
          )}
        </div>
      )}
      <span
        style={{
          color: "#e9d5ff",
          pointerEvents: "none",
          fontSize: "11px",
          fontWeight: "500",
          fontFamily: "var(--font-heading)",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>
    </animated.div>
  );
};
