export interface HoleData {
  holeNumber: number;
  status: 'EMPTY' | 'PLANTED' | 'HARVESTED';
  plantedDate?: string;
  plantVariety?: string;
  plantHealth?: string;
  notes?: string;
}

export interface Row {
  id: number;
  plotId: number;
  rowNumber: number;
  length: number;
  spacing: number;
  holeCount: number;
  holesData: HoleData[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 