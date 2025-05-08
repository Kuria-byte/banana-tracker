import React, { useState } from "react";
import type { HoleData } from "@/lib/types/row";

interface HoleFormProps {
  initialValues?: Partial<HoleData>;
  onSubmit: (values: Partial<HoleData>) => void;
  onCancel: () => void;
}

export const HoleForm: React.FC<HoleFormProps> = ({ initialValues = {}, onSubmit, onCancel }) => {
  const [holeNumber, setHoleNumber] = useState(initialValues.holeNumber || 1);
  const [status, setStatus] = useState<HoleData["status"]>(initialValues.status || "EMPTY");
  const [plantedDate, setPlantedDate] = useState(initialValues.plantedDate || "");
  const [plantVariety, setPlantVariety] = useState(initialValues.plantVariety || "");
  const [plantHealth, setPlantHealth] = useState(initialValues.plantHealth || "");
  const [notes, setNotes] = useState(initialValues.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ holeNumber, status, plantedDate, plantVariety, plantHealth, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="holeNumber">Hole Number</label>
        <input id="holeNumber" type="number" value={holeNumber} onChange={e => setHoleNumber(Number(e.target.value))} min={1} required className="input input-bordered w-full" placeholder="Enter hole number" />
      </div>
      <div>
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={e => setStatus(e.target.value as HoleData["status"])} className="select select-bordered w-full">
          <option value="EMPTY">Empty</option>
          <option value="PLANTED">Planted</option>
          <option value="HARVESTED">Harvested</option>
        </select>
      </div>
      <div>
        <label htmlFor="plantedDate">Planted Date</label>
        <input id="plantedDate" type="date" value={plantedDate} onChange={e => setPlantedDate(e.target.value)} className="input input-bordered w-full" placeholder="Select planted date" />
      </div>
      <div>
        <label htmlFor="plantVariety">Plant Variety</label>
        <input id="plantVariety" type="text" value={plantVariety} onChange={e => setPlantVariety(e.target.value)} className="input input-bordered w-full" placeholder="Enter plant variety" />
      </div>
      <div>
        <label htmlFor="plantHealth">Plant Health</label>
        <input id="plantHealth" type="text" value={plantHealth} onChange={e => setPlantHealth(e.target.value)} className="input input-bordered w-full" placeholder="Enter plant health" />
      </div>
      <div>
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} className="textarea textarea-bordered w-full" placeholder="Enter notes (optional)" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">Save</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}; 