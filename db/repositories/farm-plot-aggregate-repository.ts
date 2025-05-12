import { db } from "../client"
import { getAllFarms } from "./farm-repository";
import { getAllPlots } from "./plot-repository";

export async function getFarmCardsData() {
  const farms = await getAllFarms();
  const plots = await getAllPlots();

  return farms.map(farm => {
    const farmPlots = plots.filter(plot => String(plot.farmId) === String(farm.id));
    const numberOfPlots = farmPlots.length;
    const numberOfHoles = farmPlots.reduce((sum, plot) => {
      if (!Array.isArray(plot.layoutStructure)) return sum;
      return sum + plot.layoutStructure.reduce((rowSum, row) => rowSum + (row.holes?.length || 0), 0);
    }, 0);

    return {
      ...farm,
      numberOfPlots,
      numberOfHoles,
    };
  });
} 