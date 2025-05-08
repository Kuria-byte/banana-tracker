import React from "react";
import type { HoleData } from "@/lib/types/row";

interface HoleItemProps {
  hole: HoleData;
  onEdit: (hole: HoleData) => void;
  onManagePlant: (hole: HoleData) => void;
}

export const HoleItem: React.FC<HoleItemProps> = ({ hole, onEdit, onManagePlant }) => {
  return (
    <tr>
      <td>{hole.holeNumber}</td>
      <td>{hole.status}</td>
      <td>{hole.plantVariety || '-'}</td>
      <td>{hole.plantHealth || '-'}</td>
      <td>{hole.notes || '-'}</td>
      <td>
        <button onClick={() => onEdit(hole)} className="btn btn-sm btn-primary mr-2">Edit</button>
        <button onClick={() => onManagePlant(hole)} className="btn btn-sm btn-secondary">Manage Plant</button>
      </td>
    </tr>
  );
}; 