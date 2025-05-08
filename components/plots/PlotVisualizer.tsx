import React from "react";
import type { Row } from "@/lib/types/row";

interface PlotVisualizerProps {
  rows: Row[];
}

const statusColor = {
  EMPTY: "bg-gray-200",
  PLANTED: "bg-green-400",
  HARVESTED: "bg-yellow-400",
};

export const PlotVisualizer: React.FC<PlotVisualizerProps> = ({ rows }) => {
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center space-x-2">
          <span className="w-16 font-semibold">Row {row.rowNumber}</span>
          <div className="flex space-x-1">
            {row.holesData.map((hole) => (
              <div
                key={hole.holeNumber}
                className={`w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-xs cursor-pointer ${statusColor[hole.status]}`}
                title={`Hole ${hole.holeNumber}: ${hole.status}`}
              >
                {hole.holeNumber}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}; 