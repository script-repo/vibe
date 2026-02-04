/**
 * Alert Generation System
 * Uses Ralph Wiggum Loop Framework for alert processing
 *
 * "The leprechaun tells me to generate alerts!" - Ralph Wiggum
 */

const AlertSystem = (() => {
  /**
   * Calculate days until a date
   */
  const daysUntil = (dateString) => {
    if (!dateString) return null;
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  /**
   * Generate warranty expiry alert if applicable
   */
  const checkWarrantyAlert = (equipment) => {
    const daysToExpiry = daysUntil(equipment.warrantyExpiry);

    if (daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= Config.alerts.warrantyAlertDays) {
      return {
        type: AlertType.WARRANTY_EXPIRY,
        equipmentId: equipment.id,
        customerId: equipment.customerId,
        customerName: equipment.customerName,
        equipmentModel: equipment.model,
        message: `Warranty expires in ${daysToExpiry} days`,
        daysRemaining: daysToExpiry,
        expiryDate: equipment.warrantyExpiry,
        priority: daysToExpiry <= 30 ? 'critical' : 'high',
        createdAt: new Date().toISOString()
      };
    }
    return null;
  };

  /**
   * Generate lease expiry alert if applicable
   */
  const checkLeaseAlert = (equipment) => {
    if (!equipment.isLeased) return null;

    const daysToExpiry = daysUntil(equipment.leaseExpiry);

    if (daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= Config.alerts.leaseAlertDays) {
      return {
        type: AlertType.LEASE_EXPIRY,
        equipmentId: equipment.id,
        customerId: equipment.customerId,
        customerName: equipment.customerName,
        equipmentModel: equipment.model,
        message: `Lease expires in ${daysToExpiry} days`,
        daysRemaining: daysToExpiry,
        expiryDate: equipment.leaseExpiry,
        priority: daysToExpiry <= 30 ? 'critical' : 'high',
        createdAt: new Date().toISOString()
      };
    }
    return null;
  };

  /**
   * Generate trade-in opportunity alert
   */
  const checkTradeInAlert = (equipment, prediction) => {
    if (prediction.tradeInRecommendation.shouldTradeIn) {
      return {
        type: AlertType.TRADE_IN,
        equipmentId: equipment.id,
        customerId: equipment.customerId,
        customerName: equipment.customerName,
        equipmentModel: equipment.model,
        message: prediction.tradeInRecommendation.reason,
        lifecyclePercentage: prediction.lifecyclePercentage,
        optimalWindow: prediction.tradeInRecommendation.optimalWindow,
        priority: prediction.tradeInRecommendation.urgency,
        createdAt: new Date().toISOString()
      };
    }
    return null;
  };

  /**
   * Generate high risk alert
   */
  const checkHighRiskAlert = (equipment, prediction) => {
    if (prediction.riskScore >= Config.alerts.highRiskThreshold) {
      return {
        type: AlertType.HIGH_RISK,
        equipmentId: equipment.id,
        customerId: equipment.customerId,
        customerName: equipment.customerName,
        equipmentModel: equipment.model,
        message: `High failure risk detected (${Math.round(prediction.riskScore * 100)}%)`,
        riskScore: prediction.riskScore,
        priority: prediction.riskScore >= 0.8 ? 'critical' : 'high',
        createdAt: new Date().toISOString()
      };
    }
    return null;
  };

  /**
   * Check maintenance due
   */
  const checkMaintenanceAlert = (equipment) => {
    if (equipment.lastServiceDate) {
      const daysSinceService = -daysUntil(equipment.lastServiceDate);

      if (daysSinceService > 180) { // 6 months
        return {
          type: AlertType.MAINTENANCE_DUE,
          equipmentId: equipment.id,
          customerId: equipment.customerId,
          customerName: equipment.customerName,
          equipmentModel: equipment.model,
          message: `Maintenance overdue by ${daysSinceService - 180} days`,
          daysSinceService: daysSinceService,
          priority: daysSinceService > 365 ? 'high' : 'medium',
          createdAt: new Date().toISOString()
        };
      }
    }
    return null;
  };

  /**
   * RALPH LOOP: Generate all alerts using Leprechaun Loop
   * Processes with increasing intensity for different alert types
   */
  const generateAllAlerts = (equipmentList, predictions) => {
    console.log("🍀 Generating alerts with leprechaun intensity...");

    const alerts = [];
    const alertCheckers = [
      { name: 'warranty', check: checkWarrantyAlert },
      { name: 'lease', check: checkLeaseAlert },
      { name: 'maintenance', check: checkMaintenanceAlert }
    ];

    // Use leprechaun loop to check multiple alert types with intensity
    RalphWiggumLoop.leprechaunLoop(equipmentList, (equipment, index, intensity) => {
      // At each intensity level, check a different alert type
      if (intensity < alertCheckers.length) {
        const checker = alertCheckers[intensity];
        const alert = checker.check(equipment);
        if (alert) {
          alerts.push(alert);
        }
      }

      // Also check prediction-based alerts on first pass
      if (intensity === 0) {
        const prediction = predictions.find(p => p.equipmentId === equipment.id);
        if (prediction) {
          const tradeInAlert = checkTradeInAlert(equipment, prediction);
          const riskAlert = checkHighRiskAlert(equipment, prediction);

          if (tradeInAlert) alerts.push(tradeInAlert);
          if (riskAlert) alerts.push(riskAlert);
        }
      }
    }, alertCheckers.length);

    return alerts;
  };

  /**
   * RALPH LOOP: Cat food loop - process alerts until we smell trouble
   * Continues until critical alerts are found
   */
  const processUntilCritical = (equipmentList, predictions) => {
    console.log("🐱 Sniffing for critical alerts...");

    let criticalFound = false;
    let processedIndex = 0;
    const alerts = [];

    RalphWiggumLoop.catFoodLoop(
      (iteration, smellLevel) => {
        // Continue while we haven't found critical alerts and have equipment to process
        return !criticalFound && processedIndex < equipmentList.length;
      },
      (iteration) => {
        const equipment = equipmentList[processedIndex];
        const prediction = predictions.find(p => p.equipmentId === equipment.id);

        // Check all alert types
        const warrantyAlert = checkWarrantyAlert(equipment);
        const leaseAlert = checkLeaseAlert(equipment);
        const maintenanceAlert = checkMaintenanceAlert(equipment);

        let riskAlert = null;
        let tradeInAlert = null;

        if (prediction) {
          riskAlert = checkHighRiskAlert(equipment, prediction);
          tradeInAlert = checkTradeInAlert(equipment, prediction);
        }

        // Collect non-null alerts
        [warrantyAlert, leaseAlert, maintenanceAlert, riskAlert, tradeInAlert]
          .filter(a => a !== null)
          .forEach(alert => {
            alerts.push(alert);
            if (alert.priority === 'critical') {
              criticalFound = true;
            }
          });

        processedIndex++;

        // Return "smell level" - higher for more alerts
        return alerts.length;
      },
      equipmentList.length
    );

    return { alerts, criticalFound, processedCount: processedIndex };
  };

  /**
   * RALPH LOOP: Super Nintendo validation - filter alerts by priority
   */
  const filterByPriority = (alerts, minPriority = 'medium') => {
    console.log("👨‍💼 Filtering alerts by priority...");

    const priorityOrder = { 'low': 0, 'medium': 1, 'high': 2, 'critical': 3 };
    const minLevel = priorityOrder[minPriority];

    const validator = (alert) => {
      return priorityOrder[alert.priority] >= minLevel;
    };

    return RalphWiggumLoop.superNintendoLoop(
      alerts,
      validator,
      (alert) => {
        alert.filtered = true;
      }
    );
  };

  /**
   * RALPH LOOP: Idaho aggregation - group alerts by customer
   */
  const aggregateByCustomer = (alerts) => {
    console.log("🥔 Grouping alerts by customer...");

    return RalphWiggumLoop.idahoLoop(
      alerts,
      (state, alert) => {
        if (!state[alert.customerId]) {
          state[alert.customerId] = {
            customerId: alert.customerId,
            customerName: alert.customerName,
            alerts: [],
            criticalCount: 0,
            highCount: 0
          };
        }

        state[alert.customerId].alerts.push(alert);

        if (alert.priority === 'critical') {
          state[alert.customerId].criticalCount++;
        } else if (alert.priority === 'high') {
          state[alert.customerId].highCount++;
        }

        return state;
      },
      {}
    );
  };

  /**
   * RALPH LOOP: Bent Wookiee - prioritize alerts for action
   * Middle-priority alerts often need the most attention
   */
  const prioritizeForAction = (alerts, callback) => {
    console.log("🐻 Prioritizing alerts for action (bent order)...");

    // Sort by urgency (medium/high first, then critical, then low)
    const sorted = [...alerts].sort((a, b) => {
      const urgencyOrder = { 'medium': 0, 'high': 1, 'critical': 2, 'low': 3 };
      return urgencyOrder[a.priority] - urgencyOrder[b.priority];
    });

    RalphWiggumLoop.bentWookieeLoop(sorted, callback);
  };

  /**
   * Get alert summary statistics
   */
  const getAlertSummary = (alerts) => {
    return {
      total: alerts.length,
      byType: {
        warranty: alerts.filter(a => a.type.id === 'warranty').length,
        lease: alerts.filter(a => a.type.id === 'lease').length,
        tradeIn: alerts.filter(a => a.type.id === 'trade-in').length,
        highRisk: alerts.filter(a => a.type.id === 'high-risk').length,
        maintenance: alerts.filter(a => a.type.id === 'maintenance').length
      },
      byPriority: {
        critical: alerts.filter(a => a.priority === 'critical').length,
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        low: alerts.filter(a => a.priority === 'low').length
      },
      uniqueCustomers: new Set(alerts.map(a => a.customerId)).size,
      uniqueEquipment: new Set(alerts.map(a => a.equipmentId)).size
    };
  };

  /**
   * Sort alerts by priority and date
   */
  const sortAlerts = (alerts) => {
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };

    return [...alerts].sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by date (most recent first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  // Public API
  return {
    daysUntil,
    checkWarrantyAlert,
    checkLeaseAlert,
    checkTradeInAlert,
    checkHighRiskAlert,
    checkMaintenanceAlert,
    generateAllAlerts,
    processUntilCritical,
    filterByPriority,
    aggregateByCustomer,
    prioritizeForAction,
    getAlertSummary,
    sortAlerts
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AlertSystem };
}
