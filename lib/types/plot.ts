export interface HoleData {
  holeNumber: number;
  status: 'EMPTY' | 'PLANTED' | 'HARVESTED';
  plantHealth?: 'Healthy' | 'Diseased' | 'Pest-affected' | 'Damaged';
  rowNumber: number;
  // Add more fields as needed (e.g., notes, plantedDate, etc.)
}

export interface RowData {
  rowNumber: number;
  length: number;    // meters
  spacing: number;   // meters
  holes: HoleData[];
  // Add more fields as needed (e.g., notes)
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