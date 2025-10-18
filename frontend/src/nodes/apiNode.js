// apiNode.js
// Node for making external API calls
import { createThemedNode } from "./nodeFactory";
import { nodeConfigs } from "./nodeConfigs";

export const APINode = createThemedNode(nodeConfigs.api);
