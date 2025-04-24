// src/components/HealthInsightsPage.js
import React, { useState, useEffect } from 'react';
// Import any charting libraries you plan to use (e.g., Chart.js, Recharts)

const HealthInsightsPage = () => {
  const [periodData, setPeriodData] = useState(() => {
    const savedData = localStorage.getItem('lunalog_period_data');
    return savedData ? JSON.parse(savedData) : { periodDays: [], cycleLength: 28, periodLength: 5 }; // Initialize with defaults
  });

  useEffect(() => {
    // You might want to update local state if localStorage changes elsewhere
    const handleStorageChange = () => {
      const newData = localStorage.getItem('lunalog_period_data');
      if (newData) {
        setPeriodData(JSON.parse(newData));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ... (functions to calculate insights will go here)
};

export default HealthInsightsPage;

// Inside HealthInsightsPage.js

const calculateAverageCycleLength = (periodDays) => {
  if (periodDays.length < 2) return 0;
  const sortedDays = periodDays.sort((a, b) => new Date(a) - new Date(b));
  let totalDifference = 0;
  for (let i = 1; i < sortedDays.length; i++) {
    const date1 = new Date(sortedDays[i - 1]);
    const date2 = new Date(sortedDays[i]);
    const differenceInDays = (date2 - date1) / (1000 * 60 * 60 * 24);
    totalDifference += differenceInDays;
  }
  return Math.round(totalDifference / (sortedDays.length - 1)) || 0;
};

const calculateAveragePeriodDuration = (periodDays) => {
  if (!periodDays.length) return 0;
  const sortedDays = periodDays.sort((a, b) => new Date(a) - new Date(b));
  let totalDuration = 0;
  let currentPeriodLength = 0;
  for (let i = 0; i < sortedDays.length; i++) {
    if (i > 0) {
      const prevDate = new Date(sortedDays[i - 1]);
      const currentDate = new Date(sortedDays[i]);
      const difference = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
      if (difference <= 1) { // Consecutive day
        currentPeriodLength++;
      } else {
        totalDuration += (currentPeriodLength + 1); // Add 1 for the first day
        currentPeriodLength = 0;
      }
    } else {
      currentPeriodLength = 0;
    }
    if (i === sortedDays.length - 1) {
      totalDuration += (currentPeriodLength + 1);
    }
  }
  return Math.round(totalDuration / (periodDays.filter((day, index, self) => self.indexOf(day) === index).length)) || 0; // Avoid counting same start day multiple times
};

const calculateConsistencyScore = (periodDays, averageCycleLength) => {
  if (periodDays.length < 3 || averageCycleLength === 0) return 0;
  const sortedDays = periodDays.sort((a, b) => new Date(a) - new Date(b));
  const recentCycles = [];
  for (let i = sortedDays.length - 1; i > 0; i--) {
    const date1 = new Date(sortedDays[i - 1]);
    const date2 = new Date(sortedDays[i]);
    recentCycles.push(Math.abs(((date2 - date1) / (1000 * 60 * 60 * 24)) - averageCycleLength));
    if (recentCycles.length >= 3) break; // Consider the last 3 cycles
  }
  const averageDeviation = recentCycles.reduce((sum, dev) => sum + dev, 0) / recentCycles.length;
  // Define a scale - lower deviation means higher consistency (you might need to adjust these values)
  if (averageDeviation <= 2) return 95 + Math.random() * 5;
  if (averageDeviation <= 5) return 85 + Math.random() * 10;
  if (averageDeviation <= 10) return 70 + Math.random() * 15;
  return 50 + Math.random() * 20;
};

const HealthInsightsPage = () => {
  const [periodData, setPeriodData] = useState(/* ... */);

  const averageCycle = calculateAverageCycleLength(periodData.periodDays);
  const averagePeriod = calculateAveragePeriodDuration(periodData.periodDays);
  const consistencyScore = calculateConsistencyScore(periodData.periodDays, averageCycle);

  return (
    <div>
      <h1>Health Insights</h1>
      <div>
        <div>
          <p>Average Cycle Length</p>
          <p>{averageCycle} days</p>
        </div>
        <div>
          <p>Average Period Duration</p>
          <p>{averagePeriod} days</p>
        </div>
        <div>
          <p>Consistency Score</p>
          <p>{Math.round(consistencyScore)}%</p>
        </div>
      </div>
      {/* ... (Cycle Length Trends chart will go here - using a charting library) */}
    </div>
  );
};