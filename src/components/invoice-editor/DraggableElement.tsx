
import React, { useState, ReactNode } from 'react';
import Draggable from 'react-draggable';
import { cn } from '@/lib/utils';

interface DraggableElementProps {
  id: string;
  type: 'header' | 'client' | 'dates' | 'items' | 'totals' | 'notes' | 'signature';
  defaultPosition?: { x: number; y: number };
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  locked?: boolean;
  children: ReactNode;
  className?: string;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  id,
  type,
  defaultPosition = { x: 0, y: 0 },
  onPositionChange,
  locked = false,
  children,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  const handleDragStop = (e: any, data: { x: number; y: number }) => {
    setIsDragging(false);
    if (onPositionChange) {
      onPositionChange(id, { x: data.x, y: data.y });
    }
  };

  return (
    <Draggable
      disabled={locked}
      defaultPosition={defaultPosition}
      bounds="parent"
      onStart={handleDragStart}
      onStop={handleDragStop}
      handle=".drag-handle"
    >
      <div 
        className={cn(
          "absolute border border-transparent transition-all",
          isDragging ? "border-primary z-50 shadow-md" : "hover:border-gray-200",
          locked ? "cursor-default" : "cursor-move",
          className
        )}
        data-element-type={type}
      >
        <div className="drag-handle absolute inset-0 z-10" />
        {children}
      </div>
    </Draggable>
  );
};

export default DraggableElement;
