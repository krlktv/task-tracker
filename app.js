'use strict';

const addTaskForm = document.querySelector('#addTaskForm');
const currentTasks = document.querySelector('#currentTasks');
const completedTasks = document.querySelector('#completedTasks');
const ascBtn = document.querySelector('#incr');
const descBtn = document.querySelector('#decr');
const toDoHeading = document.querySelector('#toDoHeading');
const completedHeading = document.querySelector('#completedHeading');
const tasksContainer = document.querySelector('#tasksContainer');
const clearAllBtn = document.querySelector('#clearAll');
const editTaskForm = document.querySelector('#editTaskForm');
let currentEditId = '';
const SORTING = {
	asc: 'incr',
	desc: 'decr',
};
const PRIORITY = {
	low: 'Low',
	medium: 'Medium',
	high: 'High',
};
const themeToggleBtn = document.querySelector('.custom-control-input');

render();

localStorage.setItem(0, SORTING.asc);

themeToggleBtn.addEventListener('change', toggleTheme);

ascBtn.addEventListener('click', () => {
	setSorting(SORTING.asc);
	render();
});

descBtn.addEventListener('click', () => {
	setSorting(SORTING.desc);
	render();
});

clearAllBtn.addEventListener('click', () => {
	const sortingValue = localStorage.getItem(0);
	localStorage.clear();
	localStorage.setItem(0, sortingValue);
	render();
});

addTaskForm.addEventListener('submit', e => {
	e.preventDefault();
	const task = getNewTaskData();
	addTaskToLocalStorage(task);
	render();
	addTaskForm.reset();
	addTaskForm.querySelector('[data-dismiss="modal"]').click();
});

tasksContainer.addEventListener('click', e => {
	if (e.target.classList.contains('btn-danger')) {
		const id = getTaskId(e);
		deleteTask(id);
		render();
	}

	if (e.target.classList.contains('btn-success')) {
		const id = getTaskId(e);
		toggleCompleteness(id);
		render();
	}

	if (e.target.classList.contains('btn-info')) {
		const id = getTaskId(e);
		fillTaskData(id);
		currentEditId = id;
	}
});

editTaskForm.addEventListener('submit', e => {
	e.preventDefault();
	const task = getEditTaskData();
	addTaskToLocalStorage(task);
	render();
	editTaskForm.reset();
	editTaskForm.querySelector('[data-dismiss="modal"]').click();
});

class Task {
	constructor(id, title, text, priority) {
		this.id = id;
		this.title = title;
		this.text = text;
		this.priority = priority;
		this.date = Date.now();
		this.isCompleted = false;
	}
}

function getNewTaskData() {
	const id = localStorage.length;
	const addTaskTitle = document.querySelector('#inputTitle').value;
	const addTaskText = document.querySelector('#inputText').value;
	const addTaskMedium = document.querySelector('#Medium').checked;
	const addTaskHigh = document.querySelector('#High').checked;
	let priority = '';

	if (addTaskMedium) {
		priority = PRIORITY.medium;
	} else if (addTaskHigh) {
		priority = PRIORITY.high;
	} else {
		priority = PRIORITY.low;
	}

	return new Task(id, addTaskTitle, addTaskText, priority);
}

function addTaskToLocalStorage(task) {
	localStorage.setItem(task.id, JSON.stringify(task));
}

function clearForRender() {
	while (currentTasks.firstChild) {
		currentTasks.removeChild(currentTasks.firstChild);
	}

	while (completedTasks.firstChild) {
		completedTasks.removeChild(completedTasks.firstChild);
	}
}

function toTaskDate(taskDate) {
	const date = new Date(taskDate);
	let hours = date.getHours(),
		minutes = date.getMinutes(),
		day = date.getDate(),
		month = date.getMonth() + 1,
		year = date.getFullYear();

	if (hours < 10) {
		hours = `0${hours}`;
	}

	if (minutes < 10) {
		minutes = `0${minutes}`;
	}

	if (day < 10) {
		day = `0${day}`;
	}

	if (month < 10) {
		month = `0${month}`;
	}
	return `${hours}:${minutes} ${day}.${month}.${year}`;
}

function renderTasks() {
	const tasksArray = [];
	const sortingValue = localStorage.getItem(0);
	let toDoCount = 0;
	let completedCount = 0;

	if (sortingValue === SORTING.asc) {
		for (let i = 1; i < localStorage.length; i++) {
			addToTasksArray(tasksArray, i);
		}
	} else if (sortingValue === SORTING.desc) {
		for (let i = localStorage.length - 1; i > 0; i--) {
			addToTasksArray(tasksArray, i);
		}
	}

	for (let i = 0; i < tasksArray.length; i++) {
		const current = tasksArray[i];
		if (!current) {
			continue;
		} else {
			let color = 'bg-warning';
			if (current.priority === PRIORITY.low) {
				color = 'bg-info';
			} else if (current.priority === PRIORITY.high) {
				color = 'bg-danger';
			}

			const editButton = '<button type="button" class="btn btn-info w-100" data-toggle="modal" data-target="#editModal">Edit</button>';
			const editBtn = !current.isCompleted ? editButton : '';

			const task = document.createElement('li');
			task.className = createTaskClassName(color);
			task.dataset.id = current.id;
			task.innerHTML = createTaskTemplate(current.title, current.priority, current.date, current.text, editBtn);

			if (!current.isCompleted) {
				currentTasks.appendChild(task);
				toDoCount++;
			} else {
				completedTasks.appendChild(task);
				completedCount++;
			}
		}
	}

	toDoHeading.textContent = `ToDo (${toDoCount})`;
	completedHeading.textContent = `Completed (${completedCount})`;
}

function deleteTask(id) {
	localStorage.setItem(id, null);
}

function toggleCompleteness(id) {
	const task = JSON.parse(localStorage.getItem(id));
	task.isCompleted = !task.isCompleted ? true : false;
	localStorage.setItem(id, JSON.stringify(task));
}

function fillTaskData(id) {
	const task = JSON.parse(localStorage.getItem(id));
	const editModal = document.querySelector('#editModal');
	editModal.querySelector('#editInputTitle').value = task.title;
	editModal.querySelector('#editInputText').value = task.text;
	if (task.priority === PRIORITY.low) {
		editModal.querySelector('#editLow').checked = true;
	} else if (task.priority === PRIORITY.medium) {
		editModal.querySelector('#editMedium').checked = true;
	} else {
		editModal.querySelector('#editHigh').checked = true;
	}
}

function getEditTaskData() {
	const task = JSON.parse(localStorage.getItem(currentEditId));
	task.title = editTaskForm.querySelector('#editInputTitle').value;
	task.text = editTaskForm.querySelector('#editInputText').value;

	if (editTaskForm.querySelector('#editMedium').checked) {
		task.priority = PRIORITY.medium;
	} else if (editTaskForm.querySelector('#editHigh').checked) {
		task.priority = PRIORITY.high;
	} else {
		task.priority = PRIORITY.low;
	}

	return task;
}

function render() {
	clearForRender();
	renderTasks();
}

function getTaskId(elem) {
	return elem.target.closest('.list-group-item').dataset.id;
}

function createTaskClassName(color) {
	return `list-group-item d-flex w-100 mb-2 ${color}`;
}

function createTaskTemplate(title, priority, date, text, editBtn) {
	return `
		<div class="w-100 mr-2">
			<div class="d-flex w-100 justify-content-between">
				<h5 class="mb-1">${title}</h5>
				<div>
					<small class="mr-2">${priority} priority</small>
					<small>${toTaskDate(new Date(date))}</small>
				</div>

			</div>
			<p class="mb-1 w-100">${text}</p>
		</div>
		<div class="dropdown m-2 dropleft">
			<button class="btn btn-secondary h-100" type="button" id="dropdownMenuItem1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				<i class="fas fa-ellipsis-v" aria-hidden="true"></i>
			</button>
			<div class="dropdown-menu p-2 flex-column" aria-labelledby="dropdownMenuItem1">
				<button type="button" class="btn btn-success w-100 mb-2">Toggle completeness</button>
				${editBtn}
				<button type="button" class="btn btn-danger w-100 mt-2">Delete</button>
			</div>
		</div>
	`;
}

function setSorting(value) {
	localStorage.setItem(0, value);
}

function addToTasksArray(array, item) {
	array.push(JSON.parse(localStorage.getItem(item)));
}

function toggleTheme() {
	const body = document.querySelector('body');
	body.classList.toggle('dark');
}