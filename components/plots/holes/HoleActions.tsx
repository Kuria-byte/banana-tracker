import React from "react";
import type { HoleData } from "@/lib/types/row";

interface HoleActionsProps {
  hole: HoleData;
  onEdit: (hole: HoleData) => void;
  onManagePlant: (hole: HoleData) => void;
}

export const HoleActions: React.FC<HoleActionsProps> = ({ hole, onEdit, onManagePlant }) => (
  <div className="flex gap-2">
    <button onClick={() => onEdit(hole)} className="btn btn-sm btn-primary">Edit</button>
    <button onClick={() => onManagePlant(hole)} className="btn btn-sm btn-secondary">Manage Plant</button>
  </div>
); 