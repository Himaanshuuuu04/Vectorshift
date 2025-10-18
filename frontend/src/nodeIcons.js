// nodeIcons.js
// Icon configuration for each node type using Lucide React icons

import {
  Download,
  Upload,
  Bot,
  FileText,
  Globe,
  Filter,
  Settings,
  GitBranch,
  Timer,
  Package,
} from "lucide-react";

export const nodeIcons = {
  input: {
    icon: Download,
    label: "Input",
    color: "#3fb950",
  },
  custominput: {
    icon: Download,
    label: "Input",
    color: "#3fb950",
  },
  output: {
    icon: Upload,
    label: "Output",
    color: "#f85149",
  },
  customoutput: {
    icon: Upload,
    label: "Output",
    color: "#f85149",
  },
  llm: {
    icon: Bot,
    label: "LLM",
    color: "#8957e5",
  },
  text: {
    icon: FileText,
    label: "Text",
    color: "#d29922",
  },
  api: {
    icon: Globe,
    label: "API",
    color: "#ff6b35",
  },
  filter: {
    icon: Filter,
    label: "Filter",
    color: "#bc4ec8",
  },
  transform: {
    icon: Settings,
    label: "Transform",
    color: "#1f6feb",
  },
  conditional: {
    icon: GitBranch,
    label: "Conditional",
    color: "#d29922",
  },
  delay: {
    icon: Timer,
    label: "Delay",
    color: "#768390",
  },
};

/**
 * Get icon component for a node type
 * @param {string} type - Node type
 * @returns {React.Component} - Lucide icon component
 */
export const getNodeIcon = (type) => {
  const normalizedType = type?.toLowerCase().replace(/node$/i, "");
  const iconData = nodeIcons[normalizedType];

  if (!iconData) return Package; // Default icon

  return iconData.icon;
};

/**
 * Get icon color for a node type
 * @param {string} type - Node type
 * @returns {string} - Color hex code
 */
export const getNodeIconColor = (type) => {
  const normalizedType = type?.toLowerCase().replace(/node$/i, "");
  const iconData = nodeIcons[normalizedType];

  if (!iconData) return "#8b949e"; // Default color

  return iconData.color;
};
