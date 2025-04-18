import { Handle, Position } from 'reactflow';

export const BaseNode = ({ id, data, onNodeClick }) => {
  const isFloating = data.type === 'floating';

  return (
    
    <div
      className={`relative flex items-center justify-center
        ${isFloating ? 'w-10 h-10 rounded-full bg-blue-500 text-white font-bold text-lg shadow-lg border-2 border-white absolute translate-x-11' 
                     : 'w-32 h-20 bg-white shadow-md rounded-md border border-gray-300 cursor-pointer'}`}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(id, data);
      }}
    >
      {/* Floating Node (Centered inside the Base Node) */}
      {isFloating && (
        <div className="absolute flex items-center justify-center w-full h-full">
          +
        </div>
      )}

      {/* Regular Base Node content */}
      {!isFloating && (
        <>
          <div className="text-center">{data.label}</div>

          {/* Handles for regular nodes only */}
          <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-500" />
          <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-500" />
        </>
      )}
    </div>
  );
};
