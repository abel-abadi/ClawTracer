import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { OpenClawAction } from '../types';

interface FlowViewerProps {
  data: OpenClawAction[];
  onNodeClick: (nodeData: OpenClawAction) => void;
}

const nodeWidth = 350;
const nodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};


export const FlowViewer: React.FC<FlowViewerProps> = ({ data, onNodeClick }) => {
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    data.forEach((action, index) => {
      // Determine styling based on type and error status
      let bgColor = 'bg-card';
      let borderColor = 'border-border';
      
      if (action.type === 'observation' && (action.exit_code !== 0 || action.stderr)) {
        borderColor = 'border-destructive';
        bgColor = 'bg-destructive/10';
      }

      nodes.push({
        id: action.id,
        position: { x: 0, y: 0 }, // Handled by dagre
        data: { 
          label: (
            <div className={`p-3 rounded-md border shadow-sm w-[300px] text-left flex flex-col gap-1 ${bgColor} ${borderColor}`}>
              <div className="flex items-center justify-between">
                 <span className="font-semibold text-sm capitalize">{action.type.replace('_', ' ')}</span>
                 <span className="text-xs text-muted-foreground">{new Date(action.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-xs text-foreground truncate mt-1">
                {action.type === 'thought' || action.type === 'model_output' 
                  ? action.content 
                  : action.type === 'tool_call' 
                    ? `🛠️ ${action.tool_name}: ${action.tool_args?.command || '...'}`
                    : `🔍 Exit Code: ${action.exit_code}`
                }
              </div>
            </div>
          ),
          rawData: action 
        },
        type: 'default',
        style: { width: 300, background: 'transparent', border: 'none', padding: 0 }
      });

      // Connect to previous node to form the chain
      if (index > 0) {
        edges.push({
          id: `e-${data[index - 1].id}-${action.id}`,
          source: data[index - 1].id,
          target: action.id,
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      }
    });

    return getLayoutedElements(nodes, edges);
  }, [data]);

  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, __, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-900 rounded-md border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.data.rawData as OpenClawAction)}
        fitView
        attributionPosition="bottom-right"
      >
        <MiniMap zoomable pannable />
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};
