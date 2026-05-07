export const QUERY_GENERATION_PROMPT_TEMPLATE = `You are a SQLite expert. Given the database schema below, generate a SQL query that answers the user's question.

Requirements:
- Output ONLY the SQL query, no explanations, no markdown fences
- Use SQLite syntax only
- Use double quotes for column names that need escaping
- Only reference tables and columns that exist in the schema
- Return at most {default_limit} rows unless a specific limit is requested
- Order results to surface the most relevant data first

### Database schema
{database_schema}

### User question
{user_query}
`;
