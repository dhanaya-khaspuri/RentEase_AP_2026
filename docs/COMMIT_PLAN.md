# 📋 RentEase — Git Commit Strategy & Step-by-Step Plan

Teachers and project evaluators evaluate your **GitHub commit history** to assess teamwork, steady progress, and software engineering rigor. Dumping all code in a single "initial commit" is a common red flag.

Follow this **Conventional Commits** plan to build an impressive, professional Git commit graph.

---

## 🗂️ Step-by-Step Commit Schedule

If you want to commit these files incrementally to showcase healthy development, you can stage and commit in this sequence:

### **Milestone 1: Project Initialization & Configuration**
```bash
# 1. Project setup and gitignore
git add .gitignore README.md
git commit -m "chore: initialize RentEase project structure and documentation"

# 2. Frontend scaffold and configuration
git add frontend/package.json frontend/vite.config.js frontend/tailwind.config.js frontend/postcss.config.js frontend/index.html frontend/.gitignore
git commit -m "chore(frontend): setup Vite, React 18, Tailwind CSS, and Recharts"
```

### **Milestone 2: Data Architecture & Global State**
```bash
# 3. Seed data matching PG properties, rooms, and lease models
git add frontend/src/data/initialData.js frontend/src/index.css
git commit -m "feat(data): define seed schema for PGs, rooms, tenants, payments, and notices"

# 4. AppContext with persistent local storage
git add frontend/src/context/AppContext.jsx
git commit -m "feat(state): implement central AppContext with localStorage persistence and role management"
```

### **Milestone 3: Shared UI & Navigation**
```bash
# 5. Navbar with Role Switcher & Property Selector
git add frontend/src/components/Navbar.jsx frontend/src/components/common/StatsCard.jsx
git commit -m "feat(ui): build responsive Navbar with quick role-switcher and metric cards"
```

### **Milestone 4: Simulated Payment Gateway & Receipt Generation**
```bash
# 6. Mock Payment Modal (UPI, Card, Cash) & Tax Invoice Receipt
git add frontend/src/components/common/PaymentModal.jsx frontend/src/components/common/ReceiptModal.jsx
git commit -m "feat(payments): integrate mock payment gateway with UPI/Card simulation and printable digital receipt"
```

### **Milestone 5: Tenant Portal**
```bash
# 7. Tenant Dashboard & Complaint Filing
git add frontend/src/components/common/RaiseComplaintModal.jsx frontend/src/components/tenant/TenantDashboard.jsx
git commit -m "feat(tenant): build tenant dashboard with room overview, rent dues, and ticket submission"
```

### **Milestone 6: Owner Dashboard & Analytics**
```bash
# 8. Owner Modals (Add Property, Add Room, Add Tenant, Broadcast Notice)
git add frontend/src/components/common/AddPropertyModal.jsx frontend/src/components/common/AddRoomModal.jsx frontend/src/components/common/AddTenantModal.jsx frontend/src/components/common/PublishNoticeModal.jsx frontend/src/components/common/ComplaintActionModal.jsx
git commit -m "feat(owner): add management modals for properties, rooms, tenant assignment, and ticket lifecycle"

# 9. Owner Dashboard with Live Occupancy & Recharts
git add frontend/src/components/owner/OwnerDashboard.jsx
git commit -m "feat(owner): implement owner dashboard with live occupancy calculation and Recharts analytics"
```

### **Milestone 7: Admin Governance & Backend Schema**
```bash
# 10. Admin Dashboard
git add frontend/src/components/admin/AdminDashboard.jsx frontend/src/App.jsx frontend/src/main.jsx
git commit -m "feat(admin): build platform governance dashboard with user moderation and audit logs"

# 11. Backend Prisma Schema & Express setup
git add backend/
git commit -m "feat(backend): configure Prisma PostgreSQL schema and Express starter API"

# 12. Documentation & Project Guide
git add docs/
git commit -m "docs: add viva guide, demo script, and development milestones"
```

---

## 💡 Quick Script to Push to Remote GitHub Repo
```bash
# Rename branch to main
git branch -M main

# Link your GitHub repository
git remote add origin https://github.com/dhanaya-khaspuri/RentEase_AP_2026.git

# Push all commits
git push -u origin main
```
