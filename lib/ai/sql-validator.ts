import { Parser } from 'node-sql-parser';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedQuery?: string;
}

export class SQLQueryValidator {
  private parser = new Parser();
  private allowedOperations = ['SELECT'];

  async validateQuery(query: string, userId: number): Promise<ValidationResult> {
    const errors: string[] = [];
    try {
      const ast = this.parser.astify(query) as any;
      if (!this.isAllowedOperation(ast)) errors.push("Only SELECT operations are allowed");
      if (!this.hasUserFilter(ast, userId)) errors.push("Query must include user context filtering");
      // Add more checks as needed...
      const sanitizedQuery = this.addSafetyLimits(query);
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedQuery: errors.length === 0 ? sanitizedQuery : undefined
      };
    } catch (parseError) {
      return {
        isValid: false,
        errors: [`SQL syntax error: ${parseError.message}`]
      };
    }
  }

  // Relaxed validation: only check for SELECT and basic safety
  async validateQueryRelaxed(query: string, userId: number): Promise<ValidationResult> {
    const errors: string[] = [];
    try {
      const ast = this.parser.astify(query) as any;
      if (!this.isAllowedOperation(ast)) errors.push("Only SELECT operations are allowed");
      // Optionally: check for allowed tables, no dangerous functions, etc.
      const sanitizedQuery = this.addSafetyLimits(query);
      return {
        isValid: errors.length === 0,
        errors,
        sanitizedQuery: errors.length === 0 ? sanitizedQuery : undefined
      };
    } catch (parseError) {
      return {
        isValid: false,
        errors: [`SQL syntax error: ${parseError.message}`]
      };
    }
  }

  private isAllowedOperation(ast: any): boolean {
    const operation = ast.type?.toUpperCase();
    return this.allowedOperations.includes(operation);
  }

  private hasUserFilter(ast: any, userId: number): boolean {
    const queryString = this.parser.sqlify(ast);
    return queryString.includes(`creator_id = ${userId}`) || queryString.includes(`assignee_id = ${userId}`);
  }

  private addSafetyLimits(query: string): string {
    if (!query.toUpperCase().includes('LIMIT')) {
      return query.trim().replace(/;*$/, '') + ' LIMIT 1000';
    }
    return query;
  }
}

export function validateSQL(query: string, relaxed: boolean = false): { valid: boolean; reason?: string } {
  const normalized = query.trim().toUpperCase();
  if (!normalized.startsWith("SELECT")) {
    return { valid: false, reason: "Only SELECT statements are allowed." };
  }
  if (/\b(DELETE|UPDATE|INSERT|DROP|ALTER|TRUNCATE|CREATE|REPLACE|GRANT|REVOKE|EXEC|CALL|MERGE|SET|SHOW|DESCRIBE|EXPLAIN)\b/i.test(query)) {
    return { valid: false, reason: "Dangerous SQL statement detected." };
  }
  // Optionally, block subqueries or joins in strict mode
  if (!relaxed) {
    if (/\bJOIN\b/i.test(query)) {
      return { valid: false, reason: "Joins are not allowed in strict mode." };
    }
    if (/\bUNION\b/i.test(query)) {
      return { valid: false, reason: "Union queries are not allowed in strict mode." };
    }
    if (/\b;\b/.test(query)) {
      return { valid: false, reason: "Multiple statements are not allowed." };
    }
  }
  return { valid: true };
} 