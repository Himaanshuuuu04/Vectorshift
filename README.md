# VectorShift - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend Documentation](#backend-documentation)
4. [Frontend Documentation](#frontend-documentation)
5. [Setup & Installation](#setup--installation)
6. [Usage Guide](#usage-guide)
7. [API Reference](#api-reference)
8. [Component Reference](#component-reference)
9. [Development Guide](#development-guide)

---

## Project Overview

**VectorShift** is a visual pipeline builder application that allows users to create, configure, and analyze directed acyclic graphs (DAGs) through a drag-and-drop interface. The application consists of a React-based frontend and a FastAPI backend.

### Key Features
- **Drag-and-Drop Interface**: Intuitive node-based visual programming
- **Multiple Node Types**: Input, Output, LLM, Text, API, Filter, Transform, Conditional, and Delay nodes
- **Real-time Validation**: DAG analysis with cycle detection
- **Dynamic Text Variables**: Support for variable interpolation in text nodes
- **Beautiful Animations**: Smooth, springy animations using react-spring
- **Dark Theme UI**: Modern, purple-accented dark theme
- **Toast Notifications**: User-friendly feedback system

### Tech Stack

**Frontend:**
- React 18.2.0
- ReactFlow 11.8.3 (node-based UI)
- Zustand (state management)
- @react-spring/web (animations)
- Lucide React (icons)
- React Hot Toast (notifications)

**Backend:**
- FastAPI 0.104.1
- Pydantic 2.5.0 (data validation)
- Uvicorn 0.24.0 (ASGI server)

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  Toolbar   │  │     Store    │  │   Node Components │   │
│  │ (Draggable)│  │   (Zustand)  │  │   (BaseNode +     │   │
│  │            │  │              │  │    Configs)       │   │
│  └────────────┘  └──────────────┘  └───────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            ReactFlow Canvas (PipelineUI)               │ │
│  │  - Handles drag & drop                                 │ │
│  │  - Manages node connections                            │ │
│  │  - Renders nodes and edges                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────┐                                             │
│  │   Submit   │  ----> HTTP POST /pipelines/parse          │
│  └────────────┘                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 POST /pipelines/parse                  │ │
│  │  - Receives pipeline data (nodes + edges)             │ │
│  │  - Validates structure                                 │ │
│  │  - Runs DAG analysis (Kahn's Algorithm)               │ │
│  │  - Returns: num_nodes, num_edges, is_dag              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Node Creation**: User drags node from toolbar → ReactFlow creates node
2. **State Management**: Node data stored in Zustand store
3. **Connection**: User connects nodes → Edges created in store
4. **Submission**: User clicks "Submit" → Data sent to backend
5. **Analysis**: Backend validates and analyzes pipeline structure
6. **Feedback**: Results displayed via toast notifications

---

## Backend Documentation

### File: `backend/main.py`

The backend is a FastAPI application that provides pipeline analysis functionality.

#### Import Structure

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import defaultdict, deque
```

**Purpose of each import:**
- `FastAPI`: Core framework for building the API
- `CORSMiddleware`: Enables cross-origin requests from frontend
- `BaseModel`: Pydantic base for data validation
- `List, Dict, Any`: Type hints for data structures
- `defaultdict, deque`: Efficient data structures for graph algorithms

#### Application Setup

```python
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**CORS Configuration:**
- **allow_origins**: Permits requests from React dev server (localhost:3000)
- **allow_credentials**: Enables cookies and authentication headers
- **allow_methods**: Accepts all HTTP methods (GET, POST, etc.)
- **allow_headers**: Accepts all request headers

#### Data Models

##### Node Model
```python
class Node(BaseModel):
    id: str
```
Represents a single node in the pipeline with a unique identifier.

##### Edge Model
```python
class Edge(BaseModel):
    source: str
    target: str
```
Represents a directed connection from `source` node to `target` node.

##### Pipeline Model
```python
class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
```
Complete pipeline structure containing all nodes and their connections.

#### Core Algorithm: `is_dag()`

```python
def is_dag(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> bool:
```

**Purpose:** Determines if a graph is a Directed Acyclic Graph (DAG) using Kahn's algorithm.

**Algorithm Explanation:**

1. **Graph Representation**
   ```python
   adjacency_list = defaultdict(list)
   in_degree = defaultdict(int)
   ```
   - `adjacency_list`: Maps each node to its outgoing neighbors
   - `in_degree`: Tracks number of incoming edges for each node

2. **Initialization**
   ```python
   node_ids = {node['id'] for node in nodes}
   for node_id in node_ids:
       in_degree[node_id] = 0
   ```
   Sets all nodes' in-degrees to 0 initially.

3. **Build Graph**
   ```python
   for edge in edges:
       source = edge['source']
       target = edge['target']
       adjacency_list[source].append(target)
       in_degree[target] += 1
   ```
   Constructs adjacency list and calculates actual in-degrees.

4. **Kahn's Algorithm** (Topological Sort)
   ```python
   queue = deque([node_id for node_id in node_ids if in_degree[node_id] == 0])
   visited_count = 0
   ```
   Start with nodes that have no incoming edges (in-degree = 0).

5. **Process Queue**
   ```python
   while queue:
       current = queue.popleft()
       visited_count += 1
       
       for neighbor in adjacency_list[current]:
           in_degree[neighbor] -= 1
           if in_degree[neighbor] == 0:
               queue.append(neighbor)
   ```
   - Remove node from queue
   - Increment visited count
   - Decrease in-degree of neighbors
   - Add neighbors with in-degree 0 to queue

6. **Cycle Detection**
   ```python
   return visited_count == len(node_ids)
   ```
   If all nodes visited, no cycle exists (it's a DAG).
   If some nodes remain, a cycle prevented complete traversal.

**Time Complexity:** O(V + E) where V = nodes, E = edges
**Space Complexity:** O(V + E) for adjacency list and in-degree map

#### API Endpoints

##### GET `/`
```python
@app.get('/')
def read_root():
    return {'Ping': 'Pong'}
```
Health check endpoint to verify server is running.

##### POST `/pipelines/parse`
```python
@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag_status = is_dag(pipeline.nodes, pipeline.edges)
    
    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': dag_status
    }
```

**Request Body:**
```json
{
  "nodes": [
    {"id": "node-1", "type": "input", ...},
    {"id": "node-2", "type": "llm", ...}
  ],
  "edges": [
    {"source": "node-1", "target": "node-2", ...}
  ]
}
```

**Response:**
```json
{
  "num_nodes": 2,
  "num_edges": 1,
  "is_dag": true
}
```

**Response Fields:**
- `num_nodes`: Total number of nodes in the pipeline
- `num_edges`: Total number of connections between nodes
- `is_dag`: Boolean indicating if the pipeline is a valid DAG (no cycles)

---

## Frontend Documentation

### Application Structure

```
src/
├── App.js                 # Main application component
├── store.js              # Global state management (Zustand)
├── toolbar.js            # Node palette/toolbar
├── draggableNode.js      # Draggable node items in toolbar
├── ui.js                 # Main ReactFlow canvas
├── submit.js             # Submit button & backend communication
├── theme.js              # Dark theme configuration
├── animationConfig.js    # Animation presets and configs
├── nodeIcons.js          # Icon mappings for nodes
└── nodes/
    ├── baseNode.js       # Reusable base node component
    ├── nodeFactory.js    # Factory for creating node components
    ├── nodeConfigs.js    # Configuration for all node types
    ├── nodeTheme.js      # Node theming utilities
    ├── inputNode.js      # Input node implementation
    ├── outputNode.js     # Output node implementation
    ├── llmNode.js        # LLM node implementation
    ├── textNode.js       # Text node with variable support
    ├── apiNode.js        # API request node
    ├── filterNode.js     # Data filtering node
    ├── transformNode.js  # Data transformation node
    ├── conditionalNode.js # Conditional branching node
    └── delayNode.js      # Delay/scheduling node
```

---

### Core Components

#### 1. App.js - Application Root

```javascript
function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#100826", ... }}>
      <Toaster />           {/* Toast notification container */}
      <PipelineToolbar />   {/* Node palette */}
      <div>
        <PipelineUI />      {/* ReactFlow canvas */}
        <SubmitButton />    {/* Submission button */}
      </div>
    </div>
  );
}
```

**Component Breakdown:**

- **Container Div**: Full-height dark background (#100826)
- **Toaster**: React Hot Toast component for notifications
  - Position: top-right
  - Customized success/error styling
  - Purple/green theme matching app design
- **PipelineToolbar**: Displays draggable node types
- **PipelineUI**: Main ReactFlow canvas for building pipelines
- **SubmitButton**: Triggers pipeline analysis

**Styling Philosophy:**
- Dark theme throughout (#100826 background)
- Purple accent colors (#7c3aed, #a78bfa)
- Clean, minimal design with smooth animations

---

#### 2. store.js - State Management

Uses **Zustand** for lightweight, performant state management.

```javascript
export const useStore = create((set, get) => ({
  nodes: [],              // Array of all nodes
  edges: [],              // Array of all connections
  nodeIDs: {},            // Counter for generating unique IDs
  
  // ... methods
}));
```

**State Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `nodes` | Array | All nodes in the pipeline |
| `edges` | Array | All connections between nodes |
| `nodeIDs` | Object | ID counters for each node type |

**State Methods:**

##### `getNodeID(type)`
```javascript
getNodeID: (type) => {
  const newIDs = { ...get().nodeIDs };
  if (newIDs[type] === undefined) {
    newIDs[type] = 0;
  }
  newIDs[type] += 1;
  set({ nodeIDs: newIDs });
  return `${type}-${newIDs[type]}`;
}
```
**Purpose:** Generate unique IDs for new nodes (e.g., "llm-1", "llm-2").

##### `addNode(node)`
```javascript
addNode: (node) => {
  set({ nodes: [...get().nodes, node] });
}
```
**Purpose:** Add a new node to the pipeline.

##### `onNodesChange(changes)`
```javascript
onNodesChange: (changes) => {
  set({ nodes: applyNodeChanges(changes, get().nodes) });
}
```
**Purpose:** Handle node updates (position, selection, deletion) from ReactFlow.
**Changes include:** position updates, selection state, removal, etc.

##### `onEdgesChange(changes)`
```javascript
onEdgesChange: (changes) => {
  set({ edges: applyEdgeChanges(changes, get().edges) });
}
```
**Purpose:** Handle edge updates (selection, deletion) from ReactFlow.

##### `onConnect(connection)`
```javascript
onConnect: (connection) => {
  set({
    edges: addEdge(
      {
        ...connection,
        type: "smoothstep",          // Curved edge style
        animated: true,               // Animated flow
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: "#ffffff",
        },
      },
      get().edges
    ),
  });
}
```
**Purpose:** Create new edges when user connects nodes.
**Features:**
- Smooth step curve style
- Animated flow indicator
- White arrow marker at connection end

##### `updateNodeField(nodeId, fieldName, fieldValue)`
```javascript
updateNodeField: (nodeId, fieldName, fieldValue) => {
  set({
    nodes: get().nodes.map((node) => {
      if (node.id === nodeId) {
        node.data = { ...node.data, [fieldName]: fieldValue };
      }
      return node;
    }),
  });
}
```
**Purpose:** Update specific field values within a node's data.
**Used by:** Form inputs within nodes to store user input.

##### `deleteNode(nodeId)`
```javascript
deleteNode: (nodeId) => {
  set({
    nodes: get().nodes.filter((node) => node.id !== nodeId),
    edges: get().edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ),
  });
}
```
**Purpose:** Remove a node and all its connected edges.
**Cleanup:** Ensures no orphaned edges remain.

---

#### 3. toolbar.js - Node Palette

```javascript
export const PipelineToolbar = () => {
  return (
    <div style={{ padding: "12px 16px", backgroundColor: "#1a0f2e", ... }}>
      <h2>Node Palette</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <DraggableNode type="customInput" label="Input" icon={Download} />
        <DraggableNode type="llm" label="LLM" icon={Bot} />
        <DraggableNode type="customOutput" label="Output" icon={Upload} />
        <DraggableNode type="text" label="Text" icon={FileText} />
        <DraggableNode type="filter" label="Filter" icon={Filter} />
        <DraggableNode type="transform" label="Transform" icon={Settings} />
        <DraggableNode type="api" label="API" icon={Globe} />
        <DraggableNode type="conditional" label="Conditional" icon={GitBranch} />
        <DraggableNode type="delay" label="Delay" icon={Timer} />
      </div>
    </div>
  );
};
```

**Component Structure:**
- Dark purple background (#1a0f2e)
- Gradient text title with purple theme
- Flexbox grid of draggable node items
- Uses Lucide React icons

**Available Node Types:**
1. **Input**: Data source/input node
2. **LLM**: Language model processing
3. **Output**: Data destination
4. **Text**: Text processing with variables
5. **Filter**: Data filtering
6. **Transform**: Data transformation
7. **API**: External API calls
8. **Conditional**: If/else logic
9. **Delay**: Time delays/scheduling

---

#### 4. draggableNode.js - Draggable Items

```javascript
export const DraggableNode = ({ type, label, icon }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Animation
  const springProps = useSpring({
    transform: isHovered && !isDragging
      ? "scale(1.05) translateY(-2px)"
      : "scale(1) translateY(0px)",
    boxShadow: isHovered && !isDragging
      ? "0 6px 12px rgba(0, 0, 0, 0.25)"
      : "0 2px 4px rgba(0, 0, 0, 0.15)",
    config: springConfigs.smooth,
  });
  
  // ... event handlers
};
```

**Features:**

1. **Hover Animation:**
   - Scale up 5% when hovered
   - Lift 2px with shadow
   - Smooth spring animation

2. **Drag Events:**
   ```javascript
   const onDragStart = (event, nodeType) => {
     const appData = { nodeType };
     event.dataTransfer.setData("application/reactflow", JSON.stringify(appData));
     event.dataTransfer.effectAllowed = "move";
     setIsDragging(true);
   };
   ```
   - Stores node type in drag data
   - Sets cursor to "grabbing"
   - Updates visual state

3. **Visual States:**
   - **Normal**: Dark purple background (#2d1f47)
   - **Hover**: Lighter purple (#3d2f57), purple border (#a78bfa)
   - **Dragging**: Grabbing cursor

---

#### 5. ui.js - ReactFlow Canvas

The main canvas where users build their pipelines.

```javascript
export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { nodes, edges, getNodeID, addNode, onNodesChange, onEdgesChange, onConnect } 
    = useStore(selector, shallow);
  
  // ... handlers
};
```

**Key Configuration:**

```javascript
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
```
Maps node type strings to React components.

**Drop Handler:**
```javascript
const onDrop = useCallback((event) => {
  event.preventDefault();
  
  const appData = JSON.parse(event.dataTransfer.getData("application/reactflow"));
  const type = appData?.nodeType;
  
  // Calculate drop position
  const position = reactFlowInstance.project({
    x: event.clientX - reactFlowBounds.left,
    y: event.clientY - reactFlowBounds.top,
  });
  
  // Create new node
  const nodeID = getNodeID(type);
  const newNode = {
    id: nodeID,
    type,
    position,
    data: getInitNodeData(nodeID, type),
  };
  
  addNode(newNode);
}, [reactFlowInstance]);
```

**Process:**
1. Prevent default browser behavior
2. Extract node type from drag data
3. Calculate canvas-relative position
4. Generate unique node ID
5. Create node object with initial data
6. Add to store

**ReactFlow Configuration:**
```javascript
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
  snapGrid={[20, 20]}                    // Snap to 20px grid
  connectionLineType="smoothstep"        // Smooth connection preview
  defaultEdgeOptions={{
    type: "smoothstep",
    animated: true,
    style: { stroke: "#ffffff", strokeWidth: 2.5 },
  }}
  deleteKeyCode="Delete"                 // Delete key removes nodes
  fitView
  fitViewOptions={{ padding: 0.2 }}
>
  <Background color="#4f4860" gap={20} />
  <Controls />
  <MiniMap />
</ReactFlow>
```

**Components:**
- **Background**: Dotted grid pattern
- **Controls**: Zoom, fit view, lock controls
- **MiniMap**: Overview of entire pipeline

---

#### 6. submit.js - Pipeline Submission

Handles communication with backend and displays results.

```javascript
export const SubmitButton = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  
  const handleSubmit = async () => {
    const pipelineData = { nodes, edges };
    
    try {
      const response = await fetch("http://localhost:8000/pipelines/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pipelineData),
      });
      
      const result = await response.json();
      
      // Display toast based on result
      if (result.is_dag) {
        toast.success(/* ... */);
      } else {
        toast.error(/* ... */);
      }
    } catch (error) {
      toast.error(/* ... */);
    }
  };
  
  return <button onClick={handleSubmit}>Submit Pipeline</button>;
};
```

**Toast Notifications:**

1. **Success (Valid DAG):**
   - Green theme (#10b981)
   - Shows node count, edge count
   - Confirms valid pipeline structure
   - Duration: 5 seconds

2. **Error (Cycle Detected):**
   - Red theme (#ef4444)
   - Shows node count, edge count
   - Warns about circular dependencies
   - Duration: 6 seconds

3. **Network Error:**
   - Red theme
   - Shows error message
   - Reminds user to start backend
   - Duration: 7 seconds

**Button Styling:**
- Purple gradient background
- Rounded pill shape (border-radius: 25px)
- Hover effects: lift 2px, brightens gradient
- Positioned at bottom-center of canvas
- Fixed position (z-index: 1000)

---

### Node System

The node system uses a powerful abstraction pattern for creating consistent, reusable nodes.

#### Node Architecture Overview

```
nodeConfigs.js      →    nodeFactory.js    →    Specific Node
(Configuration)          (Factory)              (Component)
                              ↓
                         baseNode.js
                      (Rendering Logic)
```

---

#### baseNode.js - The Foundation

The `BaseNode` component is a highly flexible abstraction that handles all common node functionality.

**Key Features:**
1. Dynamic handle rendering (inputs/outputs)
2. Form field generation (text, select, textarea, checkbox, custom)
3. Animation system (spring animations)
4. Delete functionality
5. Field change management
6. Theming support

**Component Structure:**

```javascript
export const BaseNode = ({ id, data, config }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const deleteNode = useStore((state) => state.deleteNode);
  const [nodeState, setNodeState] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Animations
  const nodeSpring = useSpring({ /* entry animation */ });
  const hoverSpring = useSpring({ /* hover animation */ });
  const deleteSpring = useSpring({ /* delete animation */ });
  
  // ... rendering logic
};
```

**Props:**
- `id`: Unique node identifier
- `data`: Node's data (user input, configuration)
- `config`: Configuration object defining node structure

**Animation System:**

1. **Entry Animation (nodeSpring):**
   ```javascript
   from: {
     opacity: 0,
     transform: "scale(0.3) rotate(-5deg)",
     y: -50,
   },
   to: {
     opacity: 1,
     transform: "scale(1) rotate(0deg)",
     y: 0,
   },
   config: springConfigs.wobbly,
   ```
   Node bounces in with a slight rotation.

2. **Hover Animation (hoverSpring):**
   ```javascript
   isHovered ? {
     transform: "translateY(-2px)",
     boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
   } : {
     transform: "translateY(0px)",
     boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
   }
   ```
   Node lifts slightly on hover.

3. **Delete Animation (deleteSpring):**
   ```javascript
   isDeleting ? {
     opacity: 0,
     transform: "scale(0.5) rotate(10deg)",
   } : {
     opacity: 1,
     transform: "scale(1) rotate(0deg)",
   }
   ```
   Node shrinks and rotates when deleted.

**Handle Rendering:**

```javascript
const renderInputHandles = () => {
  return config.inputs.map((input, index) => {
    const topPosition = /* calculate vertical position */;
    
    return (
      <AnimatedHandle
        type="target"
        position={Position.Left}
        id={`${id}-${input.id}`}
        style={{ top: `${topPosition}%`, background: input.color }}
        title={input.label}
        index={index}
      />
    );
  });
};
```

**Features:**
- Dynamic positioning based on number of handles
- Animated appearance with stagger delay
- Color customization per handle
- Hover animation (scale + rotate)

**Field Rendering:**

Supports multiple field types:

1. **Text Input:**
   ```javascript
   {
     type: "text",
     name: "inputName",
     label: "Name",
     defaultValue: "input_1",
     placeholder: "Enter name",
   }
   ```

2. **Select Dropdown:**
   ```javascript
   {
     type: "select",
     name: "inputType",
     label: "Type",
     options: [
       { value: "Text", label: "Text" },
       { value: "File", label: "File" },
     ],
   }
   ```

3. **Textarea:**
   ```javascript
   {
     type: "textarea",
     name: "text",
     label: "Text",
     rows: 3,
     placeholder: "Enter text",
   }
   ```

4. **Checkbox:**
   ```javascript
   {
     type: "checkbox",
     name: "enabled",
     label: "Enable feature",
   }
   ```

5. **Custom:**
   ```javascript
   {
     type: "custom",
     name: "custom",
     render: (value, onChange, nodeState) => (
       <div>Custom React element</div>
     ),
   }
   ```

**Field Change Handler:**
```javascript
const handleFieldChange = (fieldName, value) => {
  setNodeState((prev) => ({ ...prev, [fieldName]: value }));
  updateNodeField(id, fieldName, value);
  
  // Call custom onChange if provided
  const field = config.fields?.find((f) => f.name === fieldName);
  if (field?.onChange) {
    field.onChange(value, nodeState, updateNodeField, id);
  }
};
```

**Delete Button Component:**
```javascript
const DeleteButton = ({ onClick, style }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const buttonSpring = useSpring({
    transform: isHovered ? "scale(1.2) rotate(90deg)" : "scale(1) rotate(0deg)",
    background: isHovered ? "#a78bfa" : "#7c3aed",
    boxShadow: isHovered
      ? "0 0 20px rgba(167, 139, 250, 0.6)"
      : "0 2px 4px rgba(0, 0, 0, 0.3)",
    config: springConfigs.bouncy,
  });
  
  return (
    <animated.button style={buttonSpring} onClick={onClick}>
      <X size={14} strokeWidth={2.5} />
    </animated.button>
  );
};
```

---

#### nodeConfigs.js - Node Definitions

Central configuration file for all node types.

**Configuration Structure:**
```javascript
export const nodeConfigs = {
  input: {
    icon: Download,                    // Lucide icon component
    title: "Input",                    // Display title
    description: "Define an input source",
    width: 220,                        // Node width in pixels
    height: 120,                       // Node height in pixels
    
    fields: [                          // Form fields
      {
        name: "inputName",
        type: "text",
        label: "Name",
        defaultValue: "input_1",
        placeholder: "Enter input name",
      },
      {
        name: "inputType",
        type: "select",
        label: "Type",
        defaultValue: "Text",
        options: [
          { value: "Text", label: "Text" },
          { value: "File", label: "File" },
        ],
      },
    ],
    
    outputs: [{ id: "value", label: "Output" }],  // Output handles
  },
  
  // ... more node configs
};
```

**Node Configuration Options:**

| Property | Type | Description |
|----------|------|-------------|
| `icon` | Component | Lucide React icon |
| `title` | String | Node display name |
| `description` | String | Short description |
| `width` | Number | Node width (px) |
| `height` | Number | Node height (px) |
| `fields` | Array | Form field definitions |
| `inputs` | Array | Input handle definitions |
| `outputs` | Array | Output handle definitions |
| `content` | Function/Element | Custom content |
| `style` | Object | Additional CSS styles |
| `borderColor` | String | Border color |
| `background` | String | Background (gradient) |

**Utility Functions:**
```javascript
export const getNodeConfig = (name) => nodeConfigs[name];
export const getNodeNames = () => Object.keys(nodeConfigs);
```

---

#### nodeFactory.js - Component Creation

Factory pattern for creating node components from configurations.

```javascript
export const createNodeComponent = (config) => {
  return ({ id, data }) => {
    // Auto-populate defaults
    const processedData = { ...data };
    
    if (config.fields) {
      config.fields.forEach((field) => {
        if (typeof field.defaultValue === "function") {
          processedData[field.name] = 
            processedData[field.name] || field.defaultValue({ id, ...data });
        }
      });
    }
    
    return <BaseNode id={id} data={processedData} config={config} />;
  };
};
```

**Purpose:**
- Wraps BaseNode with config
- Handles default value generation
- Processes dynamic defaults (functions)

**Themed Node Creation:**
```javascript
export const createThemedNode = (config) => {
  const themedConfig = applyPurpleTheme(config);
  return createNodeComponent(themedConfig);
};
```

Applies purple theme to configuration before creating component.

**Batch Creation:**
```javascript
export const createNodes = (configs) => {
  return Object.entries(configs).reduce((acc, [name, config]) => {
    acc[name] = createThemedNode(config);
    return acc;
  }, {});
};
```

Creates multiple node components at once.

---

#### nodeTheme.js - Theming System

```javascript
export const purpleTheme = {
  colors: {
    primary: "#a78bfa",    // Light purple
    secondary: "#8b5cf6",  // Medium purple
    dark: "#7c3aed",       // Deep purple
    darker: "#6d28d9",     // Darker purple
  },
  
  node: {
    borderColor: "#a78bfa",
    background: "linear-gradient(135deg, #2d1f47 0%, #1a0f2e 100%)",
    titleColor: "#e9d5ff",
    iconColor: "#c4b5fd",
  },
  
  handle: {
    input: "#a78bfa",
    output: "#8b5cf6",
  },
};

export const applyPurpleTheme = (config) => ({
  ...config,
  borderColor: purpleTheme.node.borderColor,
  background: purpleTheme.node.background,
  titleColor: purpleTheme.node.titleColor,
  iconColor: purpleTheme.node.iconColor,
  
  inputs: config.inputs?.map((input) => ({
    ...input,
    color: purpleTheme.handle.input,
  })),
  
  outputs: config.outputs?.map((output) => ({
    ...output,
    color: purpleTheme.handle.output,
  })),
});
```

**Theme Features:**
- Consistent color palette
- Gradient backgrounds
- Handle color coordination
- Easy theme switching

---

#### textNode.js - Special Implementation

The Text Node has unique functionality: variable extraction and dynamic sizing.

**Variable Extraction:**
```javascript
const extractVariables = (text) => {
  const regex = /\{\{(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*)\}\}/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    if (!matches.includes(varName)) {
      matches.push(varName);
    }
  }
  
  return matches;
};
```

**Features:**
- Matches `{{variableName}}` pattern
- Validates JavaScript identifier rules
- Returns unique variable names

**Dynamic Sizing:**
```javascript
const calculateDimensions = (text) => {
  const minWidth = 220;
  const minHeight = 120;
  const charWidth = 7;
  const lineHeight = 20;
  
  const lines = text.split("\n");
  const maxLineLength = Math.max(...lines.map((line) => line.length), 20);
  const numLines = Math.max(lines.length, 1);
  
  const width = Math.max(minWidth, Math.min(maxLineLength * charWidth + 60, 500));
  const height = Math.max(minHeight, numLines * lineHeight + 80);
  
  return { width, height };
};
```

**Dynamic Inputs:**
```javascript
const dynamicInputs = useMemo(
  () => variables.map((varName) => ({
    id: varName,
    label: varName,
  })),
  [variables]
);
```

Creates input handles for each detected variable.

**Variable Display:**
```javascript
content: variables.length > 0 ? (
  <div style={{ /* badge container */ }}>
    <div>Variables: {variables.length}</div>
    <div>
      {variables.map((varName) => (
        <span key={varName} style={{ /* badge */ }}>
          {varName}
        </span>
      ))}
    </div>
  </div>
) : null,
```

Shows detected variables as badges below the textarea.

---

### Animation System

#### animationConfig.js - Animation Library

Centralized animation configuration for consistent feel.

**Spring Configurations:**
```javascript
export const springConfigs = {
  snappy: { tension: 400, friction: 25 },    // Quick UI interactions
  smooth: { tension: 300, friction: 25 },    // Most node animations
  slow: { tension: 200, friction: 30 },      // Important transitions
  bouncy: { tension: 300, friction: 10 },    // Playful interactions
  stiff: { tension: 500, friction: 30 },     // Precise animations
  wobbly: { tension: 180, friction: 12 },    // Attention-grabbing
};
```

**Spring Physics:**
- **Tension**: How quickly animation approaches target (higher = faster)
- **Friction**: Resistance to motion (higher = less bounce)

**Animation Presets:**
```javascript
export const animationPresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: springConfigs.smooth,
  },
  
  scaleIn: {
    from: { opacity: 0, transform: "scale(0.8)" },
    to: { opacity: 1, transform: "scale(1)" },
    config: springConfigs.smooth,
  },
  
  hoverLift: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
    config: springConfigs.snappy,
  },
  
  deleteOut: {
    opacity: 0,
    transform: "scale(0.5) rotate(10deg)",
    config: springConfigs.stiff,
  },
};
```

**Timing Utilities:**
```javascript
export const timing = {
  staggerDelay: (index, baseDelay = 50) => index * baseDelay,
  
  getStaggeredDelays: (count, baseDelay = 50) => 
    Array.from({ length: count }, (_, i) => i * baseDelay),
};
```

Used for sequential animations (e.g., handles appearing one by one).

**Easing Functions:**
```javascript
export const easings = {
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};
```

For CSS transitions (less common, springs preferred).

---

### Styling System

#### theme.js - Color System

```javascript
export const darkTheme = {
  bg: {
    primary: "#0d1117",      // Main background
    secondary: "#161b22",    // Secondary panels
    tertiary: "#21262d",     // Elevated elements
    hover: "#30363d",        // Hover states
    elevated: "#1c2128",     // Modals/overlays
  },
  
  border: {
    primary: "#30363d",      // Default borders
    secondary: "#21262d",    // Subtle borders
    muted: "#484f58",        // Muted borders
    accent: "#58a6ff",       // Accent borders
  },
  
  text: {
    primary: "#e6edf3",      // Main text
    secondary: "#8b949e",    // Secondary text
    tertiary: "#6e7681",     // Tertiary text
    muted: "#484f58",        // Muted text
    link: "#58a6ff",         // Links
  },
  
  accent: {
    primary: "#58a6ff",      // Primary accent (blue)
    secondary: "#1f6feb",    // Secondary accent
    tertiary: "#0969da",     // Tertiary accent
  },
  
  status: {
    success: "#3fb950",      // Success green
    warning: "#d29922",      // Warning yellow
    error: "#f85149",        // Error red
    info: "#58a6ff",         // Info blue
  },
  
  node: {
    bg: "#21262d",
    bgGradient: "linear-gradient(to bottom, #21262d, #1a1f26)",
    border: "#30363d",
    borderHover: "#58a6ff",
    shadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    shadowHover: "0 8px 16px rgba(0, 0, 0, 0.4)",
  },
  
  input: {
    bg: "#161b22",
    border: "#30363d",
    borderFocus: "#58a6ff",
    text: "#e6edf3",
    placeholder: "#6e7681",
  },
  
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
```

**Usage:**
Not currently used extensively, but provides a comprehensive color system for future theming.

---

#### nodeIcons.js - Icon System

```javascript
export const nodeIcons = {
  input: {
    icon: Download,
    label: "Input",
    color: "#3fb950",
  },
  output: {
    icon: Upload,
    label: "Output",
    color: "#f85149",
  },
  llm: {
    icon: Bot,
    label: "LLM",
    color: "#8957e5",
  },
  // ... more icons
};

export const getNodeIcon = (type) => {
  const normalizedType = type?.toLowerCase().replace(/node$/i, "");
  const iconData = nodeIcons[normalizedType];
  return iconData ? iconData.icon : Package;
};

export const getNodeIconColor = (type) => {
  const normalizedType = type?.toLowerCase().replace(/node$/i, "");
  const iconData = nodeIcons[normalizedType];
  return iconData ? iconData.color : "#8b949e";
};
```

**Features:**
- Centralized icon mapping
- Type-safe icon retrieval
- Fallback icon (Package)
- Color coordination

---

## Setup & Installation

### Prerequisites

- **Node.js**: 16.x or higher
- **Python**: 3.8 or higher
- **npm**: 8.x or higher
- **pip**: Latest version

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

**Server runs on:** `http://localhost:8000`

**API Documentation:** `http://localhost:8000/docs` (Swagger UI)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**App runs on:** `http://localhost:3000`

### Concurrent Startup (Windows)

Use the provided `start.bat`:
```bash
start.bat
```

This starts both backend and frontend simultaneously.

---

## Usage Guide

### Creating a Simple Pipeline

1. **Add Input Node**
   - Drag "Input" from toolbar to canvas
   - Configure name and type

2. **Add Processing Node**
   - Drag "LLM" node to canvas
   - Position it to the right of Input

3. **Add Output Node**
   - Drag "Output" to canvas
   - Position to the right of LLM

4. **Connect Nodes**
   - Click and drag from Input's output handle
   - Connect to LLM's "prompt" input handle
   - Connect LLM's output to Output's input

5. **Submit Pipeline**
   - Click "Submit Pipeline" button
   - View analysis results in toast notification

### Using Text Node Variables

1. **Add Text Node**
   ```
   Hello {{name}}, your age is {{age}}
   ```

2. **Observe Dynamic Inputs**
   - Node automatically creates "name" and "age" input handles
   - Variables shown as badges below text area

3. **Connect Variable Sources**
   - Connect other nodes to the dynamic inputs

### Node Keyboard Shortcuts

- **Delete**: Delete selected node/edge
- **Backspace**: Delete selected node/edge (alternative)

### Canvas Controls

- **Mouse Wheel**: Zoom in/out
- **Click + Drag**: Pan canvas
- **Shift + Click**: Multi-select nodes
- **Ctrl/Cmd + A**: Select all

---

## API Reference

### Backend API

#### Health Check
```http
GET /
```

**Response:**
```json
{
  "Ping": "Pong"
}
```

#### Parse Pipeline
```http
POST /pipelines/parse
Content-Type: application/json
```

**Request Body:**
```json
{
  "nodes": [
    {
      "id": "customInput-1",
      "type": "customInput",
      "position": { "x": 100, "y": 100 },
      "data": {
        "nodeType": "customInput",
        "inputName": "input_1",
        "inputType": "Text"
      }
    },
    {
      "id": "llm-1",
      "type": "llm",
      "position": { "x": 400, "y": 100 },
      "data": {
        "nodeType": "llm"
      }
    }
  ],
  "edges": [
    {
      "source": "customInput-1",
      "sourceHandle": "customInput-1-value",
      "target": "llm-1",
      "targetHandle": "llm-1-prompt",
      "id": "reactflow__edge-customInput-1-llm-1"
    }
  ]
}
```

**Response (Success):**
```json
{
  "num_nodes": 2,
  "num_edges": 1,
  "is_dag": true
}
```

**Response (Cycle Detected):**
```json
{
  "num_nodes": 3,
  "num_edges": 3,
  "is_dag": false
}
```

---

## Component Reference

### Prop Interfaces

#### BaseNode Props
```typescript
interface BaseNodeProps {
  id: string;              // Unique node identifier
  data: {
    nodeType: string;      // Type of node
    [key: string]: any;    // Additional field data
  };
  config: NodeConfig;      // Configuration object
}
```

#### NodeConfig Interface
```typescript
interface NodeConfig {
  icon?: React.Component;               // Icon component
  title: string;                        // Display title
  description?: string;                 // Short description
  width?: number;                       // Width in pixels
  height?: number;                      // Height in pixels
  borderColor?: string;                 // Border color
  background?: string;                  // Background (can be gradient)
  titleColor?: string;                  // Title text color
  iconColor?: string;                   // Icon color
  
  fields?: FieldConfig[];               // Form fields
  inputs?: HandleConfig[];              // Input handles
  outputs?: HandleConfig[];             // Output handles
  
  content?: React.ReactNode | Function; // Custom content
  style?: React.CSSProperties;          // Additional styles
  className?: string;                   // CSS class name
  hideDeleteButton?: boolean;           // Hide delete button
  springConfig?: SpringConfig;          // Animation config
}
```

#### FieldConfig Interface
```typescript
interface FieldConfig {
  name: string;                         // Field identifier
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'custom';
  label: string;                        // Display label
  defaultValue?: any | Function;        // Default value
  placeholder?: string;                 // Placeholder text
  rows?: number;                        // Textarea rows
  options?: {value: string, label: string}[];  // Select options
  style?: React.CSSProperties;          // Field styling
  onChange?: (value, nodeState, updateNodeField, nodeId) => void;  // Change handler
  render?: (value, onChange, nodeState) => React.ReactNode;  // Custom render
}
```

#### HandleConfig Interface
```typescript
interface HandleConfig {
  id: string;             // Handle identifier
  label?: string;         // Display label
  color?: string;         // Handle color
  style?: React.CSSProperties;  // Additional styling
}
```

---

## Development Guide

### Adding a New Node Type

1. **Define Configuration in nodeConfigs.js:**
   ```javascript
   export const nodeConfigs = {
     // ... existing configs
     
     myNewNode: {
       icon: MyIcon,
       title: "My New Node",
       description: "Does something cool",
       width: 240,
       height: 140,
       
       fields: [
         {
           name: "myField",
           type: "text",
           label: "My Field",
           defaultValue: "default",
           placeholder: "Enter value",
         },
       ],
       
       inputs: [{ id: "input", label: "Input" }],
       outputs: [{ id: "output", label: "Output" }],
     },
   };
   ```

2. **Create Component File (nodes/myNewNode.js):**
   ```javascript
   import { createThemedNode } from "./nodeFactory";
   import { nodeConfigs } from "./nodeConfigs";
   
   export const MyNewNode = createThemedNode(nodeConfigs.myNewNode);
   ```

3. **Register in ui.js:**
   ```javascript
   import { MyNewNode } from "./nodes/myNewNode";
   
   const nodeTypes = {
     // ... existing types
     myNewNode: MyNewNode,
   };
   ```

4. **Add to Toolbar (toolbar.js):**
   ```javascript
   import { MyIcon } from "lucide-react";
   
   <DraggableNode type="myNewNode" label="My Node" icon={MyIcon} />
   ```

5. **Add Icon Mapping (nodeIcons.js):**
   ```javascript
   export const nodeIcons = {
     // ... existing icons
     mynewnode: {
       icon: MyIcon,
       label: "My New Node",
       color: "#custom-color",
     },
   };
   ```

### Custom Node with Special Logic

If your node needs special logic (like TextNode), create a full component:

```javascript
// nodes/specialNode.js
import { useState, useEffect } from "react";
import { BaseNode } from "./baseNode";
import { MyIcon } from "lucide-react";
import { applyPurpleTheme } from "./nodeTheme";

export const SpecialNode = ({ id, data }) => {
  const [specialState, setSpecialState] = useState(null);
  
  useEffect(() => {
    // Special initialization logic
  }, []);
  
  const specialNodeConfig = {
    icon: MyIcon,
    title: "Special Node",
    width: 260,
    height: 180,
    
    fields: [
      {
        name: "myField",
        type: "text",
        label: "My Field",
        onChange: (value) => {
          // Custom logic on change
          setSpecialState(processValue(value));
        },
      },
    ],
    
    // Custom content based on state
    content: specialState ? (
      <div>{/* Custom React elements */}</div>
    ) : null,
    
    inputs: [/* ... */],
    outputs: [/* ... */],
  };
  
  const themedConfig = applyPurpleTheme(specialNodeConfig);
  
  return <BaseNode id={id} data={data} config={themedConfig} />;
};
```

### Customizing Animations

1. **Add Spring Config to animationConfig.js:**
   ```javascript
   export const springConfigs = {
     // ... existing configs
     myCustom: {
       tension: 350,
       friction: 20,
     },
   };
   ```

2. **Use in Component:**
   ```javascript
   import { springConfigs } from "../animationConfig";
   
   const mySpring = useSpring({
     /* animation properties */
     config: springConfigs.myCustom,
   });
   ```

### Modifying Theme

**Global Theme (theme.js):**
```javascript
export const darkTheme = {
  // Add or modify colors
  myCustomColor: "#hexcode",
};
```

**Node Theme (nodeTheme.js):**
```javascript
export const purpleTheme = {
  colors: {
    // Modify purple palette
    primary: "#new-color",
  },
};
```

### Backend Extension

**Adding New Analysis Logic:**

```python
# main.py

def my_analysis_function(nodes, edges):
    """
    Custom analysis logic
    """
    # Implementation
    return result

@app.post('/pipelines/my-analysis')
def my_analysis_endpoint(pipeline: Pipeline):
    result = my_analysis_function(pipeline.nodes, pipeline.edges)
    return {'result': result}
```

**Frontend Integration:**
```javascript
// submit.js or new file

const runMyAnalysis = async () => {
  const response = await fetch("http://localhost:8000/pipelines/my-analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodes, edges }),
  });
  
  const result = await response.json();
  // Handle result
};
```

---

## Project Structure Summary

```
Vectorshift/
│
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── .gitignore             # Git ignore rules
│   └── __pycache__/           # Python cache (ignored)
│
├── frontend/
│   ├── public/
│   │   ├── index.html         # HTML entry point
│   │   ├── manifest.json      # PWA manifest
│   │   └── fonts/             # Custom fonts
│   │       └── stylesheet.css
│   │
│   ├── src/
│   │   ├── index.js           # React entry point
│   │   ├── index.css          # Global styles
│   │   ├── App.js             # Main app component
│   │   ├── store.js           # Zustand state
│   │   ├── toolbar.js         # Node palette
│   │   ├── draggableNode.js   # Draggable items
│   │   ├── ui.js              # ReactFlow canvas
│   │   ├── submit.js          # Submit button
│   │   ├── theme.js           # Color system
│   │   ├── animationConfig.js # Animation library
│   │   ├── nodeIcons.js       # Icon mappings
│   │   │
│   │   ├── nodes/
│   │   │   ├── baseNode.js    # Base component
│   │   │   ├── nodeFactory.js # Factory pattern
│   │   │   ├── nodeConfigs.js # All configs
│   │   │   ├── nodeTheme.js   # Theme system
│   │   │   ├── inputNode.js   # Input node
│   │   │   ├── outputNode.js  # Output node
│   │   │   ├── llmNode.js     # LLM node
│   │   │   ├── textNode.js    # Text node (special)
│   │   │   ├── apiNode.js     # API node
│   │   │   ├── filterNode.js  # Filter node
│   │   │   ├── transformNode.js # Transform node
│   │   │   ├── conditionalNode.js # Conditional node
│   │   │   └── delayNode.js   # Delay node
│   │   │
│   │   └── styles/
│   │       ├── darkTheme.css  # Dark theme styles
│   │       ├── nodes.css      # Node styles
│   │       ├── submit.css     # Submit button styles
│   │       └── toolbar.css    # Toolbar styles
│   │
│   ├── package.json           # Node dependencies
│   └── README.md              # Frontend docs
│
├── start.bat                  # Windows startup script
└── start.sh                   # Unix startup script
```

---

## Best Practices

### Code Organization
1. **Keep configs centralized** in `nodeConfigs.js`
2. **Use factory pattern** for creating similar components
3. **Separate concerns**: UI logic, state, styling
4. **Reusable abstractions**: BaseNode pattern

### Performance
1. **Memoize expensive calculations** (useMemo, useCallback)
2. **Shallow comparison** in Zustand selectors
3. **Lazy loading** for large nodes
4. **Debounce** expensive operations

### Styling
1. **Consistent color palette** via theme files
2. **Smooth animations** with react-spring
3. **Responsive sizing** where appropriate
4. **Dark theme** throughout

### State Management
1. **Centralized state** in Zustand store
2. **Immutable updates** (spread operators)
3. **Minimal re-renders** (proper selectors)
4. **Local state** for component-specific data

---

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find and kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

**CORS errors:**
- Ensure backend CORS middleware includes frontend URL
- Check `allow_origins` in `main.py`

**Module not found:**
```bash
pip install -r requirements.txt
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Kill process or use different port
# Set in package.json or environment
PORT=3001 npm start
```

**Dependencies missing:**
```bash
npm install
```

**ReactFlow issues:**
- Ensure `reactflow` CSS is imported in component
- Check ReactFlow version compatibility

**State not updating:**
- Verify Zustand selector usage
- Check shallow comparison
- Ensure immutable updates

---

## Future Enhancements

### Potential Features
1. **Save/Load Pipelines**: Local storage or backend persistence
2. **Execution Engine**: Actually run pipelines
3. **More Node Types**: Database, Webhook, Schedule, etc.
4. **Node Grouping**: Group related nodes
5. **Undo/Redo**: History management
6. **Export Options**: JSON, Python code generation
7. **Validation Rules**: Input type checking
8. **Testing Suite**: Unit and integration tests
9. **Documentation Generator**: Auto-generate docs
10. **Performance Monitoring**: Analytics and metrics

---

## License & Credits

### Technologies Used
- **React**: UI framework
- **ReactFlow**: Node-based interface
- **Zustand**: State management
- **React Spring**: Animation library
- **Lucide React**: Icon library
- **React Hot Toast**: Notifications
- **FastAPI**: Backend framework
- **Pydantic**: Data validation

### Author
This project was created as a visual pipeline builder demonstration.

---

## Conclusion

This documentation covers every aspect of the VectorShift project, from high-level architecture to implementation details. The system uses modern web technologies and design patterns to create a powerful, extensible visual programming interface.

**Key Strengths:**
- **Modular architecture** enables easy extension
- **Consistent theming** provides polished UI
- **Smooth animations** enhance user experience
- **Type safety** reduces bugs (Pydantic on backend)
- **Reusable patterns** speed up development

For questions or contributions, please refer to specific sections of this documentation.
