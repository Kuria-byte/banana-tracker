// Mock data for the Banana Plantation Tracker

// User roles
export type UserRole = "Farm Manager" | "Farm Consultant" | "Team Leader" | "Farm Worker"

// User interface
export interface User {
  id: string
  name: string
  role: UserRole
  email: string
  phone: string
}

// Farm interface
export interface Farm {
  id: string
  name: string
  location: string
  area: number // in acres
  plotCount: number
  dateEstablished: string
  healthStatus: "Good" | "Average" | "Poor"
  teamLeaderId: string
  group_code?: string // Optional group code for farms
  // New fields for DB parity
  healthScore?: number
  groupCode?: string
  regionCode?: string
  isActive?: boolean
  creatorId?: string | number
  createdAt?: string
  updatedAt?: string
}

// Plot interface
export interface Plot {
  id: string
  farmId: string
  name: string
  area: number // in acres
  soilType: string
  dateEstablished: string
  rowCount: number
  holeCount?: number
  plantCount?: number
  layoutStructure?: any
  healthStatus: "Good" | "Average" | "Poor"
  holes?: number // Optional holes property
}

// Row interface
export interface Row {
  id: string
  plotId: string
  rowNumber: number
  plantCount: number
  plantingDate: string
  varietyName: string
  spacing: number // in meters
  healthStatus: "Healthy" | "Diseased" | "Pest-affected" | "Damaged"
}

// Growth Stage interface
export interface GrowthStage {
  id: string
  rowId: string
  plantPosition: number
  flowerEmergenceDate?: string
  bunchFormationDate?: string
  fruitDevelopmentStartDate?: string
  expectedHarvestDate?: string
  actualHarvestDate?: string
  bunchWeight?: number
  healthStatus: "Healthy" | "Diseased" | "Pest-affected" | "Damaged"
}

// Agricultural Input interface
export interface AgriculturalInput {
  id: string
  plotId: string
  rowId?: string
  type: "Manure" | "Herbicide" | "Fertilizer" | "Pesticide" | "Irrigation"
  productName: string
  applicationDate: string
  quantity: number
  unit: string
  applicatorId: string
  safetyInterval?: number
}

// Task interface
export interface Task {
  id: string
  title: string
  description: string
  assignedToId: string
  farmId: string
  plotId?: string
  rowId?: string
  dueDate: string
  status: "Pending" | "In Progress" | "Completed" | "Cancelled"
  priority: "Low" | "Medium" | "High" | "Urgent"
  type: "Planting" | "Harvesting" | "Maintenance" | "Input Application" | "Inspection"
  dateCreated?: string
  // New fields for real DB data
  farmName?: string
  farmLocation?: string
  assigneeName?: string
  assigneeEmail?: string
}

// Harvest interface
export interface Harvest {
  id: string
  farmId: string
  plotId: string
  harvestDate: string
  bunchCount: number
  totalWeight: number
  qualityRating: "Excellent" | "Good" | "Average" | "Poor"
  notes: string
}

// Yield Forecast interface
export interface YieldForecast {
  id: string
  farmId: string
  forecastPeriod: string // e.g., "2023-Q3"
  estimatedBunches: number
  estimatedWeight: number
  confidenceLevel: "High" | "Medium" | "Low"
}

// Mock users
export const users: User[] = [
  {
    id: "user1",
    name: "Joy",
    role: "Farm Manager",
    email: "joy@kamili.co.ke",
    phone: "+254 712 345 678",
  },
  {
    id: "user2",
    name: "Lynnette Nyanjau",
    role: "Farm Consultant",
    email: "lynnette@kamili.co.ke",
    phone: "+254 723 456 789",
  },
  {
    id: "user3",
    name: "Kevin Mwangi",
    role: "Team Leader",
    email: "kevin@kamili.co.ke",
    phone: "+254 734 567 890",
  },
  {
    id: "user4",
    name: "Akinyi Adhiambo",
    role: "Farm Worker",
    email: "akinyi@kamili.co.ke",
    phone: "+254 745 678 901",
  },
  {
    id: "user5",
    name: "Muthoni Njeri",
    role: "Farm Worker",
    email: "muthoni@kamili.co.ke",
    phone: "+254 756 789 012",
  },
  {
    id: "user6",
    name: "Kipchoge Keino",
    role: "Farm Worker",
    email: "kipchoge@kamili.co.ke",
    phone: "+254 767 890 123",
  },
  {
    id: "user7",
    name: "Atieno Auma",
    role: "Farm Worker",
    email: "atieno@kamili.co.ke",
    phone: "+254 778 901 234",
  },
  {
    id: "user8",
    name: "Njoroge Kamau",
    role: "Farm Worker",
    email: "njoroge@kamili.co.ke",
    phone: "+254 789 012 345",
  },
]

// Mock farms
export const farms: Farm[] = [
  // Karii Farms
  {
    id: "farm1",
    name: "Karii East Farm",
    location: "Karii, Kirinyaga County",
    area: 3.5,
    plotCount: 4,
    dateEstablished: "2020-03-15",
    healthStatus: "Good",
    teamLeaderId: "user3",
  },
  {
    id: "farm2",
    name: "Karii Central Farm",
    location: "Karii, Kirinyaga County",
    area: 2.8,
    plotCount: 3,
    dateEstablished: "2019-07-22",
    healthStatus: "Good",
    teamLeaderId: "user3",
  },
  {
    id: "farm3",
    name: "Karii West Farm",
    location: "Karii, Kirinyaga County",
    area: 4.0,
    plotCount: 5,
    dateEstablished: "2018-11-05",
    healthStatus: "Average",
    teamLeaderId: "user3",
  },
  {
    id: "farm4",
    name: "Karii North Farm",
    location: "Karii, Kirinyaga County",
    area: 1.5,
    plotCount: 2,
    dateEstablished: "2021-02-18",
    healthStatus: "Good",
    teamLeaderId: "user3",
  },
  {
    id: "farm5",
    name: "Karii South Farm",
    location: "Karii, Kirinyaga County",
    area: 2.2,
    plotCount: 3,
    dateEstablished: "2020-09-30",
    healthStatus: "Poor",
    teamLeaderId: "user3",
  },
  {
    id: "farm6",
    name: "Karii Riverside Farm",
    location: "Karii, Kirinyaga County",
    area: 3.2,
    plotCount: 4,
    dateEstablished: "2019-04-12",
    healthStatus: "Average",
    teamLeaderId: "user3",
  },
  {
    id: "farm7",
    name: "Karii Hillside Farm",
    location: "Karii, Kirinyaga County",
    area: 2.7,
    plotCount: 3,
    dateEstablished: "2020-06-25",
    healthStatus: "Good",
    teamLeaderId: "user3",
  },
  {
    id: "farm8",
    name: "Karii Valley Farm",
    location: "Karii, Kirinyaga County",
    area: 1.8,
    plotCount: 2,
    dateEstablished: "2021-01-10",
    healthStatus: "Average",
    teamLeaderId: "user3",
  },
  {
    id: "farm9",
    name: "Karii Creek Farm",
    location: "Karii, Kirinyaga County",
    area: 2.5,
    plotCount: 3,
    dateEstablished: "2019-11-20",
    healthStatus: "Good",
    teamLeaderId: "user3",
  },
  // Kangai Farms
  {
    id: "farm10",
    name: "Kangai Main Farm",
    location: "Kangai, Kirinyaga County",
    area: 3.8,
    plotCount: 4,
    dateEstablished: "2018-05-14",
    healthStatus: "Good",
    teamLeaderId: "user3",
  },
  {
    id: "farm11",
    name: "Kangai East Farm",
    location: "Kangai, Kirinyaga County",
    area: 2.3,
    plotCount: 3,
    dateEstablished: "2019-08-17",
    healthStatus: "Average",
    teamLeaderId: "user3",
  },
  {
    id: "farm12",
    name: "Kangai West Farm",
    location: "Kangai, Kirinyaga County",
    area: 1.7,
    plotCount: 2,
    dateEstablished: "2020-10-05",
    healthStatus: "Good",
    teamLeaderId: "user3",
  },
  {
    id: "farm13",
    name: "Kangai North Farm",
    location: "Kangai, Kirinyaga County",
    area: 2.9,
    plotCount: 3,
    dateEstablished: "2019-03-22",
    healthStatus: "Poor",
    teamLeaderId: "user3",
  },
  {
    id: "farm14",
    name: "Kangai South Farm",
    location: "Kangai, Kirinyaga County",
    area: 3.3,
    plotCount: 4,
    dateEstablished: "2018-09-11",
    healthStatus: "Average",
    teamLeaderId: "user3",
  },
  {
    id: "farm15",
    name: "Kangai Riverside Farm",
    location: "Kangai, Kirinyaga County",
    area: 2.1,
    plotCount: 3,
    dateEstablished: "2020-07-19",
    healthStatus: "Good",
    teamLeaderId: "user3",
  },
  {
    id: "farm16",
    name: "Kangai Hillside Farm",
    location: "Kangai, Kirinyaga County",
    area: 1.9,
    plotCount: 2,
    dateEstablished: "2021-04-03",
    healthStatus: "Average",
    teamLeaderId: "user3",
  },
  {
    id: "farm17",
    name: "Kangai Valley Farm",
    location: "Kangai, Kirinyaga County",
    area: 2.6,
    plotCount: 3,
    dateEstablished: "2019-12-15",
    healthStatus: "Good",
    teamLeaderId: "user3",
  },
  {
    id: "farm18",
    name: "Kangai Creek Farm",
    location: "Kangai, Kirinyaga County",
    area: 1.4,
    plotCount: 2,
    dateEstablished: "2020-05-28",
    healthStatus: "Average",
    teamLeaderId: "user3",
  },
]

// Generate some mock plots for the first farm
export const plots: Plot[] = [
  {
    id: "plot1",
    farmId: "farm1",
    name: "East Plot A",
    area: 0.8,
    soilType: "Loamy",
    dateEstablished: "2020-03-20",
    rowCount: 10,
    healthStatus: "Good",
  },
  {
    id: "plot2",
    farmId: "farm1",
    name: "East Plot B",
    area: 1.2,
    soilType: "Clay Loam",
    dateEstablished: "2020-04-05",
    rowCount: 15,
    healthStatus: "Average",
  },
  {
    id: "plot3",
    farmId: "farm1",
    name: "East Plot C",
    area: 0.7,
    soilType: "Sandy Loam",
    dateEstablished: "2020-04-15",
    rowCount: 8,
    healthStatus: "Good",
  },
  {
    id: "plot4",
    farmId: "farm1",
    name: "East Plot D",
    area: 0.8,
    soilType: "Loamy",
    dateEstablished: "2020-05-10",
    rowCount: 10,
    healthStatus: "Good",
  },
  {
    id: "plot5",
    farmId: "farm2",
    name: "Central Plot A",
    area: 0.9,
    soilType: "Clay",
    dateEstablished: "2019-08-01",
    rowCount: 12,
    healthStatus: "Average",
  },
  {
    id: "plot6",
    farmId: "farm2",
    name: "Central Plot B",
    area: 1.0,
    soilType: "Loamy",
    dateEstablished: "2019-08-15",
    rowCount: 14,
    healthStatus: "Good",
  },
  {
    id: "plot7",
    farmId: "farm2",
    name: "Central Plot C",
    area: 0.9,
    soilType: "Sandy Loam",
    dateEstablished: "2019-09-01",
    rowCount: 12,
    healthStatus: "Good",
  },
]

// Generate some mock rows for the first plot
export const rows: Row[] = [
  {
    id: "row1",
    plotId: "plot1",
    rowNumber: 1,
    plantCount: 25,
    plantingDate: "2020-03-25",
    varietyName: "Grand Nain",
    spacing: 2.5,
    healthStatus: "Healthy",
  },
  {
    id: "row2",
    plotId: "plot1",
    rowNumber: 2,
    plantCount: 25,
    plantingDate: "2020-03-25",
    varietyName: "Grand Nain",
    spacing: 2.5,
    healthStatus: "Healthy",
  },
  {
    id: "row3",
    plotId: "plot1",
    rowNumber: 3,
    plantCount: 25,
    plantingDate: "2020-03-26",
    varietyName: "Grand Nain",
    spacing: 2.5,
    healthStatus: "Pest-affected",
  },
  {
    id: "row4",
    plotId: "plot1",
    rowNumber: 4,
    plantCount: 25,
    plantingDate: "2020-03-26",
    varietyName: "Grand Nain",
    spacing: 2.5,
    healthStatus: "Healthy",
  },
  {
    id: "row5",
    plotId: "plot1",
    rowNumber: 5,
    plantCount: 25,
    plantingDate: "2020-03-27",
    varietyName: "Grand Nain",
    spacing: 2.5,
    healthStatus: "Healthy",
  },
]

// Generate some mock growth stages
export const growthStages: GrowthStage[] = [
  {
    id: "growth1",
    rowId: "row1",
    plantPosition: 1,
    flowerEmergenceDate: "2020-09-15",
    bunchFormationDate: "2020-10-01",
    fruitDevelopmentStartDate: "2020-10-15",
    expectedHarvestDate: "2021-01-15",
    healthStatus: "Healthy",
  },
  {
    id: "growth2",
    rowId: "row1",
    plantPosition: 2,
    flowerEmergenceDate: "2020-09-18",
    bunchFormationDate: "2020-10-05",
    fruitDevelopmentStartDate: "2020-10-20",
    expectedHarvestDate: "2021-01-20",
    healthStatus: "Healthy",
  },
  {
    id: "growth3",
    rowId: "row2",
    plantPosition: 1,
    flowerEmergenceDate: "2020-09-20",
    bunchFormationDate: "2020-10-07",
    fruitDevelopmentStartDate: "2020-10-22",
    expectedHarvestDate: "2021-01-22",
    healthStatus: "Diseased",
  },
]

// Generate some mock agricultural inputs
export const agriculturalInputs: AgriculturalInput[] = [
  {
    id: "input1",
    plotId: "plot1",
    type: "Fertilizer",
    productName: "NPK 17-17-17",
    applicationDate: "2020-05-15",
    quantity: 50,
    unit: "kg",
    applicatorId: "user4",
  },
  {
    id: "input2",
    plotId: "plot1",
    type: "Manure",
    productName: "Organic Compost",
    applicationDate: "2020-04-10",
    quantity: 200,
    unit: "kg",
    applicatorId: "user5",
  },
  {
    id: "input3",
    plotId: "plot1",
    rowId: "row3",
    type: "Pesticide",
    productName: "Neem Oil Solution",
    applicationDate: "2020-07-05",
    quantity: 5,
    unit: "L",
    applicatorId: "user6",
    safetyInterval: 7,
  },
]

// Generate some mock tasks
export const tasks: Task[] = [
  {
    id: "task1",
    title: "Apply fertilizer to Karii East Farm",
    description: "Apply NPK 17-17-17 fertilizer to all plots in Karii East Farm",
    assignedToId: "user4",
    farmId: "farm1",
    dueDate: "2023-06-15",
    status: "Pending",
    priority: "High",
    type: "Input Application",
  },
  {
    id: "task2",
    title: "Inspect pest-affected rows",
    description: "Check row 3 in East Plot A for pest infestation and recommend treatment",
    assignedToId: "user2",
    farmId: "farm1",
    plotId: "plot1",
    rowId: "row3",
    dueDate: "2023-06-10",
    status: "In Progress",
    priority: "Urgent",
    type: "Inspection",
  },
  {
    id: "task3",
    title: "Prepare for harvesting",
    description: "Prepare equipment and labor for upcoming harvest in East Plot B",
    assignedToId: "user3",
    farmId: "farm1",
    plotId: "plot2",
    dueDate: "2023-06-20",
    status: "Pending",
    priority: "Medium",
    type: "Harvesting",
  },
  {
    id: "task4",
    title: "Plant new banana suckers",
    description: "Plant 50 new Grand Nain suckers in Central Plot C",
    assignedToId: "user5",
    farmId: "farm2",
    plotId: "plot7",
    dueDate: "2023-06-18",
    status: "Pending",
    priority: "Medium",
    type: "Planting",
  },
  {
    id: "task5",
    title: "Weed Central Plot A",
    description: "Remove weeds from Central Plot A",
    assignedToId: "user7",
    farmId: "farm2",
    plotId: "plot5",
    dueDate: "2023-06-12",
    status: "Completed",
    priority: "Low",
    type: "Maintenance",
  },
]

// Mock harvest data
export const harvests: Harvest[] = [
  {
    id: "h1",
    farmId: "f1",
    plotId: "p1",
    harvestDate: "2023-01-15",
    bunchCount: 120,
    totalWeight: 2400,
    qualityRating: "Good",
    notes: "Slightly early harvest due to pest concerns",
  },
  {
    id: "h2",
    farmId: "f1",
    plotId: "p2",
    harvestDate: "2023-02-20",
    bunchCount: 150,
    totalWeight: 3000,
    qualityRating: "Excellent",
    notes: "Perfect timing, excellent quality",
  },
  {
    id: "h3",
    farmId: "f2",
    plotId: "p3",
    harvestDate: "2023-03-10",
    bunchCount: 100,
    totalWeight: 1800,
    qualityRating: "Average",
    notes: "Some bunches affected by dry weather",
  },
  {
    id: "h4",
    farmId: "f3",
    plotId: "p5",
    harvestDate: "2023-04-05",
    bunchCount: 130,
    totalWeight: 2600,
    qualityRating: "Good",
    notes: "Good overall quality",
  },
  {
    id: "h5",
    farmId: "f1",
    plotId: "p1",
    harvestDate: "2023-05-12",
    bunchCount: 140,
    totalWeight: 2800,
    qualityRating: "Good",
    notes: "Second harvest from this plot, good yield",
  },
  {
    id: "h6",
    farmId: "f2",
    plotId: "p4",
    harvestDate: "2023-06-18",
    bunchCount: 110,
    totalWeight: 2200,
    qualityRating: "Average",
    notes: "Some disease spotted, treated immediately",
  },
]

// Mock yield forecast data
export const yieldForecasts: YieldForecast[] = [
  {
    id: "yf1",
    farmId: "f1",
    forecastPeriod: "2023-Q3",
    estimatedBunches: 280,
    estimatedWeight: 5600,
    confidenceLevel: "High",
  },
  {
    id: "yf2",
    farmId: "f2",
    forecastPeriod: "2023-Q3",
    estimatedBunches: 220,
    estimatedWeight: 4400,
    confidenceLevel: "Medium",
  },
  {
    id: "yf3",
    farmId: "f3",
    forecastPeriod: "2023-Q3",
    estimatedBunches: 180,
    estimatedWeight: 3600,
    confidenceLevel: "Medium",
  },
  {
    id: "yf4",
    farmId: "f1",
    forecastPeriod: "2023-Q4",
    estimatedBunches: 300,
    estimatedWeight: 6000,
    confidenceLevel: "Medium",
  },
  {
    id: "yf5",
    farmId: "f2",
    forecastPeriod: "2023-Q4",
    estimatedBunches: 240,
    estimatedWeight: 4800,
    confidenceLevel: "Low",
  },
  {
    id: "yf6",
    farmId: "f3",
    forecastPeriod: "2023-Q4",
    estimatedBunches: 200,
    estimatedWeight: 4000,
    confidenceLevel: "Low",
  },
]

// Add workers data to the mock data:

// Add this to the existing mock data
export const workers = [
  { id: "worker1", name: "John Doe", role: "Field Worker" },
  { id: "worker2", name: "Jane Smith", role: "Team Leader" },
  { id: "worker3", name: "Michael Johnson", role: "Field Worker" },
  { id: "worker4", name: "Sarah Williams", role: "Field Worker" },
  { id: "worker5", name: "Robert Brown", role: "Consultant" },
]

// Helper function to calculate total yield
export function calculateTotalYield() {
  return harvests.reduce(
    (acc, harvest) => {
      acc.bunchCount += harvest.bunchCount
      acc.totalWeight += harvest.totalWeight
      return acc
    },
    { bunchCount: 0, totalWeight: 0 },
  )
}

// Helper function to get farm by ID
export function getFarmById(id: string) {
  return farms.find((farm) => farm.id === id)
}

// Helper function to get user by ID
export function getUserById(id: string) {
  return users.find((user) => user.id === id)
}

// Helper function to get plot by ID
export function getPlotById(id: string): Plot | undefined {
  return plots.find((plot) => plot.id === id)
}

// Helper function to get row by ID
export function getRowById(id: string): Row | undefined {
  return rows.find((row) => row.id === id)
}

// Helper function to get plots by farm ID
export function getPlotsByFarmId(farmId: string): Plot[] {
  return plots.filter((plot) => plot.farmId === farmId)
}

// Helper function to get rows by plot ID
export function getRowsByPlotId(plotId: string): Row[] {
  return rows.filter((row) => row.plotId === plotId)
}

// Helper function to get tasks by farm ID
export function getTasksByFarmId(farmId: string): Task[] {
  return tasks.filter((task) => task.farmId === farmId)
}

// Helper function to get tasks by assigned user ID
export function getTasksByAssignedUserId(userId: string): Task[] {
  return tasks.filter((task) => task.assignedToId === userId)
}

// Helper function to get agricultural inputs by plot ID
export function getInputsByPlotId(plotId: string): AgriculturalInput[] {
  return agriculturalInputs.filter((input) => input.plotId === plotId)
}

// Helper function to get growth stages by row ID
export function getGrowthStagesByRowId(rowId: string): GrowthStage[] {
  return growthStages.filter((stage) => stage.rowId === rowId)
}

// Helper function to get harvests by farm ID
export function getHarvestsByFarmId(farmId: string): Harvest[] {
  return harvests.filter((harvest) => harvest.farmId === farmId)
}

// Helper function to get harvests by plot ID
export function getHarvestsByPlotId(plotId: string): Harvest[] {
  return harvests.filter((harvest) => harvest.plotId === plotId)
}

// Helper function to get yield forecasts by farm ID
export function getYieldForecastsByFarmId(farmId: string): YieldForecast[] {
  return yieldForecasts.filter((forecast) => forecast.farmId === farmId)
}

// Helper function to format date
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

export const Bar = () => null
