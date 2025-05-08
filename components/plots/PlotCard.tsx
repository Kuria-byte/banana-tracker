import React from "react";
import Link from "next/link";

interface PlotCardProps {
  id: string | number;
  name: string;
  area: string;
  soilType: string;
  dateEstablished: string;
  rowCount: number;
  healthStatus?: string;
  farmId: string | number;
}

export const PlotCard: React.FC<PlotCardProps> = ({ id, name, area, soilType, dateEstablished, rowCount, healthStatus, farmId }) => {
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-lg">{name}</span>
        {healthStatus && (
          <span className={`text-xs px-2 py-1 rounded ${healthStatus === "Good" ? "bg-green-100 text-green-700" : healthStatus === "Average" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{healthStatus}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div>
          <div className="font-medium">Area</div>
          <div>{area}</div>
        </div>
        <div>
          <div className="font-medium">Rows</div>
          <div>{rowCount}</div>
        </div>
        <div>
          <div className="font-medium">Soil Type</div>
          <div>{soilType}</div>
        </div>
        <div>
          <div className="font-medium">Established</div>
          <div>{dateEstablished}</div>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <Link href={`/farms/${farmId}/plots/${id}`} className="btn btn-outline w-full">View Plot Details</Link>
        <Link href={`/farms/${farmId}/plots/${id}/rows`} className="btn btn-black w-full">Manage Rows</Link>
      </div>
    </div>
  );
}; 