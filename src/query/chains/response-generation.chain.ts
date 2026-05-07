import { Injectable, Logger } from '@nestjs/common';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  Runnable,
  RunnableLambda,
  RunnableSequence,
} from '@langchain/core/runnables';
import { LlmProvider } from '../llm/llm.provider';
import { RESPONSE_GENERATION_PROMPT_TEMPLATE } from '../prompts/response-generation.prompt';

export interface ResponseGenerationInput {
  user_query: string;
  rows: unknown[];
}

interface FormattedPromptInput {
  user_query: string;
  data: string;
}

@Injectable()
export class ResponseGenerationChain {
  private readonly logger = new Logger(ResponseGenerationChain.name);
  private chain: Runnable<ResponseGenerationInput, string> | null = null;

  constructor(private readonly llmProvider: LlmProvider) {}

  build(): Runnable<ResponseGenerationInput, string> {
    if (this.chain !== null) {
      return this.chain;
    }

    this.logger.debug('Building response generation chain');

    const promptTemplate = PromptTemplate.fromTemplate(
      RESPONSE_GENERATION_PROMPT_TEMPLATE,
    );

    this.chain = RunnableSequence.from([
      this.formatStep(),
      promptTemplate,
      this.llmProvider.getModel(),
      new StringOutputParser(),
    ]);

    return this.chain;
  }

  private formatStep(): RunnableLambda<
    ResponseGenerationInput,
    FormattedPromptInput
  > {
    return new RunnableLambda({
      func: (input: ResponseGenerationInput): FormattedPromptInput => ({
        user_query: input.user_query,
        data: this.formatRows(input.rows),
      }),
    });
  }

  private formatRows(rows: unknown[]): string {
    if (rows.length === 0) {
      return '[]';
    }
    return JSON.stringify(rows);
  }
}
