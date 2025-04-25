// script.js - Main JavaScript for LunaLog Period Tracker

document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default for all date inputs
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.value = formattedDate;
    });

    // Initialize calendar
    window.currentMonth = today.getMonth();
    window.currentYear = today.getFullYear();
    
    // Initialize calendar data with fixed dates
    // This would normally come from the database in a real app
    window.calendarData = {
        // Period days - May 5-8, 2025
        periodDays: [
            new Date(2025, 4, 5),
            new Date(2025, 4, 6),
            new Date(2025, 4, 7),
            new Date(2025, 4, 8)
        ],
        // Fertile window - April 16-21, 2025
        fertileDays: [
            new Date(2025, 3, 16),
            new Date(2025, 3, 17),
            new Date(2025, 3, 18),
            new Date(2025, 3, 19),
            new Date(2025, 3, 20),
            new Date(2025, 3, 21)
        ],
        // Ovulation day - April 19, 2025
        ovulationDay: new Date(2025, 3, 19)
    };
    
    renderCalendar(window.currentMonth, window.currentYear);

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
        
        // Update the global calendar data to use for highlighting
        window.calendarData = {
            periodDays: getDateArray(prediction.nextPeriodStart, prediction.nextPeriodEnd),
            fertileDays: getDateArray(prediction.fertileWindowStart, prediction.fertileWindowEnd),
            ovulationDay: prediction.ovulationDay
        };
        
        // Update calendar with predictions
        renderCalendar(window.currentMonth, window.currentYear);
    }, 1500); // Simulating AI processing time of 1.5 seconds
}

/**
 * Creates an array of Date objects between start and end dates, inclusive
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} - Array of Date objects
 */
function getDateArray(startDate, endDate) {
    const dateArray = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dateArray;
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
 */
function renderCalendar(month, year) {
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
            cell.className = 'text-center';
            
            if ((i === 0 && j < startingDay) || date > daysInMonth) {
                // Empty cell before the first day of the month
                cell.innerHTML = '';
            } else {
                // Create date cell with proper structure for styling
                const currentDate = new Date(year, month, date);
                const dayDiv = document.createElement('div');
                dayDiv.className = 'd-flex justify-content-center align-items-center';
                dayDiv.style.height = '2rem';
                dayDiv.style.width = '2rem';
                dayDiv.style.margin = '0 auto';
                dayDiv.textContent = date;
                
                // Highlight today's date
                const today = new Date();
                if (currentDate.getDate() === today.getDate() && 
                    currentDate.getMonth() === today.getMonth() && 
                    currentDate.getFullYear() === today.getFullYear()) {
                    dayDiv.classList.add('current-day');
                }
                
                // Highlight period, fertile, and ovulation days
                if (window.calendarData) {
                    // Check if this date is a period day
                    if (isPeriodDay(currentDate, window.calendarData.periodDays)) {
                        dayDiv.classList.add('period-day');
                    }
                    
                    // Check if this date is a fertile day
                    if (isFertileDay(currentDate, window.calendarData.fertileDays)) {
                        dayDiv.classList.add('fertile-day');
                    }
                    
                    // Check if this date is ovulation day
                    if (isOvulationDay(currentDate, window.calendarData.ovulationDay)) {
                        dayDiv.classList.add('ovulation-day');
                    }
                }
                
                cell.appendChild(dayDiv);
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
 * Helper function to check if a date is a period day
 * @param {Date} date - Date to check
 * @param {Array} periodDays - Array of period day dates
 * @returns {boolean} - True if the date is a period day
 */
function isPeriodDay(date, periodDays) {
    if (!periodDays) return false;
    return periodDays.some(periodDay => 
        periodDay.getDate() === date.getDate() && 
        periodDay.getMonth() === date.getMonth() && 
        periodDay.getFullYear() === date.getFullYear()
    );
}

/**
 * Helper function to check if a date is a fertile day
 * @param {Date} date - Date to check
 * @param {Array} fertileDays - Array of fertile day dates
 * @returns {boolean} - True if the date is a fertile day
 */
function isFertileDay(date, fertileDays) {
    if (!fertileDays) return false;
    return fertileDays.some(fertileDay => 
        fertileDay.getDate() === date.getDate() && 
        fertileDay.getMonth() === date.getMonth() && 
        fertileDay.getFullYear() === date.getFullYear()
    );
}

/**
 * Helper function to check if a date is ovulation day
 * @param {Date} date - Date to check
 * @param {Date} ovulationDay - Ovulation day date
 * @returns {boolean} - True if the date is ovulation day
 */
function isOvulationDay(date, ovulationDay) {
    if (!ovulationDay) return false;
    return date.getDate() === ovulationDay.getDate() && 
           date.getMonth() === ovulationDay.getMonth() && 
           date.getFullYear() === ovulationDay.getFullYear();
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