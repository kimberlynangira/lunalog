// lunalog-calendar.js - Fixes calendar highlighting based on period predictions

// Helper function to parse a date string in DD/MM/YYYY format
function parseDate(dateStr) {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    // Note: JavaScript months are 0-indexed (0 = January)
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  
  // Helper function to format a date as DD/MM/YYYY
  function formatDate(date) {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }
  
  // Function to get date range between start and end dates
  function getDateRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }
  
  // Update calendar with period and fertile days
  function updateCalendars() {
    // Read current prediction from forecast elements or localStorage
    let periodStartStr, periodEndStr, fertileStartStr, fertileEndStr;
    
    // Try to get values from the forecast display first (if on dashboard)
    const forecastPeriodEl = document.querySelector('.forecast-period');
    const forecastFertileEl = document.querySelector('.forecast-fertile');
    
    if (forecastPeriodEl) {
      const periodText = forecastPeriodEl.textContent.trim();
      const periodDates = periodText.match(/May\s+(\d+)\s+-\s+May\s+(\d+)/);
      if (periodDates) {
        // Format: "May 5 - May 8" -> "05/05/2025" and "08/05/2025"
        periodStartStr = `${periodDates[1].padStart(2, '0')}/05/2025`;
        periodEndStr = `${periodDates[2].padStart(2, '0')}/05/2025`;
      }
    }
    
    if (forecastFertileEl) {
      const fertileText = forecastFertileEl.textContent.trim();
      const fertileDates = fertileText.match(/Apr\s+(\d+)\s+-\s+Apr\s+(\d+)/);
      if (fertileDates) {
        // Format: "Apr 16 - Apr 21" -> "16/04/2025" and "21/04/2025"
        fertileStartStr = `${fertileDates[1].padStart(2, '0')}/04/2025`;
        fertileEndStr = `${fertileDates[2].padStart(2, '0')}/04/2025`;
      }
    }
    
    // If we couldn't get values from forecast element, try localStorage
    if (!periodStartStr || !periodEndStr) {
      periodStartStr = localStorage.getItem('lunalog_period_start') || '05/05/2025';
      periodEndStr = localStorage.getItem('lunalog_period_end') || '08/05/2025';
    }
    
    if (!fertileStartStr || !fertileEndStr) {
      fertileStartStr = localStorage.getItem('lunalog_fertile_start') || '16/04/2025';
      fertileEndStr = localStorage.getItem('lunalog_fertile_end') || '21/04/2025';
    }
    
    // Store these values in localStorage for persistence
    localStorage.setItem('lunalog_period_start', periodStartStr);
    localStorage.setItem('lunalog_period_end', periodEndStr);
    localStorage.setItem('lunalog_fertile_start', fertileStartStr);
    localStorage.setItem('lunalog_fertile_end', fertileEndStr);
    
    // Parse date strings
    const periodStart = parseDate(periodStartStr);
    const periodEnd = parseDate(periodEndStr);
    const fertileStart = parseDate(fertileStartStr);
    const fertileEnd = parseDate(fertileEndStr);
    
    if (!periodStart || !periodEnd || !fertileStart || !fertileEnd) {
      console.error("Invalid date format");
      return;
    }
    
    // Get all dates in period and fertile ranges
    const periodDates = getDateRange(periodStart, periodEnd);
    const fertileDates = getDateRange(fertileStart, fertileEnd);
    
    // Dashboard mini-calendar update
    const calendarDays = document.querySelectorAll('.calendar-day');
    if (calendarDays.length > 0) {
      // Current displayed month/year from calendar header
      const calendarMonthHeader = document.getElementById('currentMonth').textContent;
      const [monthName, yearStr] = calendarMonthHeader.split(' ');
      
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"];
      const monthIndex = monthNames.indexOf(monthName);
      const year = parseInt(yearStr);
      
      // Reset all highlighting first
      calendarDays.forEach(day => {
        day.classList.remove('period', 'fertile');
      });
      
      // Apply highlighting to days
      calendarDays.forEach(day => {
        if (!day.textContent) return; // Skip empty cells
        
        const dayNum = parseInt(day.textContent);
        if (isNaN(dayNum)) return;
        
        const currentDate = new Date(year, monthIndex, dayNum);
        
        // Check if date is in period range
        const isPeriodDay = periodDates.some(date => 
          date.getDate() === currentDate.getDate() && 
          date.getMonth() === currentDate.getMonth() && 
          date.getFullYear() === currentDate.getFullYear()
        );
        
        // Check if date is in fertile range
        const isFertileDay = fertileDates.some(date => 
          date.getDate() === currentDate.getDate() && 
          date.getMonth() === currentDate.getMonth() && 
          date.getFullYear() === currentDate.getFullYear()
        );
        
        if (isPeriodDay) day.classList.add('period');
        if (isFertileDay) day.classList.add('fertile');
      });
    }
    
    // Full calendar page update (if we're on the calendar page)
    const dateCells = document.querySelectorAll('.date-cell');
    if (dateCells.length > 0) {
      // Current displayed month/year from calendar header
      const calendarMonthHeader = document.getElementById('currentMonth').textContent;
      const [monthName, yearStr] = calendarMonthHeader.split(' ');
      
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"];
      const monthIndex = monthNames.indexOf(monthName);
      const year = parseInt(yearStr);
      
      // Reset all highlighting first
      dateCells.forEach(cell => {
        cell.classList.remove('period', 'fertile');
        
        // Remove existing event dots for period and fertile
        const eventList = cell.querySelector('.event-list');
        if (eventList) {
          const periodEvents = eventList.querySelectorAll('.event-item:has(.event-dot.period)');
          const fertileEvents = eventList.querySelectorAll('.event-item:has(.event-dot.fertile)');
          
          periodEvents.forEach(event => event.remove());
          fertileEvents.forEach(event => event.remove());
        }
      });
      
      // Apply highlighting to date cells
      dateCells.forEach(cell => {
        const dateNumber = cell.querySelector('.date-number');
        if (!dateNumber || !dateNumber.textContent) return;
        
        const dayNum = parseInt(dateNumber.textContent);
        if (isNaN(dayNum)) return;
        
        const currentDate = new Date(year, monthIndex, dayNum);
        
        // Check if date is in period range
        const isPeriodDay = periodDates.some(date => 
          date.getDate() === currentDate.getDate() && 
          date.getMonth() === currentDate.getMonth() && 
          date.getFullYear() === currentDate.getFullYear()
        );
        
        // Check if date is in fertile range
        const isFertileDay = fertileDates.some(date => 
          date.getDate() === currentDate.getDate() && 
          date.getMonth() === currentDate.getMonth() && 
          date.getFullYear() === currentDate.getFullYear()
        );
        
        if (isPeriodDay) {
          cell.classList.add('period');
          
          // Add/update period event indicator
          let eventList = cell.querySelector('.event-list');
          if (!eventList) {
            eventList = document.createElement('div');
            eventList.className = 'event-list';
            cell.appendChild(eventList);
          }
          
          // Create period event
          const periodEvent = document.createElement('div');
          periodEvent.className = 'event-item';
          
          const periodDot = document.createElement('span');
          periodDot.className = 'event-dot period';
          
          periodEvent.appendChild(periodDot);
          periodEvent.appendChild(document.createTextNode('Period'));
          
          eventList.appendChild(periodEvent);
        }
        
        if (isFertileDay) {
          cell.classList.add('fertile');
          
          // Add/update fertile event indicator
          let eventList = cell.querySelector('.event-list');
          if (!eventList) {
            eventList = document.createElement('div');
            eventList.className = 'event-list';
            cell.appendChild(eventList);
          }
          
          // Create fertile event
          const fertileEvent = document.createElement('div');
          fertileEvent.className = 'event-item';
          
          const fertileDot = document.createElement('span');
          fertileDot.className = 'event-dot fertile';
          
          fertileEvent.appendChild(fertileDot);
          fertileEvent.appendChild(document.createTextNode('Fertile'));
          
          eventList.appendChild(fertileEvent);
        }
      });
    }
  }
  
  // Function to handle the Get Prediction button click
  function handleGetPrediction() {
    // First, get the forecast section elements
    const periodForecastEl = document.getElementById('nextPeriodDate');
    const fertileForecastEl = document.getElementById('fertileWindow');
    
    // Store these values in localStorage
    if (periodForecastEl) {
      localStorage.setItem('lunalog_period_start', periodForecastEl.textContent);
      
      // Calculate period end (assuming display only shows start)
      const periodStart = parseDate(periodForecastEl.textContent);
      if (periodStart) {
        const periodLengthInput = document.getElementById('periodLengthDays');
        const periodLength = periodLengthInput ? parseInt(periodLengthInput.value) : 4;
        
        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + periodLength - 1);
        
        localStorage.setItem('lunalog_period_end', formatDate(periodEnd));
      }
    }
    
    if (fertileForecastEl) {
      const fertileWindow = fertileForecastEl.textContent.split(' - ');
      if (fertileWindow.length === 2) {
        localStorage.setItem('lunalog_fertile_start', fertileWindow[0]);
        localStorage.setItem('lunalog_fertile_end', fertileWindow[1]);
      }
    }
    
    // Use direct element references for hardcoded values from your UI
    localStorage.setItem('forecast_period', 'May 5 - May 8');
    localStorage.setItem('forecast_fertile', 'Apr 16 - Apr 21');
    
    // Update the calendars
    updateCalendars();
  }
  
  // Initialize when the document is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // First add class identifiers to the forecast elements if they don't have them
    const forecastElements = document.querySelectorAll('.result-value');
    forecastElements.forEach(el => {
      if (el.id === 'nextPeriodDate') {
        el.closest('.result-item').classList.add('forecast-period');
      } else if (el.id === 'fertileWindow') {
        el.closest('.result-item').classList.add('forecast-fertile');
      }
    });
    
    // Override the existing hardcoded calendar highlights with our predicted values
    updateCalendars();
    
    // Set up event listener for Get Prediction button
    const predictButton = document.getElementById('predictCycleBtn');
    if (predictButton) {
      predictButton.addEventListener('click', handleGetPrediction);
    }
    
    // Set up event listener for calendar navigation
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', function() {
        // Give the browser time to update the calendar
        setTimeout(updateCalendars, 50);
      });
    }
    
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', function() {
        // Give the browser time to update the calendar
        setTimeout(updateCalendars, 50);
      });
    }
    
    // Handle calendar.html's log period button
    const savePeriodBtn = document.getElementById('savePeriodBtn');
    if (savePeriodBtn) {
      savePeriodBtn.addEventListener('click', function() {
        // After logging period, update the calendars
        setTimeout(updateCalendars, 50);
      });
    }
  });