const taskNameInput = document.querySelector('.js-task-name-input');
const taskListElement = document.querySelector('.js-task-list');
const addButtonElement = document.querySelector('.js-add-button');
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
      !inputCheckDates(value.dueDate) ||
      !inputCheckDates(value.doDate) ||
      !inputCheckStrings(value.notes)
    ) {
      deleteTask(i, false);
    }
  }
}

localStorage.setItem('taskList', JSON.stringify(taskList));

const dueDateInputElement = document.querySelector('.js-due-date-input');
const doDateInputElement = document.querySelector('.js-do-date-input');
const notesInputElement = document.querySelector('.js-notes-input');

renderToDoList();

function addTask(payload) {
  taskList.push(payload);
  renderToDoList()
}

function renderToDoList() {
  let taskListHTML = '';
  taskList.forEach((value, index) => {
    const taskName = value.name;
    const doDate = value.doDate;
    const dueDate = value.dueDate;
    let notes = value.notes;
    taskListHTML += `
      <div class="task-card">
        <p>${taskName}</p>
        <p>${doDate}</p>
        <p>${dueDate}</p>
        <p>${notes}</p>
        <button class="js-delete-button">Delete</button> 
      </div>
    `;
  });
  taskListElement.innerHTML = taskListHTML;

  document.querySelectorAll('.js-delete-button').forEach((deleteButton, index) => {
    deleteButton.addEventListener('click', () => {
      deleteTask(index, true);
    });
  });
  localStorage.setItem('taskList', JSON.stringify(taskList));
}

function inputCheckStrings(input, isRequired = true) {
  if (typeof input !== 'string') return false; // error not a string
  if (input.trim() === '' && isRequired) return false; // error empty string
  if (input.trim().length > 500) return false; // error too long
  if (input.includes('<') || input.includes('>')) return false; // error contains < or > (to stop XSS attacks)

  return true; // only returns true if none of the return false trigger
}

function inputCheckDates(input) {
  if (typeof input !== 'string') return false; // error not a string (all dates passed are strings)
  if (input === '') return false; // error blank date
  if (isNaN(Date.parse(input))) return false; // error not a date
  if (input.includes('<') || input.includes('>')) return false; // error contains < or > (to stop XSS attacks)

  return true;
}

function validateInformation() {
  const taskName = taskNameInput.value.trim();
  const dueDate = dueDateInputElement.value;
  const doDate = doDateInputElement.value;
  let notes = notesInputElement.value;
  if (notes.trim() === '') notes = '-';

  taskNameInput.classList.remove('invalid-task-name');
  dueDateInputElement.classList.remove('invalid-date');
  doDateInputElement.classList.remove('invalid-date');
  notesInputElement.classList.remove('invalid-notes');

  if (inputCheckStrings(taskName) === false) {
    taskNameInput.classList.add('invalid-task-name');
  }

  if (inputCheckDates(dueDate) === false) {
    dueDateInputElement.classList.add('invalid-date');
  }

  if (inputCheckDates(doDate) === false) {
    doDateInputElement.classList.add('invalid-date');
  }

  if (inputCheckStrings(notes) === false) {
    notesInputElement.classList.add('invalid-notes');
  }

  if (inputCheckStrings(taskName) && inputCheckDates(dueDate) && inputCheckDates(doDate) && inputCheckStrings(notes)) {
    taskNameInput.classList.remove('invalid-task-name');
    const payload = {
      name: taskName,
      doDate: doDate,
      dueDate: dueDate,
      notes: notes
    }
    addTask(payload);
    taskNameInput.value = '';
    doDateInputElement.value = '';
    dueDateInputElement.value = '';
    notesInputElement.value = '';
  }
}

function deleteTask(index, renderUpdate) {
  taskList.splice(index, 1);
  if (renderUpdate) {
    renderToDoList();
  }
}

taskNameInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') validateInformation();
});

dueDateInputElement.addEventListener('keydown', event => {
  if (event.key === 'Enter') validateInformation();
});

doDateInputElement.addEventListener('keydown', event => {
  if (event.key === 'Enter') validateInformation();
});

notesInputElement.addEventListener('keydown', event => {
  if (event.key === 'Enter') validateInformation();
});

addButtonElement.addEventListener('click', event => {
  validateInformation()
});
