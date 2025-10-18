from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import defaultdict, deque


app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Node(BaseModel):
    id: str


class Edge(BaseModel):
    source: str
    target: str


class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


def is_dag(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> bool:
    """
    Check if the graph formed by nodes and edges is a Directed Acyclic Graph (DAG).
    Uses Kahn's algorithm (topological sort) to detect cycles.
    
    Args:
        nodes: List of node dictionaries
        edges: List of edge dictionaries with 'source' and 'target' keys
    
    Returns:
        bool: True if the graph is a DAG, False if it contains cycles
    """
    if not nodes:
        return True
    
    # Build adjacency list and calculate in-degrees
    adjacency_list = defaultdict(list)
    in_degree = defaultdict(int)
    
    # Initialize all nodes with in-degree 0
    node_ids = {node['id'] for node in nodes}
    for node_id in node_ids:
        in_degree[node_id] = 0
    
    # Build the graph
    for edge in edges:
        source = edge['source']
        target = edge['target']
        adjacency_list[source].append(target)
        in_degree[target] += 1
    
    # Kahn's algorithm: Start with nodes that have no incoming edges
    queue = deque([node_id for node_id in node_ids if in_degree[node_id] == 0])
    visited_count = 0
    
    while queue:
        current = queue.popleft()
        visited_count += 1
        
        # For each neighbor, reduce in-degree and add to queue if it becomes 0
        for neighbor in adjacency_list[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    # If we visited all nodes, there's no cycle (it's a DAG)
    return visited_count == len(node_ids)


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}


@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    """
    Parse a pipeline and return analysis results.
    
    Args:
        pipeline: Pipeline object containing nodes and edges
    
    Returns:
        dict: Contains num_nodes, num_edges, and is_dag
    """
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag_status = is_dag(pipeline.nodes, pipeline.edges)
    
    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': dag_status
    }
