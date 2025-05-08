import React from "react";
import type { Row } from "@/lib/types/row";

interface RowItemProps {
  row: Row;
  onEdit: (row: Row) => void;
  onDelete: (rowId: number) => void;
  onManageHoles: (row: Row) => void;
}

export const RowItem: React.FC<RowItemProps> = ({ row, onEdit, onDelete, onManageHoles }) => {
  return (
    <tr>
      <td>{row.rowNumber}</td>
      <td>{row.length}</td>
      <td>{row.spacing}</td>
      <td>{row.holeCount}</td>
      <td>{row.notes}</td>
      <td>
        <button onClick={() => onEdit(row)} className="btn btn-sm btn-primary mr-2">Edit</button>
        <button onClick={() => onDelete(row.id)} className="btn btn-sm btn-danger mr-2">Delete</button>
        <button onClick={() => onManageHoles(row)} className="btn btn-sm btn-secondary">Manage Holes</button>
      </td>
    </tr>
  );
}; 