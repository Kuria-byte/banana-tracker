import React from "react";
import type { Row } from "@/lib/types/row";

interface RowCardProps {
  row: Row;
  onEdit: (row: Row) => void;
  onManageHoles: (row: Row) => void;
  selected?: boolean;
}

export const RowCard: React.FC<RowCardProps> = ({ row, onEdit, onManageHoles, selected }) => {
  return (
    <div className={`bg-white border rounded-lg p-4 mb-4 shadow-sm ${selected ? "border-black" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-lg">Row {row.rowNumber}</span>
        <button className={`btn btn-xs ${selected ? "btn-black" : "btn-outline"}`}>{selected ? "Selected" : "Select"}</button>
      </div>
      <div className="flex gap-8 text-sm text-gray-600 mb-2">
        <div>
          <div className="font-medium">Length</div>
          <div>{row.length} m</div>
        </div>
        <div>
          <div className="font-medium">Spacing</div>
          <div>{row.spacing} m</div>
        </div>
        <div>
          <div className="font-medium">Holes</div>
          <div>{row.holeCount}</div>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button className="btn btn-outline w-full" onClick={() => onEdit(row)}>
          <span className="mr-1">✏️</span> Edit Row
        </button>
        <button className="btn btn-black w-full" onClick={() => onManageHoles(row)}>
          <span className="mr-1">🌱</span> Manage Holes
        </button>
      </div>
    </div>
  );
}; 