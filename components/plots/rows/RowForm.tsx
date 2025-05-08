import React, { useState } from "react";
import type { RowData, HoleData } from "@/lib/types/plot";

interface RowFormProps {
  initialValues?: Partial<RowData>;
  onSubmit: (values: RowData) => void;
  onCancel: () => void;
}

export const RowForm: React.FC<RowFormProps> = ({ initialValues = {}, onSubmit, onCancel }) => {
  const [rowNumber, setRowNumber] = useState(initialValues.rowNumber || 1);
  const [length, setLength] = useState(initialValues.length || 0);
  const [spacing, setSpacing] = useState(initialValues.spacing || 0);
  const [holeCount, setHoleCount] = useState(initialValues.holes ? initialValues.holes.length : 0);
 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate holes array
    const holes: HoleData[] = Array.from({ length: holeCount }, (_, i) => ({
      holeNumber: i + 1,
      status: "EMPTY",
      plantHealth: "Healthy",
      rowNumber,
    }));
    // Submit complete RowData object
    onSubmit({
      rowNumber,
      length,
      spacing,
      holes,
     
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="rowNumber">Row Number</label>
        <input id="rowNumber" type="number" value={rowNumber} onChange={e => setRowNumber(Number(e.target.value))} min={1} required className="input input-bordered w-full" placeholder="Enter row number" />
      </div>
      <div>
        <label htmlFor="length">Length (m)</label>
        <input id="length" type="number" value={length} onChange={e => setLength(Number(e.target.value))} min={0} step={0.01} required className="input input-bordered w-full" placeholder="Enter row length" />
      </div>
      <div>
        <label htmlFor="spacing">Spacing (m)</label>
        <input id="spacing" type="number" value={spacing} onChange={e => setSpacing(Number(e.target.value))} min={0} step={0.01} required className="input input-bordered w-full" placeholder="Enter spacing" />
      </div>
      <div>
        <label htmlFor="holeCount">Number of Holes</label>
        <input id="holeCount" type="number" value={holeCount} onChange={e => setHoleCount(Number(e.target.value))} min={0} required className="input input-bordered w-full" placeholder="Enter number of holes" />
      </div>
    
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">Save</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}; 