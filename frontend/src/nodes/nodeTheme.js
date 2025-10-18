// nodeTheme.js
// Shared monochromatic purple theme for all nodes

export const purpleTheme = {
  // Color palette
  colors: {
    primary: "#a78bfa", // Light purple
    secondary: "#8b5cf6", // Medium purple
    dark: "#7c3aed", // Deep purple
    darker: "#6d28d9", // Darker purple
  },

  // Node styling
  node: {
    borderColor: "#a78bfa",
    background: "linear-gradient(135deg, #2d1f47 0%, #1a0f2e 100%)",
    titleColor: "#e9d5ff",
    iconColor: "#c4b5fd",
  },

  // Handle colors (connections)
  handle: {
    input: "#a78bfa",
    output: "#8b5cf6",
  },
};

// Apply theme to node config
export const applyPurpleTheme = (config) => ({
  ...config,
  borderColor: purpleTheme.node.borderColor,
  background: purpleTheme.node.background,
  titleColor: purpleTheme.node.titleColor,
  iconColor: purpleTheme.node.iconColor,

  // Update input/output handle colors
  inputs: config.inputs?.map((input) => ({
    ...input,
    color: purpleTheme.handle.input,
  })),
  outputs: config.outputs?.map((output) => ({
    ...output,
    color: purpleTheme.handle.output,
  })),
});
