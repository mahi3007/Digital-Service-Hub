# API Reference

Base URL: `http://localhost:5000/api` (development)

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update profile | Yes |
| PUT | `/change-password` | Change password | Yes |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/verification/upload` | Upload verification document | Yes |
| GET | `/verification/status` | Get verification status | Yes |
| PUT | `/wallet` | Update wallet balance | Yes |

### Vendors (`/api/vendors`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all vendors | No |
| GET | `/:id` | Get vendor by ID | No |
| POST | `/profile` | Create vendor profile | Yes |
| GET | `/profile/me` | Get own vendor profile | Yes (Vendor) |
| PUT | `/profile` | Update vendor profile | Yes (Vendor) |
| PUT | `/availability` | Update availability | Yes (Vendor) |
| GET | `/stats/me` | Get vendor statistics | Yes (Vendor) |

### Services (`/api/services`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all services | No |
| GET | `/:id` | Get service by ID | No |
| POST | `/` | Create service | Yes (Vendor) |
| PUT | `/:id` | Update service | Yes (Vendor) |
| DELETE | `/:id` | Delete service | Yes (Vendor) |
| GET | `/vendor/me` | Get vendor's services | Yes (Vendor) |

### Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create` | Create booking | Yes |
| GET | `/` | Get all bookings | Yes |
| GET | `/user/me` | Get user bookings | Yes |
| GET | `/vendor/me` | Get vendor bookings | Yes (Vendor) |
| GET | `/:id` | Get booking by ID | Yes |
| PUT | `/:id/status` | Update booking status | Yes |
| PUT | `/:id/cancel` | Cancel booking | Yes |
| PUT | `/:id/complete` | Complete booking | Yes |

### RFQ (`/api/rfq`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create` | Create RFQ | Yes |
| GET | `/` | Get all RFQs | Yes |
| GET | `/user/me` | Get user RFQs | Yes |
| GET | `/vendor/me` | Get vendor RFQs | Yes (Vendor) |
| GET | `/:id` | Get RFQ by ID | Yes |
| PUT | `/:id` | Update RFQ | Yes |
| POST | `/:id/proposal` | Submit proposal | Yes (Vendor) |
| PUT | `/:rfqId/proposal/:proposalId` | Update proposal status | Yes |
| POST | `/:rfqId/select/:proposalId` | Select proposal | Yes |

### Projects (`/api/projects`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all projects | Yes |
| GET | `/user/me` | Get user projects | Yes |
| GET | `/vendor/me` | Get vendor projects | Yes (Vendor) |
| GET | `/:id` | Get project by ID | Yes |
| PUT | `/:projectId/milestone/:milestoneId` | Update milestone | Yes |
| POST | `/:projectId/milestone/:milestoneId/approve` | Approve milestone | Yes |
| POST | `/:projectId/milestone/:milestoneId/deliverable` | Upload deliverable | Yes (Vendor) |

### Payments (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create-order` | Create payment order | Yes |
| POST | `/verify` | Verify payment | Yes |
| POST | `/refund/:transactionId` | Process refund | Yes |
| GET | `/history` | Get transaction history | Yes |
| GET | `/:id` | Get transaction by ID | Yes |

### Reviews (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all reviews | No |
| GET | `/:id` | Get review by ID | No |
| POST | `/create` | Create review | Yes |
| PUT | `/:id` | Update review | Yes |
| DELETE | `/:id` | Delete review | Yes |
| POST | `/:id/helpful` | Mark review helpful | Yes |
| POST | `/:id/response` | Vendor response | Yes (Vendor) |

### Disputes (`/api/disputes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create` | Create dispute | Yes |
| GET | `/` | Get all disputes | Yes |
| GET | `/:id` | Get dispute by ID | Yes |
| POST | `/:id/message` | Add message | Yes |
| PUT | `/:id/status` | Update status | Yes (Admin) |
| POST | `/:id/resolve` | Resolve dispute | Yes (Admin) |
| POST | `/:id/escalate` | Escalate dispute | Yes |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard/stats` | Get dashboard stats | Yes (Admin) |
| GET | `/users` | Get all users | Yes (Admin) |
| PUT | `/vendors/:id/verify` | Verify vendor | Yes (Admin) |
| PUT | `/documents/:userId/verify` | Verify document | Yes (Admin) |
| GET | `/transactions` | Get all transactions | Yes (Admin) |
| GET | `/disputes/stats` | Get dispute stats | Yes (Admin) |

## Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?status=active&category=plumbing
```

### Sorting
```
?sort=-createdAt  // Descending
?sort=price       // Ascending
```

### Search
```
?search=keyword
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

- 100 requests per 15 minutes per IP
- Applies to all `/api/*` endpoints
- Returns 429 status when exceeded

## Webhooks

### Payment Webhook
```
POST /api/payments/webhook
```

Handles payment gateway callbacks for:
- Payment success
- Payment failure
- Refund processed

## WebSocket Events (Socket.IO)

### Client → Server
- `join-room`: Join chat room
- `send-message`: Send message

### Server → Client
- `receive-message`: Receive message
- `booking-status-updated`: Booking status changed
- `milestone-updated`: Project milestone updated

## Error Codes

| Code | Message |
|------|---------|
| AUTH_001 | Invalid credentials |
| AUTH_002 | Token expired |
| AUTH_003 | Unauthorized access |
| PAY_001 | Payment failed |
| PAY_002 | Insufficient balance |
| BOOK_001 | Service unavailable |
| BOOK_002 | Booking conflict |

## Best Practices

1. Always include Authorization header for protected routes
2. Handle rate limiting with exponential backoff
3. Validate input on client side before API calls
4. Use pagination for large datasets
5. Implement proper error handling
6. Cache responses when appropriate
7. Use HTTPS in production
