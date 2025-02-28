document.addEventListener('DOMContentLoaded', function () {
  // Get DOM elements
  const dayButtons = document.querySelectorAll('.day-btn');
  const daysToAddInput = document.getElementById('days-to-add');
  const increaseBtn = document.getElementById('increase-btn');
  const decreaseBtn = document.getElementById('decrease-btn');
  const startDayIcon = document.querySelector('.start-day-icon');
  const targetDayIcon = document.querySelector('.target-day-icon');
  const weeksContainer = document.getElementById('weeks-container');
  const weekStartMondayBtn = document.getElementById('week-start-monday');
  const weekStartSundayBtn = document.getElementById('week-start-sunday');
  const daySelector = document.querySelector('.day-selector');

  // Configuration
  let weekStartsOnMonday = true; // Default: week starts on Monday

  // Weekday names (short form)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Weekday emoji icons
  const weekdayIcons = ['☀️', '🌙', '🔥', '💧', '⚡', '🌱', '🌈'];

  // Set default to current day of week
  let selectedDay = new Date().getDay();
  updateSelectedDayButton();

  // Add event listeners for day buttons
  dayButtons.forEach(button => {
    button.addEventListener('click', function () {
      selectedDay = parseInt(this.getAttribute('data-day'));
      updateSelectedDayButton();
      calculateAndVisualize();
    });
  });

  // Add event listeners for the + and - buttons
  increaseBtn.addEventListener('click', function () {
    const currentValue = parseInt(daysToAddInput.value) || 0;
    daysToAddInput.value = Math.min(currentValue + 1, 100);
    calculateAndVisualize();
  });

  decreaseBtn.addEventListener('click', function () {
    const currentValue = parseInt(daysToAddInput.value) || 0;
    daysToAddInput.value = Math.max(currentValue - 1, 0);
    calculateAndVisualize();
  });

  // Add event listeners for week start configuration
  weekStartMondayBtn.addEventListener('click', function () {
    if (!weekStartsOnMonday) {
      weekStartsOnMonday = true;
      updateWeekStartButtons();
      reorderDayButtons();
      calculateAndVisualize();
    }
  });

  weekStartSundayBtn.addEventListener('click', function () {
    if (weekStartsOnMonday) {
      weekStartsOnMonday = false;
      updateWeekStartButtons();
      reorderDayButtons();
      calculateAndVisualize();
    }
  });

  // Also calculate when input changes
  daysToAddInput.addEventListener('input', calculateAndVisualize);

  // Function to update the selected day button
  function updateSelectedDayButton() {
    dayButtons.forEach(button => {
      const day = parseInt(button.getAttribute('data-day'));
      if (day === selectedDay) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  // Function to update week start buttons
  function updateWeekStartButtons() {
    if (weekStartsOnMonday) {
      weekStartMondayBtn.classList.add('active');
      weekStartSundayBtn.classList.remove('active');
    } else {
      weekStartMondayBtn.classList.remove('active');
      weekStartSundayBtn.classList.add('active');
    }
  }

  // Function to reorder day buttons based on week start configuration
  function reorderDayButtons() {
    // Get the current order of day buttons
    const dayButtonsArray = Array.from(dayButtons);

    // Remove all day buttons from the container
    dayButtonsArray.forEach(button => {
      daySelector.removeChild(button);
    });

    // Get the order of days based on configuration
    const order = getWeekdayOrder();

    // Add day buttons back in the correct order
    order.forEach(dayIndex => {
      const button = dayButtonsArray.find(btn => parseInt(btn.getAttribute('data-day')) === dayIndex);
      if (button) {
        daySelector.appendChild(button);
      }
    });
  }

  // Initial setup
  reorderDayButtons();
  calculateAndVisualize();

  function calculateAndVisualize() {
    // Get input values
    const startDay = selectedDay;
    const daysToAdd = parseInt(daysToAddInput.value) || 0;

    // Calculate the target day
    const targetDay = (startDay + daysToAdd) % 7;

    // Update icons
    startDayIcon.textContent = weekdayIcons[startDay];
    targetDayIcon.textContent = weekdayIcons[targetDay];

    // Create visualization
    createVisualization(startDay, daysToAdd, targetDay);
  }

  function createVisualization(startDay, daysToAdd, targetDay) {
    // Clear previous visualization
    weeksContainer.innerHTML = '';

    // Create an array to represent all days we need to display
    // Each element will be an object with properties:
    // - weekday: 0-6 (Sunday-Saturday)
    // - dayNumber: number of days from start (0 for start day, 1-N for subsequent days)
    // - isStart: boolean, true if this is the start day
    // - isTarget: boolean, true if this is the target day
    const days = [];

    // Add all days from start day to target day
    for (let i = 0; i <= daysToAdd; i++) {
      const weekday = (startDay + i) % 7;
      days.push({
        weekday,
        dayNumber: i,
        isStart: i === 0,
        isTarget: i === daysToAdd,
        isInRange: i > 0 && i < daysToAdd // All days between start and target
      });
    }

    // Group days into weeks based on the week start configuration
    const weeks = [];
    let currentWeek = Array(7).fill(null);

    // Determine the order of days in a week based on configuration
    const weekdayOrder = getWeekdayOrder();

    // Fill the first week
    const startDayIndex = weekdayOrder.indexOf(startDay);
    if (startDayIndex !== -1) {
      for (let i = startDayIndex; i < 7 && days.length > 0; i++) {
        currentWeek[i] = days.shift();
      }
    }
    weeks.push(currentWeek);

    // Fill subsequent weeks
    while (days.length > 0) {
      currentWeek = Array(7).fill(null);
      for (let i = 0; i < 7 && days.length > 0; i++) {
        currentWeek[i] = days.shift();
      }
      weeks.push(currentWeek);

      // Limit to 8 weeks maximum
      if (weeks.length >= 8) break;
    }

    // Create the visualization
    weeks.forEach((week, weekIndex) => {
      const weekRow = document.createElement('div');
      weekRow.className = 'week-row';

      // Add week label
      const weekLabel = document.createElement('div');
      weekLabel.className = 'week-label';
      weekLabel.textContent = weekIndex === 0 ? '🏁' : weekIndex.toString();
      weekRow.appendChild(weekLabel);

      // Add days for this week based on the week start configuration
      for (let i = 0; i < 7; i++) {
        const dayIndex = weekdayOrder[i];

        const dayElement = document.createElement('div');
        dayElement.className = 'day';

        // Add day label (name of day)
        const dayLabel = document.createElement('div');
        dayLabel.className = 'day-label';
        // Create a more compact label for mobile
        dayLabel.innerHTML = `${weekdayIcons[dayIndex]}<span>${weekdays[dayIndex]}</span>`;
        dayElement.appendChild(dayLabel);

        // Add day number
        const dayNumberElement = document.createElement('div');
        dayNumberElement.className = 'day-number';

        const dayData = week[i];
        if (dayData) {
          if (dayData.isStart) {
            dayNumberElement.textContent = '0';
            dayElement.classList.add('current');
          } else {
            dayNumberElement.textContent = dayData.dayNumber.toString();

            if (dayData.isTarget) {
              dayElement.classList.add('target');
            } else if (dayData.isInRange) {
              dayElement.classList.add('in-range');
            }
          }
        } else {
          dayNumberElement.textContent = '';
        }

        dayElement.appendChild(dayNumberElement);
        weekRow.appendChild(dayElement);
      }

      weeksContainer.appendChild(weekRow);
    });
  }

  // Helper function to get the order of weekdays based on configuration
  function getWeekdayOrder() {
    if (weekStartsOnMonday) {
      // Week starts on Monday: [1, 2, 3, 4, 5, 6, 0]
      return [1, 2, 3, 4, 5, 6, 0];
    } else {
      // Week starts on Sunday: [0, 1, 2, 3, 4, 5, 6]
      return [0, 1, 2, 3, 4, 5, 6];
    }
  }
});
