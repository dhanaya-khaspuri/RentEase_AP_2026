
# WhatsApp Messaging Database – Normalization Analysis

**Course:** Database Management Systems  
**Team Number:** T0084  
**Team Lead:** Dhanaya Khaspuri  
**Team Members:** Mahika Garg, Ishan Bansal, Saumya Madan  
**Database:** PostgreSQL 18.6  
**Schema:** whatsapp

---

## 1. Introduction

Normalization is the process of organizing data in a relational database to reduce data redundancy and prevent insertion, deletion, and update anomalies.

The WhatsApp Messaging Database manages users, devices, chats, chat memberships, media, messages, message receipts, calls, and blocked users.

The database is designed using normalization principles to maintain data consistency and referential integrity.

## 2. First Normal Form (1NF)

A relation is in First Normal Form if:

- Every attribute contains only atomic (single) values.
- There are no repeating groups or multivalued attributes.
- Every record can be uniquely identified using a primary key.

### Application to WhatsApp Database

All nine tables satisfy 1NF:

1. users
2. devices
3. chats
4. chat_members
5. media
6. messages
7. message_receipts
8. calls
9. blocked_users

For example, the `users` table stores one phone number and one display name per user. Similarly, the `messages` table stores individual message records instead of multiple messages in a single row.

Therefore, all relations satisfy First Normal Form.

## 3. Second Normal Form (2NF)

A relation is in Second Normal Form if:

- It is already in 1NF.
- Every non-key attribute is fully functionally dependent on the entire candidate key.
- There are no partial dependencies.

### 3.1 Tables with Single-Column Primary Keys

The following tables have single-column primary keys:

- users (user_id)
- devices (device_id)
- chats (chat_id)
- media (media_id)
- messages (message_id)
- calls (call_id)

Since these tables have single-attribute primary keys, partial dependency is not possible.

### 3.2 Tables with Composite Primary Keys

**A. chat_members**

Primary Key: (chat_id, user_id)

Functional Dependency:

(chat_id, user_id) → role, joined_at, left_at, is_muted

The membership information depends on the combination of both chat_id and user_id.

**B. message_receipts**

Primary Key: (message_id, user_id)

Functional Dependency:

(message_id, user_id) → delivered_at, read_at

Delivery and read timestamps depend on a particular message and its recipient.

**C. blocked_users**

Primary Key: (blocker_id, blocked_id)

Functional Dependency:

(blocker_id, blocked_id) → blocked_at

The blocking timestamp depends on the complete pair of users.

Therefore, all nine tables satisfy Second Normal Form.

## 4. Third Normal Form (3NF)

A relation is in Third Normal Form if:

- It is already in 2NF.
- No non-key attribute is transitively dependent on a candidate key.

In other words, non-key attributes should depend directly on the key, the whole key, and nothing but the key.

### Functional Dependency Analysis

| Table | Functional Dependency |
|---|---|
| users | user_id → remaining attributes |
| devices | device_id → remaining attributes |
| chats | chat_id → remaining attributes |
| chat_members | (chat_id, user_id) → remaining attributes |
| media | media_id → remaining attributes |
| messages | message_id → remaining attributes |
| message_receipts | (message_id, user_id) → remaining attributes |
| calls | call_id → remaining attributes |
| blocked_users | (blocker_id, blocked_id) → blocked_at |

The `users` table also has an alternate candidate key `phone_e164`, which uniquely identifies each user.

No transitive dependencies are identified under the stated functional dependencies.

Therefore, all nine relations satisfy Third Normal Form.

## 5. Boyce-Codd Normal Form (BCNF)

BCNF is a stronger version of 3NF.

A relation satisfies BCNF if, for every non-trivial functional dependency X → Y, X must be a superkey.

### BCNF Analysis

- **users:** user_id and phone_e164 are candidate keys. Both determine the remaining attributes.
- **devices:** device_id determines all other attributes.
- **chats:** chat_id determines all other attributes.
- **chat_members:** The composite key (chat_id, user_id) determines all membership attributes.
- **media:** media_id determines all media attributes.
- **messages:** message_id determines all message attributes.
- **message_receipts:** The composite key (message_id, user_id) determines receipt timestamps.
- **calls:** call_id determines all call attributes.
- **blocked_users:** The composite key (blocker_id, blocked_id) determines blocked_at.

Under the stated functional dependencies, all nine relations satisfy BCNF.

## 6. Final Normalized Schema

The final database consists of the following nine relations:

1. users
2. devices
3. chats
4. chat_members
5. media
6. messages
7. message_receipts
8. calls
9. blocked_users

Primary keys uniquely identify records, while foreign keys maintain relationships between tables.

Composite primary keys are used in bridge tables to prevent duplicate relationships.

## 7. Benefits of Normalization

Normalization provides several benefits:

1. Reduces unnecessary data duplication.
2. Prevents insertion, deletion, and update anomalies.
3. Improves data consistency.
4. Maintains referential integrity through primary and foreign keys.
5. Makes database maintenance easier.
6. Provides a structured relational design.

## 8. Conclusion

The WhatsApp Messaging Database is designed using normalization principles.

All nine relations satisfy 1NF, 2NF, 3NF, and BCNF under the stated functional dependencies.

The normalized structure provides better data organization, reduces redundancy, and ensures consistency while managing users, conversations, messages, media, calls, and delivery receipts.
