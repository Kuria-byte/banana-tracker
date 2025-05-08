"use client";
import React, { useState, useEffect } from "react";
import { HoleList } from "@/components/plots/holes/HoleList";
import { HoleForm } from "@/components/plots/holes/HoleForm";
import type { HoleData } from "@/lib/types/row";
import { getRowById } from "@/db/repositories/row-repository";
import {
  addHoles,
  updateHole,
  bulkUpdateHoles,
} from "@/app/actions/row-actions";

interface HoleClientProps {
  rowId: number;
}

export const HoleClient: React.FC<HoleClientProps> = ({ rowId }) => {
  const [holes, setHoles] = useState<HoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editHoleData, setEditHoleData] = useState<HoleData | null>(null);

  const fetchHoles = async () => {
    setLoading(true);
    const row = await getRowById(rowId);
    setHoles(row?.holesData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowId]);

  const handleCreate = () => {
    setEditHoleData(null);
    setShowForm(true);
  };

  const handleEdit = (hole: HoleData) => {
    setEditHoleData(hole);
    setShowForm(true);
  };

  const handleFormSubmit = async (values: Partial<HoleData>) => {
    if (editHoleData) {
      await updateHole(rowId, editHoleData.holeNumber, values);
    } else {
      await addHoles(rowId, [{ ...values, holeNumber: holes.length + 1 }]);
    }
    setShowForm(false);
    setEditHoleData(null);
    fetchHoles();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditHoleData(null);
  };

  // Placeholder for manage plant
  const handleManagePlant = (hole: HoleData) => {
    alert(`Manage plant for hole #${hole.holeNumber}`);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Holes</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          Add Hole
        </button>
      </div>
      {showForm && (
        <HoleForm
          initialValues={editHoleData || {}}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      )}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <HoleList
          holes={holes}
          onEdit={handleEdit}
          onManagePlant={handleManagePlant}
        />
      )}
    </div>
  );
}; 