import { HttpException, HttpStatus } from '@nestjs/common';

export class UnsafeSqlException extends HttpException {
  constructor(reason: string) {
    super(
      `Generated SQL is unsafe: ${reason}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
