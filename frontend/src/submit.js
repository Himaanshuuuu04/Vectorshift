// submit.js

import { useStore } from "./store";
import toast from "react-hot-toast";

export const SubmitButton = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);

  const handleSubmit = async () => {
    // Prepare the pipeline data
    const pipelineData = {
      nodes: nodes,
      edges: edges,
    };

    try {
      // Send POST request to backend
      const response = await fetch("http://localhost:8000/pipelines/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pipelineData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Display user-friendly toast with the results
      if (result.is_dag) {
        toast.success(
          (t) => (
            <div style={{ padding: "4px" }}>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "16px",
                  marginBottom: "10px",
                  color: "#065f46",
                }}
              >
                ✅ Pipeline Analysis Complete
              </div>
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#374151",
                }}
              >
                <div style={{ marginBottom: "6px" }}>
                  <strong>📊 Nodes:</strong> {result.num_nodes}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>🔗 Edges:</strong> {result.num_edges}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>🔄 Is DAG:</strong> Yes
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px",
                    background: "#d1fae5",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  ✓ Your pipeline is valid and has no circular dependencies!
                </div>
              </div>
            </div>
          ),
          {
            duration: 5000,
            style: {
              background: "#f0fdf4",
              border: "2px solid #10b981",
              padding: "16px",
              borderRadius: "10px",
              maxWidth: "500px",
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "#f0fdf4",
            },
          }
        );
      } else {
        toast.error(
          (t) => (
            <div style={{ padding: "4px" }}>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "16px",
                  marginBottom: "10px",
                  color: "#991b1b",
                }}
              >
                ⚠️ Pipeline Analysis Complete
              </div>
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: "#374151",
                }}
              >
                <div style={{ marginBottom: "6px" }}>
                  <strong>📊 Nodes:</strong> {result.num_nodes}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>🔗 Edges:</strong> {result.num_edges}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>🔄 Is DAG:</strong> No
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    padding: "8px",
                    background: "#fee2e2",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  ⚠ Warning: Your pipeline contains circular dependencies!
                </div>
              </div>
            </div>
          ),
          {
            duration: 6000,
            style: {
              background: "#fef2f2",
              border: "2px solid #ef4444",
              padding: "16px",
              borderRadius: "10px",
              maxWidth: "500px",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fef2f2",
            },
          }
        );
      }
    } catch (error) {
      console.error("Error submitting pipeline:", error);
      toast.error(
        (t) => (
          <div style={{ padding: "4px" }}>
            <div
              style={{
                fontWeight: "700",
                fontSize: "16px",
                marginBottom: "8px",
                color: "#991b1b",
              }}
            >
              ❌ Error Submitting Pipeline
            </div>
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#374151",
              }}
            >
              <div style={{ marginBottom: "8px" }}>{error.message}</div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontStyle: "italic",
                }}
              >
                Please make sure the backend server is running on
                http://localhost:8000
              </div>
            </div>
          </div>
        ),
        {
          duration: 7000,
          style: {
            background: "#fef2f2",
            border: "2px solid #ef4444",
            padding: "16px",
            borderRadius: "10px",
            maxWidth: "500px",
          },
        }
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleSubmit}
      style={{
        position: "absolute",
        bottom: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
        color: "#ffffff",
        border: "none",
        borderRadius: "25px",
        padding: "10px 24px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)",
        zIndex: 1000,
        fontFamily: "var(--font-heading)",
        letterSpacing: "-0.01em",
      }}
      onMouseEnter={(e) => {
        e.target.style.background =
          "linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)";
        e.target.style.transform = "translateX(-50%) translateY(-2px)";
        e.target.style.boxShadow = "0 6px 20px rgba(124, 58, 237, 0.6)";
      }}
      onMouseLeave={(e) => {
        e.target.style.background =
          "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)";
        e.target.style.transform = "translateX(-50%) translateY(0)";
        e.target.style.boxShadow = "0 4px 15px rgba(124, 58, 237, 0.4)";
      }}
      onMouseDown={(e) => {
        e.target.style.transform = "translateX(-50%) translateY(0) scale(0.98)";
      }}
      onMouseUp={(e) => {
        e.target.style.transform = "translateX(-50%) translateY(-2px) scale(1)";
      }}
    >
      Submit Pipeline
    </button>
  );
};
