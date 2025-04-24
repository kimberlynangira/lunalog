// browser-predict.js - Client-side prediction model for the LunaLog Period Tracker

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the simplified prediction model
    const predictor = createSimplifiedPredictor();
    
    // Set up the prediction form handler
    const predictionForm = document.getElementById('prediction-form');
    if (predictionForm) {
        predictionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading indicator
            const loadingIndicator = document.getElementById('loading-indicator');
            loadingIndicator.style.display = 'block';
            
            // Get form values
            const lastPeriodDate = new Date(document.getElementById('lastPeriodDate').value);
            const cycleLength = parseInt(document.getElementById('cycleLength').value);
            const periodLength = parseInt(document.getElementById('periodLength').value);
            
            // Simulate delay to represent AI processing
            setTimeout(() => {
                // Make prediction
                const prediction = predictor.predict(lastPeriodDate, cycleLength, periodLength);
                
                // Update UI with results
                updatePredictionResults(prediction);
                
                // Update calendar with predictions
                updateCalendarWithPredictions(prediction);
                
                // Hide loading indicator
                loadingIndicator.style.display = 'none';
            }, 1500);
        });
    }
});

/**
 * Creates a simplified predictor for client-side use
 * @returns {Object} - Simplified predictor object
 */
function createSimplifiedPredictor() {
    return {
        predict: function(lastPeriodDate, cycleLength = 28, periodLength = 5) {
            // Adjust cycle length slightly to simulate natural variation
            const adjustedCycleLength = cycleLength + (Math.random() > 0.5 ? 1 : -1);
            
            // Calculate next period start date
            const nextPeriodStart = new Date(lastPeriodDate);
            nextPeriodStart.setDate(lastPeriodDate.getDate() + adjustedCycleLength);
            
            // Calculate next period end date
            const nextPeriodEnd = new Date(nextPeriodStart);
            nextPeriodEnd.setDate(nextPeriodStart.getDate() + periodLength - 1);
            
            // Calculate ovulation day (approximately 14 days before next period)
            const ovulationDay = new Date(nextPeriodStart);
            ovulationDay.setDate(nextPeriodStart.getDate() - 14);
            
            // Calculate fertile window (5 days before ovulation and ovulation day)
            const fertileWindowStart = new Date(ovulationDay);
            fertileWindowStart.setDate(ovulationDay.getDate() - 5);
            
            const fertileWindowEnd = new Date(ovulationDay);
            
            // Generate recommendations
            const recommendations = this.generateRecommendations(cycleLength, periodLength);
            
            return {
                predictedCycleLength: adjustedCycleLength,
                predictedPeriodLength: periodLength,
                nextPeriodStart,
                nextPeriodEnd,
                ovulationDay,
                fertileWindowStart,
                fertileWindowEnd,
                recommendations
            };
        },
        
        generateRecommendations: function(cycleLength, periodLength) {
            const recommendations = [
                {
                    icon: '🧘',
                    text: 'Consider practicing stress-reduction techniques 3-5 days before your period to help manage PMS symptoms.'
                },
                {
                    icon: '🍎',
                    text: 'Increase iron-rich foods during your period to help with energy levels and potential blood loss.'
                },
                {
                    icon: '🏃‍♀️',
                    text: 'Light to moderate exercise during your period can help reduce discomfort and improve mood.'
                }
            ];
            
            // Add cycle-specific recommendations
            if (cycleLength < 25) {
                recommendations.push({
                    icon: '📝',
                    text: 'Your cycle is shorter than average. This is normal for some women, but track any changes over time.'
                });
            } else if (cycleLength > 35) {
                recommendations.push({
                    icon: '📝',
                    text: 'Your cycle is longer than average. Consider consulting with a healthcare provider if this is a recent change.'
                });
            }
            
            // Add period-specific recommendations
            if (periodLength > 7) {
                recommendations.push({
                    icon: '⚕️',
                    text: 'Your period length is longer than average. If you experience heavy bleeding, consider consulting with a healthcare provider.'
                });
            }
            
            return recommendations;
        }
    };
}

/**
 * Updates the prediction results section with calculated dates
 * @param {Object} prediction - Object containing prediction data
 */
function updatePredictionResults(prediction) {
    // Format dates for display
    const nextPeriodStartFormatted = formatDate(prediction.nextPeriodStart);
    const nextPeriodEndFormatted = formatDate(prediction.nextPeriodEnd);
    const fertileWindowStartFormatted = formatDate(prediction.fertileWindowStart);
    const fertileWindowEndFormatted = formatDate(prediction.fertileWindowEnd);
    
    // Update the result container
    document.getElementById('next-period-date').textContent = `${nextPeriodStartFormatted} - ${nextPeriodEndFormatted}`;
    document.getElementById('fertile-window').textContent = `${fertileWindowStartFormatted} - ${fertileWindowEndFormatted}`;
    
    // Update recommendations
    const recommendationsList = document.getElementById('recommendations');
    recommendationsList.innerHTML = ''; // Clear existing recommendations
    
    prediction.recommendations.forEach(recommendation => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerHTML = `<span class="stress-icon">${recommendation.icon}</span> ${recommendation.text}`;
        recommendationsList.appendChild(listItem);
    });
    
    // Show the result container
    document.getElementById('prediction-result').style.display = 'block';
}

/**
 * Updates the calendar with predicted period and fertility days
 * @param {Object} prediction - Object containing prediction data
 */
function updateCalendarWithPredictions(prediction) {
    // Get current displayed month and year from the calendar
    const monthYearText = document.getElementById('current-month-year').textContent;
    const [monthName, year] = monthYearText.split(' ');
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames.indexOf(monthName);
    
    // Re-render the calendar with prediction data
    renderCalendar(month, parseInt(year), prediction);
}

/**
 * Formats a Date object to a human-readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date)