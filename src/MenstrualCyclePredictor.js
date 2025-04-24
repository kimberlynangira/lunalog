/**
 * SimplifiedMenstrualCyclePredictor class 
 * A non-TensorFlow based implementation that uses statistical averages
 * to predict menstrual cycles
 */
class SimplifiedMenstrualCyclePredictor {
    constructor() {
      console.log('Simplified Menstrual Cycle Predictor initialized');
    }
  
    /**
     * Predict the next cycle based on historical data
     * @param {Array} historicalData - User's historical cycle data
     * @returns {Object} - Prediction results
     */
    async predictNextCycle(historicalData) {
      // Default values
      let averageCycleLength = 28;
      let averagePeriodLength = 5;
      
      // Calculate averages if we have enough data
      if (historicalData.length >= 2) {
        // Calculate cycle lengths
        let cycleLengthsSum = 0;
        let cycleLengthsCount = 0;
        
        for (let i = 1; i < historicalData.length; i++) {
          const current = new Date(historicalData[i].startDate);
          const previous = new Date(historicalData[i-1].startDate);
          const days = Math.round((current - previous) / (1000 * 60 * 60 * 24));
          
          // Only count reasonable cycle lengths
          if (days >= 21 && days <= 40) {
            cycleLengthsSum += days;
            cycleLengthsCount++;
          }
        }
        
        if (cycleLengthsCount > 0) {
          averageCycleLength = Math.round(cycleLengthsSum / cycleLengthsCount);
        }
        
        // Calculate period lengths
        let periodLengthsSum = 0;
        let periodLengthsCount = 0;
        
        for (const period of historicalData) {
          if (period.duration) {
            // Only count reasonable period lengths
            if (period.duration >= 2 && period.duration <= 10) {
              periodLengthsSum += period.duration;
              periodLengthsCount++;
            }
          }
        }
        
        if (periodLengthsCount > 0) {
          averagePeriodLength = Math.round(periodLengthsSum / periodLengthsCount);
        }
      }
      
      // Get the last period start date
      const lastPeriodStart = new Date(historicalData[historicalData.length - 1].startDate);
      
      // Calculate next period start date
      const nextPeriodStart = new Date(lastPeriodStart);
      nextPeriodStart.setDate(lastPeriodStart.getDate() + averageCycleLength);
      
      // Calculate next period end date
      const nextPeriodEnd = new Date(nextPeriodStart);
      nextPeriodEnd.setDate(nextPeriodStart.getDate() + averagePeriodLength - 1);
      
      // Calculate ovulation day (approximately 14 days before next period)
      const ovulationDay = new Date(nextPeriodStart);
      ovulationDay.setDate(nextPeriodStart.getDate() - 14);
      
      // Calculate fertile window (5 days before ovulation and the day of ovulation)
      const fertileWindowStart = new Date(ovulationDay);
      fertileWindowStart.setDate(ovulationDay.getDate() - 5);
      
      const fertileWindowEnd = new Date(ovulationDay);
      
      // Calculate PMS window (7 days before next period)
      const pmsStart = new Date(nextPeriodStart);
      pmsStart.setDate(nextPeriodStart.getDate() - 7);
      
      // Generate recommendations
      const recommendations = [];
      
      // Basic recommendations for everyone
      recommendations.push({
        icon: '🧘',
        text: 'Consider practicing stress-reduction techniques 3-5 days before your period to help manage PMS symptoms.'
      });
      
      recommendations.push({
        icon: '🍎',
        text: 'Increase iron-rich foods during your period to help with energy levels and potential blood loss.'
      });
      
      recommendations.push({
        icon: '🏃‍♀️',
        text: 'Light to moderate exercise during your period can help reduce discomfort and improve mood.'
      });
      
      return {
        predictedCycleLength: averageCycleLength,
        predictedPeriodLength: averagePeriodLength,
        nextPeriodStart,
        nextPeriodEnd,
        ovulationDay,
        fertileWindowStart,
        fertileWindowEnd,
        pmsStart,
        recommendations,
        confidence: historicalData.length >= 3 ? 0.8 : 0.6
      };
    }
  }
  
  module.exports = SimplifiedMenstrualCyclePredictor;