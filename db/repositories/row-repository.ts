import { db } from "../client";
import { rows } from "../schema";
import { eq } from "drizzle-orm";
import type { Row, HoleData } from "../../lib/types/row";

// Get all rows for a plot
export async function getRowsByPlotId(plotId: number): Promise<Row[]> {
  try {
    const result = await db.select().from(rows).where(eq(rows.plotId, plotId));
    return result.map(rowDbToModel);
  } catch (error) {
    // TODO: fallback to mock data
    throw error;
  }
}

// Get a single row by ID
export async function getRowById(rowId: number): Promise<Row | null> {
  try {
    const result = await db.select().from(rows).where(eq(rows.id, rowId));
    if (result.length === 0) return null;
    return rowDbToModel(result[0]);
  } catch (error) {
    // TODO: fallback to mock data
    throw error;
  }
}

// Create a new row
export async function createRow(rowData: Partial<Row>): Promise<Row> {
  try {
    const result = await db.insert(rows).values(rowModelToDb(rowData)).returning();
    return rowDbToModel(result[0]);
  } catch (error) {
    // TODO: fallback to mock data
    throw error;
  }
}

// Update a row
export async function updateRow(rowId: number, data: Partial<Row>): Promise<Row> {
  try {
    const result = await db.update(rows).set(rowModelToDb(data)).where(eq(rows.id, rowId)).returning();
    return rowDbToModel(result[0]);
  } catch (error) {
    // TODO: fallback to mock data
    throw error;
  }
}

// Delete a row
export async function deleteRow(rowId: number): Promise<void> {
  try {
    await db.delete(rows).where(eq(rows.id, rowId));
  } catch (error) {
    // TODO: fallback to mock data
    throw error;
  }
}

// Add holes to a row (bulk add)
export async function addHolesToRow(rowId: number, holes: HoleData[]): Promise<Row> {
  const row = await getRowById(rowId);
  if (!row) throw new Error("Row not found");
  const updatedHoles = [...(row.holesData || []), ...holes];
  return await updateRow(rowId, { holesData: updatedHoles, holeCount: updatedHoles.length });
}

// Update a single hole in a row
export async function updateHoleInRow(rowId: number, holeNumber: number, data: Partial<HoleData>): Promise<Row> {
  const row = await getRowById(rowId);
  if (!row) throw new Error("Row not found");
  const updatedHoles = (row.holesData || []).map(hole =>
    hole.holeNumber === holeNumber ? { ...hole, ...data } : hole
  );
  return await updateRow(rowId, { holesData: updatedHoles });
}

// Bulk update holes in a row
export async function bulkUpdateHoles(rowId: number, updates: Partial<HoleData>[]): Promise<Row> {
  const row = await getRowById(rowId);
  if (!row) throw new Error("Row not found");
  // Match updates by holeNumber
  const updatedHoles = (row.holesData || []).map(hole => {
    const update = updates.find(u => u.holeNumber === hole.holeNumber);
    return update ? { ...hole, ...update } : hole;
  });
  return await updateRow(rowId, { holesData: updatedHoles });
}

// Helper: DB row to model
function rowDbToModel(dbRow: any): Row {
  return {
    id: dbRow.id,
    plotId: dbRow.plotId,
    rowNumber: dbRow.rowNumber,
    length: Number(dbRow.length),
    spacing: Number(dbRow.spacing),
    holeCount: dbRow.holeCount,
    holesData: dbRow.holesData || [],
    notes: dbRow.notes || undefined,
    createdAt: dbRow.createdAt?.toISOString?.() || dbRow.createdAt,
    updatedAt: dbRow.updatedAt?.toISOString?.() || dbRow.updatedAt,
  };
}

// Helper: Model to DB row
function rowModelToDb(model: Partial<Row>): any {
  return {
    plotId: model.plotId,
    rowNumber: model.rowNumber,
    length: model.length,
    spacing: model.spacing,
    holeCount: model.holeCount,
    holesData: model.holesData,
    notes: model.notes,
    createdAt: model.createdAt ? new Date(model.createdAt) : undefined,
    updatedAt: model.updatedAt ? new Date(model.updatedAt) : undefined,
  };
} 