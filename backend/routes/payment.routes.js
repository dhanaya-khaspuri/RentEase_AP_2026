import { Router } from 'express';

const router = Router();

let payments = [
  { id: "pay_101_nov", tenantId: "usr_tenant_1", tenantName: "Aarav Sharma", propertyId: "prop_1", propertyName: "Green Valley PG", roomNumber: "101", month: "November 2024", dueDate: "2024-11-05", amount: 8000, status: "Paid", paymentDate: "2024-11-03 14:22", paymentMethod: "UPI", transactionId: "TXN_UPI_9823487123" },
  { id: "pay_102_nov", tenantId: "usr_tenant_2", tenantName: "Rohan Gupta", propertyId: "prop_1", propertyName: "Green Valley PG", roomNumber: "101", month: "November 2024", dueDate: "2024-11-05", amount: 8000, status: "Paid", paymentDate: "2024-11-04 18:10", paymentMethod: "Credit Card", transactionId: "TXN_CC_8871625412" },
  { id: "pay_103_nov", tenantId: "usr_tenant_3", tenantName: "Priyansh Verma", propertyId: "prop_1", propertyName: "Green Valley PG", roomNumber: "102", month: "November 2024", dueDate: "2024-11-05", amount: 8000, status: "Pending", paymentDate: null, paymentMethod: null, transactionId: null },
  { id: "pay_201_nov", tenantId: "usr_tenant_4", tenantName: "Sneha Reddy", propertyId: "prop_2", propertyName: "Student Homes", roomNumber: "201", month: "November 2024", dueDate: "2024-11-05", amount: 9500, status: "Pending", paymentDate: null, paymentMethod: null, transactionId: null }
];

// GET /api/payments
router.get('/', (req, res) => {
  const { propertyId, status } = req.query;
  let filtered = payments;
  if (propertyId) filtered = filtered.filter(p => p.propertyId === propertyId);
  if (status) filtered = filtered.filter(p => p.status === status);

  const totalExpected = filtered.reduce((acc, p) => acc + p.amount, 0);
  const collected = filtered.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
  const pending = filtered.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);

  res.json({
    success: true,
    count: filtered.length,
    ledgerSummary: {
      totalExpected: `₹${totalExpected.toLocaleString('en-IN')}`,
      collected: `₹${collected.toLocaleString('en-IN')}`,
      pending: `₹${pending.toLocaleString('en-IN')}`,
      collectionRate: `${Math.round((collected / (totalExpected || 1)) * 100)}%`
    },
    data: filtered
  });
});

// POST /api/payments/checkout (Simulated Payment Gateway)
router.post('/checkout', (req, res) => {
  const { paymentId, paymentMethod, notes } = req.body;
  const payment = payments.find(p => p.id === paymentId);

  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found' });
  }

  const txnId = `TXN_${(paymentMethod || 'UPI').toUpperCase()}_${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const now = new Date();
  const paymentDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0].substring(0, 5)}`;

  payment.status = "Paid";
  payment.paymentMethod = paymentMethod || "UPI";
  payment.transactionId = txnId;
  payment.paymentDate = paymentDate;
  payment.notes = notes || `Processed via ${paymentMethod || 'UPI'} simulator`;

  res.json({
    success: true,
    message: 'Payment processed successfully',
    receipt: {
      invoiceNumber: `RE-INV-${txnId.slice(-8)}`,
      amount: payment.amount,
      tenantName: payment.tenantName,
      roomNumber: payment.roomNumber,
      month: payment.month,
      transactionId: txnId,
      date: paymentDate,
      paymentMethod: payment.paymentMethod,
      breakup: {
        roomRent: Math.round(payment.amount * 0.85),
        amenitiesAndMaintenance: Math.round(payment.amount * 0.15)
      }
    },
    data: payment
  });
});

export default router;
