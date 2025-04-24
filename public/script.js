// script.js - Main JavaScript for LunaLog Period Tracker

document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default for all date inputs
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.value = formattedDate;
    });

    // Initialize calendar
    renderCalendar(today.getMonth(), today.getFullYear());

    // Add event listeners
    const predictionForm = document.getElementById('prediction-form');
    if (predictionForm) {
        predictionForm.addEventListener('submit', handlePrediction);
    }

    const prevMonthBtn = document.getElementById('prev-month');
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', handlePrevMonth);
    }

    const nextMonthBtn = document.getElementById('next-month');
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', handleNextMonth);
    }

    // Add other form listeners if these elements exist
    const stressForm = document.getElementById('stress-form');
    if (stressForm) {
        stressForm.addEventListener('submit', handleFormSubmit);
    }

    const dietForm = document.getElementById('diet-form');
    if (dietForm) {
        dietForm.addEventListener('submit', handleFormSubmit);
    }
    
    const exerciseForm = document.getElementById('exercise-form');
    if (exerciseForm) {
        exerciseForm.addEventListener('submit', handleFormSubmit);
    }
    
    const wellnessForm = document.getElementById('wellness-form');
    if (wellnessForm) {
        wellnessForm.addEventListener('submit', handleFormSubmit);
    }

    // Set global variables for calendar navigation
    window.currentMonth = today.getMonth();
    window.currentYear = today.getFullYear();
    
    console.log('LunaLog application loaded successfully');
});

/**
 * Handles the period prediction form submission
 * @param {Event} e - The form submission event
 */
function handlePrediction(e) {
    e.preventDefault();
    console.log('Handling prediction - form submission prevented');
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    
    // Get form values
    const lastPeriodDate = new Date(document.getElementById('lastPeriodDate').value);
    const cycleLength = parseInt(document.getElementById('cycleLength').value);
    const periodLength = parseInt(document.getElementById('periodLength').value);
    
    console.log('Input values:', {
        lastPeriodDate: lastPeriodDate.toDateString(),
        cycleLength,
        periodLength
    });
    
    // Simulate AI processing with setTimeout
    setTimeout(() => {
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // Calculate next cycle dates using the prediction model
        const prediction = predictNextCycle(lastPeriodDate, cycleLength, periodLength);
        console.log('Prediction generated:', prediction);
        
        // Update the UI with prediction results
        updatePredictionResults(prediction);
        
        // Update calendar with predictions
        updateCalendarWithPredictions(prediction);
    }, 1500); // Simulating AI processing time of 1.5 seconds
}

/**
 * Predicts the next menstrual cycle based on the given parameters
 * @param {Date} lastPeriodDate - The start date of the last period
 * @param {number} cycleLength - The average cycle length in days
 * @param {number} periodLength - The average period length in days
 * @returns {Object} - Object containing prediction data
 */
function predictNextCycle(lastPeriodDate, cycleLength, periodLength) {
    // Calculate next period start date
    const nextPeriodStart = new Date(lastPeriodDate);
    nextPeriodStart.setDate(lastPeriodDate.getDate() + cycleLength);
    
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
    
    // Calculate PMS window (7 days before next period)
    const pmsStart = new Date(nextPeriodStart);
    pmsStart.setDate(nextPeriodStart.getDate() - 7);
    
    // Generate AI-powered recommendations based on input and predictions
    const recommendations = generateRecommendations(lastPeriodDate, cycleLength, periodLength);
    
    return {
        nextPeriodStart,
        nextPeriodEnd,
        ovulationDay,
        fertileWindowStart,
        fertileWindowEnd,
        pmsStart,
        recommendations
    };
}

/**
 * Generates personalized recommendations based on user data
 * @param {Date} lastPeriodDate - The start date of the last period
 * @param {number} cycleLength - The average cycle length in days
 * @param {number} periodLength - The average period length in days
 * @returns {Array} - Array of recommendation objects
 */
function generateRecommendations(lastPeriodDate, cycleLength, periodLength) {
    // This is where AI-based personalized recommendations would be generated
    // For now, we'll use a basic set of recommendations based on cycle analysis
    
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
    
    // Add personalized recommendations based on period length
    if (periodLength > 7) {
        recommendations.push({
            icon: '⚕️',
            text: 'Your period length is longer than average. Consider consulting with a healthcare provider.'
        });
    }
    
    // Add personalized recommendations based on cycle length
    if (cycleLength < 24 || cycleLength > 35) {
        recommendations.push({
            icon: '📝',
            text: 'Your cycle length is outside the typical range. Keep tracking to establish your pattern or consult a healthcare provider if concerned.'
        });
    }
    
    return recommendations;
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
    const nextPeriodDateElement = document.getElementById('next-period-date');
    if (nextPeriodDateElement) {
        nextPeriodDateElement.textContent = `${nextPeriodStartFormatted} - ${nextPeriodEndFormatted}`;
    }
    
    const fertileWindowElement = document.getElementById('fertile-window');
    if (fertileWindowElement) {
        fertileWindowElement.textContent = `${fertileWindowStartFormatted} - ${fertileWindowEndFormatted}`;
    }
    
    // Update recommendations
    const recommendationsList = document.getElementById('recommendations');
    if (recommendationsList) {
        recommendationsList.innerHTML = ''; // Clear existing recommendations
        
        prediction.recommendations.forEach(recommendation => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.innerHTML = `<span class="stress-icon">${recommendation.icon}</span> ${recommendation.text}`;
            recommendationsList.appendChild(listItem);
        });
    }
    
    // Show the result container
    const resultContainer = document.getElementById('prediction-result');
    if (resultContainer) {
        resultContainer.style.display = 'block';
    }
}

/**
 * Updates the calendar with predicted period and fertility days
 * @param {Object} prediction - Object containing prediction data
 */
function updateCalendarWithPredictions(prediction) {
    // Re-render the calendar with prediction data
    renderCalendar(window.currentMonth, window.currentYear, prediction);
}

/**
 * Formats a Date object to a human-readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Renders the calendar for a specific month and year
 * @param {number} month - Month to render (0-11)
 * @param {number} year - Year to render
 * @param {Object} prediction - Optional prediction data to highlight days
 */
function renderCalendar(month, year, prediction = null) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // Day of week (0-6)
    
    // Update header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthYearElement = document.getElementById('current-month-year');
    if (monthYearElement) {
        monthYearElement.textContent = `${monthNames[month]} ${year}`;
    }
    
    // Get calendar body
    const calendarBody = document.getElementById('calendar-body');
    if (!calendarBody) return;
    
    calendarBody.innerHTML = '';
    
    // Create calendar rows and cells
    let date = 1;
    for (let i = 0; i < 6; i++) { // Up to 6 rows
        // Create a row
        const row = document.createElement('tr');
        
        // Create cells for this row
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            cell.className = 'text-center p-2';
            
            if (i === 0 && j < startingDay) {
                // Empty cell before the first day of the month
                cell.textContent = '';
            } else if (date > daysInMonth) {
                // Break once we've reached the end of the month
                break;
            } else {
                // Fill with the date
                cell.textContent = date;
                
                // Highlight today's date
                const currentDate = new Date(year, month, date);
                const today = new Date();
                if (currentDate.getDate() === today.getDate() && 
                    currentDate.getMonth() === today.getMonth() && 
                    currentDate.getFullYear() === today.getFullYear()) {
                    cell.classList.add('current-day');
                }
                
                // Highlight predicted days if prediction is available
                if (prediction) {
                    // Check if this date is within the predicted period
                    if (isDateInRange(currentDate, prediction.nextPeriodStart, prediction.nextPeriodEnd)) {
                        cell.classList.add('period-day');
                    }
                    
                    // Check if this date is within the fertile window
                    if (isDateInRange(currentDate, prediction.fertileWindowStart, prediction.fertileWindowEnd)) {
                        cell.classList.add('fertile-day');
                    }
                    
                    // Check if this date is the ovulation day
                    if (isSameDate(currentDate, prediction.ovulationDay)) {
                        cell.classList.add('ovulation-day');
                    }
                }
                
                date++;
            }
            
            row.appendChild(cell);
        }
        
        // Add the row to the calendar body
        calendarBody.appendChild(row);
        
        // Break if we've reached the end of the month
        if (date > daysInMonth) {
            break;
        }
    }
}

/**
 * Checks if a date is within a given range, inclusive
 * @param {Date} date - Date to check
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {boolean} - True if the date is within the range
 */
function isDateInRange(date, startDate, endDate) {
    return date >= startDate && date <= endDate;
}

/**
 * Checks if two dates are the same (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if the dates are the same
 */
function isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

/**
 * Handles navigation to the previous month
 */
function handlePrevMonth() {
    window.currentMonth--;
    if (window.currentMonth < 0) {
        window.currentMonth = 11;
        window.currentYear--;
    }
    renderCalendar(window.currentMonth, window.currentYear);
}

/**
 * Handles navigation to the next month
 */
function handleNextMonth() {
    window.currentMonth++;
    if (window.currentMonth > 11) {
        window.currentMonth = 0;
        window.currentYear++;
    }
    renderCalendar(window.currentMonth, window.currentYear);
}

/**
 * Generic form submission handler for all tracking forms
 * @param {Event} e - The form submission event
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formId = e.target.id;
    console.log(`Form ${formId} submitted`);
    
    // In a real application, this would save the data to the server
    // For now, just show an alert indicating successful submission
    alert(`${formId.split('-')[0].charAt(0).toUpperCase() + formId.split('-')[0].slice(1)} data saved successfully!`);
}