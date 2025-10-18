import { PipelineToolbar } from "./toolbar";
import { PipelineUI } from "./ui";
import { SubmitButton } from "./submit";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#100826",
        color: "#e6edf3",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options for all toasts
          style: {
            fontSize: "14px",
            fontFamily: "'Inter', sans-serif",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <PipelineToolbar />
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        <PipelineUI />
        <SubmitButton />
      </div>
    </div>
  );
}

export default App;
