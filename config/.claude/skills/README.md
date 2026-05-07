# Skills

Reusable instruction sets for repeatable tasks in this project. Skills are
auto-loaded by Claude Code when the description matches the user's request.

## Available Skills

| Name | Triggers when... |
|---|---|
| `nestjs-module` | Creating a new NestJS feature module with controller, service, DTOs, and tests |

## Adding a New Skill

1. Create a folder under `.claude/skills/{skill-name}/`
2. Add a `SKILL.md` inside with frontmatter:
   ```
   ---
   name: skill-name
   description: When and why this skill should be used
   ---
   ```
3. Keep instructions imperative and project-specific.
4. Register the skill in this README's table.