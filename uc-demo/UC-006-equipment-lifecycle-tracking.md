# Product Requirements Document: Equipment Lifecycle Tracking - UC-006

**Product Name:** Equipment Lifecycle Tracking System
**Version:** 1.0.0
**Client:** Pattison AG
**Date:** February 2026
**Status:** Phase 1 (Current)

---

## 1. Overview

An AI-powered equipment lifecycle management system for Pattison AG that automatically tracks customer equipment with age and status, monitors warranty and lease expiration dates, analyzes past conversations for buying signals, predicts upcoming equipment needs based on lifecycle data, suggests proactive sales opportunities with optimal timing recommendations, and alerts sales reps when action is needed.

---

## 2. Problem Statement

Sales representatives lack visibility into customer equipment status and lifecycle stages, leading to:
- Missed trade-in opportunities when equipment reaches optimal replacement timing
- Reactive rather than proactive customer engagement
- Lost revenue from expired warranties and leases going unnoticed
- Inability to predict customer needs based on equipment age and usage patterns

---

## 3. Goals & Objectives

| Goal | Success Metric |
|------|----------------|
| Increase proactive sales engagement | 40% increase in trade-in conversations initiated by sales |
| Reduce missed warranty/lease expirations | 95% of expirations flagged 90+ days in advance |
| Improve equipment replacement timing | 25% increase in trade-ins at optimal lifecycle stage |
| Enhance sales rep productivity | 30% reduction in time spent researching customer equipment |

---

## 4. Features

### 4.1 Automated Equipment Inventory
- Automatically imports equipment data from CRM and equipment management systems
- Syncs customer records, equipment specifications, purchase dates
- Maintains real-time inventory of all customer equipment
- Tracks serial numbers, model information, and configuration details

### 4.2 Lifecycle Predictions
Predicts current lifecycle stage for each equipment item:

| Stage | % of Expected Life | Description |
|-------|-------------------|-------------|
| **New** | 0-20% | Recently purchased equipment |
| **Growth** | 20-50% | Equipment in prime operating years |
| **Mature** | 50-80% | Equipment with significant usage |
| **Decline** | 80-100% | Equipment approaching end of useful life |
| **End of Life** | >100% | Equipment exceeded expected lifespan |

### 4.3 Trade-In Timing
- Recommends optimal trade-in timing based on usage, age, and risk factors
- Calculates total cost of ownership projections
- Compares repair costs vs. replacement value
- Identifies seasonal timing opportunities

### 4.4 Risk Assessment
- Calculates failure risk scores based on age, usage, and service history
- Predictive maintenance indicators
- Historical failure pattern analysis
- Component-level risk breakdown

### 4.5 Smart Alerts
Proactive notifications for:
- Warranty expiration (configurable: default 90 days)
- Lease expiration (configurable: default 120 days)
- Trade-in opportunities (lifecycle threshold: 75%)
- High-risk equipment (risk score threshold: 0.6)
- Maintenance due dates
- Usage anomalies

### 4.6 Sales Dashboard
- Web-based dashboard for viewing customer equipment portfolios
- Equipment status overview with lifecycle indicators
- Alert summary and action items
- Customer-level and territory-level views
- Opportunity pipeline visualization
- Export capabilities (CSV, PDF)

### 4.7 REST API
RESTful API for integration with other systems:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/equipment-lifecycle/equipment/{customer_id}` | GET | List customer equipment |
| `/api/v1/equipment-lifecycle/equipment/{equipment_id}/lifecycle` | GET | Get lifecycle prediction |
| `/api/v1/equipment-lifecycle/alerts/equipment` | GET | Get equipment alerts |
| `/api/v1/equipment-lifecycle/opportunities` | GET | Get opportunity suggestions |
| `/api/v1/equipment-lifecycle/portfolio/{customer_id}` | GET | Get customer portfolio view |
| `/api/v1/equipment-lifecycle/metrics/summary` | GET | Get system summary metrics |

---

## 5. User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Sales Rep** | View assigned accounts, manage own alerts, export data |
| **Account Manager** | View territory accounts, assign alerts, generate reports |
| **Sales Manager** | View all accounts, manage team, configure thresholds |
| **Admin** | Full system access, user management, system configuration |

---

## 6. Integration Requirements

### 6.1 Source Systems
| System | Data |
|--------|------|
| **CRM System** | Customer data, equipment records, conversations |
| **Equipment Management System** | Equipment specifications, purchase dates |
| **Finance System** | Warranty data, lease data, expiration dates |
| **Service Management System** | Maintenance history, usage hours |

### 6.2 Authentication
- Integration with Active Directory for SSO authentication
- OAuth 2.0 support for API access
- JWT tokens for session management

---

## 7. Design Specifications

### 7.1 Color Scheme (John Deere Theme)
```css
/* Primary Colors */
--color-primary: #367C2B;        /* John Deere Green */
--color-primary-dark: #2D6A24;   /* Darker Green */
--color-primary-light: #4A9B3D;  /* Lighter Green */

/* Secondary Colors */
--color-secondary: #FFDE00;      /* John Deere Yellow */
--color-secondary-dark: #E5C700; /* Darker Yellow */
--color-secondary-light: #FFF033;/* Lighter Yellow */

/* Semantic Colors */
--color-success: #4CAF50;
--color-warning: #FF9800;
--color-error: #F44336;
--color-info: #2196F3;

/* Neutral Colors */
--color-background: #F5F5F5;
--color-surface: #FFFFFF;
--color-text-primary: #212121;
--color-text-secondary: #757575;
--color-border: #E0E0E0;
```

### 7.2 Typography
```css
--font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 7.3 Spacing
```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
```

### 7.4 Border Radius
```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-full: 9999px;
```

### 7.5 Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

---

## 8. Configuration

Key configuration options in `configs/config.yaml`:

```yaml
alerts:
  warranty_alert_days: 90      # Days before warranty expiry to alert
  lease_alert_days: 120        # Days before lease expiry to alert
  trade_in_threshold: 0.75     # Lifecycle % to trigger trade-in alert
  high_risk_threshold: 0.6     # Risk score threshold for high-risk alerts

lifecycle:
  model_version: "1.0.0"
  min_age_days: 180            # Minimum age for predictions
  min_confidence: 0.5          # Minimum confidence to display predictions
```

---

## 9. Performance Requirements

| Metric | Requirement |
|--------|-------------|
| Equipment capacity | 10,000+ equipment items across 1,000+ customers |
| Alert generation | Process all equipment in <1 hour |
| Dashboard load time | <3 seconds for accounts with 50+ equipment items |
| Concurrent users | Support 100+ concurrent users |
| API response time | <500ms for standard queries |
| Uptime | 99.5% availability |

---

## 10. Security Requirements

- Integration with Active Directory for SSO authentication
- Role-based access control (Sales Rep, Account Manager, Sales Manager, Admin)
- Data access restricted by account ownership/territory
- Audit logging for all data access and actions
- Data encryption at rest and in transit
- Session timeout after 30 minutes of inactivity
- API rate limiting (1000 requests/hour per user)

---

## 11. Project Structure

```
equipment-lifecycle-tracking/
├── src/
│   ├── __init__.py
│   ├── models/                 # Data models and schemas
│   │   ├── __init__.py
│   │   └── schemas.py
│   ├── data_integration/       # Data extraction from source systems
│   │   ├── __init__.py
│   │   └── equipment_extractor.py
│   ├── lifecycle/              # Lifecycle prediction engine
│   │   ├── __init__.py
│   │   ├── stages.py
│   │   └── predictor.py
│   ├── alerts/                 # Alert generation system
│   │   ├── __init__.py
│   │   └── notifier.py
│   ├── dashboard/              # Dashboard data builder
│   │   ├── __init__.py
│   │   └── sales_ui.py
│   └── api/                    # REST API endpoints
│       ├── __init__.py
│       └── routes.py
├── tests/
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_lifecycle.py
│   ├── test_alerts.py
│   └── test_api.py
├── configs/
│   └── config.yaml
├── requirements.txt
└── README.md
```

---

## 12. Development

### 12.1 Prerequisites
- Python 3.9+
- pip package manager

### 12.2 Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export NAI_API_KEY="your-api-key"
export NAI_BASE_URL="https://nai.hpoc.nutanix.com:443/api"

# Configure the application
cp configs/config.yaml configs/config.local.yaml
# Edit configs/config.local.yaml with your settings
```

### 12.3 Running in Development Mode
```bash
# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn src.api.routes:app --reload --log-level debug
```

### 12.4 Running the API Server
```bash
# Start the FastAPI server
uvicorn src.api.routes:app --reload --host 0.0.0.0 --port 8000
```

API Documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 12.5 Code Style
- **Black** for code formatting
- **Flake8** for linting
- **MyPy** for type checking

```bash
# Format code
black src/ tests/

# Run linter
flake8 src/ tests/

# Run type checker
mypy src/
```

---

## 13. Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_lifecycle.py
```

---

## 14. Roadmap

### Phase 1 (Current)
- [x] Core lifecycle prediction engine
- [x] Alert generation system
- [x] Basic REST API
- [x] Mock data for development

### Phase 2
- [ ] Real-time integration with source systems
- [ ] Conversation analysis for buying signals
- [ ] Enhanced ML-based predictions
- [ ] Production database implementation

### Phase 3
- [ ] Advanced analytics and reporting
- [ ] Mobile-responsive dashboard
- [ ] Customer-facing portal
- [ ] Equipment valuation models

---

## 15. Success Criteria

| Criteria | Target | Measurement |
|----------|--------|-------------|
| Alert accuracy | >90% | % of alerts that lead to valid opportunities |
| User adoption | >80% | % of sales reps using system weekly |
| Time savings | 30% | Reduction in equipment research time |
| Revenue impact | +15% | Increase in trade-in revenue |

---

## 16. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data quality issues from source systems | High | Medium | Implement data validation and cleansing |
| User adoption resistance | Medium | Medium | Provide training and demonstrate value |
| Integration delays with legacy systems | High | High | Build mock data layer for parallel development |
| Prediction accuracy below threshold | High | Low | Continuous model retraining with feedback loop |

---

## 17. Appendix

### A. Glossary
- **Lifecycle Stage**: Classification of equipment based on age relative to expected lifespan
- **Risk Score**: 0-1 value indicating probability of equipment failure
- **Trade-In Window**: Optimal time period for equipment replacement
- **Buying Signal**: Customer behavior indicating purchase intent

### B. References
- PRD Location: `02-requirements/prds/UC-006-equipment-lifecycle-tracking.md`
- Design Tokens: `shared/pattison.css`

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Feb 2026 | Pattison AG Team | Initial PRD |
