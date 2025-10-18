// theme.js
// Dark theme configuration for the application

export const darkTheme = {
  // Background colors
  bg: {
    primary: "#0d1117",
    secondary: "#161b22",
    tertiary: "#21262d",
    hover: "#30363d",
    elevated: "#1c2128",
  },

  // Border colors
  border: {
    primary: "#30363d",
    secondary: "#21262d",
    muted: "#484f58",
    accent: "#58a6ff",
  },

  // Text colors
  text: {
    primary: "#e6edf3",
    secondary: "#8b949e",
    tertiary: "#6e7681",
    muted: "#484f58",
    link: "#58a6ff",
  },

  // Accent colors
  accent: {
    primary: "#58a6ff",
    secondary: "#1f6feb",
    tertiary: "#0969da",
  },

  // Status colors
  status: {
    success: "#3fb950",
    successBg: "#0d1117",
    warning: "#d29922",
    warningBg: "#341a00",
    error: "#f85149",
    errorBg: "#490202",
    info: "#58a6ff",
    infoBg: "#051d4d",
  },

  // Node specific colors
  node: {
    bg: "#21262d",
    bgGradient: "linear-gradient(to bottom, #21262d, #1a1f26)",
    border: "#30363d",
    borderHover: "#58a6ff",
    shadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    shadowHover: "0 8px 16px rgba(0, 0, 0, 0.4)",
  },

  // Input/Form colors
  input: {
    bg: "#161b22",
    border: "#30363d",
    borderFocus: "#58a6ff",
    text: "#e6edf3",
    placeholder: "#6e7681",
  },

  // Handle/Connection colors
  handle: {
    default: "#58a6ff",
    input: "#3fb950",
    output: "#58a6ff",
    llm: "#8957e5",
    api: "#d29922",
    conditional: "#f778ba",
    transform: "#1f6feb",
  },
};

export default darkTheme;
