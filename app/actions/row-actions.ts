"use server";
import { RowSchema, HoleDataSchema } from "../../lib/validations/row";
import * as rowRepo from "../../db/repositories/row-repository";

// List all rows for a plot
export async function listRows(plotId: number) {
  return await rowRepo.getRowsByPlotId(plotId);
}

// Create a new row
export async function createRow(input: unknown) {
  const parsed = RowSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid row data");
  return await rowRepo.createRow(parsed.data);
}

// Edit a row
export async function editRow(rowId: number, input: unknown) {
  const parsed = RowSchema.partial().safeParse(input);
  if (!parsed.success) throw new Error("Invalid row data");
  return await rowRepo.updateRow(rowId, parsed.data);
}

// Delete a row
export async function deleteRow(rowId: number) {
  return await rowRepo.deleteRow(rowId);
}

// Add holes to a row
export async function addHoles(rowId: number, holes: unknown[]) {
  const parsed = holes.map(h => HoleDataSchema.safeParse(h));
  if (parsed.some(p => !p.success)) throw new Error("Invalid hole data");
  return await rowRepo.addHolesToRow(rowId, parsed.map(p => p.data));
}

// Update a single hole in a row
export async function updateHole(rowId: number, holeNumber: number, data: unknown) {
  const parsed = HoleDataSchema.partial().safeParse(data);
  if (!parsed.success) throw new Error("Invalid hole data");
  return await rowRepo.updateHoleInRow(rowId, holeNumber, parsed.data);
}

// Bulk update holes in a row
export async function bulkUpdateHoles(rowId: number, updates: unknown[]) {
  const parsed = updates.map(u => HoleDataSchema.partial().safeParse(u));
  if (parsed.some(p => !p.success)) throw new Error("Invalid hole data");
  return await rowRepo.bulkUpdateHoles(rowId, parsed.map(p => p.data));
} 