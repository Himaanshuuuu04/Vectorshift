// nodeConfigs.js
// Centralized node configurations - All nodes defined in one place
// Makes it easy to add, modify, or remove nodes

import {
  Download,
  Upload,
  Bot,
  FileText,
  Globe,
  GitBranch,
  Timer,
  Filter,
  Settings,
} from "lucide-react";

/**
 * All node configurations in one place
 * Each config defines the structure and behavior of a node type
 */
export const nodeConfigs = {
  // ============ Original Nodes ============

  input: {
    icon: Download,
    title: "Input",
    description: "Define an input source",
    width: 220,
    height: 120,
    fields: [
      {
        name: "inputName",
        type: "text",
        label: "Name",
        defaultValue: (data) =>
          data?.inputName ||
          data?.id?.replace("customInput-", "input_") ||
          "input_1",
        placeholder: "Enter input name",
      },
      {
        name: "inputType",
        type: "select",
        label: "Type",
        defaultValue: "Text",
        options: [
          { value: "Text", label: "Text" },
          { value: "File", label: "File" },
        ],
      },
    ],
    outputs: [{ id: "value", label: "Output" }],
  },

  output: {
    icon: Upload,
    title: "Output",
    description: "Define an output destination",
    width: 220,
    height: 120,
    fields: [
      {
        name: "outputName",
        type: "text",
        label: "Name",
        defaultValue: (data) =>
          data?.outputName ||
          data?.id?.replace("customOutput-", "output_") ||
          "output_1",
        placeholder: "Enter output name",
      },
      {
        name: "outputType",
        type: "select",
        label: "Type",
        defaultValue: "Text",
        options: [
          { value: "Text", label: "Text" },
          { value: "Image", label: "Image" },
        ],
      },
    ],
    inputs: [{ id: "value", label: "Input" }],
  },

  llm: {
    icon: Bot,
    title: "LLM",
    description: "Large Language Model processing",
    width: 220,
    height: 100,
    inputs: [
      { id: "system", label: "System" },
      { id: "prompt", label: "Prompt" },
    ],
    outputs: [{ id: "response", label: "Response" }],
  },

  // Note: TextNode has special logic, so it keeps its own file
  // text: { ... } - see textNode.js for special implementation

  api: {
    icon: Globe,
    title: "API",
    description: "Make external API requests",
    width: 260,
    height: 180,
    fields: [
      {
        name: "url",
        type: "text",
        label: "URL",
        defaultValue: "https://api.example.com",
        placeholder: "API endpoint URL",
      },
      {
        name: "method",
        type: "select",
        label: "Method",
        defaultValue: "GET",
        options: [
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
          { value: "DELETE", label: "DELETE" },
        ],
      },
      {
        name: "headers",
        type: "text",
        label: "Headers",
        defaultValue: "",
        placeholder: "JSON headers (optional)",
      },
      {
        name: "timeout",
        type: "number",
        label: "Timeout (ms)",
        defaultValue: "5000",
        placeholder: "5000",
      },
    ],
    inputs: [
      { id: "body", label: "Body" },
      { id: "params", label: "Params" },
    ],
    outputs: [
      { id: "response", label: "Response" },
      { id: "error", label: "Error" },
    ],
  },

  conditional: {
    icon: GitBranch,
    title: "Conditional",
    description: "If/else logic branching",
    width: 240,
    height: 140,
    fields: [
      {
        name: "condition",
        type: "text",
        label: "Condition",
        defaultValue: "value > 0",
        placeholder: "Enter condition",
      },
      {
        name: "logic",
        type: "select",
        label: "Logic",
        defaultValue: "if",
        options: [
          { value: "if", label: "If" },
          { value: "ifElse", label: "If/Else" },
          { value: "switch", label: "Switch" },
        ],
      },
    ],
    inputs: [{ id: "input", label: "Input" }],
    outputs: [
      { id: "true", label: "True" },
      { id: "false", label: "False" },
    ],
  },

  delay: {
    icon: Timer,
    title: "Delay",
    description: "Add time delay or schedule",
    width: 220,
    height: 120,
    fields: [
      {
        name: "duration",
        type: "number",
        label: "Duration (ms)",
        defaultValue: "1000",
        placeholder: "Delay in milliseconds",
      },
      {
        name: "unit",
        type: "select",
        label: "Unit",
        defaultValue: "ms",
        options: [
          { value: "ms", label: "Milliseconds" },
          { value: "s", label: "Seconds" },
          { value: "m", label: "Minutes" },
        ],
      },
    ],
    inputs: [{ id: "trigger", label: "Trigger" }],
    outputs: [{ id: "delayed", label: "Delayed" }],
  },

  filter: {
    icon: Filter,
    title: "Filter",
    description: "Filter data based on conditions",
    width: 240,
    height: 140,
    fields: [
      {
        name: "filterField",
        type: "text",
        label: "Field",
        defaultValue: "value",
        placeholder: "Field to filter on",
      },
      {
        name: "operator",
        type: "select",
        label: "Operator",
        defaultValue: "equals",
        options: [
          { value: "equals", label: "Equals" },
          { value: "notEquals", label: "Not Equals" },
          { value: "contains", label: "Contains" },
          { value: "greaterThan", label: "Greater Than" },
          { value: "lessThan", label: "Less Than" },
        ],
      },
      {
        name: "filterValue",
        type: "text",
        label: "Value",
        defaultValue: "",
        placeholder: "Filter value",
      },
    ],
    inputs: [{ id: "data", label: "Data" }],
    outputs: [
      { id: "filtered", label: "Filtered" },
      { id: "excluded", label: "Excluded" },
    ],
  },

  transform: {
    icon: Settings,
    title: "Transform",
    description: "Transform and modify data",
    width: 240,
    height: 140,
    fields: [
      {
        name: "operation",
        type: "select",
        label: "Operation",
        defaultValue: "uppercase",
        options: [
          { value: "uppercase", label: "To Uppercase" },
          { value: "lowercase", label: "To Lowercase" },
          { value: "trim", label: "Trim Whitespace" },
          { value: "reverse", label: "Reverse" },
          { value: "replace", label: "Replace" },
        ],
      },
      {
        name: "params",
        type: "text",
        label: "Parameters",
        defaultValue: "",
        placeholder: "Additional parameters",
      },
    ],
    inputs: [{ id: "input", label: "Input" }],
    outputs: [{ id: "output", label: "Output" }],
  },
};

/**
 * Get a node configuration by name
 * @param {string} name - Node name
 * @returns {Object} Node configuration
 */
export const getNodeConfig = (name) => nodeConfigs[name];

/**
 * Get all node names
 * @returns {Array<string>} Array of node names
 */
export const getNodeNames = () => Object.keys(nodeConfigs);
