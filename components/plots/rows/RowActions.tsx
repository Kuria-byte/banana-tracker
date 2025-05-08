import React from "react";
import type { Row } from "@/lib/types/row";

interface RowActionsProps {
  row: Row;
  onEdit: (row: Row) => void;
  onDelete: (rowId: number) => void;
  onManageHoles: (row: Row) => void;
}

export const RowActions: React.FC<RowActionsProps> = ({ row, onEdit, onDelete, onManageHoles }) => (
  <div className="flex gap-2">
    <button onClick={() => onEdit(row)} className="btn btn-sm btn-primary">Edit</button>
    <button onClick={() => onDelete(row.id)} className="btn btn-sm btn-danger">Delete</button>
    <button onClick={() => onManageHoles(row)} className="btn btn-sm btn-secondary">Manage Holes</button>
  </div>
); 