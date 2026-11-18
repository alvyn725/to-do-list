const taskNameInput = document.querySelector('.js-task-name-input');
const taskListElement = document.querySelector('.js-task-list');
const taskList = [];

const dueDateInputElement = document.querySelector('.js-due-date-input');
const doDateInputElement = document.querySelector('.js-do-date-input');

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
    const deleteButton = '<button class="js-delete-button">Delete</button>'
    taskListHTML += `<p>Task Name: ${taskName} Do Date: ${doDate} Due Date: ${dueDate}</p>${deleteButton}`;
  });
  taskListElement.innerHTML = taskListHTML;

  document.querySelectorAll('.js-delete-button').forEach((deleteButton, index) => {
    deleteButton.addEventListener('click', () => {
      deleteTask(index);
    });
  });
}

function inputCheckStrings(input) {
  if (typeof input !== 'string') return false; // error not a string
  if (input.trim() === '') return false; // error empty string
  if (input.trim().length > 100) return false; // error too long
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

  taskNameInput.classList.remove('invalid-task-name');
  dueDateInputElement.classList.remove('invalid-date');
  doDateInputElement.classList.remove('invalid-date');

  if (inputCheckStrings(taskName) === false) {
    taskNameInput.classList.add('invalid-task-name');
  }

  if (inputCheckDates(dueDate) === false) {
    dueDateInputElement.classList.add('invalid-date');
  }

  if (inputCheckDates(doDate) === false) {
    doDateInputElement.classList.add('invalid-date')
  }

  if (inputCheckStrings(taskName) && inputCheckDates(dueDate) && inputCheckDates(doDate)) {
    taskNameInput.classList.remove('invalid-task-name');
    const payload = {
      name: taskName,
      doDate: doDate,
      dueDate: dueDate
    }
    addTask(payload);
    taskNameInput.value = '';
    doDateInputElement.value = '';
    dueDateInputElement.value = '';
  }
}

function deleteTask(index) {
  taskList.splice(index, 1);
  renderToDoList()
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