# 🔐 Multi-Tenant Supabase Integration

## Overview

This NestJS boilerplate has been enhanced with **multi-tenant support** using **Supabase** for Row-Level Security (RLS) integration. Each user can be assigned to one or more construction projects ("obras"), and Supabase manages all project-specific data with RLS policies.

---

## 🎯 Features

✅ **JWT Enhancement**: Tokens now include `user_uuid` and `obra_id` for Supabase RLS  
✅ **Supabase Service**: Centralized service for fetching user UUIDs and validating obra access  
✅ **UUID Validation**: Security layer to ensure only valid UUIDs are processed  
✅ **Dual Authentication**: Both `/auth/email/login` and `/auth/ingenieria/login` support multi-tenancy  
✅ **Backward Compatible**: Existing `id` and `sessionId` fields preserved  

---

## 📋 Configuration

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Supabase configuration for multi-tenant integration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

⚠️ **Important**: Use the **Service Role Key**, not the Anon Key, to bypass RLS for administrative operations.

---

## 🔑 JWT Payload Structure

### Standard Login (`/auth/email/login`)

```json
{
  "id": 3,
  "user_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "role": { "id": 4, "name": "Admin Obra" },
  "sessionId": 42,
  "email": "admin.obra1@ingenieria.com",
  "iat": 1762155104,
  "exp": 1762156004
}
```

### IngenierIA Login with Obra (`/auth/ingenieria/login`)

```json
{
  "id": 3,
  "user_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "obra_id": "c13e4b9e-41f1-4273-a18e-c26699edab61",
  "role": { "id": 4, "name": "Admin Obra" },
  "sessionId": 42,
  "email": "admin.obra1@ingenieria.com",
  "iat": 1762155104,
  "exp": 1762156004
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | ✅ | Numeric user ID (PostgreSQL) - for backward compatibility |
| `user_uuid` | `string` | ⚠️ | Supabase user UUID - required for RLS, optional if Supabase unavailable |
| `obra_id` | `string` | ❌ | Construction project UUID - only for IngenierIA login |
| `role` | `object` | ✅ | User role with id and name |
| `sessionId` | `number` | ✅ | Session identifier |
| `email` | `string` | ✅ | User email address |
| `iat` | `number` | ✅ | Issued at timestamp |
| `exp` | `number` | ✅ | Expiration timestamp |

---

## 🚀 API Usage

### Login with Email (Standard)

```bash
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.obra1@ingenieria.com",
    "password": "secret"
  }'
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpires": 1762156004000,
  "user": {
    "id": 3,
    "email": "admin.obra1@ingenieria.com",
    "firstName": "Maria",
    "lastName": "Perez",
    "role": {
      "id": 4,
      "name": "Admin Obra"
    }
  }
}
```

### Login with Obra (IngenierIA Multi-Tenant)

```bash
curl -X POST http://localhost:3000/api/v1/auth/ingenieria/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.obra1@ingenieria.com",
    "password": "secret",
    "obraId": "c13e4b9e-41f1-4273-a18e-c26699edab61"
  }'
```

**Response**: Same as above, but JWT includes `obra_id` field.

---

## 🔐 Security Features

### UUID Validation

All `obra_id` values are validated before processing:

```typescript
import { isValidUuidAnyVersion } from '../utils/uuid-validator';

if (!isValidUuidAnyVersion(obraId)) {
  throw new UnprocessableEntityException({
    errors: { obra_id: 'invalidUuid' }
  });
}
```

### Obra Access Validation

When logging in with an `obra_id`, the system validates access in **both databases**:

1. **PostgreSQL** (NestJS): Checks `obra_usuario` table for assignment
2. **Supabase**: Validates RLS access using `validateUserObraAccess()`

If either check fails, login is rejected with `401 Unauthorized`.

---

## 🛠️ Architecture

### SupabaseService

Located in `src/auth/supabase.service.ts`, provides:

#### `getUserSupabaseUuid(email: string): Promise<string>`
- Fetches Supabase UUID from `users` table by email
- Throws error if user not found
- Used during login to populate `user_uuid` in JWT

#### `validateUserObraAccess(userUuid: string, obraId: string): Promise<boolean>`
- Validates user has access to obra in Supabase `obra_usuario` table
- Returns `true` if access exists, `false` otherwise
- Used when `obra_id` is provided during login

#### `getClient(): SupabaseClient`
- Returns raw Supabase client for advanced operations

### AuthService Updates

Enhanced methods:
- `validateLogin()` - Now fetches `user_uuid` from Supabase
- `validateLoginIngenieria()` - Validates `obra_id` format and access in both databases
- `getTokensData()` - Signs JWT with `user_uuid` and `obra_id` fields

---

## 🧪 Testing

### Decode JWT Token

```bash
echo "YOUR_JWT_TOKEN" | cut -d '.' -f 2 | base64 -d | jq
```

### Expected Output

```json
{
  "id": 3,
  "user_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "obra_id": "c13e4b9e-41f1-4273-a18e-c26699edab61",
  "role": {
    "id": 4,
    "name": "Admin Obra"
  },
  "sessionId": 15,
  "email": "admin.obra1@ingenieria.com",
  "iat": 1762155104,
  "exp": 1762156004
}
```

### Test Endpoints

```bash
# 1. Login without obra (standard)
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.general@ingenieria.com","password":"secret"}'

# 2. Login with obra (multi-tenant)
curl -X POST http://localhost:3000/api/v1/auth/ingenieria/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin.obra1@ingenieria.com",
    "password":"secret",
    "obraId":"c13e4b9e-41f1-4273-a18e-c26699edab61"
  }'

# 3. Use token to access protected endpoint
curl -X GET http://localhost:3000/api/v1/obras?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ⚠️ Error Handling

### Supabase Unavailable

If Supabase is unreachable, login **still succeeds** but without `user_uuid`:

```typescript
let userUuid: string | undefined;
try {
  if (user.email) {
    userUuid = await this.supabaseService.getUserSupabaseUuid(user.email);
  }
} catch (error) {
  // Log error but don't fail login
  console.error('Failed to fetch Supabase UUID:', error);
}
```

**Result**: JWT is signed without `user_uuid` field (backward compatible).

### Invalid Obra ID

```json
{
  "statusCode": 422,
  "message": "Unprocessable Entity",
  "errors": {
    "obra_id": "invalidUuid"
  }
}
```

### No Access to Obra

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "errors": {
    "obra": "noAccess"
  }
}
```

---

## 📊 Database Schema Requirements

### Supabase Tables

#### `users` Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  -- other fields...
);
```

#### `obra_usuario` Table
```sql
CREATE TABLE obra_usuario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  obra_id UUID REFERENCES obras(id),
  role_id INT,
  -- other fields...
);
```

### PostgreSQL (NestJS)

Must have matching email addresses in both databases for `user_uuid` lookup to work.

---

## 🔄 Migration Path

### Existing Users

1. **Export users** from PostgreSQL
2. **Import to Supabase** `users` table with matching emails
3. **Map relationships** in `obra_usuario` table
4. **Update environment variables** with Supabase credentials
5. **Restart application**

### Testing Migration

```bash
# Verify user exists in Supabase
curl -X POST http://localhost:3000/api/v1/auth/email/login \
  -H "Content-Type: application/json" \
  -d '{"email":"existing.user@example.com","password":"secret"}'

# Check if user_uuid is in token
echo "TOKEN" | cut -d '.' -f 2 | base64 -d | jq '.user_uuid'
```

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

## ✅ Checklist

- [x] Install `@supabase/supabase-js` package
- [x] Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to environment
- [x] Create `SupabaseService` with UUID fetching and validation
- [x] Update `JwtPayloadType` to include `user_uuid` and `obra_id`
- [x] Modify `validateLogin()` to fetch Supabase UUID
- [x] Enhance `validateLoginIngenieria()` with UUID validation
- [x] Add UUID validation helper functions
- [ ] Sync user data between PostgreSQL and Supabase
- [ ] Test login endpoints with valid/invalid obra IDs
- [ ] Configure Supabase RLS policies
- [ ] Update frontend to handle `obra_id` in token

---

**Last Updated**: November 3, 2025  
**Version**: 1.0.0  
**Author**: NestJS Boilerplate + Supabase Integration
