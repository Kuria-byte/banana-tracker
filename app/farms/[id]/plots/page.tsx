import React from "react";
import { getPlotsByFarmId } from "@/db/repositories/plot-repository";
import { PlotCard } from "@/components/plots/PlotCard";

interface PlotListPageProps {
  params: { id: string };
}

const PlotListPage = async ({ params }: PlotListPageProps) => {
  const plots = await getPlotsByFarmId(Number(params.id));
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Plots</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plots.map((plot) => (
          <PlotCard
            key={plot.id}
            id={plot.id}
            name={plot.name}
            area={plot.area ? `${plot.area} acres` : "-"}
            soilType={plot.soilType || "-"}
            dateEstablished={plot.createdAt ? new Date(plot.createdAt).toLocaleDateString() : "-"}
            rowCount={plot.rowCount ?? 0}
            healthStatus={plot.status}
            farmId={params.id}
          />
        ))}
      </div>
    </div>
  );
};

export default PlotListPage; 