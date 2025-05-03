import { db } from "../client"

export async function getFarmCardsData() {
  // This query joins farms and plots, groups by farm, and aggregates holes and earliest planted date
  const result = await db.execute(`
    SELECT
      f.id,
      f.name,
      f.location,
      f.group_code,
      f.size AS area,
      MIN(p.planted_date) AS established_date,
      COALESCE(SUM(p.holes), 0) AS holes
    FROM farms f
    LEFT JOIN plots p ON p.farm_id = f.id
    GROUP BY f.id, f.name, f.location, f.group_code, f.size
    ORDER BY f.name
  `)
  // Map the result to the UI model
  return result.rows.map((row: any) => ({
    id: row.id?.toString() ?? "",
    name: row.name,
    location: row.location,
    group_code: row.group_code ?? "",
    area: row.area !== undefined && row.area !== null && !isNaN(Number(row.area)) ? Number(row.area) : 0,
    holes: row.holes !== undefined && row.holes !== null ? Number(row.holes) : 0,
    establishedDate: row.established_date ? new Date(row.established_date).toISOString() : "",
  }))
} 