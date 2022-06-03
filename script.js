// TODO fix itemChecker's working with local storage

const state = {
  todos: [],
  page: "all",
  pages: ["all", "active", "completed"],
  activeItems() {
    return this.todos.filter((item) => !item.checked);
  },
  completedItems() {
    return this.todos.filter((item) => item.checked);
  },
  isSelectedAll() {
    return this.completedItems().length == this.todos.length;
  },
  currentItems() {
    return this.page == "all"
      ? this.todos
      : this.page == "active"
      ? this.activeItems()
      : this.completedItems();
  },
};

if (JSON.parse(localStorage.getItem("data"))) {
  if (JSON.parse(localStorage.getItem("data")).todos.length) {
    state.todos = JSON.parse(localStorage.getItem("data")).todos;
    hideShowElem({ show: true, selector: "#arrow" });
    hideShowElem({ show: true, selector: ".controller" });
    setActivePage({ page: "all" });
    renderActiveItemsCounter();
  }
}
// console.log(state);

//#region helpers

// console.log(localStorage.getItem("data"))
function reloadLocalStorage() {
  localStorage.setItem("data", JSON.stringify(state));
}
function returnNewTodoObj(text) {
  return {
    text,
    checked: false,
    id: uniqueId(),
  };
}

function uniqueId() {
  const date = Date.now();
  return `${date}`;
}

// UI rendering
function renderTodoItem({ text, id, checked = false }) {
  const parentElement = document.querySelector("#content");

  const parentDiv = document.createElement("div");
  const removeIcon = document.createElement("span");
  const todoItem = document.createElement("div");
  const todoItemChecker = document.createElement("input");

  parentDiv.className = "item-parent";
  parentDiv.id = id;
  removeIcon.innerText = "x";
  removeIcon.className = "removeIcon";
  todoItemChecker.type = "checkbox";
  todoItemChecker.classList.add("checkbox-style");
  todoItem.innerText = text;
  todoItem.classList.add("secondary");

  todoItemChecker.onchange = handleCheckTodoItem;
  removeIcon.onclick = handleRemoveItem;

  parentDiv.appendChild(todoItemChecker);
  parentDiv.appendChild(todoItem);
  parentDiv.append(removeIcon);

  parentElement.appendChild(parentDiv);
  checkItem(todoItemChecker, checked);
}

function renderItems() {
  const items = state.currentItems();
  const parentElement = document.querySelector("#content");
  parentElement.innerHTML = "";
  items.forEach((item) => {
    renderTodoItem(item);
  });
  // console.log("tandz");
}

function hideShowElem({ selector, show, className = "d-none" }) {
  const elem = document.querySelector(selector);
  if (show) {
    elem.classList.remove(className);
  } else {
    elem.classList.add(className);
  }
}

function checkItem(elem, checked) {
  elem.checked = checked;
  const p = elem.nextSibling;
  if (checked) {
    p.classList.add("checked");
  } else {
    p.classList.remove("checked");
  }
  console.log(p);
}

function renderActiveItemsCounter() {
  const count = state.activeItems().length;
  const text = count == 1 ? "item left" : "items left";
  const elem = document.querySelector(".item-left");
  elem.innerText = `${count} ${text}`;
}

function setActivePage({ page = "all", className = "selected-page" }) {
  const { pages } = state;
  state.page = page;
  pages.forEach((item) => {
    const elem = document.querySelector(`#${item}`);
    if (item == page) {
      elem.classList.add(className);
    } else {
      elem.classList.remove(className);
    }
  });
  renderItems();
}

//#endregion

// #region Event Listeners
function handleAddTodoItems({ key, target }) {
  const actualValue = target.value.trim();
  if (key == "Enter" && actualValue != "") {
    const newItem = returnNewTodoObj(actualValue);
    state.todos.push(newItem);
    target.value = "";

    renderActiveItemsCounter();
    renderTodoItem({ ...newItem });
    if (state.todos.length == 1) {
      hideShowElem({ show: true, selector: "#arrow" });
      hideShowElem({ show: true, selector: ".controller" });
      setActivePage({ page: "all" });
    }
    reloadLocalStorage();
  }
}

function handleRemoveItem({ target: { parentElement } }) {
  const { id } = parentElement;
  const filteredTodos = state.todos.filter((todoItem) => todoItem.id !== id);
  state.todos = filteredTodos;
  parentElement.remove();

  renderActiveItemsCounter();
  hideShowElem({
    show: !!state.completedItems().length,
    selector: "#clearCompleted",
  });
  if (!state.todos.length) {
    hideShowElem({ show: false, selector: "#arrow" });
    hideShowElem({ show: false, selector: ".controller" });
  }
  reloadLocalStorage();
}

function handleSelectAll() {
  let newTodos = [];
  const isSelectedAll = state.isSelectedAll();
  state.todos.forEach((item) => {
    const checkbox = document.getElementById(item.id).firstChild;
    newTodos.push({ ...item, checked: !isSelectedAll });
    checkItem(checkbox, !isSelectedAll);
  });
  state.todos = newTodos;
  hideShowElem({
    show: !!state.completedItems().length,
    selector: "#clearCompleted",
  });
  renderActiveItemsCounter();
  reloadLocalStorage();
}

function handleCheckTodoItem(e) {
  const {
    checked,
    parentElement: { id },
  } = e.target;
  const elementIndex = state.todos.findIndex((item) => item.id == id);
  state.todos[elementIndex].checked = checked;

  checkItem(e.target, checked);
  hideShowElem({
    show: !!state.completedItems().length,
    selector: "#clearCompleted",
  });
  renderActiveItemsCounter();
}

function handleClearCompleted() {
  const todosClone = [...state.todos];
  const activeItems = [];
  todosClone.forEach((todoItem) => {
    const { checked, id } = todoItem;
    if (checked) {
      // TODO check query selector
      const elem = document.getElementById(id);
      elem.remove();
    } else {
      activeItems.push(todoItem);
    }
  });
  state.todos = activeItems;

  hideShowElem({ show: false, selector: "#clearCompleted" });
  renderActiveItemsCounter();
  if (!state.todos.length) {
    hideShowElem({ show: false, selector: "#arrow" });
    hideShowElem({ show: false, selector: ".controller" });
  }
  reloadLocalStorage();
}

function handleChangePage({ target: { id } }) {
  if (id == "filters-parent") return;
  if (state.page != id) setActivePage({ page: id });
}

//#endregion

// main start

const mainInput = document.querySelector("#main");
const filtersParent = document.querySelector("#filters-parent");
const clearCompletedElem = document.querySelector("#clearCompleted");
const selectAllElem = document.querySelector("#arrow");
renderItems();
mainInput.addEventListener("keypress", handleAddTodoItems);
clearCompletedElem.addEventListener("click", handleClearCompleted);
selectAllElem.addEventListener("click", handleSelectAll);
filtersParent.addEventListener("click", handleChangePage);
