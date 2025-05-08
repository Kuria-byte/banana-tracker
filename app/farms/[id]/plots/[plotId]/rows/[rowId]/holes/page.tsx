import React from "react";
import { HoleClient } from "./HoleClient";

interface HolesPageProps {
  params: { id: string; plotId: string; rowId: string };
}

const HolesPage = ({ params }: HolesPageProps) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Holes for Row {params.rowId}</h1>
      <HoleClient rowId={Number(params.rowId)} />
    </div>
  );
};

export default HolesPage; 