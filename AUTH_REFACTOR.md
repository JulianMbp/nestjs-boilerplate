# 🔐 IngenierIA Backend Auth — Simple Role-Based Architecture

## Overview

The authentication system has been refactored to implement a **simple, role-based architecture** without multi-tenancy. Users log in with email/password, receive a JWT containing their role, and all business logic is based on roles rather than `obra_id`.

## ✅ What Changed

### 1. JWT Payload Structure

The JWT token now contains:

```json
{
  "id": 3,
  "email": "admin.general@ingenieria.com",
  "role": {
    "id": 3,
    "name": "Admin General"
  },
  "sessionId": 31,
  "iat": 1762155104,
  "exp": 1762156004
}
```

**Key Points:**
- ❌ Removed: `obra_id`, `user_uuid`
- ✅ Added: `email` field
- ✅ Kept: `id` (numeric from NestJS DB), `role` (with id and name), `sessionId`

### 2. Authentication Endpoints

Simplified endpoints:

#### `POST /api/v1/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "admin.general@ingenieria.com",
  "password": "secret"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbG...",
  "tokenExpires": 1762156004000,
  "user": {
    "id": 3,
    "email": "admin.general@ingenieria.com",
    "firstName": "Julian",
    "lastName": "Bastidas",
    "role": {
      "id": 3,
      "name": "Admin General"
    }
  }
}
```

#### `POST /api/v1/auth/refresh`
Refresh the access token.

**Headers:**
```
Authorization: Bearer <refreshToken>
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbG...",
  "tokenExpires": 1762156004000
}
```

#### Other Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - Logout (invalidates session)
- `GET /api/v1/auth/me` - Get current user profile
- `PATCH /api/v1/auth/me` - Update current user
- `DELETE /api/v1/auth/me` - Soft delete current user

**Removed Endpoints:**
- ❌ `/api/v1/auth/email/login` (now just `/auth/login`)
- ❌ `/api/v1/auth/ingenieria/login` (merged into `/auth/login`)

### 3. Role-Based Access Control

#### Available Roles

The system supports the following roles:

1. **Admin General** - Full system access
2. **Admin Obra** - Construction project administrator
3. **Encargado de Área** - Area manager
4. **Obrero** - Worker
5. **SST** - Health and safety
6. **Compras** - Purchasing
7. **RRHH** - Human resources
8. **Consultor** - Consultant

#### Using the RolesGuard

The `RolesGuard` now checks `role.name` directly from the JWT payload:

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';

@Controller('users')
export class UsersController {
  /**
   * Only Admin General can access this endpoint
   */
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin General')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  /**
   * Multiple roles can access this endpoint
   */
  @Get('stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin General', 'Admin Obra', 'RRHH')
  async getStats() {
    return this.statsService.getData();
  }
}
```

**Important:** Role names in `@Roles()` decorator are case-insensitive and support partial matching.

### 4. Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Flutter)              │
└────────────────┬────────────────────────┘
                 │
                 ↓ POST /auth/login
                 ↓ { email, password }
┌─────────────────────────────────────────┐
│      NestJS Backend (Auth Service)      │
│  1. Validate credentials                │
│  2. Create session                      │
│  3. Generate JWT with role              │
└──────┬──────────────────────────────────┘
       │
       ↓ JWT Token
┌──────────────────────────────────────────┐
│  JWT Payload:                            │
│  - id: 3                                 │
│  - email: "admin.general@..."            │
│  - role: { id: 3, name: "Admin General" }│
│  - sessionId: 31                         │
└──────────────────────────────────────────┘
       │
       ↓ Protected Requests
┌──────────────────────────────────────────┐
│  Controllers with RolesGuard             │
│  - Check role.name from JWT              │
│  - Allow/deny based on @Roles()          │
└──────────────────────────────────────────┘
```

## 🧪 Testing

### 1. Login Test

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.general@ingenieria.com",
    "password": "secret"
  }'
```

### 2. Access Protected Endpoint

```bash
# Get the token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Access protected resource
curl -X GET http://localhost:3000/api/v1/users/stats \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Role-Based Access

```bash
# This should work for Admin General
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN_ADMIN_GENERAL"

# This should fail for other roles (403 Forbidden)
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN_OBRERO"
```

## 📋 User Seeding

Users are seeded automatically on first run. Default credentials:

| Email | Password | Role |
|-------|----------|------|
| admin.general@ingenieria.com | secret | Admin General |
| admin.obra1@ingenieria.com | secret | Admin Obra |
| admin.obra2@ingenieria.com | secret | Admin Obra |
| encargado.area1@ingenieria.com | secret | Encargado de Área |
| obrero.1@ingenieria.com | secret | Obrero |
| sst.1@ingenieria.com | secret | SST |
| compras.1@ingenieria.com | secret | Compras |
| rrhh.1@ingenieria.com | secret | RRHH |
| consultor.1@ingenieria.com | secret | Consultor |

## 🔧 Implementation Details

### Files Modified

1. **`src/auth/strategies/types/jwt-payload.type.ts`**
   - Added `email: string` field
   - Removed `user_uuid?` and `obra_id?`

2. **`src/auth/auth.service.ts`**
   - Removed `validateLoginIngenieria()` method
   - Updated `getTokensData()` to include email in JWT
   - Removed all multi-tenant logic

3. **`src/auth/auth.controller.ts`**
   - Simplified to `/auth/login` (removed `/email/login` and `/ingenieria/login`)
   - Removed unused imports

4. **`src/roles/roles.guard.ts`**
   - Now checks `user.role.name` from JWT
   - Removed `getRoleEnumByName()` mapping
   - Removed `requiere_obra` decorator support

5. **`src/users/users.controller.example.ts`** (NEW)
   - Example controller showing role-based access patterns

### Database Schema

**Users table remains unchanged:**
- `id` - Primary key
- `email` - Unique email
- `password` - Hashed password
- `first_name`, `last_name` - User names
- `role_id` - Foreign key to roles table
- `status_id` - Active/inactive status
- `provider` - Auth provider (email, google, etc.)

**No multi-tenant tables** (obra_usuario, obras) in NestJS database.

## 🚀 Next Steps

1. **Implement business logic** based on roles instead of obras
2. **Use Supabase** for project-level data (not user authentication)
3. **Create additional controllers** with appropriate role restrictions
4. **Frontend integration** - Update Flutter app to use `/auth/login` endpoint

## 📚 Best Practices

1. **Always use both guards together:**
   ```typescript
   @UseGuards(AuthGuard('jwt'), RolesGuard)
   ```

2. **Be specific with role names:**
   ```typescript
   @Roles('Admin General')  // ✅ Good
   @Roles('admin')          // ❌ Might match unexpectedly
   ```

3. **Handle authorization errors in frontend:**
   - 401 Unauthorized = Invalid/expired token → Redirect to login
   - 403 Forbidden = Valid token but insufficient role → Show error message

4. **Secure sensitive endpoints:**
   ```typescript
   // Only Admin General should delete users
   @Delete(':id')
   @UseGuards(AuthGuard('jwt'), RolesGuard)
   @Roles('Admin General')
   async deleteUser(@Param('id') id: string) {
     return this.usersService.delete(id);
   }
   ```

## ⚠️ Migration Notes

If you have existing code using the old multi-tenant system:

1. **Remove obra_id from API calls** - No longer needed
2. **Update endpoint URLs** - Use `/auth/login` instead of `/auth/ingenieria/login`
3. **Change authorization logic** - Use role names instead of obra access checks
4. **Update JWT decoding** - Expect `email` field in payload

## 🐛 Troubleshooting

### "User role information is missing from token"
- Ensure you're using a freshly generated token after the refactor
- Old tokens won't have the correct structure

### "You do not have the necessary permissions"
- Check that the user's role name matches exactly what's in `@Roles()`
- Verify the user has the correct role in the database

### Cannot access any protected endpoints
- Ensure `Authorization: Bearer <token>` header is set correctly
- Verify token hasn't expired (default: 15 minutes)
- Use `/auth/refresh` to get a new token
