import { Injectable, Logger } from '@nestjs/common';
import { UnsafeSqlException } from '../exceptions/unsafe-sql.exception';

const DEFAULT_ROW_LIMIT = 100;

const FORBIDDEN_KEYWORDS = [
  'DROP',
  'DELETE',
  'TRUNCATE',
  'ALTER',
  'CREATE',
  'INSERT',
  'UPDATE',
  'GRANT',
  'REVOKE',
] as const;

const FORBIDDEN_KEYWORDS_PATTERN = new RegExp(
  `\\b(?:${FORBIDDEN_KEYWORDS.join('|')})\\b`,
  'i',
);
const STARTS_WITH_SELECT_PATTERN = /^select\b/i;
const LIMIT_PATTERN = /\blimit\s+\d+/i;
const CODE_FENCE_OPEN_PATTERN = /^\s*```(?:[a-zA-Z]+)?\s*\n?/;
const CODE_FENCE_CLOSE_PATTERN = /\n?\s*```\s*$/;
const TRAILING_SEMICOLON_PATTERN = /;\s*$/;

@Injectable()
export class SqlValidator {
  private readonly logger = new Logger(SqlValidator.name);

  validate(rawSql: string): string {
    const cleaned = this.stripCodeFences(rawSql).trim();

    if (cleaned.length === 0) {
      this.reject('SQL is empty');
    }

    this.assertStartsWithSelect(cleaned);
    this.assertNoForbiddenKeyword(cleaned);
    this.assertSingleStatement(cleaned);

    return this.appendLimitIfMissing(cleaned);
  }

  private stripCodeFences(sql: string): string {
    return sql
      .replace(CODE_FENCE_OPEN_PATTERN, '')
      .replace(CODE_FENCE_CLOSE_PATTERN, '');
  }

  private assertStartsWithSelect(sql: string): void {
    if (!STARTS_WITH_SELECT_PATTERN.test(sql)) {
      this.reject('only SELECT statements are allowed');
    }
  }

  private assertNoForbiddenKeyword(sql: string): void {
    const match = FORBIDDEN_KEYWORDS_PATTERN.exec(sql);
    if (match !== null) {
      this.reject(`forbidden keyword detected: ${match[0].toUpperCase()}`);
    }
  }

  private assertSingleStatement(sql: string): void {
    const statements = sql
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);
    if (statements.length > 1) {
      this.reject('multiple statements are not allowed');
    }
  }

  private appendLimitIfMissing(sql: string): string {
    if (LIMIT_PATTERN.test(sql)) {
      return sql;
    }
    const withoutTrailingSemicolon = sql.replace(
      TRAILING_SEMICOLON_PATTERN,
      '',
    );
    const limited = `${withoutTrailingSemicolon} LIMIT ${DEFAULT_ROW_LIMIT}`;
    this.logger.debug(`Appended default LIMIT clause: ${limited}`);
    return limited;
  }

  private reject(reason: string): never {
    this.logger.debug(`Rejecting SQL: ${reason}`);
    throw new UnsafeSqlException(reason);
  }
}
