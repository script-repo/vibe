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
      'console': 'Ralph Console'
    };
    document.getElementById('page-title').textContent = titles[pageId] || 'Dashboard';

    // Load page-specific data
    if (pageId === 'alerts') loadAlertsPage();
    if (pageId === 'equipment') loadEquipmentPage();
    if (pageId === 'lifecycle') loadLifecyclePage();
    if (pageId === 'opportunities') loadOpportunitiesPage();
    if (pageId === 'customers') loadCustomersPage();
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
        <tr>
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
    runBentWookiee
  };
})();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  Dashboard.init();
});
