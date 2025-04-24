// data-models.js
// Core data models for the LunaLog application

/**
 * User Profile Data Model
 * Stores user-specific settings and information
 */
const userProfileModel = {
  // Basic user information
  name: '',
  age: null,
  email: '',

  // Cycle settings
  averageCycleLength: 28, // in days
  averagePeriodLength: 5, // in days

  // App preferences
  notifications: {
    enabled: true,
    periodReminder: true, // Notify before predicted period
    fertilityReminder: false, // Notify during fertile window
    logReminder: true, // Remind to log data
    reminderDays: 2 // Days before period to send reminder
  },

  // Theme preferences
  theme: 'light', // 'light' or 'dark'
  colorScheme: 'default', // 'default', 'blue', 'purple', etc.

  // Privacy settings
  privacySettings: {
    dataSharing: false, // Whether to anonymously share data for insights
    backupEnabled: true, // Whether to backup data
    exportFormat: 'json' // Default export format
  },

  // Health information (optional)
  healthInfo: {
    conditions: [], // Any health conditions
    medications: [], // Current medications
    birthControlMethod: null, // Current birth control method
    lastHealthCheckup: null // Date of last checkup
  }
};

/**
 * Cycle Data Model
 * Tracks period, symptoms, and related information
 */
const cycleDataModel = {
  // Period tracking
  periodDays: [], // Array of date strings representing period days

  // Symptoms tracking - Key is date string, value is array of symptoms
  symptoms: {
    // '2023-05-01': ['headache', 'cramps', 'bloating']
  },

  // Notes for specific days - Key is date string, value is note text
  notes: {
    // '2023-05-01': 'Felt particularly tired today. Early bedtime needed.'
  },

  // Flow intensity tracking - Key is date string, value is flow level
  flow: {
    // '2023-05-01': 'heavy', // 'spotting', 'light', 'medium', 'heavy'
  },

  // Mood tracking - Key is date string, value is mood
  mood: {
    // '2023-05-01': 'stressed', // 'happy', 'sad', 'anxious', 'irritable', 'calm', 'energetic', 'stressed'
  },

  // Physical activity tracking - Key is date string, value is activity level
  activity: {
    // '2023-05-01': 'moderate', // 'none', 'light', 'moderate', 'intense'
  },

  // Sleep tracking - Key is date string, value is hours of sleep
  sleep: {
    // '2023-05-01': 7.5, // Hours of sleep
  },

  // Predictions based on historical data
  predictions: {
    nextPeriod: null, // Predicted start date of next period
    fertileWindow: {
      start: null,
      end: null
    }, // Predicted fertile window
    ovulationDay: null, // Predicted ovulation day
    confidence: 0 // Confidence level in prediction (0-100)
  },

  // Historical statistics
  statistics: {
    averageCycleLength: 28, // Average cycle length based on logged data
    averagePeriodLength: 5, // Average period length based on logged data
    cycleRegularity: 'regular', // 'regular', 'somewhat regular', 'irregular'
    cycleHistory: [] // Array of past cycle lengths for trend analysis
  }
};

/**
 * Health Log Data Model
 * Stores additional health metrics
 */
const healthLogModel = {
  // Weight tracking - Key is date string, value is weight
  weight: {
    // '2023-05-01': 150 // Weight in pounds or kilograms (based on user preference)
  },

  // Temperature tracking (for fertility awareness) - Key is date string, value is temperature
  basalTemperature: {
    // '2023-05-01': 97.8 // Temperature in Fahrenheit or Celsius (based on user preference)
  },

  // Cervical fluid observations - Key is date string, value is observation
  cervicalFluid: {
    // '2023-05-01': 'egg-white' // 'dry', 'sticky', 'creamy', 'egg-white', 'watery'
  },

  // Medication tracking - Key is date string, value is array of medications taken
  medications: {
    // '2023-05-01': ['iron supplement', 'vitamin D']
  },

  // Sexual activity tracking - Key is date string, value is boolean or details
  sexualActivity: {
    // '2023-05-01': true // or object with additional details if needed
  },

  // Pregnancy test results - Key is date string, value is result
  pregnancyTest: {
    // '2023-05-01': 'negative' // 'positive', 'negative', 'inconclusive'
  },

  // Ovulation test results - Key is date string, value is result
  ovulationTest: {
    // '2023-05-01': 'positive' // 'positive', 'negative', 'inconclusive'
  }
};

/**
 * Provider Communication Model
 * For storing healthcare provider information and communication
 */
const providerModel = {
  // Provider information
  providers: [
    // {
    //   id: '1',
    //   name: 'Dr. Jane Smith',
    //   specialty: 'OB/GYN',
    //   phone: '555-123-4567',
    //   email: 'drsmith@example.com',
    //   address: '123 Medical Center Dr.',
    //   notes: 'Primary gynecologist'
    // }
  ],

  // Appointments
  appointments: [
    // {
    //   id: '1',
    //   providerId: '1',
    //   date: '2023-06-15T09:30:00',
    //   purpose: 'Annual checkup',
    //   notes: 'Bring list of questions about birth control options',
    //   reminded: true // Whether user has been reminded of this appointment
    // }
  ],

  // Questions to ask at next appointment
  questions: [
    // {
    //   id: '1',
    //   text: 'Ask about switching birth control methods',
    //   date: '2023-05-01T12:00:00', // When the question was added
    //   appointmentId: '1', // Which appointment this is for (optional)
    //   answered: false
    // }
  ],

  // Health reports/data to share with provider
  reports: [
    // {
    //   id: '1',
    //   title: 'Cycle data Jan-Mar 2023',
    //   date: '2023-04-01T10:00:00',
    //   data: { /* Reference to exported data */ },
    //   shared: false, // Whether this has been shared with provider
    //   providerId: '1' // Which provider this is for
    // }
  ]
};

/**
 * Settings Model
 * Application settings and preferences
 */
const settingsModel = {
  // Data management
  data: {
    lastBackup: null, // Date of last backup
    autoBackup: true, // Whether to automatically backup data
    backupInterval: 7, // Days between automatic backups
    exportFormat: 'json', // Default export format ('json', 'csv')
    dataRetention: 365 // Days to keep data
  },

  // Display settings
  display: {
    theme: 'light', // 'light' or 'dark'
    colorScheme: 'default', // Color scheme for the app
    dateFormat: 'MM/DD/YYYY', // Preferred date format
    startOfWeek: 0, // 0 = Sunday, 1 = Monday, etc.
    language: 'en' // User interface language
  },

  // Notification settings
  notifications: {
    enabled: true, // Master toggle for notifications
    periodReminder: true, // Remind about upcoming period
    periodReminderDays: 2, // Days before period to send reminder
    fertilityAlert: false, // Alert for fertile window
    logReminder: true, // Remind to log data
    reminderTime: '20:00', // Time of day for reminders (24h format)
    missedLogReminder: true, // Remind if day was not logged
    appointmentReminders: true, // Remind about upcoming appointments
    appointmentReminderDays: 1 // Days before appointment to send reminder
  },

  // Security settings
  security: {
    appLock: false, // Whether app requires authentication to open
    lockMethod: 'none', // 'none', 'pin', 'biometric'
    autoLock: false, // Auto-lock after period of inactivity
    lockTimeout: 5, // Minutes of inactivity before auto-lock
    secureExport: false // Whether exports are encrypted
  }
};

/**
 * Education Content Model
 * Stores educational content and resources
 */
const educationModel = {
  // Articles and educational content
  articles: [
    // {
    //   id: '1',
    //   title: 'Understanding Your Menstrual Cycle',
    //   summary: 'Learn about the four phases of the menstrual cycle and what happens in your body.',
    //   content: '...',
    //   tags: ['basics', 'cycle phases', 'hormones'],
    //   imageUrl: '/images/articles/cycle-phases.jpg',
    //   read: false // Whether user has marked as read
    // }
  ],

  // Frequently asked questions
  faqs: [
    // {
    //   id: '1',
    //   question: 'How long is a typical menstrual cycle?',
    //   answer: 'A typical menstrual cycle is 28 days, but it can range from 21 to 35 days. Factors like stress, illness, and hormonal changes can affect cycle length.'
    // }
    // Add more FAQs here
  ],

  // Glossary of terms
  glossary: [
    // {
    //   term: 'Menstruation',
    //   definition: 'The monthly shedding of the uterine lining, which results in bleeding.'
    // },
    // Add more glossary terms here
  ],

  // Links to external resources
  resources: [
    // {
    //   title: 'Planned Parenthood',
    //   url: 'https://www.plannedparenthood.org/',
    //   description: 'Provides reproductive healthcare services and education.'
    // },
    // Add more external resources here
  ]
};

export {
  userProfileModel,
  cycleDataModel,
  healthLogModel,
  providerModel,
  settingsModel,
  educationModel
};