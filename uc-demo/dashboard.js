/**
 * Dashboard Controller
 * Pattison AG - Equipment Lifecycle Tracking
 *
 * "I'm a dashboard star!" - Ralph Wiggum
 */

const Dashboard = (() => {
  // State
  let predictions = [];
  let alerts = [];
  let consoleBuffer = [];
  let signalHistory = [];
  let timelineEvents = [];
  let activityFeed = [];
  let compareSlot1 = null;
  let compareSlot2 = null;

  // Console logging override
  const originalLog = console.log;
  console.log = function(...args) {
    originalLog.apply(console, args);
    consoleBuffer.push(args.join(' '));
    updateConsole();
  };

  /**
   * Update console output
   */
  const updateConsole = () => {
    const consoleEl = document.getElementById('ralph-console');
    if (consoleEl) {
      consoleEl.textContent = consoleBuffer.slice(-50).join('\n');
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }
  };

  /**
   * Clear console
   */
  const clearConsole = () => {
    consoleBuffer = ['👦 Ralph Wiggum Loop Console Ready!\n'];
    updateConsole();
  };

  /**
   * Initialize dashboard
   */
  const init = () => {
    console.log("🚀 Initializing Equipment Lifecycle Dashboard...");
    console.log(`📦 Loaded ${MockDataStore.getAllEquipment().length} equipment items`);
    console.log(`👥 Loaded ${MockDataStore.getCustomers().length} customers`);

    // Setup navigation
    setupNavigation();

    // Run initial analysis
    refreshData();

    console.log("✅ Dashboard initialized successfully!");
    console.log(`💭 Ralph says: "${RalphWiggumLoop.getWisdom()}"`);

    // Show welcome toast after a brief delay
    setTimeout(() => {
      showToast('Welcome to Pattison AG', 'Equipment Lifecycle Dashboard is ready', 'success', 4000);
    }, 500);

    // Show alert summary toast
    setTimeout(() => {
      const criticalCount = alerts.filter(a => a.priority === 'critical').length;
      if (criticalCount > 0) {
        showToast('Attention Required', `${criticalCount} critical alerts need your attention`, 'warning', 6000);
      }
    }, 2000);

    // Initialize stats ticker
    initStatsTicker();
  };

  /**
   * Setup navigation handlers
   */
  const setupNavigation = () => {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page) {
          showPage(page);
        }
      });
    });
  };

  /**
   * Show a specific page
   */
  const showPage = (pageId) => {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageId);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.toggle('active', page.id === `page-${pageId}`);
    });

    // Update title
    const titles = {
      'dashboard': 'Dashboard',
      'alerts': 'Alerts',
      'equipment': 'All Equipment',
      'lifecycle': 'Lifecycle Analysis',
      'opportunities': 'Trade-In Opportunities',
      'customers': 'Customer Portfolio',
      'console': 'Ralph Console',
      'health': 'Fleet Health',
      'signals': 'Buying Signals',
      'revenue': 'Revenue Calculator',
      'timeline': 'Event Timeline',
      'territory': 'Territory Map',
      'compare': 'Compare Equipment',
      'activity': 'Activity Feed'
    };
    document.getElementById('page-title').textContent = titles[pageId] || 'Dashboard';

    // Load page-specific data
    if (pageId === 'alerts') loadAlertsPage();
    if (pageId === 'equipment') loadEquipmentPage();
    if (pageId === 'lifecycle') loadLifecyclePage();
    if (pageId === 'opportunities') loadOpportunitiesPage();
    if (pageId === 'customers') loadCustomersPage();
    if (pageId === 'health') loadHealthPage();
    if (pageId === 'signals') loadSignalsPage();
    if (pageId === 'revenue') loadRevenuePage();
    if (pageId === 'timeline') loadTimelinePage();
    if (pageId === 'territory') loadTerritoryPage();
    if (pageId === 'compare') loadComparePage();
    if (pageId === 'activity') loadActivityPage();
  };

  /**
   * Refresh all data
   */
  const refreshData = () => {
    console.log("\n" + "=".repeat(50));
    console.log("🔄 REFRESHING DATA WITH RALPH LOOPS");
    console.log("=".repeat(50));

    const equipment = MockDataStore.getAllEquipment();

    // Run lifecycle predictions
    console.log("\n📊 Running Lifecycle Predictions...");
    predictions = LifecycleEngine.predictAllLifecycles(equipment);

    // Validate predictions
    const { approved, rejected } = LifecycleEngine.validatePredictions(predictions);
    console.log(`✅ ${approved.length} predictions validated, ${rejected.length} below confidence threshold`);

    // Generate alerts
    console.log("\n🔔 Generating Alerts...");
    alerts = AlertSystem.generateAllAlerts(equipment, predictions);
    alerts = AlertSystem.sortAlerts(alerts);
    console.log(`📬 Generated ${alerts.length} alerts`);

    // Update UI
    updateDashboardStats();
    updateLifecycleDistribution();
    updateRecentAlerts();
    updateEquipmentTable();

    console.log("\n✨ Data refresh complete!");
    console.log(`💭 "${RalphWiggumLoop.getWisdom()}"`);
  };

  /**
   * Update dashboard statistics
   */
  const updateDashboardStats = () => {
    const equipment = MockDataStore.getAllEquipment();
    const summary = AlertSystem.getAlertSummary(alerts);
    const riskDist = LifecycleEngine.getRiskDistribution(predictions);

    document.getElementById('stat-total-equipment').textContent = equipment.length;
    document.getElementById('stat-alerts').textContent = alerts.length;
    document.getElementById('stat-critical-alerts').textContent = `${summary.byPriority.critical} critical`;
    document.getElementById('stat-high-risk').textContent = riskDist.high;
    document.getElementById('stat-trade-in').textContent = summary.byType.tradeIn;

    // Update alert badge
    document.getElementById('alert-count').textContent = alerts.length;
  };

  /**
   * Update lifecycle distribution
   */
  const updateLifecycleDistribution = () => {
    const distribution = LifecycleEngine.getStageDistribution(predictions);

    document.getElementById('stage-new').textContent = distribution.new;
    document.getElementById('stage-growth').textContent = distribution.growth;
    document.getElementById('stage-mature').textContent = distribution.mature;
    document.getElementById('stage-decline').textContent = distribution.decline;
    document.getElementById('stage-eol').textContent = distribution.eol;

    // Highlight the largest stage
    const stages = ['new', 'growth', 'mature', 'decline', 'eol'];
    const maxStage = stages.reduce((max, stage) =>
      distribution[stage] > distribution[max] ? stage : max, 'new');

    stages.forEach(stage => {
      const el = document.querySelector(`.lifecycle-stage.${stage}`);
      if (el) el.classList.toggle('active', stage === maxStage);
    });

    // Update bars
    const total = predictions.length;
    const barsHtml = stages.map(stage => {
      const count = distribution[stage];
      const pct = total > 0 ? (count / total * 100) : 0;
      const colors = { new: 'blue', growth: 'green', mature: 'yellow', decline: 'yellow', eol: 'red' };
      return `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="text-transform: capitalize;">${stage === 'eol' ? 'End of Life' : stage}</span>
            <span>${count} (${pct.toFixed(1)}%)</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${colors[stage]}" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('lifecycle-bars').innerHTML = barsHtml;
  };

  /**
   * Update recent alerts
   */
  const updateRecentAlerts = () => {
    const recentAlerts = alerts.slice(0, 5);
    const container = document.getElementById('recent-alerts');

    if (recentAlerts.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center;">No alerts at this time</p>';
      return;
    }

    container.innerHTML = recentAlerts.map(alert => `
      <div class="alert-item ${alert.type.id}">
        <span class="alert-icon">${alert.type.icon}</span>
        <div class="alert-content">
          <div class="alert-title">${alert.equipmentModel}</div>
          <div class="alert-description">${alert.message}</div>
          <div class="alert-time">${alert.customerName}</div>
        </div>
        <span class="badge badge-${alert.priority}">${alert.priority}</span>
      </div>
    `).join('');
  };

  /**
   * Update equipment table
   */
  const updateEquipmentTable = () => {
    const equipment = MockDataStore.getAllEquipment().slice(0, 10);
    const tbody = document.getElementById('equipment-table-body');

    tbody.innerHTML = equipment.map(eq => {
      const prediction = predictions.find(p => p.equipmentId === eq.id);
      if (!prediction) return '';

      const stage = prediction.currentStage;

      return `
        <tr onclick="Dashboard.openEquipmentModal('${eq.id}')" style="cursor: pointer;">
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="equipment-icon" style="width: 36px; height: 36px; font-size: 18px;">
                ${getEquipmentIcon(eq.category)}
              </div>
              <div>
                <div style="font-weight: 600;">${eq.model}</div>
                <div style="font-size: 12px; color: var(--color-text-secondary);">${eq.id}</div>
              </div>
            </div>
          </td>
          <td>${eq.customerName}</td>
          <td>
            <div class="progress-bar" style="width: 100px;">
              <div class="progress-fill ${prediction.lifecyclePercentage > 80 ? 'red' : prediction.lifecyclePercentage > 50 ? 'yellow' : 'green'}"
                   style="width: ${Math.min(prediction.lifecyclePercentage, 100)}%"></div>
            </div>
            <div style="font-size: 12px; margin-top: 4px;">${prediction.lifecyclePercentage}%</div>
          </td>
          <td><span class="badge badge-${stage.id}">${stage.label}</span></td>
          <td><span class="badge badge-${prediction.failureRiskLevel}">${prediction.failureRiskLevel}</span></td>
          <td>
            ${prediction.tradeInRecommendation.shouldTradeIn ?
              '<button class="btn btn-primary" style="padding: 4px 12px; font-size: 12px;">Trade-In</button>' :
              '<button class="btn btn-outline" style="padding: 4px 12px; font-size: 12px;">View</button>'}
          </td>
        </tr>
      `;
    }).join('');
  };

  /**
   * Get equipment icon by category
   */
  const getEquipmentIcon = (category) => {
    const icons = {
      tractor: '🚜',
      combine: '🌾',
      sprayer: '💧',
      planter: '🌱',
      loader: '🏗️',
      mower: '🌿',
      baler: '📦',
      tillage: '⚒️'
    };
    return icons[category] || '🔧';
  };

  /**
   * Load alerts page
   */
  const loadAlertsPage = () => {
    const container = document.getElementById('all-alerts');
    container.innerHTML = alerts.map(alert => `
      <div class="alert-item ${alert.type.id}">
        <span class="alert-icon">${alert.type.icon}</span>
        <div class="alert-content">
          <div class="alert-title">${alert.equipmentModel} - ${alert.type.label}</div>
          <div class="alert-description">${alert.message}</div>
          <div class="alert-time">${alert.customerName} | ${new Date(alert.createdAt).toLocaleDateString()}</div>
        </div>
        <span class="badge badge-${alert.priority}">${alert.priority}</span>
      </div>
    `).join('') || '<p style="text-align: center; color: var(--color-text-secondary);">No alerts</p>';
  };

  /**
   * Filter alerts by priority
   */
  const filterAlerts = (priority) => {
    const container = document.getElementById('all-alerts');
    const filtered = priority === 'all' ? alerts : alerts.filter(a => a.priority === priority);

    container.innerHTML = filtered.map(alert => `
      <div class="alert-item ${alert.type.id}">
        <span class="alert-icon">${alert.type.icon}</span>
        <div class="alert-content">
          <div class="alert-title">${alert.equipmentModel} - ${alert.type.label}</div>
          <div class="alert-description">${alert.message}</div>
          <div class="alert-time">${alert.customerName}</div>
        </div>
        <span class="badge badge-${alert.priority}">${alert.priority}</span>
      </div>
    `).join('') || '<p style="text-align: center; color: var(--color-text-secondary);">No alerts</p>';
  };

  /**
   * Load equipment page
   */
  const loadEquipmentPage = () => {
    const equipment = MockDataStore.getAllEquipment();
    const tbody = document.getElementById('all-equipment-table');

    tbody.innerHTML = equipment.map(eq => {
      const prediction = predictions.find(p => p.equipmentId === eq.id);
      return `
        <tr>
          <td>${eq.id}</td>
          <td>${getEquipmentIcon(eq.category)} ${eq.model}</td>
          <td>${eq.customerName}</td>
          <td>${eq.ageYears.toFixed(1)}</td>
          <td>${eq.currentHours.toLocaleString()}</td>
          <td><span class="badge badge-${prediction?.currentStage.id || 'new'}">${prediction?.currentStage.label || 'Unknown'}</span></td>
          <td>${prediction ? (prediction.riskScore * 100).toFixed(0) + '%' : '--'}</td>
        </tr>
      `;
    }).join('');
  };

  /**
   * Load lifecycle page
   */
  const loadLifecyclePage = () => {
    const distribution = LifecycleEngine.getStageDistribution(predictions);

    document.getElementById('lifecycle-new').textContent = distribution.new;
    document.getElementById('lifecycle-growth').textContent = distribution.growth;
    document.getElementById('lifecycle-mature').textContent = distribution.mature;
    document.getElementById('lifecycle-decline').textContent = distribution.decline;

    const details = document.getElementById('lifecycle-details');
    details.innerHTML = `
      <p>Total equipment analyzed: <strong>${predictions.length}</strong></p>
      <p>Average lifecycle percentage: <strong>${(predictions.reduce((sum, p) => sum + p.lifecyclePercentage, 0) / predictions.length).toFixed(1)}%</strong></p>
      <p>Equipment at end of life: <strong>${distribution.eol}</strong></p>
      <p style="margin-top: 16px; color: var(--color-text-secondary);">
        💭 "${RalphWiggumLoop.getWisdom()}"
      </p>
    `;
  };

  /**
   * Load opportunities page
   */
  const loadOpportunitiesPage = () => {
    const opportunities = predictions
      .filter(p => p.tradeInRecommendation.shouldTradeIn)
      .sort((a, b) => {
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        return urgencyOrder[a.tradeInRecommendation.urgency] - urgencyOrder[b.tradeInRecommendation.urgency];
      });

    const container = document.getElementById('opportunities-list');

    if (opportunities.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No trade-in opportunities at this time</p>';
      return;
    }

    container.innerHTML = opportunities.map(opp => {
      const equipment = MockDataStore.getEquipmentById(opp.equipmentId);
      return `
        <div class="equipment-item">
          <div class="equipment-icon">${getEquipmentIcon(equipment.category)}</div>
          <div class="equipment-info">
            <div class="equipment-name">${equipment.model}</div>
            <div class="equipment-meta">${equipment.customerName} | ${opp.lifecyclePercentage}% lifecycle</div>
          </div>
          <div class="equipment-status">
            <span class="badge badge-${opp.tradeInRecommendation.urgency}">${opp.tradeInRecommendation.urgency}</span>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">
              ${opp.tradeInRecommendation.optimalWindow}
            </div>
          </div>
          <button class="btn btn-primary">Contact</button>
        </div>
      `;
    }).join('');
  };

  /**
   * Load customers page
   */
  const loadCustomersPage = () => {
    const customers = MockDataStore.getCustomers();
    const alertsByCustomer = AlertSystem.aggregateByCustomer(alerts);
    const tbody = document.getElementById('customers-table');

    tbody.innerHTML = customers.map(customer => {
      const customerAlerts = alertsByCustomer[customer.id];
      const alertCount = customerAlerts ? customerAlerts.alerts.length : 0;

      return `
        <tr>
          <td><strong>${customer.name}</strong></td>
          <td>${customer.territory}</td>
          <td>${customer.totalEquipment}</td>
          <td>
            ${alertCount > 0 ?
              `<span class="badge badge-${customerAlerts.criticalCount > 0 ? 'high' : 'medium'}">${alertCount} alerts</span>` :
              '<span class="badge badge-low">No alerts</span>'}
          </td>
          <td><button class="btn btn-outline">View Portfolio</button></td>
        </tr>
      `;
    }).join('');
  };

  /**
   * Run full analysis demo
   */
  const runFullAnalysis = () => {
    clearConsole();
    console.log("🚀 FULL RALPH WIGGUM ANALYSIS");
    console.log("=".repeat(50) + "\n");

    const equipment = MockDataStore.getAllEquipment();

    // Step 1: Predict lifecycles
    console.log("📊 Step 1: Lifecycle Predictions");
    const preds = LifecycleEngine.predictAllLifecycles(equipment);

    // Step 2: Aggregate by stage
    console.log("\n🥔 Step 2: Aggregate by Stage");
    const byStage = LifecycleEngine.aggregateByStage(preds);
    console.log(`Results: New=${byStage.new.length}, Growth=${byStage.growth.length}, Mature=${byStage.mature.length}, Decline=${byStage.decline.length}, EOL=${byStage.eol.length}`);

    // Step 3: Generate alerts
    console.log("\n🍀 Step 3: Generate Alerts");
    const allAlerts = AlertSystem.generateAllAlerts(equipment, preds);
    console.log(`Generated ${allAlerts.length} total alerts`);

    // Step 4: Filter by priority
    console.log("\n👨‍💼 Step 4: Filter Critical/High Alerts");
    const { approved } = AlertSystem.filterByPriority(allAlerts, 'high');
    console.log(`${approved.length} high-priority alerts`);

    // Step 5: Aggregate by customer
    console.log("\n🥔 Step 5: Group Alerts by Customer");
    const byCustomer = AlertSystem.aggregateByCustomer(allAlerts);
    console.log(`Alerts span ${Object.keys(byCustomer).length} customers`);

    console.log("\n" + "=".repeat(50));
    console.log("✅ ANALYSIS COMPLETE!");
    console.log(`💭 "${RalphWiggumLoop.getWisdom()}"`);
  };

  /**
   * Demo: Choo-Choo Loop
   */
  const runChooChooDemo = () => {
    clearConsole();
    console.log("🚂 CHOO-CHOO LOOP DEMO\n");

    const sample = MockDataStore.getAllEquipment().slice(0, 5);
    RalphWiggumLoop.chooChooLoop(sample, (eq, i) => {
      console.log(`  [${i}] ${eq.model} - ${eq.customerName}`);
    });
  };

  /**
   * Demo: Learnding Loop
   */
  const runLearnding = () => {
    clearConsole();
    console.log("📚 LEARNDING LOOP DEMO\n");

    const sample = MockDataStore.getAllEquipment().slice(0, 5);
    const learned = LifecycleEngine.batchLearnEquipment(sample);
    console.log("\nLearned summaries:");
    learned.forEach(l => console.log(`  - ${l.summary} (${l.stage})`));
  };

  /**
   * Demo: Leprechaun Loop
   */
  const runLeprechaun = () => {
    clearConsole();
    console.log("🍀 LEPRECHAUN LOOP DEMO\n");

    const sample = MockDataStore.getAllEquipment().slice(0, 3);
    RalphWiggumLoop.leprechaunLoop(sample, (eq, index, intensity) => {
      console.log(`  🔥 ${eq.model} - Intensity ${intensity + 1}`);
    }, 3);
  };

  /**
   * Demo: Idaho Loop
   */
  const runIdaho = () => {
    clearConsole();
    console.log("🥔 IDAHO LOOP DEMO\n");

    const stages = ['New', 'Growth', 'Mature', 'Decline'];
    const result = RalphWiggumLoop.idahoLoop(
      stages,
      (state, stage) => `${state} → ${stage}`,
      'Lifecycle'
    );
    console.log(`\nFinal: ${result}`);
  };

  /**
   * Demo: Bent Wookiee Loop
   */
  const runBentWookiee = () => {
    clearConsole();
    console.log("🐻 BENT WOOKIEE LOOP DEMO\n");

    const sample = MockDataStore.getAllEquipment().slice(0, 5);
    RalphWiggumLoop.bentWookieeLoop(sample, (eq, origIdx, bentIdx) => {
      console.log(`  Bent[${bentIdx}] → Original[${origIdx}]: ${eq.model}`);
    });
  };

  // ============================================
  // FEATURE 1: Toast Notifications
  // ============================================
  const showToast = (title, message, type = 'info', duration = 5000) => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.classList.add('exiting');
      setTimeout(() => toast.remove(), 300);
    }, duration);

    return toast;
  };

  const showAlertToasts = () => {
    // Show critical alerts as toasts
    const criticalAlerts = alerts.filter(a => a.priority === 'critical').slice(0, 3);
    criticalAlerts.forEach((alert, i) => {
      setTimeout(() => {
        showToast(
          alert.type.label,
          `${alert.equipmentModel}: ${alert.message}`,
          'error',
          6000
        );
      }, i * 1000);
    });
  };

  // ============================================
  // FEATURE 2: Fleet Health Gauge
  // ============================================
  const loadHealthPage = () => {
    animateHealthGauge();
    loadHealthByCategory();
  };

  const calculateFleetHealth = () => {
    const equipment = MockDataStore.getAllEquipment();
    let totalScore = 0;
    let ageScore = 0;
    let usageScore = 0;
    let maintenanceScore = 0;
    let riskScoreTotal = 0;

    RalphWiggumLoop.chooChooLoop(equipment, (eq) => {
      const prediction = predictions.find(p => p.equipmentId === eq.id);
      const lifecyclePct = prediction ? prediction.lifecyclePercentage : 50;

      // Age score (lower lifecycle % = better)
      ageScore += Math.max(0, 100 - lifecyclePct);

      // Usage score
      const usagePct = (eq.currentHours / eq.expectedHours) * 100;
      usageScore += Math.max(0, 100 - usagePct);

      // Maintenance score (recent service = good)
      if (eq.lastServiceDate) {
        const daysSince = (new Date() - new Date(eq.lastServiceDate)) / (1000 * 60 * 60 * 24);
        maintenanceScore += daysSince < 180 ? 100 : daysSince < 365 ? 70 : 40;
      } else {
        maintenanceScore += 30;
      }

      // Risk score
      if (prediction) {
        riskScoreTotal += (1 - prediction.riskScore) * 100;
      }
    });

    const count = equipment.length;
    return {
      overall: Math.round((ageScore + usageScore + maintenanceScore + riskScoreTotal) / (count * 4)),
      age: Math.round(ageScore / count),
      usage: Math.round(usageScore / count),
      maintenance: Math.round(maintenanceScore / count),
      risk: Math.round(riskScoreTotal / count)
    };
  };

  const animateHealthGauge = () => {
    const health = calculateFleetHealth();
    const gaugeEl = document.getElementById('health-gauge-fill');
    const scoreEl = document.getElementById('health-score');
    const statusEl = document.getElementById('health-status');

    // Animate gauge
    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (health.overall / 100) * circumference;

    // Color based on score
    let color, status, statusClass;
    if (health.overall >= 80) {
      color = '#4CAF50';
      status = 'Excellent';
      statusClass = 'excellent';
    } else if (health.overall >= 65) {
      color = '#2196F3';
      status = 'Good';
      statusClass = 'good';
    } else if (health.overall >= 50) {
      color = '#FF9800';
      status = 'Fair';
      statusClass = 'fair';
    } else if (health.overall >= 35) {
      color = '#E65100';
      status = 'Poor';
      statusClass = 'poor';
    } else {
      color = '#F44336';
      status = 'Critical';
      statusClass = 'critical';
    }

    gaugeEl.style.stroke = color;
    gaugeEl.style.strokeDashoffset = offset;

    // Animate number
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      scoreEl.textContent = current;
      if (current >= health.overall) {
        clearInterval(interval);
      }
    }, 20);

    statusEl.textContent = status;
    statusEl.className = `health-gauge-status ${statusClass}`;

    // Update breakdown
    document.getElementById('health-age').textContent = health.age + '%';
    document.getElementById('health-usage').textContent = health.usage + '%';
    document.getElementById('health-maintenance').textContent = health.maintenance + '%';
    document.getElementById('health-risk').textContent = health.risk + '%';

    // Show toast
    showToast('Fleet Health Calculated', `Overall score: ${health.overall}% (${status})`,
      health.overall >= 65 ? 'success' : 'warning');
  };

  const loadHealthByCategory = () => {
    const equipment = MockDataStore.getAllEquipment();
    const byCategory = {};

    equipment.forEach(eq => {
      if (!byCategory[eq.category]) {
        byCategory[eq.category] = { total: 0, healthSum: 0 };
      }
      const prediction = predictions.find(p => p.equipmentId === eq.id);
      byCategory[eq.category].total++;
      byCategory[eq.category].healthSum += prediction ? (100 - prediction.lifecyclePercentage) : 50;
    });

    const container = document.getElementById('health-by-category');
    const categories = Object.entries(byCategory).map(([cat, data]) => ({
      category: cat,
      health: Math.round(data.healthSum / data.total),
      count: data.total
    })).sort((a, b) => b.health - a.health);

    container.innerHTML = categories.map(cat => `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="text-transform: capitalize;">${getEquipmentIcon(cat.category)} ${cat.category}</span>
          <span>${cat.health}% (${cat.count} units)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${cat.health >= 60 ? 'green' : cat.health >= 40 ? 'yellow' : 'red'}"
               style="width: ${cat.health}%"></div>
        </div>
      </div>
    `).join('');
  };

  // ============================================
  // FEATURE 3: Buying Signal Analyzer
  // ============================================
  const conversations = {
    conv1: {
      customer: 'Green Valley Farms',
      messages: [
        { sender: 'customer', name: 'Tom Green', text: "Hi, we've been having some issues with our 8R 410. It's been in the shop twice this month already." },
        { sender: 'sales', name: 'John Smith', text: "I'm sorry to hear that, Tom. How old is the tractor now?" },
        { sender: 'customer', name: 'Tom Green', text: "It's about 8 years old now. Getting close to 10,000 hours. I'm starting to wonder if it's worth keeping." },
        { sender: 'sales', name: 'John Smith', text: "That's a significant investment in repairs. Have you thought about looking at the new 8R series?" },
        { sender: 'customer', name: 'Tom Green', text: "Actually yes, I've been looking at them online. What kind of trade-in value could we get?" }
      ]
    },
    conv2: {
      customer: 'Prairie Wind Agriculture',
      messages: [
        { sender: 'sales', name: 'John Smith', text: "Hi Sarah, this is our quarterly check-in. How's everything running?" },
        { sender: 'customer', name: 'Sarah Miller', text: "Pretty good actually. The combine performed well this harvest." },
        { sender: 'sales', name: 'John Smith', text: "Great to hear! Any plans for the upcoming season?" },
        { sender: 'customer', name: 'Sarah Miller', text: "We're thinking about it. Nothing concrete yet, but we might expand operations next year." },
        { sender: 'sales', name: 'John Smith', text: "That's exciting! Let me know if you'd like to discuss equipment options." }
      ]
    },
    conv3: {
      customer: 'Sunrise Cooperative',
      messages: [
        { sender: 'customer', name: 'Mike Johnson', text: "We need to upgrade our sprayer fleet. Currently running three R4038s that are all over 7 years old." },
        { sender: 'sales', name: 'John Smith', text: "I understand. The R4045 has some significant improvements. When were you looking to make this change?" },
        { sender: 'customer', name: 'Mike Johnson', text: "Before spring planting ideally. We need better coverage and efficiency." },
        { sender: 'sales', name: 'John Smith', text: "That's a tight timeline but doable. Should we schedule a demo?" },
        { sender: 'customer', name: 'Mike Johnson', text: "Yes, definitely. Also, what financing options are available? We want to replace all three." }
      ]
    },
    conv4: {
      customer: 'Heritage Family Farm',
      messages: [
        { sender: 'customer', name: 'Bob Heritage', text: "I'm very disappointed with the service we received last week." },
        { sender: 'sales', name: 'John Smith', text: "I'm sorry to hear that, Bob. What happened?" },
        { sender: 'customer', name: 'Bob Heritage', text: "The technician didn't show up on time and the repair wasn't done correctly. Had to call back." },
        { sender: 'sales', name: 'John Smith', text: "That's unacceptable. Let me escalate this and make it right." },
        { sender: 'customer', name: 'Bob Heritage', text: "I appreciate that. We've been loyal customers for 15 years." }
      ]
    },
    conv5: {
      customer: 'Big Sky Ranch',
      messages: [
        { sender: 'customer', name: 'Emma Davis', text: "John, we just acquired 2,000 more acres. We're going to need significant equipment additions." },
        { sender: 'sales', name: 'John Smith', text: "Congratulations Emma! That's a major expansion. What are you thinking?" },
        { sender: 'customer', name: 'Emma Davis', text: "At minimum: 2 tractors, a combine, and a planter. Possibly more depending on the financials." },
        { sender: 'sales', name: 'John Smith', text: "That's exciting. When do you need to have everything operational?" },
        { sender: 'customer', name: 'Emma Davis', text: "We want to plant on that land this spring. Budget is around $1.5 million. Let's meet this week." }
      ]
    }
  };

  const loadSignalsPage = () => {
    // Page loads with default state
  };

  const loadConversation = () => {
    const select = document.getElementById('conversation-select');
    const display = document.getElementById('conversation-display');
    const convId = select.value;

    if (!convId) {
      display.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 20px;">Select a conversation to view and analyze for buying signals</p>';
      return;
    }

    const conv = conversations[convId];
    display.innerHTML = conv.messages.map(msg => `
      <div class="conversation-message">
        <div class="message-avatar ${msg.sender}">${msg.sender === 'customer' ? '👤' : '💼'}</div>
        <div class="message-content">
          <div class="message-sender">${msg.name}</div>
          <div class="message-text">${msg.text}</div>
        </div>
      </div>
    `).join('');
  };

  const analyzeConversation = () => {
    const select = document.getElementById('conversation-select');
    const convId = select.value;

    if (!convId) {
      showToast('No Conversation Selected', 'Please select a conversation to analyze', 'warning');
      return;
    }

    const conv = conversations[convId];
    const text = conv.messages.map(m => m.text).join(' ').toLowerCase();

    // Signal detection using Ralph's nosePickerLoop (sampling keywords)
    const buyingKeywords = ['upgrade', 'replace', 'new', 'trade-in', 'looking at', 'need', 'want', 'budget', 'financing', 'when can', 'demo', 'expand', 'acquire'];
    const urgencyKeywords = ['asap', 'immediately', 'this week', 'before', 'tight timeline', 'soon', 'this spring', 'urgent'];
    const negativeKeywords = ['disappointed', 'complaint', 'issue', 'problem', 'wrong', 'unhappy', 'frustrated'];
    const commitmentKeywords = ['yes', 'definitely', 'schedule', 'meet', 'let\'s', 'we want', 'we need', 'budget is'];

    let buyingScore = 0;
    let urgencyScore = 0;
    let sentimentScore = 50;
    let commitmentScore = 0;

    console.log("📡 Analyzing conversation for buying signals...");

    RalphWiggumLoop.chooChooLoop(buyingKeywords, (keyword) => {
      if (text.includes(keyword)) {
        buyingScore += 15;
        console.log(`  Found buying signal: "${keyword}"`);
      }
    });

    urgencyKeywords.forEach(keyword => {
      if (text.includes(keyword)) urgencyScore += 20;
    });

    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) sentimentScore -= 15;
    });

    commitmentKeywords.forEach(keyword => {
      if (text.includes(keyword)) commitmentScore += 12;
    });

    // Normalize scores
    buyingScore = Math.min(100, buyingScore);
    urgencyScore = Math.min(100, urgencyScore);
    sentimentScore = Math.max(0, Math.min(100, sentimentScore + 20));
    commitmentScore = Math.min(100, commitmentScore);

    const overallScore = Math.round((buyingScore * 0.4) + (urgencyScore * 0.2) + (sentimentScore * 0.15) + (commitmentScore * 0.25));

    // Determine recommendation
    let recommendation, recClass;
    if (overallScore >= 70) {
      recommendation = 'High Priority - Schedule meeting immediately';
      recClass = 'high';
    } else if (overallScore >= 45) {
      recommendation = 'Medium Priority - Follow up within the week';
      recClass = 'medium';
    } else {
      recommendation = 'Low Priority - Continue nurturing relationship';
      recClass = 'low';
    }

    // Update UI
    const resultsContainer = document.getElementById('signal-results');
    resultsContainer.innerHTML = `
      <div class="overall-signal">
        <div class="overall-signal-title">Overall Buying Signal Score</div>
        <div class="overall-signal-value">${overallScore}%</div>
        <div class="overall-signal-recommendation">${recommendation}</div>
      </div>
      <div class="signal-results" style="margin-top: 16px;">
        <div class="signal-card">
          <div class="signal-indicator ${buyingScore >= 60 ? 'high' : buyingScore >= 30 ? 'medium' : 'low'}">🛒</div>
          <div class="signal-details">
            <div class="signal-type">Purchase Intent</div>
            <div class="signal-description">Keywords indicating interest in buying</div>
          </div>
          <div class="signal-score">
            <div class="signal-score-value">${buyingScore}%</div>
            <div class="signal-score-label">Score</div>
          </div>
        </div>
        <div class="signal-card">
          <div class="signal-indicator ${urgencyScore >= 60 ? 'high' : urgencyScore >= 30 ? 'medium' : 'low'}">⏰</div>
          <div class="signal-details">
            <div class="signal-type">Urgency Level</div>
            <div class="signal-description">Timeline pressure indicators</div>
          </div>
          <div class="signal-score">
            <div class="signal-score-value">${urgencyScore}%</div>
            <div class="signal-score-label">Score</div>
          </div>
        </div>
        <div class="signal-card">
          <div class="signal-indicator ${sentimentScore >= 60 ? 'high' : sentimentScore >= 40 ? 'medium' : 'low'}">💬</div>
          <div class="signal-details">
            <div class="signal-type">Sentiment</div>
            <div class="signal-description">Overall tone of conversation</div>
          </div>
          <div class="signal-score">
            <div class="signal-score-value">${sentimentScore}%</div>
            <div class="signal-score-label">Score</div>
          </div>
        </div>
        <div class="signal-card">
          <div class="signal-indicator ${commitmentScore >= 60 ? 'high' : commitmentScore >= 30 ? 'medium' : 'low'}">✅</div>
          <div class="signal-details">
            <div class="signal-type">Commitment Signals</div>
            <div class="signal-description">Agreement and next step indicators</div>
          </div>
          <div class="signal-score">
            <div class="signal-score-value">${commitmentScore}%</div>
            <div class="signal-score-label">Score</div>
          </div>
        </div>
      </div>
    `;

    // Add to history
    signalHistory.unshift({
      customer: conv.customer,
      score: overallScore,
      recommendation: recClass,
      timestamp: new Date().toLocaleTimeString()
    });

    updateSignalHistory();

    // Show toast
    showToast('Analysis Complete', `${conv.customer}: ${overallScore}% buying signal`,
      overallScore >= 60 ? 'success' : 'info');
  };

  const updateSignalHistory = () => {
    const container = document.getElementById('signal-history');
    if (signalHistory.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Signal analysis history will appear here</p>';
      return;
    }

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Customer</th>
            <th>Score</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          ${signalHistory.slice(0, 10).map(h => `
            <tr>
              <td>${h.timestamp}</td>
              <td>${h.customer}</td>
              <td><strong>${h.score}%</strong></td>
              <td><span class="badge badge-${h.recommendation}">${h.recommendation}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  };

  // ============================================
  // FEATURE 4: Revenue Calculator
  // ============================================
  const equipmentValues = {
    tractor: { base: 250000, depreciation: 0.08 },
    combine: { base: 450000, depreciation: 0.07 },
    sprayer: { base: 200000, depreciation: 0.09 },
    planter: { base: 180000, depreciation: 0.06 },
    loader: { base: 120000, depreciation: 0.08 },
    mower: { base: 50000, depreciation: 0.10 },
    baler: { base: 80000, depreciation: 0.08 },
    tillage: { base: 60000, depreciation: 0.07 }
  };

  const loadRevenuePage = () => {
    calculateRevenue();
  };

  const calculateRevenue = () => {
    console.log("💵 Calculating Revenue Opportunities...");

    const opportunities = predictions.filter(p => p.tradeInRecommendation.shouldTradeIn);
    const revenueByCategory = {
      tractor: 0,
      combine: 0,
      sprayer: 0,
      planter: 0,
      other: 0
    };

    let totalRevenue = 0;
    const topOpps = [];

    RalphWiggumLoop.chooChooLoop(opportunities, (opp) => {
      const equipment = MockDataStore.getEquipmentById(opp.equipmentId);
      const values = equipmentValues[equipment.category] || { base: 100000, depreciation: 0.08 };

      // Calculate trade-in value (depreciation based on age)
      const tradeInValue = Math.round(values.base * Math.pow(1 - values.depreciation, equipment.ageYears));
      // New equipment sale value
      const saleValue = values.base;
      // Revenue = sale - trade-in credit (simplified profit margin ~15%)
      const revenue = Math.round((saleValue - tradeInValue) * 0.15 + saleValue * 0.08);

      totalRevenue += revenue;

      if (['tractor', 'combine', 'sprayer', 'planter'].includes(equipment.category)) {
        revenueByCategory[equipment.category] += revenue;
      } else {
        revenueByCategory.other += revenue;
      }

      topOpps.push({
        equipment,
        prediction: opp,
        tradeInValue,
        saleValue,
        revenue
      });
    });

    // Update totals
    document.getElementById('revenue-total').textContent = formatCurrency(totalRevenue);
    document.getElementById('revenue-opportunities').textContent = `from ${opportunities.length} trade-in opportunities`;

    document.getElementById('revenue-tractors').textContent = formatCurrency(revenueByCategory.tractor);
    document.getElementById('revenue-combines').textContent = formatCurrency(revenueByCategory.combine);
    document.getElementById('revenue-sprayers').textContent = formatCurrency(revenueByCategory.sprayer);
    document.getElementById('revenue-planters').textContent = formatCurrency(revenueByCategory.planter);
    document.getElementById('revenue-other').textContent = formatCurrency(revenueByCategory.other);

    // Animate bars
    const maxRevenue = Math.max(...Object.values(revenueByCategory), 1);
    setTimeout(() => {
      ['tractors', 'combines', 'sprayers', 'planters', 'other'].forEach(cat => {
        const key = cat === 'other' ? 'other' : cat.slice(0, -1);
        const pct = (revenueByCategory[key === 'other' ? 'other' : key] / maxRevenue) * 100;
        document.getElementById(`bar-${cat}`).style.width = `${pct}%`;
        document.getElementById(`bar-val-${cat}`).textContent = formatCurrency(revenueByCategory[key === 'other' ? 'other' : key]);
      });
    }, 100);

    // Top opportunities
    const sortedOpps = topOpps.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    document.getElementById('top-opportunities').innerHTML = sortedOpps.map(opp => `
      <div class="equipment-item">
        <div class="equipment-icon">${getEquipmentIcon(opp.equipment.category)}</div>
        <div class="equipment-info">
          <div class="equipment-name">${opp.equipment.model}</div>
          <div class="equipment-meta">${opp.equipment.customerName} | Trade-in: ${formatCurrency(opp.tradeInValue)}</div>
        </div>
        <div class="equipment-status">
          <div style="font-size: var(--text-xl); font-weight: bold; color: var(--color-success);">${formatCurrency(opp.revenue)}</div>
          <div style="font-size: var(--text-xs); color: var(--color-text-secondary);">Potential Revenue</div>
        </div>
      </div>
    `).join('') || '<p style="text-align: center; color: var(--color-text-secondary);">No opportunities found</p>';

    showToast('Revenue Calculated', `${formatCurrency(totalRevenue)} potential from ${opportunities.length} opportunities`, 'success');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // ============================================
  // FEATURE 5: Event Timeline
  // ============================================
  const loadTimelinePage = () => {
    generateTimelineEvents();
    renderTimeline('all');
  };

  const generateTimelineEvents = () => {
    timelineEvents = [];
    const equipment = MockDataStore.getAllEquipment();

    RalphWiggumLoop.chooChooLoop(equipment, (eq) => {
      const prediction = predictions.find(p => p.equipmentId === eq.id);

      // Warranty events
      if (eq.warrantyExpiry) {
        const daysUntil = Math.ceil((new Date(eq.warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 180) {
          timelineEvents.push({
            type: 'warranty',
            date: eq.warrantyExpiry,
            daysUntil,
            title: `Warranty Expiring - ${eq.model}`,
            description: `${eq.customerName}'s warranty expires in ${daysUntil} days`,
            equipment: eq,
            icon: '🛡️'
          });
        }
      }

      // Lease events
      if (eq.isLeased && eq.leaseExpiry) {
        const daysUntil = Math.ceil((new Date(eq.leaseExpiry) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 180) {
          timelineEvents.push({
            type: 'lease',
            date: eq.leaseExpiry,
            daysUntil,
            title: `Lease Expiring - ${eq.model}`,
            description: `${eq.customerName}'s lease expires in ${daysUntil} days`,
            equipment: eq,
            icon: '📋'
          });
        }
      }

      // Trade-in events
      if (prediction && prediction.tradeInRecommendation.shouldTradeIn) {
        const urgencyDays = prediction.tradeInRecommendation.urgency === 'high' ? 30 :
          prediction.tradeInRecommendation.urgency === 'medium' ? 90 : 180;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + urgencyDays);

        timelineEvents.push({
          type: 'trade-in',
          date: futureDate.toISOString().split('T')[0],
          daysUntil: urgencyDays,
          title: `Trade-In Window - ${eq.model}`,
          description: `${eq.customerName} - ${prediction.tradeInRecommendation.reason}`,
          equipment: eq,
          icon: '🔄'
        });
      }

      // Maintenance events
      if (eq.lastServiceDate) {
        const daysSince = Math.ceil((new Date() - new Date(eq.lastServiceDate)) / (1000 * 60 * 60 * 24));
        if (daysSince > 150) {
          const dueDate = new Date(eq.lastServiceDate);
          dueDate.setDate(dueDate.getDate() + 180);
          const daysUntil = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));

          timelineEvents.push({
            type: 'maintenance',
            date: dueDate.toISOString().split('T')[0],
            daysUntil: Math.max(0, daysUntil),
            title: `Maintenance Due - ${eq.model}`,
            description: `${eq.customerName} - ${daysSince} days since last service`,
            equipment: eq,
            icon: '🔧'
          });
        }
      }
    });

    // Sort by date
    timelineEvents.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const renderTimeline = (filter) => {
    const container = document.getElementById('event-timeline');
    let events = timelineEvents;

    if (filter !== 'all') {
      events = timelineEvents.filter(e => e.type === filter);
    }

    // Update filter buttons
    document.querySelectorAll('.timeline-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    if (events.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 40px;">No events found for this filter</p>';
      return;
    }

    container.innerHTML = events.slice(0, 15).map((event, i) => {
      const badgeClass = event.daysUntil <= 30 ? 'urgent' : event.daysUntil <= 90 ? 'soon' : 'normal';
      const badgeText = event.daysUntil <= 0 ? 'Overdue' : `${event.daysUntil} days`;

      return `
        <div class="timeline-item" style="animation-delay: ${i * 0.05}s">
          <div class="timeline-marker ${event.type}">${event.icon}</div>
          <div class="timeline-content">
            <span class="timeline-days-badge ${badgeClass}">${badgeText}</span>
            <div class="timeline-date">${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div class="timeline-title">${event.title}</div>
            <div class="timeline-description">${event.description}</div>
            <div class="timeline-actions">
              <button class="btn btn-primary" style="padding: 4px 12px; font-size: 12px;">Take Action</button>
              <button class="btn btn-outline" style="padding: 4px 12px; font-size: 12px;">View Details</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  const filterTimeline = (filter) => {
    renderTimeline(filter);
  };

  // ============================================
  // FEATURE 6: Equipment Detail Modal
  // ============================================
  const openEquipmentModal = (equipmentId) => {
    const equipment = MockDataStore.getEquipmentById(equipmentId);
    const prediction = predictions.find(p => p.equipmentId === equipmentId);

    if (!equipment) return;

    const modal = document.getElementById('equipment-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    title.innerHTML = `
      <span>${getEquipmentIcon(equipment.category)}</span>
      <span>${equipment.model} - ${equipment.id}</span>
    `;

    const stage = prediction?.currentStage || { label: 'Unknown', id: 'new' };

    body.innerHTML = `
      <div class="modal-grid">
        <div>
          <div class="modal-section">
            <div class="modal-section-title">Equipment Information</div>
            <div class="detail-row">
              <span class="detail-label">Serial Number</span>
              <span class="detail-value">${equipment.serialNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Category</span>
              <span class="detail-value" style="text-transform: capitalize;">${equipment.category}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Purchase Date</span>
              <span class="detail-value">${new Date(equipment.purchaseDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Age</span>
              <span class="detail-value">${equipment.ageYears.toFixed(1)} years</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Current Hours</span>
              <span class="detail-value">${equipment.currentHours.toLocaleString()} hrs</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Expected Life</span>
              <span class="detail-value">${equipment.expectedHours.toLocaleString()} hrs</span>
            </div>
          </div>

          <div class="modal-section">
            <div class="modal-section-title">Customer</div>
            <div class="detail-row">
              <span class="detail-label">Name</span>
              <span class="detail-value">${equipment.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location</span>
              <span class="detail-value">${equipment.location}</span>
            </div>
          </div>
        </div>

        <div>
          <div class="modal-section">
            <div class="modal-section-title">Lifecycle Analysis</div>
            <div style="text-align: center; padding: var(--spacing-4); background: var(--color-background); border-radius: var(--radius-lg); margin-bottom: var(--spacing-4);">
              <div style="font-size: var(--text-3xl); font-weight: bold;">${prediction?.lifecyclePercentage || '--'}%</div>
              <div style="font-size: var(--text-sm); color: var(--color-text-secondary);">Lifecycle Progress</div>
              <span class="badge badge-${stage.id}" style="margin-top: var(--spacing-2);">${stage.label}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Risk Score</span>
              <span class="detail-value">
                <span class="badge badge-${prediction?.failureRiskLevel || 'low'}">${prediction ? Math.round(prediction.riskScore * 100) : '--'}%</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Trade-In</span>
              <span class="detail-value">${prediction?.tradeInRecommendation.shouldTradeIn ? '✅ Recommended' : '❌ Not Yet'}</span>
            </div>
            ${prediction?.tradeInRecommendation.shouldTradeIn ? `
            <div class="detail-row">
              <span class="detail-label">Optimal Window</span>
              <span class="detail-value">${prediction.tradeInRecommendation.optimalWindow}</span>
            </div>
            ` : ''}
          </div>

          <div class="modal-section">
            <div class="modal-section-title">Warranty & Lease</div>
            <div class="detail-row">
              <span class="detail-label">Warranty Expires</span>
              <span class="detail-value">${equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Leased</span>
              <span class="detail-value">${equipment.isLeased ? 'Yes' : 'No'}</span>
            </div>
            ${equipment.isLeased ? `
            <div class="detail-row">
              <span class="detail-label">Lease Expires</span>
              <span class="detail-value">${new Date(equipment.leaseExpiry).toLocaleDateString()}</span>
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="modal-section" style="margin-top: var(--spacing-6);">
        <div class="modal-section-title">Service History (${equipment.serviceHistory.length} records)</div>
        <div class="service-timeline">
          ${equipment.serviceHistory.slice(0, 5).map(service => `
            <div class="service-entry">
              <span class="service-date">${new Date(service.date).toLocaleDateString()}</span>
              <span class="service-type">${service.type}</span>
              <span class="service-cost">${formatCurrency(service.cost)}</span>
            </div>
          `).join('') || '<p style="color: var(--color-text-secondary);">No service records</p>'}
        </div>
      </div>

      <div style="margin-top: var(--spacing-6); display: flex; gap: var(--spacing-3);">
        <button class="btn btn-primary" onclick="Dashboard.showToast('Action Scheduled', 'Contact scheduled for ${equipment.customerName}', 'success')">📞 Contact Customer</button>
        <button class="btn btn-secondary" onclick="Dashboard.showToast('Report Generated', 'Equipment report exported', 'info')">📄 Export Report</button>
        <button class="btn btn-outline" onclick="Dashboard.closeModal()">Close</button>
      </div>
    `;

    modal.classList.add('active');
  };

  const closeModal = () => {
    document.getElementById('equipment-modal').classList.remove('active');
  };

  // ============================================
  // FEATURE 7: Territory Heat Map
  // ============================================
  const loadTerritoryPage = () => {
    refreshTerritoryMap();
  };

  const refreshTerritoryMap = () => {
    const territories = {};
    const equipment = MockDataStore.getAllEquipment();
    const customers = MockDataStore.getCustomers();

    // Calculate territory stats
    customers.forEach(customer => {
      if (!territories[customer.territory]) {
        territories[customer.territory] = {
          name: customer.territory,
          customers: [],
          equipment: [],
          totalHealth: 0,
          alerts: 0,
          opportunities: 0,
          rep: customer.rep
        };
      }
      territories[customer.territory].customers.push(customer);
    });

    equipment.forEach(eq => {
      const customer = customers.find(c => c.id === eq.customerId);
      if (customer && territories[customer.territory]) {
        territories[customer.territory].equipment.push(eq);
        const prediction = predictions.find(p => p.equipmentId === eq.id);
        if (prediction) {
          territories[customer.territory].totalHealth += (100 - prediction.lifecyclePercentage);
          if (prediction.tradeInRecommendation.shouldTradeIn) {
            territories[customer.territory].opportunities++;
          }
        }
      }
    });

    // Calculate alerts by territory
    alerts.forEach(alert => {
      const customer = customers.find(c => c.id === alert.customerId);
      if (customer && territories[customer.territory]) {
        territories[customer.territory].alerts++;
      }
    });

    const container = document.getElementById('territory-map');
    container.innerHTML = Object.values(territories).map(territory => {
      const avgHealth = territory.equipment.length > 0 ?
        Math.round(territory.totalHealth / territory.equipment.length) : 0;

      let healthClass;
      if (avgHealth >= 70) healthClass = 'excellent';
      else if (avgHealth >= 50) healthClass = 'good';
      else if (avgHealth >= 30) healthClass = 'fair';
      else healthClass = 'poor';

      const initials = territory.rep.split(' ').map(n => n[0]).join('');

      return `
        <div class="territory-card ${healthClass}" onclick="Dashboard.showToast('Territory Selected', '${territory.name} - ${territory.equipment.length} equipment units', 'info')">
          <div class="territory-header">
            <div class="territory-name">🗺️ ${territory.name}</div>
            <div class="territory-health ${healthClass}">${avgHealth}%</div>
          </div>
          <div class="territory-stats">
            <div class="territory-stat">
              <div class="territory-stat-value">${territory.customers.length}</div>
              <div class="territory-stat-label">Customers</div>
            </div>
            <div class="territory-stat">
              <div class="territory-stat-value">${territory.equipment.length}</div>
              <div class="territory-stat-label">Equipment</div>
            </div>
            <div class="territory-stat">
              <div class="territory-stat-value">${territory.alerts}</div>
              <div class="territory-stat-label">Alerts</div>
            </div>
          </div>
          <div class="territory-rep">
            <div class="territory-rep-avatar">${initials}</div>
            <div class="territory-rep-name">${territory.rep}</div>
          </div>
        </div>
      `;
    }).join('');

    showToast('Territory Map Updated', `${Object.keys(territories).length} territories loaded`, 'success');
  };

  // ============================================
  // FEATURE 8: Equipment Comparison Tool
  // ============================================
  const loadComparePage = () => {
    // Reset comparison
    updateComparisonSlots();
  };

  const openEquipmentSelector = (slot) => {
    const dropdown = document.getElementById(`dropdown-${slot}`);
    const allDropdowns = document.querySelectorAll('.equipment-dropdown');

    // Close other dropdowns
    allDropdowns.forEach(d => d.classList.remove('active'));

    if (dropdown.classList.contains('active')) {
      dropdown.classList.remove('active');
      return;
    }

    // Populate dropdown
    const equipment = MockDataStore.getAllEquipment();
    dropdown.innerHTML = equipment.slice(0, 20).map(eq => {
      const prediction = predictions.find(p => p.equipmentId === eq.id);
      return `
        <div class="equipment-dropdown-item" onclick="event.stopPropagation(); Dashboard.selectEquipment(${slot}, '${eq.id}')">
          <span>${getEquipmentIcon(eq.category)}</span>
          <div style="flex: 1;">
            <div style="font-weight: 500;">${eq.model}</div>
            <div style="font-size: 12px; color: var(--color-text-secondary);">${eq.customerName}</div>
          </div>
          <span class="badge badge-${prediction?.currentStage.id || 'new'}">${prediction?.lifecyclePercentage || '--'}%</span>
        </div>
      `;
    }).join('');

    dropdown.classList.add('active');
  };

  const selectEquipment = (slot, equipmentId) => {
    const equipment = MockDataStore.getEquipmentById(equipmentId);
    if (!equipment) return;

    if (slot === 1) {
      compareSlot1 = equipment;
    } else {
      compareSlot2 = equipment;
    }

    document.querySelectorAll('.equipment-dropdown').forEach(d => d.classList.remove('active'));
    updateComparisonSlots();

    if (compareSlot1 && compareSlot2) {
      runComparison();
    }
  };

  const updateComparisonSlots = () => {
    const slot1 = document.getElementById('compare-slot-1');
    const slot2 = document.getElementById('compare-slot-2');

    if (compareSlot1) {
      slot1.classList.add('selected');
      slot1.innerHTML = `
        <div class="comparison-selector-icon">${getEquipmentIcon(compareSlot1.category)}</div>
        <div style="font-weight: 600;">${compareSlot1.model}</div>
        <div style="font-size: 12px; color: var(--color-text-secondary);">${compareSlot1.customerName}</div>
        <div class="equipment-dropdown" id="dropdown-1"></div>
      `;
    } else {
      slot1.classList.remove('selected');
      slot1.innerHTML = `
        <div class="comparison-selector-icon">🚜</div>
        <div class="comparison-selector-label">Click to select equipment</div>
        <div class="equipment-dropdown" id="dropdown-1"></div>
      `;
    }

    if (compareSlot2) {
      slot2.classList.add('selected');
      slot2.innerHTML = `
        <div class="comparison-selector-icon">${getEquipmentIcon(compareSlot2.category)}</div>
        <div style="font-weight: 600;">${compareSlot2.model}</div>
        <div style="font-size: 12px; color: var(--color-text-secondary);">${compareSlot2.customerName}</div>
        <div class="equipment-dropdown" id="dropdown-2"></div>
      `;
    } else {
      slot2.classList.remove('selected');
      slot2.innerHTML = `
        <div class="comparison-selector-icon">🚜</div>
        <div class="comparison-selector-label">Click to select equipment</div>
        <div class="equipment-dropdown" id="dropdown-2"></div>
      `;
    }
  };

  const runComparison = () => {
    if (!compareSlot1 || !compareSlot2) return;

    const pred1 = predictions.find(p => p.equipmentId === compareSlot1.id);
    const pred2 = predictions.find(p => p.equipmentId === compareSlot2.id);

    const metrics = [
      { label: 'Age (Years)', val1: compareSlot1.ageYears.toFixed(1), val2: compareSlot2.ageYears.toFixed(1), better: 'lower' },
      { label: 'Hours', val1: compareSlot1.currentHours, val2: compareSlot2.currentHours, better: 'lower' },
      { label: 'Lifecycle %', val1: pred1?.lifecyclePercentage || 0, val2: pred2?.lifecyclePercentage || 0, better: 'lower' },
      { label: 'Risk Score', val1: pred1 ? Math.round(pred1.riskScore * 100) : 0, val2: pred2 ? Math.round(pred2.riskScore * 100) : 0, better: 'lower' },
      { label: 'Service Records', val1: compareSlot1.serviceHistory.length, val2: compareSlot2.serviceHistory.length, better: 'higher' }
    ];

    const table = document.getElementById('comparison-table');
    table.innerHTML = `
      <div class="comparison-row header">
        <div class="comparison-cell">Metric</div>
        <div class="comparison-cell">${compareSlot1.model}</div>
        <div class="comparison-cell">${compareSlot2.model}</div>
      </div>
      ${metrics.map(m => {
        const v1 = parseFloat(m.val1);
        const v2 = parseFloat(m.val2);
        const winner1 = m.better === 'lower' ? v1 < v2 : v1 > v2;
        const winner2 = m.better === 'lower' ? v2 < v1 : v2 > v1;
        const max = Math.max(v1, v2, 1);

        return `
          <div class="comparison-row">
            <div class="comparison-cell metric">${m.label}</div>
            <div class="comparison-cell ${winner1 ? 'winner' : ''}">
              <div class="comparison-bar">
                <div class="comparison-bar-fill" style="width: ${(v1 / max) * 100}%; background: ${winner1 ? 'var(--color-success)' : 'var(--color-border)'}"></div>
              </div>
              ${m.val1}${m.label.includes('%') ? '%' : ''}
            </div>
            <div class="comparison-cell ${winner2 ? 'winner' : ''}">
              <div class="comparison-bar">
                <div class="comparison-bar-fill" style="width: ${(v2 / max) * 100}%; background: ${winner2 ? 'var(--color-success)' : 'var(--color-border)'}"></div>
              </div>
              ${m.val2}${m.label.includes('%') ? '%' : ''}
            </div>
          </div>
        `;
      }).join('')}
    `;

    document.getElementById('comparison-results').style.display = 'block';
    showToast('Comparison Ready', `${compareSlot1.model} vs ${compareSlot2.model}`, 'success');
  };

  const clearComparison = () => {
    compareSlot1 = null;
    compareSlot2 = null;
    updateComparisonSlots();
    document.getElementById('comparison-results').style.display = 'none';
  };

  // ============================================
  // FEATURE 9: Live Activity Feed
  // ============================================
  const loadActivityPage = () => {
    generateInitialActivity();
    renderActivityFeed();
    updateActivityStats();
  };

  const generateInitialActivity = () => {
    activityFeed = [];
    const types = ['alert', 'trade-in', 'maintenance', 'risk'];
    const icons = { alert: '🔔', 'trade-in': '💰', maintenance: '🔧', risk: '⚠️' };
    const equipment = MockDataStore.getAllEquipment().slice(0, 15);

    equipment.forEach((eq, i) => {
      const type = types[i % types.length];
      const prediction = predictions.find(p => p.equipmentId === eq.id);

      let title, description;
      switch (type) {
        case 'alert':
          title = 'Alert Generated';
          description = `${eq.model} warranty expiring soon`;
          break;
        case 'trade-in':
          title = 'Trade-In Opportunity';
          description = `${eq.model} at ${prediction?.lifecyclePercentage || 75}% lifecycle`;
          break;
        case 'maintenance':
          title = 'Maintenance Due';
          description = `${eq.model} service recommended`;
          break;
        case 'risk':
          title = 'Risk Detected';
          description = `${eq.model} high failure risk`;
          break;
      }

      activityFeed.push({
        type,
        icon: icons[type],
        title,
        description,
        customer: eq.customerName,
        time: `${Math.floor(Math.random() * 60)} min ago`
      });
    });
  };

  const renderActivityFeed = () => {
    const container = document.getElementById('activity-feed');
    container.innerHTML = activityFeed.map(activity => `
      <div class="activity-item ${activity.type}">
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-description">${activity.description} - ${activity.customer}</div>
        </div>
        <div class="activity-time">${activity.time}</div>
      </div>
    `).join('');
  };

  const updateActivityStats = () => {
    document.getElementById('activity-predictions').textContent = predictions.length;
    document.getElementById('activity-alerts').textContent = alerts.length;
    document.getElementById('activity-opportunities').textContent =
      predictions.filter(p => p.tradeInRecommendation.shouldTradeIn).length;
    document.getElementById('activity-risks').textContent =
      predictions.filter(p => p.failureRiskLevel === 'high').length;
  };

  const simulateActivity = () => {
    const types = ['alert', 'trade-in', 'maintenance', 'risk'];
    const icons = { alert: '🔔', 'trade-in': '💰', maintenance: '🔧', risk: '⚠️' };
    const equipment = MockDataStore.getAllEquipment();

    let count = 0;
    const interval = setInterval(() => {
      if (count >= 5) {
        clearInterval(interval);
        return;
      }

      const eq = equipment[Math.floor(Math.random() * equipment.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const prediction = predictions.find(p => p.equipmentId === eq.id);

      const titles = {
        alert: 'New Alert',
        'trade-in': 'Opportunity Detected',
        maintenance: 'Service Required',
        risk: 'Risk Alert'
      };

      const newActivity = {
        type,
        icon: icons[type],
        title: titles[type],
        description: `${eq.model} - ${eq.customerName}`,
        customer: eq.customerName,
        time: 'Just now'
      };

      activityFeed.unshift(newActivity);
      renderActivityFeed();

      showToast(newActivity.title, newActivity.description, type === 'risk' ? 'error' : 'info', 3000);
      count++;
    }, 1500);
  };

  // ============================================
  // FEATURE 10: Stats Ticker Bar
  // ============================================
  const initStatsTicker = () => {
    const equipment = MockDataStore.getAllEquipment();
    const summary = AlertSystem.getAlertSummary(alerts);
    const riskDist = LifecycleEngine.getRiskDistribution(predictions);
    const opportunities = predictions.filter(p => p.tradeInRecommendation.shouldTradeIn).length;

    const tickerItems = [
      { icon: '🚜', value: equipment.length, label: 'Total Equipment' },
      { icon: '👥', value: MockDataStore.getCustomers().length, label: 'Active Customers' },
      { icon: '🔔', value: alerts.length, label: 'Active Alerts' },
      { icon: '⚠️', value: summary.byPriority.critical, label: 'Critical Alerts' },
      { icon: '💰', value: opportunities, label: 'Trade-In Opportunities' },
      { icon: '📉', value: riskDist.high, label: 'High Risk Equipment' },
      { icon: '✅', value: riskDist.low, label: 'Healthy Equipment' },
      { icon: '🔧', value: summary.byType.maintenance, label: 'Maintenance Due' }
    ];

    // Duplicate for seamless scroll
    const content = [...tickerItems, ...tickerItems].map(item => `
      <span class="ticker-item">
        <span class="ticker-icon">${item.icon}</span>
        <span class="ticker-value">${item.value}</span>
        <span class="ticker-label">${item.label}</span>
      </span>
      <span class="ticker-divider"></span>
    `).join('');

    document.getElementById('ticker-content').innerHTML = content;
  };

  // Public API
  return {
    init,
    showPage,
    refreshData,
    filterAlerts,
    runFullAnalysis,
    runChooChooDemo,
    runLearnding,
    runLeprechaun,
    runIdaho,
    runBentWookiee,
    // Features 1-5
    showToast,
    animateHealthGauge,
    loadConversation,
    analyzeConversation,
    calculateRevenue,
    filterTimeline,
    // Features 6-10
    openEquipmentModal,
    closeModal,
    refreshTerritoryMap,
    openEquipmentSelector,
    selectEquipment,
    clearComparison,
    simulateActivity
  };
})();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  Dashboard.init();
});
