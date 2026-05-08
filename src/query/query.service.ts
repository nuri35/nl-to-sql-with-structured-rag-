import { Injectable, Logger } from '@nestjs/common';
import { QueryGenerationChain } from './chains/query-generation.chain';
import { ResponseGenerationChain } from './chains/response-generation.chain';

export interface QueryResult {
  answer: string;
  sql: string;
  rows: unknown[];
}

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);

  constructor(
    private readonly queryGenerationChain: QueryGenerationChain,
    private readonly responseGenerationChain: ResponseGenerationChain,
  ) {}

  async query(userQuery: string): Promise<QueryResult> {
    this.logger.log(`Processing query: ${userQuery}`);

    const queryChain = await this.queryGenerationChain.build();
    const { sql, rows } = await queryChain.invoke({ user_query: userQuery });

    this.logger.debug(`Generated SQL: ${sql}`);

    const responseChain = this.responseGenerationChain.build();
    const answer = await responseChain.invoke({
      user_query: userQuery,
      rows,
    });

    return { answer, sql, rows };
  }
}
