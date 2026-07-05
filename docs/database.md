# Shubh Samay — Database

No backend database is used for app functionality. All panchang data is calculated live from astronomy-engine on every request.

## Prisma schema (unused scaffold)
A Prisma schema exists at `prisma/schema.prisma` with two models — this is leftover from the Next.js starter template and is NOT used by the app:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Database config
- Provider: SQLite (via Prisma)
- Connection: `DATABASE_URL="file:./dev.db"` in `.env`
- The `.env` file is gitignored (as `.env*` pattern in `.gitignore`)

## Future considerations
- If user accounts or saved searches are needed, the Prisma schema can be extended
- For production, consider migrating to PostgreSQL
