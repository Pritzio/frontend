# User Management Component (Admin)

## File Structure

```
src/app/features/admin/users/
├── interfaces/
│   ├── index.ts                 # Exports all interfaces
│   ├── admin-user.interface.ts  # Main user interface
│   ├── user-profile.interface.ts # User profile interface
│   └── user-role.interface.ts   # User role interface
├── enums/
│   ├── index.ts                 # Exports all enums
│   ├── user-status.enum.ts      # User statuses
│   └── profile-visibility.enum.ts # Profile visibility
├── constants/
│   ├── index.ts                 # Exports all constants
│   └── role-mappings.constant.ts # Role name mappings
├── users.component.ts           # Component logic
├── users.component.html         # Component template
├── users.component.scss         # Component styles
└── README.md                    # This documentation
```

## Interfaces

### IAdminUser
Main interface representing a user in the admin context:
- `id`: Unique user identifier
- `username`: Username
- `email`: Email address
- `status`: User status (active, inactive, suspended, etc.)
- `profile`: Profile information (IUserProfile)
- `roles`: Array of user roles (IUserRole[])
- `createdAt`: Creation date
- `lastLoginAt`: Last login (optional)

### IUserProfile
User profile information:
- `firstName`: First name
- `lastName`: Last name
- `isVerified`: Whether verified
- `isActive`: Whether active
- `profileVisibility`: Profile visibility (public, private, friends)

### IUserRole
User role:
- `id`: Role identifier
- `name`: Role name
- `displayName`: Display name

## Enums

### UserStatus
- `ACTIVE`: Active user
- `INACTIVE`: Inactive user
- `SUSPENDED`: Suspended user
- `PENDING_VERIFICATION`: Pending verification
- `DELETED`: Deleted user

### ProfileVisibility
- `PUBLIC`: Public profile
- `PRIVATE`: Private profile
- `FRIENDS`: Friends only

## Constants

### ROLE_DISPLAY_NAMES
Role name mappings:
- `admin` → "Administrator"
- `user` → "User"
- `moderator` → "Moderator"
- `customer` → "Customer"
- `vendor` → "Vendor"
- `support` → "Support"

## Usage

```typescript
import { IAdminUser, UserStatus } from './interfaces';
import { ProfileVisibility } from './enums';
import { ROLE_DISPLAY_NAMES } from './constants';

// In the component
public users: IAdminUser[] = [];
public UserStatus = UserStatus;
public ProfileVisibility = ProfileVisibility;
```

## Backend Data Structure

The component expects to receive data in this format:

```json
{
  "users": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "status": "active",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "isVerified": boolean,
        "isActive": boolean,
        "profileVisibility": "public"
      },
      "roles": [
        {
          "id": "string",
          "name": "customer",
          "displayName": "Customer"
        }
      ],
      "createdAt": "date",
      "lastLoginAt": "date"
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```
