import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { QueryGenerationChain } from './chains/query-generation.chain';
import { ResponseGenerationChain } from './chains/response-generation.chain';
import { LlmProvider } from './llm/llm.provider';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { SqlValidator } from './validators/sql.validator';

@Module({
  imports: [DatabaseModule],
  controllers: [QueryController],
  providers: [
    SqlValidator,
    LlmProvider,
    QueryGenerationChain,
    ResponseGenerationChain,
    QueryService,
  ],
  exports: [
    SqlValidator,
    QueryGenerationChain,
    ResponseGenerationChain,
    QueryService,
  ],
})
export class QueryModule {}
