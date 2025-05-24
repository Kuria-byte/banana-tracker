// Growth stage thresholds in days
export const GROWTH_STAGE_THRESHOLDS: Record<string, number> = {
  "Early Growth": 0,          // 0-90 days (3 months)
  "Vegetative": 90,           // 3-8 months
  "Flower Emergence": 240,    // 8-10 months
  "Bunch Formation": 300,     // 10-11 months
  "Fruit Development": 330,   // 11-12 months
  "Ready for Harvest": 360    // 12+ months
};

export const GROWTH_STAGES = [
  "Early Growth",
  "Vegetative",
  "Flower Emergence",
  "Bunch Formation",
  "Fruit Development",
  "Ready for Harvest"
];

export function calculateGrowthStage(plantedDate: Date): string {
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
  let currentStage = "Early Growth";
  for (const [stage, threshold] of Object.entries(GROWTH_STAGE_THRESHOLDS)) {
    if (ageInDays >= threshold) {
      currentStage = stage;
    } else {
      break;
    }
  }
  return currentStage;
}

export function getDaysFromPlanting(plantedDate: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Infers harvest cycle information for a perennial plant (e.g., banana) given its plantedDate.
 * Assumes a fixed harvest cycle length (default 400 days).
 * Returns: cycleNumber, daysSinceLastHarvest, daysToNextHarvest, statusLabel, and a UI color.
 */
export function getInferredHarvestInfo(
  plantedDate: string | Date,
  cycleLengthDays: number = 400
): {
  cycleNumber: number;
  daysSinceLastHarvest: number;
  daysToNextHarvest: number;
  statusLabel: string;
  color: string;
} {
  if (!plantedDate) {
    return {
      cycleNumber: 0,
      daysSinceLastHarvest: 0,
      daysToNextHarvest: 0,
      statusLabel: "Unknown",
      color: "bg-gray-300 text-gray-700",
    };
  }
  const now = new Date();
  const planted = typeof plantedDate === "string" ? new Date(plantedDate) : plantedDate;
  const age = Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
  const cycleNumber = Math.floor(age / cycleLengthDays) + 1;
  const daysSinceLastHarvest = age % cycleLengthDays;
  const daysToNextHarvest = cycleLengthDays - daysSinceLastHarvest;

  let statusLabel = "Growing";
  let color = "bg-blue-100 text-blue-800 border-blue-200";
  if (daysToNextHarvest <= 30) {
    statusLabel = "Ready for Harvest";
    color = "bg-red-100 text-red-800 border-red-200";
  } else if (daysSinceLastHarvest < 30 && cycleNumber > 1) {
    statusLabel = `Recently Harvested (Cycle ${cycleNumber - 1})`;
    color = "bg-green-100 text-green-800 border-green-200";
  } else if (cycleNumber > 1) {
    statusLabel = `Cycle ${cycleNumber}`;
    color = "bg-yellow-100 text-yellow-800 border-yellow-200";
  }

  return {
    cycleNumber,
    daysSinceLastHarvest,
    daysToNextHarvest,
    statusLabel,
    color,
  };
}

/**
 * Returns the status of all plants in a banana mat (main + suckers) for a given hole.
 * @param hole The HoleData object
 * @param allGrowthRecords All growth records for the plot (array)
 * @returns Array of { id, role, age, stage, plantedDate, parentPlantId, daysToHarvest }
 */
export function getMatStatus(
  hole: { mainPlantId?: number; suckerIds?: number[]; plantedDate?: string; },
  allGrowthRecords: Array<{
    id: number;
    isMainPlant?: boolean;
    parentPlantId?: number | null;
    recordDate?: string;
    stage?: string;
    replacedPlantId?: number | null;
    // ...other fields
  }>
): Array<{
  id: number;
  role: 'main' | 'sucker';
  age: number;
  stage: string;
  plantedDate: string;
  parentPlantId?: number | null;
  daysToHarvest?: number;
}> {
  if (!hole || (!hole.mainPlantId && (!hole.suckerIds || hole.suckerIds.length === 0))) return [];
  const now = new Date();
  // Helper to get record by id
  const getRecord = (id?: number) => allGrowthRecords.find(r => r.id === id);
  // Main plant
  const main = getRecord(hole.mainPlantId);
  // Suckers
  const suckers = (hole.suckerIds || []).map(getRecord).filter(Boolean);
  // Compose mat array
  const mat = [];
  if (main) {
    const plantedDate = main.recordDate || hole.plantedDate || '';
    const age = plantedDate ? Math.floor((now.getTime() - new Date(plantedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const stage = main.stage || calculateGrowthStage(plantedDate ? new Date(plantedDate) : new Date());
    // Days to harvest (if main)
    let daysToHarvest: number | undefined = undefined;
    if (stage === 'Ready for Harvest') daysToHarvest = 0;
    else {
      const thresholds = Object.values(GROWTH_STAGE_THRESHOLDS);
      const maxThreshold = thresholds[thresholds.length - 1];
      daysToHarvest = plantedDate ? Math.max(0, maxThreshold - age) : undefined;
    }
    mat.push({
      id: main.id,
      role: 'main',
      age,
      stage,
      plantedDate,
      parentPlantId: main.parentPlantId,
      daysToHarvest,
    });
  }
  for (const s of suckers) {
    const plantedDate = s.recordDate || '';
    const age = plantedDate ? Math.floor((now.getTime() - new Date(plantedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const stage = s.stage || calculateGrowthStage(plantedDate ? new Date(plantedDate) : new Date());
    mat.push({
      id: s.id,
      role: 'sucker',
      age,
      stage,
      plantedDate,
      parentPlantId: s.parentPlantId,
    });
  }
  // Sort: main first, then suckers by age descending (oldest first)
  return mat.sort((a, b) => (a.role === 'main' ? -1 : 1) || b.age - a.age);
}

/**
 * Returns the display growth stage for a plant, using the most recent manual record if available, otherwise inferring from plantedDate.
 * @param plantedDate The planted date of the plant (string or Date)
 * @param growthRecords Array of growth records for this plant (main or sucker)
 * @returns { stage: string, isManual: boolean, date: string }
 */
export function getDisplayGrowthStage(
  plantedDate: string | Date,
  growthRecords: Array<{ stage?: string; recordDate?: string }>
): { stage: string; isManual: boolean; date: string } {
  // Find the most recent manual stage record (not 'Planted' or 'Sucker')
  const manual = growthRecords
    .filter(r => r.stage && r.stage !== 'Planted' && r.stage !== 'Sucker')
    .sort((a, b) => (new Date(b.recordDate || 0).getTime() - new Date(a.recordDate || 0).getTime()))[0];
  if (manual) {
    return {
      stage: manual.stage!,
      isManual: true,
      date: manual.recordDate || '',
    };
  }
  // Fallback to automatic
  const date = typeof plantedDate === 'string' ? plantedDate : plantedDate?.toISOString();
  return {
    stage: plantedDate ? calculateGrowthStage(new Date(plantedDate)) : 'Unknown',
    isManual: false,
    date: date || '',
  };
} 