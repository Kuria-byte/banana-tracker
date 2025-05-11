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