/**
 * Lifecycle Prediction Engine
 * Uses Ralph Wiggum Loop Framework for all data processing
 *
 * "Me fail predictions? That's unpossible!" - Ralph Wiggum
 */

const LifecycleEngine = (() => {
  /**
   * Calculate lifecycle percentage for a single equipment
   * Based on age and usage hours
   */
  const calculateLifecyclePercentage = (equipment) => {
    const agePercentage = (equipment.ageYears / equipment.expectedLifeYears) * 100;
    const hoursPercentage = (equipment.currentHours / equipment.expectedHours) * 100;

    // Weighted average: 40% age, 60% hours (usage is more indicative)
    return (agePercentage * 0.4) + (hoursPercentage * 0.6);
  };

  /**
   * Determine lifecycle stage from percentage
   */
  const getStageFromPercentage = (percentage) => {
    if (percentage < 20) return LifecycleStage.NEW;
    if (percentage < 50) return LifecycleStage.GROWTH;
    if (percentage < 80) return LifecycleStage.MATURE;
    if (percentage < 100) return LifecycleStage.DECLINE;
    return LifecycleStage.EOL;
  };

  /**
   * Calculate failure risk score (0-1)
   * Based on age, usage, and service history
   */
  const calculateRiskScore = (equipment) => {
    // Base risk from lifecycle percentage
    const lifecyclePct = calculateLifecyclePercentage(equipment);
    let riskScore = Math.min(lifecyclePct / 100, 1) * 0.5;

    // Additional risk from overuse
    if (lifecyclePct > 100) {
      riskScore += 0.2;
    }

    // Risk reduction from recent service
    if (equipment.lastServiceDate) {
      const daysSinceService = (new Date() - new Date(equipment.lastServiceDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceService < 90) {
        riskScore -= 0.1;
      } else if (daysSinceService > 365) {
        riskScore += 0.15;
      }
    }

    // Service history factor
    const servicesPerYear = equipment.serviceHistory.length / Math.max(equipment.ageYears, 1);
    if (servicesPerYear < 1) {
      riskScore += 0.1; // Under-maintained
    }

    return Math.max(0, Math.min(1, riskScore));
  };

  /**
   * Calculate optimal trade-in timing
   */
  const calculateTradeInTiming = (equipment) => {
    const lifecyclePct = calculateLifecyclePercentage(equipment);
    const stage = getStageFromPercentage(lifecyclePct);

    let recommendation = {
      shouldTradeIn: false,
      urgency: 'low',
      reason: '',
      optimalWindow: null
    };

    if (lifecyclePct >= 75 && lifecyclePct < 90) {
      recommendation = {
        shouldTradeIn: true,
        urgency: 'medium',
        reason: 'Optimal trade-in window - maximize resale value',
        optimalWindow: 'Now - 6 months'
      };
    } else if (lifecyclePct >= 90) {
      recommendation = {
        shouldTradeIn: true,
        urgency: 'high',
        reason: 'Equipment approaching end of life - trade in soon',
        optimalWindow: 'Immediate'
      };
    } else if (lifecyclePct >= 60) {
      const monthsToOptimal = Math.round(((75 - lifecyclePct) / 100) * equipment.expectedLifeYears * 12);
      recommendation = {
        shouldTradeIn: false,
        urgency: 'low',
        reason: 'Equipment in good condition',
        optimalWindow: `${monthsToOptimal} months`
      };
    }

    return recommendation;
  };

  /**
   * RALPH LOOP: Predict lifecycles for all equipment
   * Uses chooChooLoop for standard iteration with encouragement
   */
  const predictAllLifecycles = (equipmentList) => {
    console.log("🚜 Starting Lifecycle Prediction Engine...");
    const predictions = [];

    RalphWiggumLoop.chooChooLoop(equipmentList, (equipment, index) => {
      const lifecyclePct = calculateLifecyclePercentage(equipment);
      const stage = getStageFromPercentage(lifecyclePct);
      const riskScore = calculateRiskScore(equipment);
      const tradeIn = calculateTradeInTiming(equipment);

      predictions.push({
        equipmentId: equipment.id,
        customerId: equipment.customerId,
        model: equipment.model,
        lifecyclePercentage: Math.round(lifecyclePct * 10) / 10,
        currentStage: stage,
        riskScore: Math.round(riskScore * 100) / 100,
        failureRiskLevel: riskScore >= 0.6 ? 'high' : riskScore >= 0.3 ? 'medium' : 'low',
        tradeInRecommendation: tradeIn,
        confidence: calculateConfidence(equipment),
        predictedAt: new Date().toISOString()
      });
    });

    return predictions;
  };

  /**
   * RALPH LOOP: Batch process equipment using learnding loop
   * Returns transformed data with educational commentary
   */
  const batchLearnEquipment = (equipmentList) => {
    console.log("📚 Learning about equipment lifecycles...");

    return RalphWiggumLoop.learnding(equipmentList, (equipment) => {
      return {
        id: equipment.id,
        summary: `${equipment.model} - ${Math.round(calculateLifecyclePercentage(equipment))}% lifecycle`,
        stage: getStageFromPercentage(calculateLifecyclePercentage(equipment)).label,
        risk: calculateRiskScore(equipment) >= 0.6 ? 'High Risk' : 'Normal'
      };
    });
  };

  /**
   * RALPH LOOP: Idaho transformation - aggregate equipment by stage
   * Uses reduce-like processing with identity transformation
   */
  const aggregateByStage = (predictions) => {
    console.log("🥔 Aggregating equipment by lifecycle stage...");

    const initialState = {
      new: [],
      growth: [],
      mature: [],
      decline: [],
      eol: []
    };

    return RalphWiggumLoop.idahoLoop(
      predictions,
      (state, prediction) => {
        const stageId = prediction.currentStage.id;
        state[stageId].push(prediction);
        return state;
      },
      initialState
    );
  };

  /**
   * RALPH LOOP: Bent Wookiee processing - prioritize middle-lifecycle equipment
   * Equipment in mature stage gets processed first (trade-in opportunities)
   */
  const prioritizeTradeInOpportunities = (equipmentList, callback) => {
    console.log("🐻 Prioritizing trade-in opportunities (bent order)...");

    // Sort by lifecycle percentage (closest to 75% first)
    const sorted = [...equipmentList].sort((a, b) => {
      const aPct = calculateLifecyclePercentage(a);
      const bPct = calculateLifecyclePercentage(b);
      const aDistance = Math.abs(aPct - 75);
      const bDistance = Math.abs(bPct - 75);
      return aDistance - bDistance;
    });

    RalphWiggumLoop.bentWookieeLoop(sorted, callback);
  };

  /**
   * RALPH LOOP: Nose picker - sample equipment for quick analysis
   * When we don't need to analyze everything
   */
  const sampleAnalysis = (equipmentList, sampleRate = 0.3) => {
    console.log("👃 Sampling equipment for quick analysis...");

    const sampled = [];
    RalphWiggumLoop.nosePickerLoop(equipmentList, (equipment) => {
      sampled.push({
        id: equipment.id,
        model: equipment.model,
        lifecyclePct: calculateLifecyclePercentage(equipment),
        risk: calculateRiskScore(equipment)
      });
    }, sampleRate);

    return sampled;
  };

  /**
   * RALPH LOOP: Super Nintendo Chalmers - validate predictions
   * Only process equipment that meets minimum confidence threshold
   */
  const validatePredictions = (predictions) => {
    console.log("👨‍💼 Validating predictions with authority...");

    const validator = (prediction) => {
      return prediction.confidence >= Config.lifecycle.minConfidence;
    };

    return RalphWiggumLoop.superNintendoLoop(
      predictions,
      validator,
      (prediction) => {
        // Mark as validated
        prediction.validated = true;
      }
    );
  };

  /**
   * Calculate prediction confidence based on data quality
   */
  const calculateConfidence = (equipment) => {
    let confidence = 0.5; // Base confidence

    // More service history = higher confidence
    if (equipment.serviceHistory.length > 5) {
      confidence += 0.2;
    } else if (equipment.serviceHistory.length > 2) {
      confidence += 0.1;
    }

    // Equipment with more age has more data points
    if (equipment.ageYears > 2) {
      confidence += 0.15;
    }

    // Recent data is more reliable
    if (equipment.lastServiceDate) {
      const daysSince = (new Date() - new Date(equipment.lastServiceDate)) / (1000 * 60 * 60 * 24);
      if (daysSince < 180) {
        confidence += 0.15;
      }
    }

    return Math.min(1, confidence);
  };

  /**
   * Get stage distribution summary
   */
  const getStageDistribution = (predictions) => {
    const distribution = {
      new: 0,
      growth: 0,
      mature: 0,
      decline: 0,
      eol: 0
    };

    predictions.forEach(p => {
      distribution[p.currentStage.id]++;
    });

    return distribution;
  };

  /**
   * Get risk distribution summary
   */
  const getRiskDistribution = (predictions) => {
    return {
      high: predictions.filter(p => p.failureRiskLevel === 'high').length,
      medium: predictions.filter(p => p.failureRiskLevel === 'medium').length,
      low: predictions.filter(p => p.failureRiskLevel === 'low').length
    };
  };

  // Public API
  return {
    calculateLifecyclePercentage,
    getStageFromPercentage,
    calculateRiskScore,
    calculateTradeInTiming,
    predictAllLifecycles,
    batchLearnEquipment,
    aggregateByStage,
    prioritizeTradeInOpportunities,
    sampleAnalysis,
    validatePredictions,
    calculateConfidence,
    getStageDistribution,
    getRiskDistribution
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LifecycleEngine };
}
