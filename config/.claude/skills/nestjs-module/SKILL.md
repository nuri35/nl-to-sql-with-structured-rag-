---
name: nestjs-module
description: Scaffold a new NestJS feature module with controller, service, DTOs, exceptions, and tests following project conventions. Use when the user asks to create a new module, feature, or domain area in src/.
---

# NestJS Module Scaffold

When the user requests a new module (e.g., "add a users module", "scaffold an analytics feature"):

## Pre-checks

1. Confirm the module name in kebab-case (e.g., `users`, `query-history`).
2. Confirm whether this module needs a controller, service, or both.
3. Confirm what the module depends on (e.g., DatabaseService, RagService).

If unclear, ask before generating files.

## File Structure

Create under `src/{module-name}/`:

```
src/{module-name}/
├── {module-name}.module.ts
├── {module-name}.controller.ts          (only if HTTP-facing)
├── {module-name}.service.ts
├── {module-name}.service.spec.ts
├── dto/
│   └── .gitkeep
└── exceptions/
    └── .gitkeep
```

## File Templates

### `{module-name}.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { {ModuleName}Controller } from './{module-name}.controller';
import { {ModuleName}Service } from './{module-name}.service';

@Module({
  imports: [],
  controllers: [{ModuleName}Controller],
  providers: [{ModuleName}Service],
  exports: [{ModuleName}Service],
})
export class {ModuleName}Module {}
```

### `{module-name}.controller.ts`

```typescript
import { Controller } from '@nestjs/common';
import { {ModuleName}Service } from './{module-name}.service';

@Controller('{module-name}')
export class {ModuleName}Controller {
  constructor(private readonly service: {ModuleName}Service) {}
}
```

### `{module-name}.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class {ModuleName}Service {
  private readonly logger = new Logger({ModuleName}Service.name);
}
```

### `{module-name}.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { {ModuleName}Service } from './{module-name}.service';

describe('{ModuleName}Service', () => {
  let service: {ModuleName}Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ModuleName}Service],
    }).compile();

    service = module.get<{ModuleName}Service>({ModuleName}Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## Final Steps

1. Register the new module in `src/app.module.ts` `imports` array.
2. Do **not** add example logic. Empty scaffolding only.
3. Do **not** add comments explaining what NestJS decorators do.
4. Apply project conventions from `CLAUDE.md` (strict types, no `any`, async/await).

## What to Avoid

- Skipping the spec file. Every service gets a spec.
- Adding boilerplate methods like `findAll`, `create` — let the user define what they need.
- Importing concrete classes from outside the module without checking if it should be injected.
