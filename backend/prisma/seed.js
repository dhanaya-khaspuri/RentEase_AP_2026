import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting RentEase PostgreSQL Database Seeding...');

  // 1. Clean existing records
  await prisma.payment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.room.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Owner User
  const owner = await prisma.user.create({
    data: {
      id: 'usr_owner_1',
      name: 'Rahul Verma',
      email: 'rahul.owner@rentease.com',
      passwordHash: '$2b$10$wT5H8...demoHash',
      phone: '+91 98765 43210',
      role: 'OWNER',
      status: 'active'
    }
  });

  // 3. Create Tenant Users
  const tenant1 = await prisma.user.create({
    data: {
      id: 'usr_tenant_1',
      name: 'Aarav Sharma',
      email: 'aarav.tenant@rentease.com',
      passwordHash: '$2b$10$wT5H8...demoHash',
      phone: '+91 98111 22334',
      role: 'TENANT',
      status: 'active'
    }
  });

  const admin = await prisma.user.create({
    data: {
      id: 'usr_admin_1',
      name: 'Siddharth Mehta',
      email: 'admin@rentease.com',
      passwordHash: '$2b$10$wT5H8...demoHash',
      phone: '+91 99999 88888',
      role: 'ADMIN',
      status: 'active'
    }
  });

  // 4. Create Properties
  const prop1 = await prisma.property.create({
    data: {
      id: 'prop_1',
      ownerId: owner.id,
      name: 'Green Valley PG',
      location: 'Sonipat, Haryana (Near Rajiv Gandhi Education City)',
      type: 'Boys & Working Professionals',
      totalRooms: 25,
      amenities: ['High-speed Wi-Fi', '3 Meals Included', 'Power Backup', 'CCTV Security', 'Washing Machine'],
      managerPhone: '+91 98765 43211'
    }
  });

  const prop2 = await prisma.property.create({
    data: {
      id: 'prop_2',
      ownerId: owner.id,
      name: 'Student Homes',
      location: 'North Campus, Delhi University, Delhi',
      type: 'Co-living & Students',
      totalRooms: 40,
      amenities: ['Wi-Fi', 'Housekeeping', 'Biometric Access', 'AC Rooms', 'Study Lounge'],
      managerPhone: '+91 98765 43212'
    }
  });

  // 5. Create Rooms
  const room101 = await prisma.room.create({
    data: {
      id: 'room_101',
      propertyId: prop1.id,
      roomNumber: '101',
      floor: 1,
      capacity: 2,
      occupied: 2,
      rent: 8000,
      type: 'Double Sharing',
      hasAC: true,
      hasAttachedBath: true
    }
  });

  const room102 = await prisma.room.create({
    data: {
      id: 'room_102',
      propertyId: prop1.id,
      roomNumber: '102',
      floor: 1,
      capacity: 2,
      occupied: 1,
      rent: 8000,
      type: 'Double Sharing',
      hasAC: true,
      hasAttachedBath: true
    }
  });

  // 6. Create Lease
  await prisma.lease.create({
    data: {
      tenantId: tenant1.id,
      roomId: room101.id,
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-06-30'),
      monthlyRent: 8000,
      deposit: 16000,
      isActive: true
    }
  });

  // 7. Create Payments
  await prisma.payment.create({
    data: {
      id: 'pay_101_nov',
      propertyId: prop1.id,
      tenantId: tenant1.id,
      roomNumber: '101',
      month: 'November 2024',
      dueDate: new Date('2024-11-05'),
      amount: 8000,
      status: 'PAID',
      paymentDate: new Date('2024-11-03T14:22:00'),
      paymentMethod: 'UPI',
      transactionId: 'TXN_UPI_9823487123',
      notes: 'Paid via GPay'
    }
  });

  // 8. Create Complaint
  await prisma.complaint.create({
    data: {
      id: 'cmp_1',
      propertyId: prop1.id,
      tenantId: tenant1.id,
      roomNumber: '101',
      category: 'Plumbing',
      title: 'Bathroom tap leaking continuously',
      description: 'The sink mixer tap in room 101 has been dripping since yesterday evening.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      assignedTo: 'Ramesh (Plumber)'
    }
  });

  // 9. Create Notice
  await prisma.notice.create({
    data: {
      id: 'not_1',
      propertyId: prop1.id,
      title: 'Water Supply Interruption Tomorrow Morning',
      category: 'Maintenance',
      content: 'Due to scheduled overhead tank cleaning, water supply paused 9 AM to 1 PM.',
      author: 'Rahul Verma (Owner)',
      priority: 'High',
      isPinned: true
    }
  });

  console.log('✅ RentEase Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
