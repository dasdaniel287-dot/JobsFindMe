const STORAGE_KEY = 'todoApp.tasks';

let tasks = loadTasks();
let currentFilter = 'all';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse saved tasks:', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'active':
      return tasks.filter((task) => !task.completed);
    case 'completed':
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

function updateCount() {
  const remaining = tasks.filter((task) => !task.completed).length;
  const label = remaining === 1 ? '1 task left' : `${remaining} tasks left`;
  todoCount.textContent = label;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    todoList.innerHTML = '<li class="empty-state">No tasks here yet.</li>';
    updateCount();
    return;
  }

  todoList.innerHTML = filteredTasks
    .map(
      (task) => `
        <li class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete" />
          <span class="todo-text">${escapeHtml(task.text)}</span>
          <button class="delete-btn" type="button" aria-label="Delete task">Delete</button>
        </li>
      `
    )
    .join('');

  updateCount();
}

function addTask(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    text: cleanText,
    completed: false,
  });

  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

todoList.addEventListener('click', (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const item = target.closest('.todo-item');

  if (!item) {
    return;
  }

  const id = item.dataset.id;

  if (target.matches('.delete-btn')) {
    deleteTask(id);
    return;
  }

  if (target.matches('input[type="checkbox"]')) {
    toggleTask(id);
  }
});

todoList.addEventListener('change', (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (target.type === 'checkbox') {
    const item = target.closest('.todo-item');
    if (item) {
      toggleTask(item.dataset.id);
    }
  }
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.toggle('active', btn === button);
    });

    renderTasks();
  });
});

renderTasks();
