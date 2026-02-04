/**
 * Equipment Data Models and Mock Data
 * Pattison AG - Equipment Lifecycle Tracking (UC-006)
 *
 * "I'm learnding about tractors!" - Ralph Wiggum
 */

// Equipment Categories
const EquipmentCategory = {
  TRACTOR: 'tractor',
  COMBINE: 'combine',
  SPRAYER: 'sprayer',
  PLANTER: 'planter',
  LOADER: 'loader',
  MOWER: 'mower',
  BALER: 'baler',
  TILLAGE: 'tillage'
};

// Lifecycle Stages
const LifecycleStage = {
  NEW: { id: 'new', label: 'New', minPct: 0, maxPct: 20, color: '#1565C0' },
  GROWTH: { id: 'growth', label: 'Growth', minPct: 20, maxPct: 50, color: '#2E7D32' },
  MATURE: { id: 'mature', label: 'Mature', minPct: 50, maxPct: 80, color: '#F57F17' },
  DECLINE: { id: 'decline', label: 'Decline', minPct: 80, maxPct: 100, color: '#E65100' },
  EOL: { id: 'eol', label: 'End of Life', minPct: 100, maxPct: Infinity, color: '#C62828' }
};

// Alert Types
const AlertType = {
  WARRANTY_EXPIRY: { id: 'warranty', label: 'Warranty Expiring', icon: '🛡️', priority: 'high' },
  LEASE_EXPIRY: { id: 'lease', label: 'Lease Expiring', icon: '📋', priority: 'high' },
  TRADE_IN: { id: 'trade-in', label: 'Trade-In Opportunity', icon: '🔄', priority: 'medium' },
  HIGH_RISK: { id: 'high-risk', label: 'High Risk', icon: '⚠️', priority: 'critical' },
  MAINTENANCE_DUE: { id: 'maintenance', label: 'Maintenance Due', icon: '🔧', priority: 'medium' }
};

// Configuration (from PRD)
const Config = {
  alerts: {
    warrantyAlertDays: 90,
    leaseAlertDays: 120,
    tradeInThreshold: 0.75,
    highRiskThreshold: 0.6
  },
  lifecycle: {
    modelVersion: '1.0.0',
    minAgeDays: 180,
    minConfidence: 0.5
  }
};

// Customer Data
const customers = [
  { id: 'CUST001', name: 'Green Valley Farms', territory: 'Midwest', rep: 'John Smith', totalEquipment: 12 },
  { id: 'CUST002', name: 'Prairie Wind Agriculture', territory: 'Midwest', rep: 'John Smith', totalEquipment: 8 },
  { id: 'CUST003', name: 'Sunrise Cooperative', territory: 'Northeast', rep: 'Sarah Johnson', totalEquipment: 24 },
  { id: 'CUST004', name: 'Heritage Family Farm', territory: 'Southeast', rep: 'Mike Wilson', totalEquipment: 6 },
  { id: 'CUST005', name: 'Big Sky Ranch', territory: 'Northwest', rep: 'Emily Davis', totalEquipment: 15 },
  { id: 'CUST006', name: 'Cornbelt Enterprises', territory: 'Midwest', rep: 'John Smith', totalEquipment: 32 },
  { id: 'CUST007', name: 'Delta Ag Solutions', territory: 'Southeast', rep: 'Mike Wilson', totalEquipment: 18 },
  { id: 'CUST008', name: 'Northern Plains Co-op', territory: 'Northwest', rep: 'Emily Davis', totalEquipment: 22 }
];

// Equipment Models Database
const equipmentModels = {
  tractor: [
    { model: '8R 410', expectedLifeYears: 15, expectedHours: 12000 },
    { model: '7R 350', expectedLifeYears: 15, expectedHours: 12000 },
    { model: '6M 175', expectedLifeYears: 12, expectedHours: 10000 },
    { model: '5R 140', expectedLifeYears: 12, expectedHours: 10000 },
    { model: '4M 180', expectedLifeYears: 10, expectedHours: 8000 }
  ],
  combine: [
    { model: 'S790', expectedLifeYears: 12, expectedHours: 4000 },
    { model: 'S780', expectedLifeYears: 12, expectedHours: 4000 },
    { model: 'X9 1100', expectedLifeYears: 15, expectedHours: 5000 }
  ],
  sprayer: [
    { model: 'R4045', expectedLifeYears: 10, expectedHours: 5000 },
    { model: 'R4038', expectedLifeYears: 10, expectedHours: 5000 }
  ],
  planter: [
    { model: 'DB120', expectedLifeYears: 15, expectedHours: 3000 },
    { model: 'DB90', expectedLifeYears: 15, expectedHours: 3000 },
    { model: '1795', expectedLifeYears: 12, expectedHours: 2500 }
  ],
  loader: [
    { model: '544L', expectedLifeYears: 12, expectedHours: 10000 },
    { model: '624L', expectedLifeYears: 12, expectedHours: 10000 }
  ]
};

// Generate mock equipment data
const generateMockEquipment = () => {
  const equipment = [];
  let equipmentId = 1000;

  customers.forEach(customer => {
    const numEquipment = customer.totalEquipment;

    for (let i = 0; i < numEquipment; i++) {
      const categories = Object.keys(equipmentModels);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const models = equipmentModels[category];
      const modelInfo = models[Math.floor(Math.random() * models.length)];

      // Random age between 0 and expectedLifeYears + 2 years
      const maxAge = modelInfo.expectedLifeYears + 2;
      const ageYears = Math.random() * maxAge;
      const purchaseDate = new Date();
      purchaseDate.setFullYear(purchaseDate.getFullYear() - ageYears);

      // Calculate hours based on age (roughly proportional with some variance)
      const expectedHoursPerYear = modelInfo.expectedHours / modelInfo.expectedLifeYears;
      const actualHours = Math.floor(ageYears * expectedHoursPerYear * (0.7 + Math.random() * 0.6));

      // Warranty (typically 2-5 years from purchase)
      const warrantyYears = 2 + Math.floor(Math.random() * 3);
      const warrantyExpiry = new Date(purchaseDate);
      warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + warrantyYears);

      // Lease (some equipment is leased, typically 3-5 years)
      const isLeased = Math.random() > 0.6;
      let leaseExpiry = null;
      if (isLeased) {
        const leaseYears = 3 + Math.floor(Math.random() * 2);
        leaseExpiry = new Date(purchaseDate);
        leaseExpiry.setFullYear(leaseExpiry.getFullYear() + leaseYears);
      }

      // Service history (random number of service events)
      const numServices = Math.floor(ageYears * 2) + Math.floor(Math.random() * 3);
      const serviceHistory = [];
      for (let s = 0; s < numServices; s++) {
        const serviceDate = new Date(purchaseDate);
        serviceDate.setMonth(serviceDate.getMonth() + Math.floor(Math.random() * ageYears * 12));
        serviceHistory.push({
          date: serviceDate.toISOString().split('T')[0],
          type: ['oil change', 'filter replacement', 'inspection', 'repair', 'major overhaul'][Math.floor(Math.random() * 5)],
          cost: Math.floor(Math.random() * 5000) + 200
        });
      }

      equipment.push({
        id: `EQ${equipmentId++}`,
        customerId: customer.id,
        customerName: customer.name,
        category: category,
        model: modelInfo.model,
        serialNumber: `JD${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        ageYears: Math.round(ageYears * 10) / 10,
        currentHours: actualHours,
        expectedLifeYears: modelInfo.expectedLifeYears,
        expectedHours: modelInfo.expectedHours,
        warrantyExpiry: warrantyExpiry.toISOString().split('T')[0],
        isLeased: isLeased,
        leaseExpiry: leaseExpiry ? leaseExpiry.toISOString().split('T')[0] : null,
        lastServiceDate: serviceHistory.length > 0 ?
          serviceHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null,
        serviceHistory: serviceHistory.sort((a, b) => new Date(b.date) - new Date(a.date)),
        location: customer.territory,
        status: 'active'
      });
    }
  });

  return equipment;
};

// Mock data store
const MockDataStore = {
  customers: customers,
  equipment: generateMockEquipment(),

  // Get equipment by customer
  getEquipmentByCustomer: function(customerId) {
    return this.equipment.filter(e => e.customerId === customerId);
  },

  // Get equipment by ID
  getEquipmentById: function(equipmentId) {
    return this.equipment.find(e => e.id === equipmentId);
  },

  // Get all equipment
  getAllEquipment: function() {
    return this.equipment;
  },

  // Get customers
  getCustomers: function() {
    return this.customers;
  },

  // Get customer by ID
  getCustomerById: function(customerId) {
    return this.customers.find(c => c.id === customerId);
  },

  // Get summary stats
  getSummaryStats: function() {
    return {
      totalEquipment: this.equipment.length,
      totalCustomers: this.customers.length,
      averageAge: this.equipment.reduce((sum, e) => sum + e.ageYears, 0) / this.equipment.length,
      totalHours: this.equipment.reduce((sum, e) => sum + e.currentHours, 0)
    };
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EquipmentCategory,
    LifecycleStage,
    AlertType,
    Config,
    MockDataStore,
    customers,
    equipmentModels
  };
}
