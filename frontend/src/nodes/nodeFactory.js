// nodeFactory.js
// Factory for creating node components with minimal boilerplate

import { BaseNode } from "./baseNode";
import { applyPurpleTheme } from "./nodeTheme";

/**
 * Create a React component from a node configuration
 * Automatically handles id extraction for default values
 * @param {Object} config - Node configuration object
 * @returns {Function} React component
 */
export const createNodeComponent = (config) => {
  return ({ id, data }) => {
    // Auto-populate defaults based on ID if needed
    const processedData = { ...data };

    // Handle default name generation from ID
    if (config.fields) {
      config.fields.forEach((field) => {
        if (typeof field.defaultValue === "function") {
          processedData[field.name] =
            processedData[field.name] || field.defaultValue({ id, ...data });
        } else if (field.defaultValue && !processedData[field.name]) {
          processedData[field.name] = field.defaultValue;
        }
      });
    }

    return <BaseNode id={id} data={processedData} config={config} />;
  };
};

/**
 * Create a themed node component with purple theme applied
 * @param {Object} config - Node configuration
 * @returns {Function} React component with theme applied
 */
export const createThemedNode = (config) => {
  const themedConfig = applyPurpleTheme(config);
  return createNodeComponent(themedConfig);
};

/**
 * Batch create multiple node components
 * @param {Object} configs - Object with node names as keys and configs as values
 * @returns {Object} Object with node names as keys and components as values
 */
export const createNodes = (configs) => {
  return Object.entries(configs).reduce((acc, [name, config]) => {
    acc[name] = createThemedNode(config);
    return acc;
  }, {});
};
