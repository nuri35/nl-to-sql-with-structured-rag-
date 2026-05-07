import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { QueryGenerationChain } from './chains/query-generation.chain';
import { LlmProvider } from './llm/llm.provider';
import { SqlValidator } from './validators/sql.validator';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [SqlValidator, LlmProvider, QueryGenerationChain],
  exports: [SqlValidator, QueryGenerationChain],
})
export class QueryModule {}
