'use strict';

const addTaskForm = document.querySelector('#addTaskForm');
const currentTasks = document.querySelector('#currentTasks');
const completedTasks = document.querySelector('#completedTasks');
const incr = document.querySelector('#incr');
const decr = document.querySelector('#decr');
const toDoHeading = document.querySelector('#toDoHeading');
const completedHeading = document.querySelector('#completedHeading');
const tasksContainer = document.querySelector('#tasksContainer');
const clearAll = document.querySelector('#clearAll');
const editTaskForm = document.querySelector('#editTaskForm');
let currentEditId = '';

clearForRender();
renderTasks();

localStorage.setItem(0, 'incr');

incr.addEventListener('click', () => {
	localStorage.setItem(0, 'incr');
	clearForRender();
	renderTasks();
});

decr.addEventListener('click', () => {
	localStorage.setItem(0, 'decr');
	clearForRender();
	renderTasks();
});

clearAll.addEventListener('click', () => {
	localStorage.clear();
	localStorage.setItem(0, 'incr');
	clearForRender();
	renderTasks();
});

addTaskForm.addEventListener('submit', e => {
	e.preventDefault();
	const task = getNewTaskData();
	addTaskToLocalStorage(task);
	clearForRender();
	renderTasks();
	addTaskForm.reset();
	addTaskForm.querySelector('[data-dismiss="modal"]').click();
});

tasksContainer.addEventListener('click', e => {
	if (e.target.classList.contains('btn-danger')) {
		const id = e.target.closest('.list-group-item').dataset.id;
		deleteTask(id);
		clearForRender();
		renderTasks();
	}

	if (e.target.classList.contains('btn-success')) {
		const id = e.target.closest('.list-group-item').dataset.id;
		toggleCompleteness(id);
		clearForRender();
		renderTasks();
	}

	if (e.target.classList.contains('btn-info')) {
		const id = e.target.closest('.list-group-item').dataset.id;
		fillTaskData(id);
		currentEditId = id;
	}
});

editTaskForm.addEventListener('submit', e => {
	e.preventDefault();
	const task = getEditTaskData();
	addTaskToLocalStorage(task);
	clearForRender();
	renderTasks();
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
		priority = 'Medium';
	} else if (addTaskHigh) {
		priority = 'High';
	} else {
		priority = 'Low';
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
		hours = '0' + hours;
	}

	if (minutes < 10) {
		minutes = '0' + minutes;
	}

	if (day < 10) {
		day = '0' + day;
	}

	if (month < 10) {
		month = '0' + month;
	}
	return `${hours}:${minutes} ${day}.${month}.${year}`;
}

function renderTasks() {
	const tasksArray = [];
	let toDoCount = 0;
	let completedCount = 0;

	if (localStorage.getItem(0) === 'incr') {
		for (let i = 1; i < localStorage.length; i++) {
			tasksArray.push(JSON.parse(localStorage.getItem(i)));
		}
	} else if (localStorage.getItem(0) === 'decr') {
		for (let i = localStorage.length - 1; i > 0; i--) {
			tasksArray.push(JSON.parse(localStorage.getItem(i)));
		}
	}

	for (let i = 0; i < tasksArray.length; i++) {
		const current = tasksArray[i];
		if (current === null) {
			continue;
		} else {
			let color = 'bg-warning';
			if (current.priority === 'Low') {
				color = 'bg-light';
			} else if (current.priority === 'High') {
				color = 'bg-danger';
			}

			let editBtn = '<button type="button" class="btn btn-info w-100" data-toggle="modal" data-target="#editModal">Edit</button>';
			if (current.isCompleted) {
				editBtn = '';
			}

			const task = document.createElement('li');
			task.className = `list-group-item d-flex w-100 mb-2 ${color}`;
			task.dataset.id = current.id;
			task.innerHTML = `
			<div class="w-100 mr-2">
				<div class="d-flex w-100 justify-content-between">
					<h5 class="mb-1">${current.title}</h5>
					<div>
						<small class="mr-2">${current.priority} priority</small>
						<small>${toTaskDate(new Date(current.date))}</small>
					</div>

				</div>
				<p class="mb-1 w-100">${current.text}</p>
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
	if (!task.isCompleted) {
		task.isCompleted = true;
	} else {
		task.isCompleted = false;
	}
	localStorage.setItem(id, JSON.stringify(task));
}

function fillTaskData(id) {
	const task = JSON.parse(localStorage.getItem(id));
	const editModal = document.querySelector('#editModal');
	editModal.querySelector('#editInputTitle').value = task.title;
	editModal.querySelector('#editInputText').value = task.text;
	if (task.priority === 'Low') {
		editModal.querySelector('#editLow').checked = true;
	} else if (task.priority === 'Medium') {
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
		task.priority = 'Medium';
	} else if (editTaskForm.querySelector('#editHigh').checked) {
		task.priority = 'High';
	} else {
		task.priority = 'Low';
	}

	return task;
}