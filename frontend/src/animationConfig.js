// animationConfig.js
// Centralized animation configuration for consistent and smooth animations across all nodes

/**
 * Spring configurations for different animation types
 * These are optimized for smooth, natural-feeling animations
 */
export const springConfigs = {
  // Quick and snappy - for small UI interactions
  snappy: {
    tension: 400,
    friction: 25,
  },

  // Smooth and gentle - for most node animations
  smooth: {
    tension: 300,
    friction: 25,
  },

  // Slow and deliberate - for important transitions
  slow: {
    tension: 200,
    friction: 30,
  },

  // Bouncy - for playful interactions
  bouncy: {
    tension: 300,
    friction: 10,
  },

  // Stiff - for precise, quick animations
  stiff: {
    tension: 500,
    friction: 30,
  },

  // Wobbly - for attention-grabbing animations
  wobbly: {
    tension: 180,
    friction: 12,
  },
};

/**
 * Common animation presets
 */
export const animationPresets = {
  // Fade in animation
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: springConfigs.smooth,
  },

  // Scale in animation
  scaleIn: {
    from: { opacity: 0, transform: "scale(0.8)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: springConfigs.smooth,
  },

  // Slide in from left
  slideInLeft: {
    from: { opacity: 0, transform: "translateX(-20px)" },
    to: { opacity: 1, transform: "translateX(0px)" },
    config: springConfigs.smooth,
  },

  // Slide in from right
  slideInRight: {
    from: { opacity: 0, transform: "translateX(20px)" },
    to: { opacity: 1, transform: "translateX(0px)" },
    config: springConfigs.smooth,
  },

  // Slide in from top
  slideInTop: {
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: springConfigs.smooth,
  },

  // Slide in from bottom
  slideInBottom: {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: springConfigs.smooth,
  },

  // Hover lift effect
  hoverLift: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
    config: springConfigs.snappy,
  },

  // Hover rest state
  hoverRest: {
    transform: "translateY(0px)",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    config: springConfigs.snappy,
  },

  // Delete animation
  deleteOut: {
    opacity: 0,
    transform: "scale(0.5) rotate(10deg)",
    config: springConfigs.stiff,
  },
};

/**
 * Timing utilities
 */
export const timing = {
  // Stagger delay for sequential animations (in ms)
  staggerDelay: (index, baseDelay = 50) => index * baseDelay,

  // Get delay for array of items
  getStaggeredDelays: (count, baseDelay = 50) => {
    return Array.from({ length: count }, (_, i) => i * baseDelay);
  },
};

/**
 * Easing functions for custom animations
 */
export const easings = {
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

/**
 * Color animation helpers
 */
export const colorAnimations = {
  // Hover colors for different node types
  hover: {
    primary: "#4CAF50",
    secondary: "#2196F3",
    warning: "#FF9800",
    error: "#F44336",
    info: "#00BCD4",
  },

  // Focus colors
  focus: {
    primary: "rgba(76, 175, 80, 0.2)",
    secondary: "rgba(33, 150, 243, 0.2)",
    warning: "rgba(255, 152, 0, 0.2)",
    error: "rgba(244, 67, 54, 0.2)",
    info: "rgba(0, 188, 212, 0.2)",
  },
};

export default {
  springConfigs,
  animationPresets,
  timing,
  easings,
  colorAnimations,
};
