# 📦 RentEase — Week 2 Academic Deliverable
> **Database Schema, Prisma ORM Models & Express REST API Architecture**

---

## 📌 Week 2 Objectives Achieved
1. **Relational Database Design**: Designed a normalized PostgreSQL schema tailored to multi-property PG management.
2. **Prisma ORM Configuration**: Complete `schema.prisma` with Enums, composite indices, cascading rules, and relational mappings.
3. **Database Seeding (`seed.js`)**: Seed script with realistic academic demo data (Rahul Verma's Green Valley PG Sonipat & Student Homes Delhi).
4. **REST API Endpoints**:
   - `POST /api/auth/register` & `POST /api/auth/login` (JWT token based)
   - `GET /api/properties` & `POST /api/properties`
   - `GET /api/rooms` (with live occupancy calculations) & `POST /api/rooms`
   - `GET /api/tenants` & `POST /api/tenants` (lease creation)
   - `GET /api/payments` & `POST /api/payments/checkout` (mock payment simulator & tax invoice generator)
   - `GET /api/complaints` & `PATCH /api/complaints/:id/status` (4-stage lifecycle: `Pending ➔ Assigned ➔ In Progress ➔ Resolved`)
   - `GET /api/notices` & `POST /api/notices` (broadcast announcements)
5. **Role-Based Middleware**: `authenticateToken` and `authorizeRoles('OWNER', 'TENANT', 'ADMIN')`.

---

## 🗄️ Database Entity-Relationship (ER) Architecture

```mermaid
erDiagram
    USER ||--o{ PROPERTY : owns
    USER ||--o| LEASE : holds
    USER ||--o{ COMPLAINT : files
    PROPERTY ||--|{ ROOM : contains
    PROPERTY ||--o{ NOTICE : broadcasts
    PROPERTY ||--o{ PAYMENT : reconciles
    ROOM ||--o{ LEASE : accommodates
    
    USER {
        string id PK
        string name
        string email UK
        string phone
        enum role "ADMIN | OWNER | TENANT"
        string status "active | blocked"
        datetime createdAt
    }

    PROPERTY {
        string id PK
        string ownerId FK
        string name
        string location
        string type
        int totalRooms
        string[] amenities
        string managerPhone
    }

    ROOM {
        string id PK
        string propertyId FK
        string roomNumber
        int floor
        int capacity
        int occupied
        float rent
        boolean hasAC
        boolean hasAttachedBath
    }

    LEASE {
        string id PK
        string tenantId FK
        string roomId FK
        date startDate
        date endDate
        float monthlyRent
        float deposit
        boolean isActive
    }

    PAYMENT {
        string id PK
        string propertyId FK
        string tenantId FK
        string month
        float amount
        enum status "PENDING | PAID | OVERDUE"
        string transactionId UK
        datetime paymentDate
    }

    COMPLAINT {
        string id PK
        string propertyId FK
        string tenantId FK
        string category
        string title
        string description
        enum priority "LOW | MEDIUM | HIGH | URGENT"
        enum status "PENDING | ASSIGNED | IN_PROGRESS | RESOLVED"
        string assignedTo
    }

    NOTICE {
        string id PK
        string propertyId FK
        string title
        string category
        string content
        string author
        boolean isPinned
    }
```

---

## 🚀 How to Run the Backend
```bash
# 1. Install dependencies
npm install

# 2. Run in development mode
npm run dev
# Server starts at http://localhost:5000
```

### Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```

### Test Live Occupancy Summary
```bash
curl http://localhost:5000/api/rooms?propertyId=prop_1
```

### Test Mock Payment Checkout & Receipt
```bash
curl -X POST http://localhost:5000/api/payments/checkout \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"pay_103_nov","paymentMethod":"UPI"}'
```
