// delayNode.js
// Node for adding delays or scheduling operations
import { createThemedNode } from "./nodeFactory";
import { nodeConfigs } from "./nodeConfigs";

export const DelayNode = createThemedNode(nodeConfigs.delay);
