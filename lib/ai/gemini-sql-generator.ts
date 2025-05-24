import { SchemaContext } from "./schema-context";
import { geminiModel } from "./gemini-client";

export async function generateSQLFromQuestion(question: string, schema: SchemaContext): Promise<string> {
  // Compose a prompt for Gemini
  const prompt = `
You are a SQL expert for a banana farm management system. Given the following database schema and a user question, generate a single, safe, broad SELECT SQL query that answers the question. Do not use DELETE, UPDATE, INSERT, DROP, or any DML/DDL. Only use SELECT queries. Avoid hardcoded filters unless the question is very specific. Prefer broad queries (e.g., show all, count all, aggregate, etc.).

Schema:
${schema.tables.map(table => `Table: ${table.name}\nDescription: ${table.description}\nColumns: ${table.columns.map(col => `${col.name} (${col.type}) - ${col.description}`).join(", ")}`).join("\n\n")}

Relationships:
${schema.tables.flatMap(table => table.relationships.map(rel => `Table ${table.name}.${rel.foreignKey} references ${rel.referencedTable}.${rel.referencedColumn} (${rel.description})`)).join("\n")}

Business Terms:
${schema.businessTerms.map(term => `${term.term}: ${term.maps_to}`).join("\n")}

User Question: ${question}

Respond ONLY with a SQL query in a Markdown code block (no explanation):
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  // Extract SQL from Markdown code block if present
  const match = text.match(/```(?:sql)?\n([\s\S]+?)```/i);
  if (match) {
    return match[1].trim();
  }
  // Fallback: try to find a SELECT statement
  const selectMatch = text.match(/(SELECT[\s\S]+?;)/i);
  if (selectMatch) {
    return selectMatch[1].trim();
  }
  // Fallback: return the whole text
  return text.trim();
} 