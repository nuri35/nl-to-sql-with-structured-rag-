import { existsSync } from 'node:fs';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Database from 'better-sqlite3';
import { DatabaseConnectionException } from './exceptions/database-connection.exception';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private db!: Database.Database;
  private cachedSchema?: string;

  onModuleInit(): void {
    const dbPath = process.env.DB_PATH;
    if (!dbPath) {
      throw new DatabaseConnectionException(
        'DB_PATH environment variable is not set',
      );
    }
    if (!existsSync(dbPath)) {
      throw new DatabaseConnectionException(
        `Database file does not exist at path: ${dbPath}`,
      );
    }

    this.db = new Database(dbPath, { readonly: true, fileMustExist: true });
    this.logger.log(`Connected to SQLite database at ${dbPath} (read-only)`);
  }

  onModuleDestroy(): void {
    this.db.close();
    this.logger.log('Database connection closed');
  }

  getSchema(): string {
    if (this.cachedSchema !== undefined) {
      return this.cachedSchema;
    }

    const rows = this.db
      .prepare(
        `SELECT sql FROM sqlite_master
         WHERE type = 'table'
           AND sql IS NOT NULL
           AND name NOT LIKE 'sqlite_%'
         ORDER BY name`,
      )
      .all() as { sql: string }[];

    this.cachedSchema = rows.map((row) => `${row.sql};`).join('\n\n');
    return this.cachedSchema;
  }

  execute(sql: string): unknown[] {
    this.logger.debug(`Executing SQL: ${sql}`);
    return this.db.prepare(sql).all();
  }
}
