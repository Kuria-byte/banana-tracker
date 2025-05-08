import { z } from "zod";

export const HoleDataSchema = z.object({
  holeNumber: z.number().int().min(1),
  status: z.enum(["EMPTY", "PLANTED", "HARVESTED"]),
  plantedDate: z.string().optional(),
  plantVariety: z.string().optional(),
  plantHealth: z.string().optional(),
  notes: z.string().optional(),
});

export const RowSchema = z.object({
  plotId: z.number().int(),
  rowNumber: z.number().int().min(1),
  length: z.number().positive(),
  spacing: z.number().positive(),
  holeCount: z.number().int().min(0),
  holesData: z.array(HoleDataSchema),
  notes: z.string().optional(),
});

export type HoleDataInput = z.infer<typeof HoleDataSchema>;
export type RowInput = z.infer<typeof RowSchema>; 