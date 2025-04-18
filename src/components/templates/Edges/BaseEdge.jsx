import { BaseEdge } from 'reactflow';
 
export function CustomEdge({ sourceX, sourceY, targetX, targetY, ...props }) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
 
  return <BaseEdge path={edgePath} {...props} />;
}