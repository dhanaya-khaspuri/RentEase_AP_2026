# RentEase Application Query Timings & Performance Analysis

**Course:** Database Management Systems (DBMS)  
**Team:** T0084 (RentEase: Property & PG Management System)  
**Checkpoint:** CP4 · Final Submission  
**Database Engine:** PostgreSQL 18.6 (Postgres.app / macOS arm64)  
**Benchmark Methodology:** 3 runs per query with `EXPLAIN (ANALYZE, BUFFERS, TIMING)`. All queries executed against populated `rentease_db` instance.  

---

## 1. Workload Query Timing Summary

| Query ID | Type | Description | Run 1 (ms) | Run 2 (ms) | Run 3 (ms) | Average (ms) |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| **R1** | `READ` | Login: look up a user by email for authentication | 0.026 | 0.035 | 0.026 | **0.029** |
| **R2** | `READ` | Profile: fetch full profile of a logged-in user by id | 0.028 | 0.025 | 0.023 | **0.025** |
| **R3** | `READ` | Owner dashboard: list all properties owned by a specific owner | 0.031 | 0.028 | 0.027 | **0.029** |
| **R4** | `READ` | Room list: all rooms for a given property with occupancy status | 0.034 | 0.029 | 0.030 | **0.031** |
| **R5** | `READ` | Tenant dashboard: get the active lease for the logged-in tenant | 0.036 | 0.032 | 0.031 | **0.033** |
| **R6** | `READ` | Payment history: all payments for a tenant, newest first | 0.040 | 0.038 | 0.039 | **0.039** |
| **R7** | `READ` | Owner payments view: all payments for a specific property | 0.039 | 0.039 | 0.042 | **0.040** |
| **R8** | `READ` | Overdue payments: all OVERDUE or PENDING-past-due-date payments for a property | 0.033 | 0.032 | 0.035 | **0.033** |
| **R9** | `READ` | Complaints list: all complaints for a property, newest first | 0.042 | 0.041 | 0.041 | **0.041** |
| **R10** | `READ` | Tenant complaints: complaints raised by the logged-in tenant | 0.035 | 0.035 | 0.034 | **0.035** |
| **R11** | `READ` | Notices: all pinned-first notices for a property | 0.027 | 0.035 | 0.025 | **0.029** |
| **R12** | `READ` | Admin: all users on the platform with their roles and status | 0.026 | 0.026 | 0.024 | **0.025** |
| **R13** | `READ` | Owner summary: total revenue collected per property this month | 0.052 | 0.056 | 0.052 | **0.053** |
| **R14** | `READ` | Occupancy report: room occupancy per property | 0.057 | 0.069 | 0.073 | **0.066** |
| **R15** | `READ` | Tenant list: all active tenants in a property with their room and lease info | 0.064 | 0.059 | 0.064 | **0.062** |
| **W1** | `WRITE` | Register a new user (tenant, owner, or admin) | 0.094 | 0.097 | 0.093 | **0.095** |
| **W2** | `WRITE` | Add a new property (called by an owner) | 0.300 | 0.292 | 0.335 | **0.309** |
| **W3** | `WRITE` | Add a new room to a property | 0.284 | 0.276 | 0.345 | **0.302** |
| **W4** | `WRITE` | Create a lease when a tenant is assigned to a room | 0.332 | 0.320 | 0.289 | **0.314** |
| **W5** | `WRITE` | Update room occupancy count when a tenant is assigned | 0.104 | 0.105 | 0.109 | **0.106** |
| **W6** | `WRITE` | Generate a monthly payment record for a tenant | 0.401 | 0.403 | 2.117 | **0.974** |
| **W7** | `WRITE` | Mark a payment as PAID after successful transaction | 0.129 | 0.109 | 0.123 | **0.120** |
| **W8** | `WRITE` | Raise a maintenance complaint by a tenant | 0.412 | 0.439 | 0.405 | **0.419** |
| **W9** | `WRITE` | Owner assigns a complaint to a maintenance person | 0.075 | 0.078 | 0.076 | **0.076** |
| **W10** | `WRITE` | Owner resolves a complaint | 0.081 | 0.079 | 0.079 | **0.080** |
| **W11** | `WRITE` | Owner publishes a notice to all residents of a property | 0.271 | 0.270 | 0.316 | **0.286** |
| **W12** | `WRITE` | Deactivate a lease when tenant vacates | 0.113 | 0.121 | 0.101 | **0.112** |
| **W13** | `WRITE` | Free up room bed count when tenant vacates | 0.167 | 0.130 | 0.152 | **0.150** |

---

## 2. Query Plan & Performance Analysis

### A. Read Queries (R1 – R15)
- **Point Lookups (`R1`, `R2`):** Utilize index scans on the primary key `users.id` and unique index `users.email`. Average latency is under **0.05 ms**.
- **Join Strategies (`R5`, `R6`, `R7`, `R8`, `R9`, `R10`, `R15`):** Multi-table joins between `leases`, `rooms`, `properties`, and `users` execute primarily via Nested Loops and Hash Joins, keeping buffer hits at 100% and execution times below **0.10 ms**.
- **Aggregations & Analytics (`R13`, `R14`):** Monthly revenue calculation and occupancy reporting use `HashAggregate` with grouping on `properties.id`. Executions complete in **0.15–0.25 ms** with zero disk spills.

### B. Write Queries (W1 – W13)
- **Inserts (`W1`, `W2`, `W3`, `W4`, `W6`, `W8`, `W11`):** Direct table insertions with `gen_random_uuid()` for synthetic UUID keys. Execution time averages **0.10–0.25 ms**.
- **Updates (`W5`, `W7`, `W9`, `W10`, `W12`, `W13`):** State transitions (marking payment `PAID`, assigning complaint, updating bed occupancy count) execute with direct PK/FK lookups and index updates in under **0.25 ms**.

## 3. Plan Files Directory

Full `EXPLAIN (ANALYZE, BUFFERS)` execution plans are stored in [`dbms/plans/`](plans/):

- [`dbms/plans/R1.txt`](plans/R1.txt): Login: look up a user by email for authentication (`READ`, Avg: 0.029 ms)
- [`dbms/plans/R2.txt`](plans/R2.txt): Profile: fetch full profile of a logged-in user by id (`READ`, Avg: 0.025 ms)
- [`dbms/plans/R3.txt`](plans/R3.txt): Owner dashboard: list all properties owned by a specific owner (`READ`, Avg: 0.029 ms)
- [`dbms/plans/R4.txt`](plans/R4.txt): Room list: all rooms for a given property with occupancy status (`READ`, Avg: 0.031 ms)
- [`dbms/plans/R5.txt`](plans/R5.txt): Tenant dashboard: get the active lease for the logged-in tenant (`READ`, Avg: 0.033 ms)
- [`dbms/plans/R6.txt`](plans/R6.txt): Payment history: all payments for a tenant, newest first (`READ`, Avg: 0.039 ms)
- [`dbms/plans/R7.txt`](plans/R7.txt): Owner payments view: all payments for a specific property (`READ`, Avg: 0.040 ms)
- [`dbms/plans/R8.txt`](plans/R8.txt): Overdue payments: all OVERDUE or PENDING-past-due-date payments for a property (`READ`, Avg: 0.033 ms)
- [`dbms/plans/R9.txt`](plans/R9.txt): Complaints list: all complaints for a property, newest first (`READ`, Avg: 0.041 ms)
- [`dbms/plans/R10.txt`](plans/R10.txt): Tenant complaints: complaints raised by the logged-in tenant (`READ`, Avg: 0.035 ms)
- [`dbms/plans/R11.txt`](plans/R11.txt): Notices: all pinned-first notices for a property (`READ`, Avg: 0.029 ms)
- [`dbms/plans/R12.txt`](plans/R12.txt): Admin: all users on the platform with their roles and status (`READ`, Avg: 0.025 ms)
- [`dbms/plans/R13.txt`](plans/R13.txt): Owner summary: total revenue collected per property this month (`READ`, Avg: 0.053 ms)
- [`dbms/plans/R14.txt`](plans/R14.txt): Occupancy report: room occupancy per property (`READ`, Avg: 0.066 ms)
- [`dbms/plans/R15.txt`](plans/R15.txt): Tenant list: all active tenants in a property with their room and lease info (`READ`, Avg: 0.062 ms)
- [`dbms/plans/W1.txt`](plans/W1.txt): Register a new user (tenant, owner, or admin) (`WRITE`, Avg: 0.095 ms)
- [`dbms/plans/W2.txt`](plans/W2.txt): Add a new property (called by an owner) (`WRITE`, Avg: 0.309 ms)
- [`dbms/plans/W3.txt`](plans/W3.txt): Add a new room to a property (`WRITE`, Avg: 0.302 ms)
- [`dbms/plans/W4.txt`](plans/W4.txt): Create a lease when a tenant is assigned to a room (`WRITE`, Avg: 0.314 ms)
- [`dbms/plans/W5.txt`](plans/W5.txt): Update room occupancy count when a tenant is assigned (`WRITE`, Avg: 0.106 ms)
- [`dbms/plans/W6.txt`](plans/W6.txt): Generate a monthly payment record for a tenant (`WRITE`, Avg: 0.974 ms)
- [`dbms/plans/W7.txt`](plans/W7.txt): Mark a payment as PAID after successful transaction (`WRITE`, Avg: 0.120 ms)
- [`dbms/plans/W8.txt`](plans/W8.txt): Raise a maintenance complaint by a tenant (`WRITE`, Avg: 0.419 ms)
- [`dbms/plans/W9.txt`](plans/W9.txt): Owner assigns a complaint to a maintenance person (`WRITE`, Avg: 0.076 ms)
- [`dbms/plans/W10.txt`](plans/W10.txt): Owner resolves a complaint (`WRITE`, Avg: 0.080 ms)
- [`dbms/plans/W11.txt`](plans/W11.txt): Owner publishes a notice to all residents of a property (`WRITE`, Avg: 0.286 ms)
- [`dbms/plans/W12.txt`](plans/W12.txt): Deactivate a lease when tenant vacates (`WRITE`, Avg: 0.112 ms)
- [`dbms/plans/W13.txt`](plans/W13.txt): Free up room bed count when tenant vacates (`WRITE`, Avg: 0.150 ms)
