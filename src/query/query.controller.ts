import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { QueryRequestDto } from './dto/query-request.dto';
import { QueryResponseDto } from './dto/query-response.dto';
import { QueryService } from './query.service';

@Controller('query')
export class QueryController {
  private readonly logger = new Logger(QueryController.name);

  constructor(private readonly queryService: QueryService) {}

  @Post()
  @HttpCode(200)
  async query(@Body() body: QueryRequestDto): Promise<QueryResponseDto> {
    this.logger.log(`Received query request: ${body.query}`);
    const result = await this.queryService.query(body.query);
    return result;
  }
}
