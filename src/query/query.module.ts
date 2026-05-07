import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SqlValidator } from './validators/sql.validator';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [SqlValidator],
  exports: [SqlValidator],
})
export class QueryModule {}
