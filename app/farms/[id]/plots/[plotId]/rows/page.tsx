import React from "react";
import RowClient from "./RowClient";
import { getPlotWithRows } from "@/app/actions/plot-actions";

interface RowPageProps {
  params: { id: string; plotId: string };
}

export default async function RowPage(props: RowPageProps) {
  const { params } = await props;
  const plot = await getPlotWithRows(Number(params.plotId));
  const rows = Array.isArray(plot?.layoutStructure) ? plot.layoutStructure : [];
  if (!rows || rows.length === 0) {
    return <div>No rows found for this plot.</div>;
  }
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Rows for Plot {params.plotId}</h1>
      <RowClient rows={rows} plotId={params.plotId} />
    </div>
  );
} 