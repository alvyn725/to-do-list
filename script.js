const taskNameInput = document.querySelector('.js-task-name-input');
const taskListElement = document.querySelector('.js-task-list');
const taskList = [];

const dueDateInputElement = document.querySelector('.js-due-date-input');


function addTask(payload) {
  console.log('task was added');
  taskList.push(payload);
  console.log(taskList);
  renderToDoList()
}

function renderToDoList() {
  let taskListHTML = '';
  taskList.forEach((value, index) => {
    const taskName = value.name;
    const dueDate = value.dueDate;
    taskListHTML += `<p>Task Name: ${taskName} Due Date: ${dueDate}</p>`
  });
  taskListElement.innerHTML = taskListHTML;
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
  const dueDate = dueDateInputElement.value
  taskNameInput.classList.remove('invalid-task-name');
  dueDateInputElement.classList.remove('invalid-date');

  if (inputCheckStrings(taskName) === false) {
    taskNameInput.classList.add('invalid-task-name');
  }

  if (inputCheckDates(dueDate) === false) {
    dueDateInputElement.classList.add('invalid-date');
  }

  if (inputCheckStrings(taskName) && inputCheckDates(dueDate)) {
    taskNameInput.classList.remove('invalid-task-name');
    const payload = {
      name: taskName,
      dueDate: dueDate
    }
    addTask(payload);
    taskNameInput.value = '';
  }
}

taskNameInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') validateInformation();
});

dueDateInputElement.addEventListener('keydown', event => {
  if (event.key === 'Enter') validateInformation();
});