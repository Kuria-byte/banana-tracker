import React from "react";
import type { Row } from "@/lib/types/row";
import { RowCard } from "./RowCard";

interface RowListProps {
  rows: Row[];
  onEdit: (row: Row) => void;
  onDelete?: (rowId: number) => void; // Not used in RowCard, but kept for compatibility
  onManageHoles: (row: Row) => void;
  selectedRowId?: number;
}

export const RowList: React.FC<RowListProps> = ({ rows, onEdit, onManageHoles, selectedRowId }) => {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row) => (
        <RowCard
          key={row.id}
          row={row}
          onEdit={onEdit}
          onManageHoles={onManageHoles}
          selected={selectedRowId === row.id}
        />
      ))}
    </div>
  );
}; 