const taskListElement = document.querySelector('.js-task-list');
const addButtonElement = document.querySelector('.js-add-button');

const taskNameInputElement = document.querySelector('.js-task-name-input');
const statusInputElement = document.querySelector('.js-status-input');
const subjectInputElement = document.querySelector('.js-subject-input');
const dueDateInputElement = document.querySelector('.js-due-date-input');
const doDateInputElement = document.querySelector('.js-do-date-input');
const notesInputElement = document.querySelector('.js-notes-input');

function getOffsetDateString(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formatted = `${year}-${month}-${day}`;
  return inputCheckDates(formatted) ? formatted : '';
}

const savedTasksRaw = localStorage.getItem('taskList');
let taskList = [];

if (savedTasksRaw === null) {
  taskList = [
    {
      name: 'Math Paper 2',
      status: 'Not Started',
      subject: 'Math',
      doDate: getOffsetDateString(0),  
      dueDate: getOffsetDateString(1),  
      notes: 'Timed Practice: 1 hour 15 minutes'
    },

    {
      name: 'English Situational Writing Draft',
      status: 'In Progress',
      subject: 'English',
      doDate: getOffsetDateString(-1),
      dueDate: getOffsetDateString(2), 
      notes: 'Check tone and word count (250 to 350 words)'
    },
    
    {
      name: 'Science Chemistry Worksheet',
      status: 'Not Started',
      subject: 'Science',
      doDate: getOffsetDateString(0),
      dueDate: getOffsetDateString(0), 
      notes: 'Acids, Bases and Salts review'
    }
  ];
} else {
  try {
    taskList = JSON.parse(savedTasksRaw) || [];
  } catch {
    taskList = [];
  }
}

if (!Array.isArray(taskList)) {
  taskList = [];
} else {
  for (let i = taskList.length - 1; i >= 0; i--) {
    const value = taskList[i];
    if (
      !value ||
      !inputCheckStrings(value.name) ||
      !inputCheckDropdown(statusInputElement, value.status) ||
      !inputCheckDropdown(subjectInputElement, value.subject) ||
      !inputCheckDates(value.dueDate) ||
      !inputCheckDates(value.doDate) ||
      !inputCheckStrings(value.notes, false)
    ) {
      deleteTask(i, false);
    }
  }
}

localStorage.setItem('taskList', JSON.stringify(taskList));
renderToDoList();

function addTask(payload) {
  taskList.push(payload);
  renderToDoList();
}

function renderToDoList() {
  let taskListHTML = '';
  reorderTaskList()
  taskList.forEach((value, index) => {
    const taskName = replaceSymbolsHTMLEntities(value.name);
    const doDate = replaceSymbolsHTMLEntities(value.doDate);
    const dueDate = replaceSymbolsHTMLEntities(value.dueDate);
    const rawNotes = value.notes === 'Add notes...' ? '' : (value.notes || '');
    const notes = replaceSymbolsHTMLEntities(rawNotes);
    const urgency = getUrgency(index).name;

    taskListHTML += `
      <div class="task-card">
        <div class="first-row">
          <textarea class="update task-name-update js-text-update" data-field="name" data-index="${index}">${taskName}</textarea>

          <div class="card-column-two">
            <p class="urgency js-urgency">${urgency}</p>
            <select id="subject-${index}" class="update js-dropdown-update subject-update" data-field="subject" data-index="${index}">
              <option value="English">English</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="Mother Tounge">Mother Tounge</option>
            </select>
            <select class="update js-dropdown-update status-update" data-field="status" data-index="${index}">
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
        </div>

        <div class="date-row">
          <div class="date-row-section">
            <label for="do-date-${index}">Do Date</label>
            <input type="date" class="update js-date-update" data-field="doDate" value="${doDate}" data-index="${index}" id="do-date-${index}">
          </div>
          <div class="date-row-section">
            <label for="due-date-${index}">Due Date</label>
            <input type="date" class="update js-date-update" data-field="dueDate" value="${dueDate}" data-index="${index}" id="due-date-${index}">
          </div>
        </div>

        <div class="notes-section">
          <label class="label" for="notes-${index}">Notes</label>
          <div class="third-row">
            <input class="update js-text-update notes-update" data-field="notes" data-index="${index}" value="${notes}" placeholder="Add notes..." id="notes-${index}">
            <button type="button" class="js-delete-button delete-button" data-index="${index}">Delete</button>
          </div>
        </div>
      </div>
    `;
  });

  taskListElement.innerHTML = taskListHTML;
  localStorage.setItem('taskList', JSON.stringify(taskList));

  document.querySelectorAll('.js-dropdown-update').forEach((dropdownField) => {
    const index = Number(dropdownField.dataset.index);
    const field = dropdownField.dataset.field;
    dropdownField.value = taskList[index][field];
  });

  attachListeners();
}

function getUrgency(taskIndex) {
  const todayDate = getLocalOSDateString();
  const doDate = taskList[taskIndex].doDate;
  const dueDate = taskList[taskIndex].dueDate;
  const status = taskList[taskIndex].status;

  if (status === 'Complete') return {name: 'Completed', className: 'urgency-green', urgency: 7};
  if (todayDate === false) return {name: 'Date Error', className: 'urgency-red', urgency: 1};
  if (doDate === '' || dueDate === '') return {name: 'Incomplete Dates', className: 'urgency-orange', urgency: 5};
  if (doDate && dueDate && doDate > dueDate) return {name: 'Invalid Dates', className: 'urgency-red', urgency: 1};
  if (dueDate && dueDate < todayDate) return {name: 'Past Due', className: 'urgency-red', urgency: 2};
  if (dueDate && dueDate === todayDate) return {name: 'Due Today', className: 'urgency-red', urgency: 3};
  if (doDate && doDate < todayDate) return {name: 'Past To-Do Date', className: 'urgency-orange', urgency: 4};
  if (doDate && doDate === todayDate) return {name: 'Do Today', className: 'urgency-orange', urgency: 5};

  return {name: 'Upcoming', className: 'urgency-white', urgency: 6};
}

function reorderTaskList() {
  const reorderedTaskList = [];
  const priority = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: []
  }
  for (let priorityLevel = 1; priorityLevel <= 7; priorityLevel++) {
    for (let i = 0; i < taskList.length; i++) {
      const urgency = getUrgency(i)
      const writeList = priority[priorityLevel]
      if (urgency.urgency === priorityLevel) {
        writeList.push(taskList[i]);
      } else {
        continue
      }
    }
    for (let i = 0; i < priority[priorityLevel].length; i++) {
      const task = priority[priorityLevel][i];
      reorderedTaskList.push(task);
    }
  }
  taskList = reorderedTaskList;
}

function attachListeners() {
  document.querySelectorAll('.js-urgency').forEach((urgencyElement) => {
    urgencyElement.className = 'js-urgency urgency';

    const text = urgencyElement.textContent;
    function addClass(className) {
      urgencyElement.classList.add(className);
    }
    if (text === 'Completed') addClass('urgency-green');
    else if (text === 'Date Error' || text === 'Invalid Dates' || text === 'Past Due' || text === 'Due Today') addClass('urgency-red');
    else if (text === 'Past To-Do Date' || text === 'Incomplete Dates' || text === 'Do Today') addClass('urgency-orange');
    else addClass('urgency-white');
  });

  document.querySelectorAll('.js-delete-button').forEach((deleteButton) => {
    const index = Number(deleteButton.dataset.index);
    deleteButton.addEventListener('click', () => {
      deleteTask(index, true);
    });
  });

  document.querySelectorAll('.js-text-update').forEach((textElement) => {
    const fieldName = textElement.dataset.field;
    const index = Number(textElement.dataset.index);

    textElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        textElement.blur();
      }
    });

    textElement.addEventListener('change', () => {
      const newInput = textElement.value;
      const isRequired = fieldName === 'name';

      if (inputCheckStrings(newInput, isRequired)) {
        taskList[index][fieldName] = newInput.trim();
        renderToDoList();
      } else {
        textElement.classList.add('invalid');
      }
    });
  });

  document.querySelectorAll('.js-date-update').forEach((dateElement) => {
    dateElement.addEventListener('change', () => {
      const fieldName = dateElement.dataset.field;
      const index = Number(dateElement.dataset.index);
      const newInput = dateElement.value;

      if (inputCheckDates(newInput)) {
        taskList[index][fieldName] = newInput;
        renderToDoList();
      } else {
        dateElement.classList.add('invalid');
      }
    });
  });

  document.querySelectorAll('.js-dropdown-update').forEach((dropdownElement) => {
    dropdownElement.addEventListener('change', () => {
      const fieldName = dropdownElement.dataset.field;
      const index = Number(dropdownElement.dataset.index);
      const newInput = dropdownElement.value;

      if (inputCheckDropdown(dropdownElement, newInput)) {
        taskList[index][fieldName] = newInput;
        renderToDoList();
      } else {
        dropdownElement.classList.add('invalid');
      }
    });
  });
}

function inputCheckStrings(input, isRequired = true) {
  if (typeof input !== 'string') return false;
  if (input.trim() === '' && isRequired) return false;
  if (input.trim().length > 500) return false;
  return true;
}

function inputCheckDates(input) {
  if (typeof input !== 'string') return false;
  if (isNaN(Date.parse(input)) && input.trim() !== '') return false;
  return true;
}

function inputCheckDropdown(inputElementName, input) {
  const allowedOptions = [];
  for (const option of inputElementName.options) {
    allowedOptions.push(option.value);
  }
  return allowedOptions.includes(input);
}

function replaceSymbolsHTMLEntities(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function validateInformation() {
  let isValid = true;
  const taskName = taskNameInputElement.value.trim();
  const status = statusInputElement.value;
  const subject = subjectInputElement.value;
  const dueDate = dueDateInputElement.value;
  const doDate = doDateInputElement.value;
  const notes = notesInputElement.value.trim();

  taskNameInputElement.classList.remove('invalid');
  statusInputElement.classList.remove('invalid');
  subjectInputElement.classList.remove('invalid');
  dueDateInputElement.classList.remove('invalid');
  doDateInputElement.classList.remove('invalid');
  notesInputElement.classList.remove('invalid');

  if (!inputCheckStrings(taskName, true)) {
    taskNameInputElement.classList.add('invalid');
    isValid = false;
  }

  if (!inputCheckDropdown(statusInputElement, status)) {
    statusInputElement.classList.add('invalid');
    isValid = false;
  }

  if (!inputCheckDropdown(subjectInputElement, subject)) {
    subjectInputElement.classList.add('invalid');
    isValid = false;
  }

  if (!inputCheckDates(dueDate)) {
    dueDateInputElement.classList.add('invalid');
    isValid = false;
  }

  if (!inputCheckDates(doDate)) {
    doDateInputElement.classList.add('invalid');
    isValid = false;
  }

  if (!inputCheckStrings(notes, false)) {
    notesInputElement.classList.add('invalid');
    isValid = false;
  }

  if (!isValid) return;
  const payload = {
    name: taskName,
    status,
    subject,
    doDate,
    dueDate,
    notes,
  };

  addTask(payload);

  taskNameInputElement.value = '';
  statusInputElement.value = 'Not Started';
  subjectInputElement.value = 'English';
  doDateInputElement.value = '';
  dueDateInputElement.value = '';
  notesInputElement.value = '';
}

function deleteTask(index, renderUpdate) {
  taskList.splice(index, 1);
  localStorage.setItem('taskList', JSON.stringify(taskList));

  if (renderUpdate) {
    renderToDoList();
  }
}

function getLocalOSDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;
  return inputCheckDates(date) ? date : false;
}

document.body.querySelector('.input-row').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.repeat) validateInformation();
});

addButtonElement.addEventListener('click', () => {
  validateInformation();
});