// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback } from "react";
import ReactFlow, { Controls, Background, MiniMap } from "reactflow";
import { useStore } from "./store";
import { shallow } from "zustand/shallow";
import { InputNode } from "./nodes/inputNode";
import { LLMNode } from "./nodes/llmNode";
import { OutputNode } from "./nodes/outputNode";
import { TextNode } from "./nodes/textNode";
import { FilterNode } from "./nodes/filterNode";
import { TransformNode } from "./nodes/transformNode";
import { APINode } from "./nodes/apiNode";
import { ConditionalNode } from "./nodes/conditionalNode";
import { DelayNode } from "./nodes/delayNode";

import "reactflow/dist/style.css";

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  filter: FilterNode,
  transform: TransformNode,
  api: APINode,
  conditional: ConditionalNode,
  delay: DelayNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector, shallow);

  const getInitNodeData = (nodeID, type) => {
    let nodeData = { id: nodeID, nodeType: `${type}` };
    return nodeData;
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData("application/reactflow")) {
        const appData = JSON.parse(
          event.dataTransfer.getData("application/reactflow")
        );
        const type = appData?.nodeType;

        // check if the dropped element is valid
        if (typeof type === "undefined" || !type) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type),
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <>
      <div
        ref={reactFlowWrapper}
        style={{
          width: "100wv",
          height: "72vh",
          backgroundColor: "#100826",
          borderRadius: "8px",
          border: "1px solid #4f4860",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          proOptions={proOptions}
          snapGrid={[gridSize, gridSize]}
          connectionLineType="smoothstep"
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
            style: { stroke: "#ffffff", strokeWidth: 2.5 },
          }}
          deleteKeyCode="Delete"
          nodesConnectable={true}
          nodesDraggable={true}
          elementsSelectable={true}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background
            color="#4f4860"
            gap={gridSize}
            style={{ backgroundColor: "#100826" }}
          />
          <Controls
            style={{
              button: {
                backgroundColor: "#1a0f2e",
                color: "#e6edf3",
                borderColor: "#4f4860",
              },
            }}
          />
          <MiniMap
            style={{
              backgroundColor: "#1a0f2e",
              border: "1px solid #a78bfa",
            }}
            maskColor="rgba(124, 58, 237, 0.3)"
            nodeColor={(node) => {
              return "#c4b5fd";
            }}
            nodeStrokeColor={(node) => {
              return "#a78bfa";
            }}
            nodeStrokeWidth={2}
          />
        </ReactFlow>
      </div>
    </>
  );
};
