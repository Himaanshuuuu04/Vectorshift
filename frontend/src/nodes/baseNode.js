// baseNode.js
// Reusable base component for creating nodes with consistent structure
// Supports dynamic handles, custom fields, and flexible styling

import { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { useStore } from "../store";
import { useSpring, animated, config } from "@react-spring/web";
import { springConfigs, animationPresets, timing } from "../animationConfig";
import { X } from "lucide-react";

/**
 * AnimatedHandle - Smooth animated handle component with springy bounce
 */
const AnimatedHandle = ({ index, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleSpring = useSpring({
    from: { scale: 0, opacity: 0, rotate: -180 },
    to: { scale: 1, opacity: 1, rotate: 0 },
    delay: timing.staggerDelay(index, 60),
    config: springConfigs.wobbly,
  });

  const hoverSpring = useSpring({
    scale: isHovered ? 1.4 : 1,
    rotate: isHovered ? 360 : 0,
    config: springConfigs.bouncy,
  });

  const AnimatedHandleComponent = animated(Handle);

  return (
    <AnimatedHandleComponent
      {...props}
      style={{
        ...props.style,
        transform: handleSpring.scale.to(
          (s) =>
            `scale(${s * hoverSpring.scale.get()}) rotate(${
              handleSpring.rotate.get() + hoverSpring.rotate.get()
            }deg)`
        ),
        opacity: handleSpring.opacity,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
};

/**
 * DeleteButton - Animated delete button component with springy rotation
 */
const DeleteButton = ({ onClick, style }) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonSpring = useSpring({
    transform: isHovered ? "scale(1.2) rotate(90deg)" : "scale(1) rotate(0deg)",
    background: isHovered ? "#a78bfa" : "#7c3aed",
    boxShadow: isHovered
      ? "0 0 20px rgba(167, 139, 250, 0.6)"
      : "0 2px 4px rgba(0, 0, 0, 0.3)",
    config: springConfigs.bouncy,
  });

  return (
    <animated.button
      onClick={onClick}
      style={{ ...style, ...buttonSpring }}
      title="Delete node"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <X size={14} strokeWidth={2.5} style={{ display: "block" }} />
    </animated.button>
  );
};

/**
 * BaseNode - A flexible abstraction for creating React Flow nodes
 *
 * @param {Object} props - Component props
 * @param {string} props.id - Unique node identifier
 * @param {Object} props.data - Node data and configuration
 * @param {string} props.data.nodeType - Type of node (for display)
 * @param {Object} props.config - Node configuration object
 */
export const BaseNode = ({ id, data, config }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const [nodeState, setNodeState] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Springy bounce animation for node appearance - more playful and dynamic
  const nodeSpring = useSpring({
    from: {
      opacity: 0,
      transform: "scale(0.3) rotate(-5deg)",
      y: -50,
    },
    to: {
      opacity: 1,
      transform: "scale(1) rotate(0deg)",
      y: 0,
    },
    config: config.springConfig || springConfigs.wobbly,
  });

  // Hover animation for elevation and glow effect
  const hoverSpring = useSpring(
    isHovered ? animationPresets.hoverLift : animationPresets.hoverRest
  );

  // Delete animation
  const deleteSpring = useSpring({
    opacity: isDeleting ? 0 : 1,
    transform: isDeleting
      ? "scale(0.5) rotate(10deg)"
      : "scale(1) rotate(0deg)",
    config: springConfigs.stiff,
    onRest: () => {
      if (isDeleting) {
        deleteNode(id);
      }
    },
  });

  // Initialize state from data or defaults
  useEffect(() => {
    const initialState = {};
    if (config.fields) {
      config.fields.forEach((field) => {
        initialState[field.name] = data[field.name] ?? field.defaultValue ?? "";
      });
    }
    setNodeState(initialState);
  }, []);

  // Handle field changes and update global store
  const handleFieldChange = (fieldName, value) => {
    setNodeState((prev) => ({ ...prev, [fieldName]: value }));
    updateNodeField(id, fieldName, value);

    // If there's a custom onChange handler, call it
    const field = config.fields?.find((f) => f.name === fieldName);
    if (field?.onChange) {
      field.onChange(value, nodeState, updateNodeField, id);
    }
  };

  // Render input handles (left side - targets)
  const renderInputHandles = () => {
    if (!config.inputs || config.inputs.length === 0) return null;

    return config.inputs.map((input, index) => {
      const totalInputs = config.inputs.length;
      const topPosition =
        totalInputs === 1 ? 50 : (100 / (totalInputs + 1)) * (index + 1);

      return (
        <AnimatedHandle
          key={input.id || `input-${index}`}
          type="target"
          position={Position.Left}
          id={`${id}-${input.id}`}
          style={{
            top: `${topPosition}%`,
            background: input.color || "#555",
            ...input.style,
          }}
          title={input.label || input.id}
          index={index}
        />
      );
    });
  };

  // Render output handles (right side - sources)
  const renderOutputHandles = () => {
    if (!config.outputs || config.outputs.length === 0) return null;

    return config.outputs.map((output, index) => {
      const totalOutputs = config.outputs.length;
      const topPosition =
        totalOutputs === 1 ? 50 : (100 / (totalOutputs + 1)) * (index + 1);

      return (
        <AnimatedHandle
          key={output.id || `output-${index}`}
          type="source"
          position={Position.Right}
          id={`${id}-${output.id}`}
          style={{
            top: `${topPosition}%`,
            background: output.color || "#555",
            ...output.style,
          }}
          title={output.label || output.id}
          index={index}
        />
      );
    });
  };

  // Render form fields (inputs, selects, textareas, etc.)
  const renderFields = () => {
    if (!config.fields || config.fields.length === 0) return null;

    return config.fields.map((field, index) => {
      const value = nodeState[field.name] ?? "";

      const fieldContent = (() => {
        switch (field.type) {
          case "text":
          case "email":
          case "number":
            return (
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    display: "block",
                    marginBottom: "6px",
                    color: "#c4b5fd",
                    fontWeight: "600",
                    paddingLeft: "2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {field.label}:
                </label>
                <input
                  type={field.type}
                  value={value}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  placeholder={field.placeholder}
                  style={{
                    width: "calc(100% - 4px)",
                    padding: "8px 10px",
                    fontSize: "13px",
                    fontFamily: "'Inter', sans-serif",
                    border: "1px solid #4f4860",
                    borderRadius: "6px",
                    background: "#1a0f2e",
                    color: "#e9d5ff",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxSizing: "border-box",
                    marginLeft: "2px",
                    ...field.style,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#a78bfa";
                    e.target.style.boxShadow = `0 0 0 2px rgba(167, 139, 250, 0.3)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#4f4860";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            );

          case "select":
            return (
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    display: "block",
                    marginBottom: "6px",
                    color: "#c4b5fd",
                    fontWeight: "600",
                    paddingLeft: "2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {field.label}:
                </label>
                <select
                  value={value}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  style={{
                    width: "calc(100% - 4px)",
                    padding: "8px 10px",
                    fontSize: "13px",
                    fontFamily: "'Inter', sans-serif",
                    border: "1px solid #4f4860",
                    borderRadius: "6px",
                    background: "#1a0f2e",
                    color: "#e9d5ff",
                    transition: "border-color 0.2s ease",
                    boxSizing: "border-box",
                    marginLeft: "2px",
                    ...field.style,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#a78bfa";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#4f4860";
                  }}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );

          case "textarea":
            return (
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    display: "block",
                    marginBottom: "6px",
                    color: "#c4b5fd",
                    fontWeight: "600",
                    paddingLeft: "2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {field.label}:
                </label>
                <textarea
                  value={value}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  placeholder={field.placeholder}
                  rows={field.rows || 3}
                  style={{
                    width: "calc(100% - 4px)",
                    padding: "8px 10px",
                    fontSize: "13px",
                    fontFamily: "'Inter', sans-serif",
                    border: "1px solid #4f4860",
                    borderRadius: "6px",
                    background: "#1a0f2e",
                    color: "#e9d5ff",
                    resize: "vertical",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxSizing: "border-box",
                    marginLeft: "2px",
                    ...field.style,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#a78bfa";
                    e.target.style.boxShadow = `0 0 0 2px rgba(167, 139, 250, 0.3)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#4f4860";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            );

          case "checkbox":
            return (
              <div style={{ marginBottom: "12px", paddingLeft: "2px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    color: "#e6edf3",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      handleFieldChange(field.name, e.target.checked)
                    }
                    style={{ marginRight: "8px", cursor: "pointer" }}
                  />
                  {field.label}
                </label>
              </div>
            );

          case "custom":
            // Allow custom field rendering
            return field.render ? (
              <div style={{ marginBottom: "12px", paddingLeft: "2px" }}>
                {field.render(
                  value,
                  (newValue) => handleFieldChange(field.name, newValue),
                  nodeState
                )}
              </div>
            ) : null;

          default:
            return null;
        }
      })();

      return (
        <div
          key={field.name}
          className="field-animation"
          style={{
            animation: `slideInLeft 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${timing.staggerDelay(
              index,
              100
            )}ms forwards`,
            opacity: 0,
          }}
        >
          {fieldContent}
        </div>
      );
    });
  };

  // Render custom content if provided
  const renderContent = () => {
    if (config.content) {
      if (typeof config.content === "function") {
        return config.content(nodeState, handleFieldChange);
      }
      return config.content;
    }
    return null;
  };

  const nodeStyle = {
    width: config.width || 240,
    minHeight: config.height || 100,
    border: config.borderColor
      ? `2px solid ${config.borderColor}`
      : "2px solid #30363d",
    borderRadius: config.borderRadius || "10px",
    padding: "16px",
    background:
      config.background || "linear-gradient(to bottom, #21262d, #1a1f26)",
    position: "relative",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    ...config.style,
  };

  const deleteButtonStyle = {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: "50%",
    background: "#ff4444",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    lineHeight: "1",
    zIndex: 10,
    fontWeight: "bold",
  };

  const handleDelete = () => {
    setIsDeleting(true);
  };

  return (
    <animated.div
      style={{
        ...nodeStyle,
        opacity: nodeSpring.opacity,
        transform: nodeSpring.transform,
        ...(nodeSpring.y && {
          transform: nodeSpring.y.to(
            (y) => `translateY(${y}px) ${nodeSpring.transform}`
          ),
        }),
        ...hoverSpring,
        ...deleteSpring,
      }}
      className={config.className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderInputHandles()}

      {!config.hideDeleteButton && (
        <DeleteButton onClick={handleDelete} style={deleteButtonStyle} />
      )}

      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {config.icon && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {typeof config.icon === "string" ? (
              <span style={{ fontSize: "20px", lineHeight: "1" }}>
                {config.icon}
              </span>
            ) : (
              <config.icon
                size={20}
                strokeWidth={2}
                style={{
                  color: config.iconColor || config.borderColor || "#e6edf3",
                }}
              />
            )}
          </div>
        )}
        <strong
          style={{
            fontSize: "20px",
            color: config.titleColor || "#e6edf3",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            letterSpacing: "-0.02em",
            textRendering: "optimizeLegibility",
          }}
        >
          {config.title || data.nodeType || "Node"}
        </strong>
      </div>

      {config.description && (
        <div
          style={{
            fontSize: "11px",
            color: "#8b949e",
            marginBottom: "10px",
            lineHeight: "1.45",
            fontWeight: "400",
            letterSpacing: "0",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {config.description}
        </div>
      )}

      {renderContent()}
      {renderFields()}

      {renderOutputHandles()}
    </animated.div>
  );
};

/**
 * Helper function to create a node component from config
 * @param {Object} config - Node configuration
 * @returns {Function} React component
 */
export const createNode = (config) => {
  return ({ id, data }) => <BaseNode id={id} data={data} config={config} />;
};
