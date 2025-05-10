// scripts/export-db-schema.ts
import 'dotenv/config';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const docsDir = join(process.cwd(), 'docs');
if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true });

const queries = {
  columns: `
    SELECT
      n.nspname AS table_schema,
      c.relname AS table_name,
      a.attname AS column_name,
      pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
      NOT a.attnotnull AS is_nullable,
      pg_catalog.pg_get_expr(ad.adbin, ad.adrelid) AS column_default
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
    WHERE a.attnum > 0
      AND NOT a.attisdropped
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY n.nspname, c.relname, a.attnum`,

  primaryKeys: `
    SELECT 
      tc.table_schema,
      tc.table_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'`,

  fks: `
    SELECT 
      tc.constraint_name,
      tc.table_schema AS source_schema,
      tc.table_name AS source_table,
      kcu.column_name AS source_column,
      ccu.table_schema AS target_schema,
      ccu.table_name AS target_table,
      ccu.column_name AS target_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'`
};

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    // Fetch all schema data
    const [columns, primaryKeys, fks] = await Promise.all([
      client.query(queries.columns),
      client.query(queries.primaryKeys),
      client.query(queries.fks)
    ]);

    // Enhance columns with primary key info
    const pkSet = new Set(
      primaryKeys.rows.map(pk => 
        `${pk.table_schema}.${pk.table_name}.${pk.column_name}`
      )
    );

    const enhancedColumns = columns.rows.map(col => ({
      ...col,
      is_nullable: col.is_nullable ? 'YES' : 'NO',
      is_primary: pkSet.has(
        `${col.table_schema}.${col.table_name}.${col.column_name}`
      )
    }));

    // Write schema data
    writeFileSync(
      join(docsDir, 'db-schema.json'),
      JSON.stringify(enhancedColumns, null, 2)
    );

    // Generate schema Markdown
    const schemaMD = [
      '# Database Schema',
      '| Schema | Table | Column | Type | Nullable | Default | Primary |',
      '|--------|-------|--------|------|----------|---------|---------|',
      ...enhancedColumns.map(col => 
        `| ${col.table_schema} | ${col.table_name} | ${col.column_name} ` +
        `| ${col.data_type} | ${col.is_nullable} ` +
        `| ${col.column_default || ''} | ${col.is_primary ? '✅' : ''} |`
      )
    ].join('\n');

    writeFileSync(join(docsDir, 'db-schema.md'), schemaMD);

    // Write relationships data
    writeFileSync(
      join(docsDir, 'db-relationships.json'),
      JSON.stringify(fks.rows, null, 2)
    );

    // Generate relationships Markdown
    const fkMD = [
      '# Database Relationships (Foreign Keys)',
      '| Constraint | Source Schema | Source Table | Source Column | Target Schema | Target Table | Target Column |',
      '|------------|---------------|-------------|--------------|---------------|-------------|--------------|',
      ...fks.rows.map(fk => 
        `| ${fk.constraint_name} | ${fk.source_schema} ` +
        `| ${fk.source_table} | ${fk.source_column} ` +
        `| ${fk.target_schema} | ${fk.target_table} | ${fk.target_column} |`
      )
    ].join('\n');

    writeFileSync(join(docsDir, 'db-relationships.md'), fkMD);

    console.log('✅ Database documentation generated successfully');
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('❌ Error generating documentation:', err);
  process.exit(1);
}); 