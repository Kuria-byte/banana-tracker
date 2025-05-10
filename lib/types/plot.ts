export interface HoleData {
  holeNumber: number;
  status: 'EMPTY' | 'PLANTED' | 'HARVESTED';
  rowNumber: number;
  // Banana lifecycle tracking fields
  mainPlantId?: number; // growth record id for main plant
  activePlantIds?: number[]; // all active plant growth record ids (main + suckers)
  suckerIds?: number[]; // Explicitly track suckers (growth record ids)
  targetSuckerCount?: number; // how many suckers to maintain
  currentSuckerCount?: number; // current count of active suckers
  plantedDate?: string; // ISO date string
  plantHealth?: 'Healthy' | 'Diseased' | 'Pest-affected' | 'Damaged';
  notes?: string;
}

export interface RowData {
  rowNumber: number;
  length: number;    // meters
  spacing: number;   // meters
  holes: HoleData[];
  notes?: string; // Additional notes for the row
}

export interface Plot {
  id: number;
  name: string;
  farmId: number;
  area: number;
  soilType: string;
  rowCount: number;
  plantCount: number;
  holes: number;
  layoutStructure: RowData[];
  createdAt: string;
  updatedAt: string;
  plantedDate?: string;
  cropType?: string;
  status?: string;
}

export interface Harvest {
  // ... existing fields ...
} 