// textNode.js

import { useState, useEffect, useRef, useMemo } from "react";
import { BaseNode } from "./baseNode";
import { FileText } from "lucide-react";
import { applyPurpleTheme, purpleTheme } from "./nodeTheme";

/**
 * Extract variables from text surrounded by {{ }}
 * @param {string} text - The text to parse
 * @returns {Array<string>} - Array of unique variable names
 */
const extractVariables = (text) => {
  if (!text) return [];

  // Match {{variableName}} pattern - valid JS variable names
  const regex = /\{\{(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*)\}\}/g;
  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    if (!matches.includes(varName)) {
      matches.push(varName);
    }
  }

  return matches;
};

/**
 * Calculate dynamic dimensions based on text content
 * @param {string} text - The text content
 * @returns {Object} - Width and height
 */
const calculateDimensions = (text) => {
  const minWidth = 220;
  const minHeight = 120;
  const charWidth = 7; // Average character width
  const lineHeight = 20;

  if (!text) {
    return { width: minWidth, height: minHeight };
  }

  // Calculate based on content
  const lines = text.split("\n");
  const maxLineLength = Math.max(...lines.map((line) => line.length), 20);
  const numLines = Math.max(lines.length, 1);

  // Dynamic width: based on longest line
  const width = Math.max(
    minWidth,
    Math.min(maxLineLength * charWidth + 60, 500)
  );

  // Dynamic height: based on number of lines + padding for title and label
  const height = Math.max(minHeight, numLines * lineHeight + 80);

  return { width, height };
};

export const TextNode = ({ id, data }) => {
  const [variables, setVariables] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 220, height: 120 });
  const textRef = useRef(data?.text || "{{input}}");

  useEffect(() => {
    const text = data?.text || textRef.current;
    const extractedVars = extractVariables(text);
    setVariables(extractedVars);

    const dims = calculateDimensions(text);
    setDimensions(dims);
  }, [data?.text]);

  // Create dynamic inputs based on extracted variables
  // Memoize to prevent unnecessary re-renders
  const dynamicInputs = useMemo(
    () =>
      variables.map((varName) => ({
        id: varName,
        label: varName,
      })),
    [variables]
  );

  // Memoize config to only recreate when dimensions or variables change
  const textNodeConfig = useMemo(
    () =>
      applyPurpleTheme({
        icon: FileText,
        title: "Text",
        description: "Text input with variable support",
        width: dimensions.width,
        height: dimensions.height + (variables.length > 0 ? 30 : 0), // Extra space for variable badges

        fields: [
          {
            name: "text",
            type: "textarea",
            label: "Text",
            defaultValue: "{{input}}",
            placeholder: "Enter text or {{variable}}",
            rows: Math.max(3, Math.ceil((dimensions.height - 80) / 20)),
            style: {
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: "12px",
              lineHeight: "1.5",
            },
            onChange: (value, nodeState, updateNodeField, nodeId) => {
              textRef.current = value;
              const newVars = extractVariables(value);
              setVariables(newVars);

              const newDims = calculateDimensions(value);
              setDimensions(newDims);
            },
          },
        ],

        // Add custom content to show detected variables
        content:
          variables.length > 0 ? (
            <div
              style={{
                marginTop: "8px",
                padding: "6px 8px",
                backgroundColor: "rgba(167, 139, 250, 0.1)",
                borderRadius: "4px",
                border: "1px solid rgba(167, 139, 250, 0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: "#c4b5fd",
                  marginBottom: "4px",
                  fontWeight: "600",
                }}
              >
                Variables: {variables.length}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                }}
              >
                {variables.map((varName) => (
                  <span
                    key={varName}
                    style={{
                      display: "inline-block",
                      padding: "2px 6px",
                      backgroundColor: purpleTheme.colors.secondary,
                      color: "#e9d5ff",
                      borderRadius: "3px",
                      fontSize: "10px",
                      fontWeight: "600",
                      fontFamily: "monospace",
                    }}
                  >
                    {varName}
                  </span>
                ))}
              </div>
            </div>
          ) : null,

        inputs: dynamicInputs,
        outputs: [{ id: "output", label: "Output" }],
      }),
    [dimensions, variables, dynamicInputs]
  );

  return <BaseNode id={id} data={data} config={textNodeConfig} />;
};
