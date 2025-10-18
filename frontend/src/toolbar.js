// toolbar.js

import { DraggableNode } from "./draggableNode";
import {
  Download,
  Upload,
  Bot,
  FileText,
  Filter,
  Settings,
  Globe,
  GitBranch,
  Timer,
} from "lucide-react";

export const PipelineToolbar = () => {
  return (
    <div
      style={{
        padding: "12px 16px",
        backgroundColor: "#1a0f2e",
        borderBottom: "1px solid #4f4860",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      <h2
        style={{
          margin: "0 0 12px 0",
          fontSize: "28px",
          fontWeight: "700",
          fontFamily: "var(--font-heading)",
          letterSpacing: "-0.02em",
        }}
      >
        <span
          style={{
            background:
              "linear-gradient(135deg, #e9d5ff 0%, #7c3aed 50%, #5b21b6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Node Palette
        </span>
      </h2>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <DraggableNode type="customInput" label="Input" icon={Download} />
        <DraggableNode type="llm" label="LLM" icon={Bot} />
        <DraggableNode type="customOutput" label="Output" icon={Upload} />
        <DraggableNode type="text" label="Text" icon={FileText} />
        <DraggableNode type="filter" label="Filter" icon={Filter} />
        <DraggableNode type="transform" label="Transform" icon={Settings} />
        <DraggableNode type="api" label="API" icon={Globe} />
        <DraggableNode
          type="conditional"
          label="Conditional"
          icon={GitBranch}
        />
        <DraggableNode type="delay" label="Delay" icon={Timer} />
      </div>
    </div>
  );
};
