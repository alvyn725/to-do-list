const taskListElement = document.querySelector('.js-task-list');
const addButtonElement = document.querySelector('.js-add-button');

const taskNameInputElement = document.querySelector('.js-task-name-input');
const statusInputElement = document.querySelector('.js-status-input')
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
      !inputCheckStrings(value.notes)
    ) {
      deleteTask(i, false);
    }
  }
}

localStorage.setItem('taskList', JSON.stringify(taskList));
renderToDoList();

function addTask(payload) {
  taskList.push(payload);
  renderToDoList()
}

function renderToDoList() {
  let taskListHTML = '';
  let taskHTML = '';
  taskList.forEach((value, index) => {
    const taskName = replaceSymbolsHTMLEntities(value.name);
    const doDate = replaceSymbolsHTMLEntities(value.doDate);
    const dueDate = replaceSymbolsHTMLEntities(value.dueDate);
    const notes = replaceSymbolsHTMLEntities(value.notes);
    taskHTML = `      
      <div class="task-card">
        <input class="update task-name-update js-text-update" data-field="name" data-index="${index}" value="${taskName}">
        <select class="update js-dropdown-update" data-field="status" data-index="${index}">
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Complete</option>
        </select>
        <input type="date" class="update js-status-update js-date-update" data-field="doDate" value="${doDate}" data-index="${index}">
        <input type="date" class="update js-date-update" data-field="dueDate" value="${dueDate}" data-index="${index}">
        <input class="update js-text-update" data-field="notes" value="${notes}" data-index="${index}">
        <button class="js-delete-button">Delete</button> 
      </div>  
    `;
    taskListHTML += taskHTML;
  });
  taskListElement.innerHTML = taskListHTML;
  localStorage.setItem('taskList', JSON.stringify(taskList));

  document.querySelectorAll('.js-dropdown-update').forEach((dropdownField, index) => {
    dropdownField.value = taskList[index].status
  });
  attachListeners()
}

function attachListeners() {
  document.querySelectorAll('.js-delete-button').forEach((deleteButton, index) => {
    deleteButton.addEventListener('click', () => {
      deleteTask(index, true);
    });
  });

  document.querySelectorAll('.js-text-update').forEach((textElement) => {
    const fieldName = textElement.dataset.field;
    const index = textElement.dataset.index;

    textElement.addEventListener('focus', () => {
      if (fieldName === 'notes' && textElement.value === '-') {
        textElement.value = '';
      }
    });

    textElement.addEventListener('change', () => {
      const newInput = textElement.value;
        if (inputCheckStrings(newInput)) {
        taskList[index][fieldName] = newInput;
        renderToDoList();
      } else if (fieldName === 'notes' && newInput.trim() === '') {
        textElement.value = '-';
        taskList[index][fieldName] = '-';
        renderToDoList();
      } else {
        textElement.classList.add('invalid')
      }
    });

    textElement.addEventListener('blur', () => {
      if (fieldName === 'notes' && textElement.value.trim() === '') {
        textElement.value = '-';
      }
    });
  });
  
  document.querySelectorAll('.js-date-update').forEach((dateElement) => {
    dateElement.addEventListener('change', () => {
      const fieldName = dateElement.dataset.field;
      const index = dateElement.dataset.index;
      const newInput = dateElement.value;
      if (inputCheckDates(newInput)) {
        taskList[index][fieldName] = newInput;
        renderToDoList()
      } else {
        dateElement.classList.add('invalid')
      }
    });
  });
  
  document.querySelectorAll('.js-dropdown-update').forEach((dropdownElement) => {
    dropdownElement.addEventListener('change', () => {
      const fieldName = dropdownElement.dataset.field;
      const index = dropdownElement.dataset.index;
      const newInput = dropdownElement.value;
      if (inputCheckDropdown(dropdownElement, newInput)) {
        taskList[index][fieldName] = newInput;
        renderToDoList()
      } else {
        dropdownElement.classList.add('invalid')
      }
    });
  });
}

function inputCheckStrings(input, isRequired = true) {
  if (typeof input !== 'string') return false; // error not a string
  if (input.trim() === '' && isRequired) return false; // error empty string
  if (input.trim().length > 500) return false; // error too long

  return true; // only returns true if none of the return false trigger
}

function inputCheckDates(input) {
  if (typeof input !== 'string') return false; // error not a string (all dates passed are strings)
  if (isNaN(Date.parse(input)) && input.trim() !== '') return false; // error not a date and not empty

  return true; // only returns true if none of the return false trigger
}

function inputCheckDropdown(inputElementName, input) {
  let allowedOptions = [];
  for (const options of inputElementName.options) {
    allowedOptions.push(options.value);
  }

  if (!allowedOptions.includes(input)) return false; // checks if it is in the list of allowable options
  return true; // only returns true if none of the return false trigger
} 

function replaceSymbolsHTMLEntities (input) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");  
}

function validateInformation() {
  let isValid = true;
  const taskName = taskNameInputElement.value.trim();
  const status = statusInputElement.value;
  const dueDate = dueDateInputElement.value;
  const doDate = doDateInputElement.value;
  let notes = notesInputElement.value;
  if (notes.trim() === '') notes = '-';

  taskNameInputElement.classList.remove('invalid');
  statusInputElement.classList.remove('invalid');
  dueDateInputElement.classList.remove('invalid');
  doDateInputElement.classList.remove('invalid');
  notesInputElement.classList.remove('invalid');

  if (inputCheckStrings(taskName) === false) {
    taskNameInputElement.classList.add('invalid');
    isValid = false;
  }

  if (inputCheckDropdown(statusInputElement, status) === false) {
    statusInputElement.classList.add('invalid');
    isValid = false;
  }

  if (inputCheckDates(dueDate) === false) {
    dueDateInputElement.classList.add('invalid');
    isValid = false;
  }

  if (inputCheckDates(doDate) === false) {
    doDateInputElement.classList.add('invalid');
    isValid = false;
  }

  if (inputCheckStrings(notes) === false) {
    notesInputElement.classList.add('invalid');
    isValid = false;
  }

  if (isValid === false) return;
  const payload = {
    name: taskName,
    status: status,
    doDate: doDate,
    dueDate: dueDate,
    notes: notes
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
  if (renderUpdate) {
    renderToDoList();
  }
}

document.body.querySelector('.input-row').addEventListener('keydown', event => {
  if (event.key === 'Enter') validateInformation();
});

addButtonElement.addEventListener('click', event => {
  validateInformation()
});
