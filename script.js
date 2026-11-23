const taskListElement = document.querySelector('.js-task-list');
const addButtonElement = document.querySelector('.js-add-button');

const taskNameInputElement = document.querySelector('.js-task-name-input');
const statusInputElement = document.querySelector('.js-status-input');
const dueDateInputElement = document.querySelector('.js-due-date-input');
const doDateInputElement = document.querySelector('.js-do-date-input');
const notesInputElement = document.querySelector('.js-notes-input');

let taskList = [];
try {
  taskList = JSON.parse(localStorage.getItem('taskList')) || [];
} catch {
  taskList = [];
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

  taskList.forEach((value, index) => {
    const taskName = replaceSymbolsHTMLEntities(value.name);
    const doDate = replaceSymbolsHTMLEntities(value.doDate);
    const dueDate = replaceSymbolsHTMLEntities(value.dueDate);
    const rawNotes = value.notes === 'Add notes...' ? '' : (value.notes || '');
    const notes = replaceSymbolsHTMLEntities(rawNotes);
    const urgency = getUrgency(index);

    taskListHTML += `
      <div class="task-card">
        <div class="first-row">
          <textarea class="update task-name-update js-text-update" data-field="name" data-index="${index}">${taskName}</textarea>

          <div class="card-column-two">
            <p class="urgency">${urgency}</p>
            <select class="update js-dropdown-update status-update" data-field="status" data-index="${index}">
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
        </div>

        <div class="date-row">
          <label class="label" for="do-date-${index}">Do Date</label>
          <label class="label" for="due-date-${index}">Due Date</label>
          <input type="date" class="update do-date js-date-update" data-field="doDate" value="${doDate}" data-index="${index}" id="do-date-${index}">
          <input type="date" class="update due-date js-date-update" data-field="dueDate" value="${dueDate}" data-index="${index}" id="due-date-${index}">
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

  document.querySelectorAll('.js-dropdown-update').forEach((dropdownField, index) => {
    dropdownField.value = taskList[index].status;
  });

  attachListeners();
}

function getUrgency(taskIndex) {
  const todayDate = getLocalOSDateString();
  const doDate = taskList[taskIndex].doDate;
  const dueDate = taskList[taskIndex].dueDate;
  const status = taskList[taskIndex].status;

  if (status === 'Complete') return `&#128994; Completed`;
  if (todayDate === false) return `Date Error`;
  if (doDate === '' || dueDate === '') return `Incomplete Dates`;
  if (doDate && dueDate && doDate > dueDate) return `&#128308; Do Date Past Due Date`;
  if (dueDate && dueDate < todayDate) return `&#128308; Past Due`;
  if (dueDate && dueDate === todayDate) return `&#128308; Due Today`;
  if (doDate && doDate < todayDate) return `&#128992; Past To-Do Date`;
  if (doDate && doDate === todayDate) return `&#128993; Do Today`;

  return `&#9898; Upcoming`;
}

function attachListeners() {
  document.querySelectorAll('.js-delete-button').forEach((deleteButton) => {
    const index = Number(deleteButton.dataset.index);
    deleteButton.addEventListener('click', () => {
      deleteTask(index, true);
    });
  });

  document.querySelectorAll('.js-text-update').forEach((textElement) => {
    const fieldName = textElement.dataset.field;
    const index = Number(textElement.dataset.index);

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
  const dueDate = dueDateInputElement.value;
  const doDate = doDateInputElement.value;
  const notes = notesInputElement.value.trim();

  taskNameInputElement.classList.remove('invalid');
  statusInputElement.classList.remove('invalid');
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
  payload = {
    name: taskName,
    status,
    doDate,
    dueDate,
    notes
  }

  addTask(payload);

  taskNameInputElement.value = '';
  statusInputElement.value = 'Not Started';
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
  if (event.key === 'Enter') validateInformation();
});

addButtonElement.addEventListener('click', () => {
  validateInformation();
});