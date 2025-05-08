const plots = [
  { id: 3, row_count: 25, holes: 250 },
  { id: 2, row_count: 20, holes: 345 },
  { id: 8, row_count: 20, holes: 400 },
  { id: 11, row_count: 30, holes: 458 },
  { id: 15, row_count: 20, holes: 469 },
  { id: 1, row_count: 20, holes: 470 },
  { id: 13, row_count: 20, holes: 480 },
  { id: 12, row_count: 20, holes: 200 },
  { id: 16, row_count: 20, holes: 200 },
  { id: 9, row_count: 20, holes: 574 },
  { id: 7, row_count: 20, holes: 320 },
  { id: 5, row_count: 20, holes: 360 },
  { id: 17, row_count: 20, holes: 200 },
  { id: 18, row_count: 20, holes: 400 },
  { id: 14, row_count: 20, holes: 179 },
  { id: 6, row_count: 22, holes: 188 },
  { id: 4, row_count: 20, holes: 300 },
  { id: 10, row_count: 20, holes: 323 }
];

/**
 * Generates a layout structure based on the given row count and total holes.
 * Distributes holes evenly across rows.
 * 
 * @param {number} rowCount - Number of rows
 * @param {number} holes - Total number of holes
 * @return {Array} - Array of row objects containing hole information
 */
function generateLayout(rowCount, holes) {
  // Calculate how many holes should be in each row (evenly distributed)
  const holesPerRow = Math.ceil(holes / rowCount);
  let holesLeft = holes;
  let holeNumber = 1;
  const layout = [];
  
  for (let row = 1; row <= rowCount; row++) {
    // For the last row, only use remaining holes
    const holesInThisRow = Math.min(holesPerRow, holesLeft);
    const rowHoles = [];
    
    // Create the holes for this row
    for (let h = 0; h < holesInThisRow; h++) {
      rowHoles.push({
        status: "PLANTED",
        holeNumber: holeNumber,
        plantHealth: "Healthy",
        row_number: row
      });
      holeNumber++;
    }
    
    // Add this row to the layout
    layout.push({
      holes: rowHoles,
      length: holesInThisRow * 10, // 10 units per hole
      spacing: 10,
      rowNumber: row
    });
    
    holesLeft -= holesInThisRow;
  }
  
  return layout;
}

/**
 * Generates SQL UPDATE statements for each plot
 * Uses proper JSON escaping to prevent SQL injection
 */
function generateSqlStatements() {
  const statements = [];
  
  plots.forEach(plot => {
    const layout = generateLayout(plot.row_count, plot.holes);
    
    // Properly escape JSON for SQL (handle quotes)
    const json = JSON.stringify(layout)
      .replace(/'/g, "''") // Double single quotes for SQL escaping
      .replace(/\\"/g, '\\"'); // Maintain escaped double quotes
    
    statements.push(`UPDATE plots SET layout_structure = '${json}' WHERE id = ${plot.id};`);
  });
  
  return statements;
}

// Generate and log SQL statements for testing
const sqlStatements = generateSqlStatements();
console.log(`Generated ${sqlStatements.length} SQL statements`);

// Print sample info for verification
plots.forEach(plot => {
  const layout = generateLayout(plot.row_count, plot.holes);
  const totalHoles = layout.reduce((acc, row) => acc + row.holes.length, 0);
  const totalRows = layout.length;
  
  console.log(`Plot ID ${plot.id}: ${totalHoles} holes in ${totalRows} rows`);
});

// For the first plot, output the first row's details for inspection
const sampleLayout = generateLayout(plots[0].row_count, plots[0].holes);
console.log(`\nSample layout for Plot ID ${plots[0].id} (first row):`);
console.log(`Row number: ${sampleLayout[0].rowNumber}`);
console.log(`Holes in row: ${sampleLayout[0].holes.length}`);
console.log(`Row length: ${sampleLayout[0].length}`);
console.log(`First hole number: ${sampleLayout[0].holes[0].holeNumber}`);
console.log(`Last hole number: ${sampleLayout[0].holes[sampleLayout[0].holes.length-1].holeNumber}`);

// Write statements to a file (if needed)
// Use this function in a Node.js environment to write to a file
function writeStatementsToFile(filename) {
  const fs = require('fs');
  const statements = generateSqlStatements();
  
  fs.writeFileSync(
    filename, 
    statements.join('\n'), 
    'utf8'
  );
  
  console.log(`SQL statements written to ${filename}`);
}

// Uncomment to use in Node.js
writeStatementsToFile('plot_updates.sql');

// Export the layout generation function for reuse
module.exports = {
  generateLayout,
  generateSqlStatements
};