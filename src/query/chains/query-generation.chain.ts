import { Injectable, Logger } from '@nestjs/common';
import { AIMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  Runnable,
  RunnableLambda,
  RunnableSequence,
} from '@langchain/core/runnables';
import { DatabaseService } from '../../database/database.service';
import { LlmProvider } from '../llm/llm.provider';
import { QUERY_GENERATION_PROMPT_TEMPLATE } from '../prompts/query-generation.prompt';
import { SqlValidator } from '../validators/sql.validator';

const DEFAULT_ROW_LIMIT = 100;

export interface QueryGenerationInput {
  user_query: string;
}

export interface QueryGenerationResult {
  sql: string;
  rows: unknown[];
}

@Injectable()
export class QueryGenerationChain {
  private readonly logger = new Logger(QueryGenerationChain.name);
  private chain: Runnable<QueryGenerationInput, QueryGenerationResult> | null =
    null;

  constructor(
    private readonly llmProvider: LlmProvider,
    private readonly sqlValidator: SqlValidator,
    private readonly databaseService: DatabaseService,
  ) {}

  async build(): Promise<
    Runnable<QueryGenerationInput, QueryGenerationResult>
  > {
    if (this.chain !== null) {
      return this.chain;
    }

    this.logger.debug('Building query generation chain');

    const filledPrompt = await this.buildPartialPrompt();

    this.chain = RunnableSequence.from([
      filledPrompt,
      this.llmProvider.getModel(),
      this.extractContent(),
      this.validateSql(),
      this.executeSql(),
    ]);

    return this.chain;
  }

  private async buildPartialPrompt(): Promise<PromptTemplate> {
    const promptTemplate = PromptTemplate.fromTemplate(
      QUERY_GENERATION_PROMPT_TEMPLATE,
    );
    return promptTemplate.partial({
      database_schema: this.databaseService.getSchema(),
      default_limit: String(DEFAULT_ROW_LIMIT),
    });
  }

  private extractContent(): RunnableLambda<AIMessage, string> {
    return new RunnableLambda({
      func: (message: AIMessage): string => {
        const { content } = message;
        if (typeof content !== 'string') {
          throw new Error('LLM response content was not a string');
        }
        return content;
      },
    });
  }

  private validateSql(): RunnableLambda<string, string> {
    return new RunnableLambda({
      func: (sql: string): string => this.sqlValidator.validate(sql),
    });
  }

  private executeSql(): RunnableLambda<string, QueryGenerationResult> {
    return new RunnableLambda({
      func: (sql: string): QueryGenerationResult => ({
        sql,
        rows: this.databaseService.execute(sql),
      }),
    });
  }
}

// TODO: suan burası okey yarın devam edecegız sql generate edıyor artık validate ile birlikte bı bu retrivel kısmımız phase 1 genel tekrar edecegız yarın..
