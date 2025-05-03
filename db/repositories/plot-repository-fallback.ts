import * as plotRepository from "./plot-repository"
import * as mockData from "@/lib/mock-data"
import { withFallback } from "./fallback"
import type { Plot } from "@/lib/mock-data"
import type { PlotFormValues } from "@/lib/validations/form-schemas"

// Mock implementations that use the mock data
function getAllPlotsMock(): Plot[] {
  return mockData.plots
}

function getPlotByIdMock(id: string): Plot | null {
  return mockData.getPlotById(id)
}

function getPlotsByFarmIdMock(farmId: string): Plot[] {
  return mockData.getPlotsByFarmId(farmId)
}

function createPlotMock(values: PlotFormValues): Plot {
  const newPlot: Plot = {
    id: `plot-${Date.now()}`,
    farmId: values.farmId,
    name: values.name,
    area: values.area,
    soilType: values.soilType,
    dateEstablished: values.dateEstablished.toISOString(),
    healthStatus: values.healthStatus,
    rowCount: 0,
  }

  // In a real implementation, we would add this to the mock data
  // mockData.plots.push(newPlot);

  return newPlot
}

function updatePlotMock(id: string, values: PlotFormValues): Plot {
  const plot = mockData.getPlotById(id)

  if (!plot) {
    throw new Error(`Plot with id ${id} not found`)
  }

  const updatedPlot: Plot = {
    ...plot,
    name: values.name,
    area: values.area,
    soilType: values.soilType,
    dateEstablished: values.dateEstablished.toISOString(),
    healthStatus: values.healthStatus,
  }

  // In a real implementation, we would update the mock data
  // const index = mockData.plots.findIndex(p => p.id === id);
  // if (index !== -1) {
  //   mockData.plots[index] = updatedPlot;
  // }

  return updatedPlot
}

function deletePlotMock(id: string): boolean {
  // In a real implementation, we would remove from the mock data
  // const index = mockData.plots.findIndex(p => p.id === id);
  // if (index !== -1) {
  //   mockData.plots.splice(index, 1);
  //   return true;
  // }

  return mockData.getPlotById(id) !== undefined
}

// Create fallback versions of all repository functions
export const getAllPlots = withFallback(
  plotRepository.getAllPlots,
  getAllPlotsMock,
  "Failed to fetch plots from database",
)

export const getPlotById = withFallback(
  async (id: string) => plotRepository.getPlotById(Number.parseInt(id)),
  getPlotByIdMock,
  "Failed to fetch plot from database",
)

export const getPlotsByFarmId = withFallback(
  async (farmId: string) => plotRepository.getPlotsByFarmId(Number.parseInt(farmId)),
  getPlotsByFarmIdMock,
  "Failed to fetch plots for farm from database",
)

export const createPlot = withFallback(plotRepository.createPlot, createPlotMock, "Failed to create plot in database")

export const updatePlot = withFallback(
  async (id: string, values: PlotFormValues) => plotRepository.updatePlot(Number.parseInt(id), values),
  updatePlotMock,
  "Failed to update plot in database",
)

export const deletePlot = withFallback(
  async (id: string) => plotRepository.deletePlot(Number.parseInt(id)),
  deletePlotMock,
  "Failed to delete plot from database",
)
