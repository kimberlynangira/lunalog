import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// Data model for a period entry
const defaultPeriodData = {
  periodDays: [],
  symptoms: {},
  notes: {},
  predictions: {
    nextPeriod: null,
    fertileWindow: { start: null, end: null },
    ovulationDay: null
  },
  cycleLength: 28,
  periodLength: 5
};

const CalendarView = () => {
  // State for tracking the current month and year
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [periodData, setPeriodData] = useState(() => {
    // Initialize with data from localStorage or default
    const savedData = localStorage.getItem('lunalog_period_data');
    return savedData ? JSON.parse(savedData) : defaultPeriodData;
  });
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    flow: 'none', // none, light, medium, heavy
    symptoms: [],
    notes: ''
  });
  
  // Common symptoms list
  const symptomOptions = [
    'Cramps', 'Headache', 'Bloating', 'Fatigue', 
    'Mood Swings', 'Breast Tenderness', 'Acne', 'Backache'
  ];

  // Save data to localStorage whenever periodData changes
  useEffect(() => {
    localStorage.setItem('lunalog_period_data', JSON.stringify(periodData));
  }, [periodData]);

  // Get days in a month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get the day of the week the month starts on (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Get month name
  const getMonthName = (month) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
  };

  // Check if a date has period data
  const isPeriodDay = (day) => {
    const dateString = `${currentYear}-${currentMonth + 1}-${day}`;
    return periodData.periodDays.includes(dateString);
  };

  // Check if a date is in the fertile window
  const isFertileDay = (day) => {
    if (!periodData.predictions.fertileWindow.start) return false;
    
    const dateToCheck = new Date(currentYear, currentMonth, day);
    const startDate = new Date(periodData.predictions.fertileWindow.start);
    const endDate = new Date(periodData.predictions.fertileWindow.end);
    
    return dateToCheck >= startDate && dateToCheck <= endDate;
  };

  // Check if a date is the predicted ovulation day
  const isOvulationDay = (day) => {
    if (!periodData.predictions.ovulationDay) return false;
    
    const ovulationDate = new Date(periodData.predictions.ovulationDay);
    return (
      ovulationDate.getDate() === day &&
      ovulationDate.getMonth() === currentMonth &&
      ovulationDate.getFullYear() === currentYear
    );
  };

  // Select a date to log information
  const handleDateSelect = (day) => {
    const selectedDate = `${currentYear}-${currentMonth + 1}-${day}`;
    setSelectedDate(selectedDate);
    
    // If this date already has data, load it for editing
    if (isPeriodDay(day)) {
      const existingFlow = periodData.periodDays.includes(selectedDate) ? 'medium' : 'none';
      const existingSymptoms = periodData.symptoms[selectedDate] || [];
      const existingNotes = periodData.notes[selectedDate] || '';
      
      setNewEntry({
        flow: existingFlow,
        symptoms: existingSymptoms,
        notes: existingNotes
      });
    } else {
      // Reset form for new entry
      setNewEntry({
        flow: 'none',
        symptoms: [],
        notes: ''
      });
    }
    
    setShowEntryForm(true);
  };

  // Save the entry for the selected date
  const saveEntry = () => {
    const updatedPeriodData = { ...periodData };
    
    // Update period days
    if (newEntry.flow !== 'none') {
      if (!updatedPeriodData.periodDays.includes(selectedDate)) {
        updatedPeriodData.periodDays = [...updatedPeriodData.periodDays, selectedDate];
      }
    } else {
      // Remove from period days if flow is set to none
      updatedPeriodData.periodDays = updatedPeriodData.periodDays.filter(
        date => date !== selectedDate
      );
    }
    
    // Update symptoms
    updatedPeriodData.symptoms = {
      ...updatedPeriodData.symptoms,
      [selectedDate]: newEntry.symptoms
    };
    
    // Update notes
    updatedPeriodData.notes = {
      ...updatedPeriodData.notes,
      [selectedDate]: newEntry.notes
    };
    
    // Update predictions based on new data
    if (updatedPeriodData.periodDays.length >= 2) {
      // Sort period days
      const sortedPeriodDays = [...updatedPeriodData.periodDays].sort();
      
      // Calculate average cycle length based on first days of periods
      const firstDaysOfPeriods = [];
      let currentPeriod = [];
      
      sortedPeriodDays.forEach(dateStr => {
        const date = new Date(dateStr);
        
        // Check if this date is consecutive with the current period
        if (currentPeriod.length === 0) {
          currentPeriod.push(dateStr);
          firstDaysOfPeriods.push(dateStr);
        } else {
          const lastDate = new Date(currentPeriod[currentPeriod.length - 1]);
          const dayDiff = Math.round((date - lastDate) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            // Consecutive day, add to current period
            currentPeriod.push(dateStr);
          } else {
            // New period starts
            currentPeriod = [dateStr];
            firstDaysOfPeriods.push(dateStr);
          }
        }
      });
      
      // If we have at least 2 first days, calculate cycle length
      if (firstDaysOfPeriods.length >= 2) {
        let totalCycleLength = 0;
        let cycleCount = 0;
        
        for (let i = 1; i < firstDaysOfPeriods.length; i++) {
          const prevPeriodStart = new Date(firstDaysOfPeriods[i - 1]);
          const currentPeriodStart = new Date(firstDaysOfPeriods[i]);
          const cycleDays = Math.round(
            (currentPeriodStart - prevPeriodStart) / (1000 * 60 * 60 * 24)
          );
          
          if (cycleDays > 0 && cycleDays < 60) { // Ignore outliers
            totalCycleLength += cycleDays;
            cycleCount++;
          }
        }
        
        if (cycleCount > 0) {
          updatedPeriodData.cycleLength = Math.round(totalCycleLength / cycleCount);
          
          // Predict next period
          const lastPeriodStart = new Date(firstDaysOfPeriods[firstDaysOfPeriods.length - 1]);
          const nextPeriodDate = new Date(lastPeriodStart);
          nextPeriodDate.setDate(nextPeriodDate.getDate() + updatedPeriodData.cycleLength);
          updatedPeriodData.predictions.nextPeriod = nextPeriodDate.toISOString();
          
          // Predict ovulation (typically 14 days before next period)
          const ovulationDate = new Date(nextPeriodDate);
          ovulationDate.setDate(nextPeriodDate.getDate() - 14);
          updatedPeriodData.predictions.ovulationDay = ovulationDate.toISOString();
          
          // Predict fertile window (typically 5 days before and 1 day after ovulation)
          const fertileWindowStart = new Date(ovulationDate);
          fertileWindowStart.setDate(ovulationDate.getDate() - 5);
          
          const fertileWindowEnd = new Date(ovulationDate);
          fertileWindowEnd.setDate(ovulationDate.getDate() + 1);
          
          updatedPeriodData.predictions.fertileWindow = {
            start: fertileWindowStart.toISOString(),
            end: fertileWindowEnd.toISOString()
          };
        }
      }
    }
    
    setPeriodData(updatedPeriodData);
    setShowEntryForm(false);
  };

  // Handle symptom selection
  const toggleSymptom = (symptom) => {
    const updatedSymptoms = [...newEntry.symptoms];
    
    if (updatedSymptoms.includes(symptom)) {
      // Remove symptom if already selected
      const index = updatedSymptoms.indexOf(symptom);
      updatedSymptoms.splice(index, 1);
    } else {
      // Add symptom if not already selected
      updatedSymptoms.push(symptom);
    }
    
    setNewEntry({
      ...newEntry,
      symptoms: updatedSymptoms
    });
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const totalDays = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      let bgColor = 'bg-white';
      let textColor = 'text-gray-700';
      
      // Style based on period, fertile window, or ovulation
      if (isPeriodDay(day)) {
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
      } else if (isOvulationDay(day)) {
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
      } else if (isFertileDay(day)) {
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
      }
      
      days.push(
        <div 
          key={day} 
          className={`p-2 border border-gray-200 ${bgColor} hover:bg-gray-100 cursor-pointer text-center`}
          onClick={() => handleDateSelect(day)}
        >
          <span className={`${textColor} font-medium`}>{day}</span>
          
          {/* Indicators for data */}
          {periodData.symptoms[`${currentYear}-${currentMonth + 1}-${day}`] && 
            periodData.symptoms[`${currentYear}-${currentMonth + 1}-${day}`].length > 0 && (
            <div className="mt-1 w-2 h-2 bg-yellow-400 rounded-full mx-auto"></div>
          )}
          
          {periodData.notes[`${currentYear}-${currentMonth + 1}-${day}`] && (
            <div className="mt-1 w-2 h-2 bg-green-400 rounded-full mx-auto"></div>
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">
              {getMonthName(currentMonth)} {currentYear}
            </h2>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(new Date().getMonth());
                setCurrentYear(new Date().getFullYear());
              }}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {/* Days of the week */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {renderCalendarDays()}
        </div>
        
        {/* Calendar Legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Period</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Fertile Window</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Ovulation</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2 flex justify-center items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600">Symptoms</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2 flex justify-center items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600">Notes</span>
          </div>
        </div>
        
        {/* Entry Form */}
        {showEntryForm && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {/* Flow Tracking */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period Flow
              </label>
              <div className="flex space-x-2">
                {['none', 'light', 'medium', 'heavy'].map(flow => (
                  <button
                    key={flow}
                    onClick={() => setNewEntry({ ...newEntry, flow })}
                    className={`px-3 py-1 rounded-md ${
                      newEntry.flow === flow
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {flow.charAt(0).toUpperCase() + flow.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Symptoms Tracking */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms
              </label>
              <div className="flex flex-wrap gap-2">
                {symptomOptions.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1 rounded-md ${
                      newEntry.symptoms.includes(symptom)
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                placeholder="Add any notes about how you're feeling today..."
              ></textarea>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEntryForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEntry}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;