import React from "react";
import type { HoleData } from "@/lib/types/row";

interface HoleListProps {
  holes: HoleData[];
  onEdit: (hole: HoleData) => void;
  onManagePlant: (hole: HoleData) => void;
}

export const HoleList: React.FC<HoleListProps> = ({ holes, onEdit, onManagePlant }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>Hole #</th>
            <th>Status</th>
            <th>Variety</th>
            <th>Health</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {holes.map((hole) => (
            <tr key={hole.holeNumber}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}; 