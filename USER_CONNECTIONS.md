# User Connections Feature

## Overview

The user connections feature allows users to connect their accounts and view shared transactions. This feature is designed with security as a top priority to prevent unauthorized access to user data.

## Security Features

### 1. **Explicit Connection Approval**
- All connection requests require explicit approval from the recipient
- Users cannot view another user's transactions without an accepted connection
- Connection requests can be rejected, preventing unwanted access

### 2. **Permission Verification**
- All transaction queries verify that the requesting user has permission to view the target user's data
- The `canViewUserTransactions()` helper function checks for accepted connections before allowing access
- Users can only view transactions of:
  - Themselves (always allowed)
  - Users they have an accepted connection with

### 3. **Request Validation**
- Users cannot send connection requests to themselves
- Duplicate connection requests are prevented
- Connection status is tracked (pending, accepted, rejected, blocked)

### 4. **Database-Level Constraints**
- Unique constraint prevents duplicate connections
- Foreign key relationships ensure data integrity
- Status enum restricts connection states to valid values

### 5. **Server-Side Validation**
- All connection operations are performed server-side
- Authentication middleware ensures only authenticated users can perform actions
- Input validation using Zod schemas prevents invalid data

## Database Schema

### `user_connections` Table

```sql
CREATE TABLE user_connections (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  requester_user_id TEXT NOT NULL,
  recipient_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(requester_user_id, recipient_user_id)
);
```

## API Endpoints

### 1. Send Connection Request
- **Endpoint**: `sendConnectionRequest`
- **Method**: POST
- **Auth**: Required
- **Input**: `{ recipientUserId: string }` or `{ recipientEmail: string }`
- **Security**: Prevents self-connections, checks for existing connections

### 2. Get Connection Requests
- **Endpoint**: `getConnectionRequests`
- **Method**: GET
- **Auth**: Required
- **Returns**: Sent requests, received requests, and accepted connections
- **Security**: Only returns connections involving the authenticated user

### 3. Respond to Connection Request
- **Endpoint**: `respondToConnectionRequest`
- **Method**: POST
- **Auth**: Required
- **Input**: `{ connectionId: number, action: 'accept' | 'reject' }`
- **Security**: Only the recipient can respond to requests

### 4. Remove Connection
- **Endpoint**: `removeConnection`
- **Method**: POST
- **Auth**: Required
- **Input**: `{ connectionId: number }`
- **Security**: Only users involved in the connection can remove it

### 5. Get Connections
- **Endpoint**: `getConnections`
- **Method**: GET
- **Auth**: Required
- **Returns**: List of accepted connections
- **Security**: Only returns connections involving the authenticated user

## Transaction Filtering

### Updated `getTransactionsByMonth`

The transaction query now supports filtering by connected users:

- **`userId`**: Filter by specific user ID (must be connected)
- **`includeConnected`**: Include all connected users' transactions

**Security**: The query verifies permissions before returning data:
- Users can always view their own transactions
- Users can only view transactions of users they're connected to
- Unauthorized access attempts throw an error

## Usage

### 1. Sending a Connection Request

Navigate to `/dashboard/connections` and use the "Send Connection Request" form:

```typescript
// By User ID
await sendConnectionRequest({
  data: { recipientUserId: "user_abc123" }
});

// By Email (requires Clerk Backend API setup)
await sendConnectionRequest({
  data: { recipientEmail: "user@example.com" }
});
```

### 2. Managing Connection Requests

View and respond to pending requests on the connections page:
- **Received Requests**: Requests sent to you - can accept or reject
- **Sent Requests**: Requests you've sent - shows pending status

### 3. Filtering Transactions by User

On the transactions page (`/dashboard/transactions`):
- Use the "Filter by User" dropdown to select a specific user
- Check "Include all connected users" to see combined transactions
- Only connected users' transactions are available in the filter

## Setup Instructions

### 1. Database Migration

Run the database migration to create the `user_connections` table:

```bash
npm run drizzle-kit generate
npm run drizzle-kit migrate
```

### 2. Clerk Backend API (Optional)

To enable email-based connection requests, set up Clerk's Backend API:

1. Install `@clerk/clerk-sdk-node`:
```bash
npm install @clerk/clerk-sdk-node
```

2. Set `CLERK_SECRET_KEY` in your environment variables

3. Update `src/data/sendConnectionRequest.ts` to use Clerk's API:

```typescript
import { clerkClient } from "@clerk/clerk-sdk-node";

// In the handler:
if (data.recipientEmail && !recipientUserId) {
  const users = await clerkClient.users.getUserList({ 
    emailAddress: [data.recipientEmail] 
  });
  if (users.length === 0) throw new Error("User not found");
  recipientUserId = users[0].id;
}
```

## Security Best Practices

1. **Never expose user IDs in URLs** - Use connection IDs for operations
2. **Always verify permissions** - Check connections before showing data
3. **Validate inputs** - Use Zod schemas for all inputs
4. **Log access attempts** - Consider adding audit logs for security monitoring
5. **Rate limiting** - Consider adding rate limits to prevent abuse
6. **Email verification** - Ensure emails are verified before allowing connections

## Future Enhancements

- [ ] User profiles with display names
- [ ] Connection request notifications
- [ ] Block user functionality (partially implemented)
- [ ] Connection request expiration
- [ ] Bulk connection operations
- [ ] Connection analytics/insights

## Troubleshooting

### "User not found" error
- Ensure the user ID or email is correct
- For email lookup, ensure Clerk Backend API is configured

### "Not authorized to view this user's transactions"
- Verify the connection is accepted (not pending)
- Check that you're using the correct user ID

### "Connection request already pending"
- Wait for the recipient to respond
- Or cancel the existing request first
