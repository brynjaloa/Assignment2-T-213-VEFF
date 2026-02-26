import axios from "axios";

/* =========================
   CONFIG
========================= */
const API_BASE = "https://veff-2026-quotes.netlify.app/api/v1";
const LOCAL_API_BASE = "http://localhost:3000/api/v1";


/* =========================
   QUOTE FEATURE
========================= */

/**
 * Fetch a quote from the API
 * @param {string} category - quote category
 */
const loadQuote = async (category = "general") => {
   try {
      const response = await axios.get(`${API_BASE}/quotes`, {
         params: { category }
   });

      const data = response.data;

      // get DOM elements
      const quoteText = document.getElementById("quote-text");
      const quoteAuthor = document.getElementById("quote-author");

      if (quoteText) {
      // update DOM
      quoteText.textContent = `"${data.quote}"`;
      }
      if (quoteAuthor) {
         quoteAuthor.textContent = `${data.author}`;
      }
   } catch (error) {
      console.error("Error while fetching quote", error);

      const quoteText = document.getElementById("quote-text");
      const quoteAuthor = document.getElementById("quote-author");
      
      // Show an error in UI
      if (quoteText) quoteText.textContent = "Failed to load quote";

      if (quoteAuthor) quoteAuthor.textContent = "";
      }
};

/**
 * Attach event listeners for quote feature
 */
const wireQuoteEvents = () => {
   const select = document.getElementById("quote-category-select");
   const newQuoteBtn = document.getElementById("new-quote-btn");

   // Load a new quote when new category is selected 
   if (select) {
   select.addEventListener("change", async (event) => {
      const category = event.target.value;
      await loadQuote(category);
   });
}

   if (newQuoteBtn && select) {
   // Load a new quote when the button is pressed
   newQuoteBtn.addEventListener("click", async () => {
      await loadQuote(select.value);
   });
}
};


/* =========================
   TASK FEATURE
========================= */

/**
 * Render a single task item into the task list
 * @param {Object} task - task object with id, task, finished
*/

const renderTask = (task) => {
   const taskList = document.querySelector(".task-list");
   if (!taskList) return;

   const li = document.createElement("li");
   li.classList.add("task-item");
   li.dataset.id = task.id;

   const checkbox = document.createElement("input");
   checkbox.type = "checkbox";
   checkbox.id = `task-${task.id}`;
   checkbox.checked = task.finished === 1;

   checkbox.addEventListener("change", async () => {
      await updateTaskStatus(task.id, checkbox.checked ? 1 : 0);
   });

   const label = document.createElement("label");
   label.htmlFor = `task-${task.id}`;
   label.textContent = task.task;

   li.appendChild(checkbox);
   li.appendChild(label);
   taskList.append(li);
};

/** 
 * Fetch tasks from backend and display them
 */
const loadTasks = async () => {
   try {
      const response = await axios.get(`${LOCAL_API_BASE}/tasks`);
      const tasks = response.data;

      const taskList = document.querySelector(".task-list");
      if (taskList) taskList.innerHTML = "";

      tasks.forEach((task) => renderTask(task));
   } catch (error) {
      console.error("Error while fetching tasks", error);
   }
};

/** 
 * Update task's finished status on the backend
 * @param {number} id - task id
 * @param {number} finished - 0 or 1
*/
const updateTaskStatus = async (id, finished) => {
   try {
      await axios.patch(`${LOCAL_API_BASE}/tasks/${id}`, {finished});
   } catch(error) {
      console.error("Error while updating task status", error)
   }
};

/**
 * Add a new task to the backend and display it
 */

const addTask = async () => {
   const input = document.getElementById("new-task");
   if (!input) return;

   const taskText = input.value.trim();
   if (!taskText) return;

   try {
      const response = await axios.post(`${LOCAL_API_BASE}/tasks`, {task: taskText});
      const newTask = response.data;
      renderTask(newTask);
      input.value = "";
   } catch (error) {
      console.error("Error while adding task", error);
   }
};

/**
 * Attach event listeners for task feature
 */
const wireTaskEvents = () => {
   const addBtn = document.getElementById("add-task-btn");
   const input = document.getElementById("new-task");

   if (addBtn) {
      addBtn.addEventListener("click", async () => {
         await addTask();
      });
   }

   if (input) {
      input.addEventListener("keydown", async (event) => {
         if (event.key === "Enter") {
            event.preventDefault();
            await addTask();
         }
      });
   }
};

/* =========================
   NOTES FEATURE
========================= */

/**
 * Fetch notes from the backend and display them
 */

const loadNotes = async () => {
   try {
      const response = await axios.get(`${LOCAL_API_BASE}/notes`);
      const notes = response.data

      const textarea = document.getElementById("notes-text");
      if (textarea) {
         textarea.value = notes.notes ?? "";
      }
   } catch (error) {
      console.error("Error while fetching notes", error);
   }
};

/**
 * Save notes to the backend
 */
const saveNotes = async () => {
   const textarea = document.getElementById("notes-text");
   const saveBtn = document.getElementById("save-notes-btn");
   if (!textarea) return;

   try {
      await axios.put(`${LOCAL_API_BASE}/notes`, { notes: textarea.value });
      if (saveBtn) saveBtn.disabled = true;
   } catch (error) {
      console.error("Error while saving notes", error);
   }
};

/**
 * Attach event listeners for notes feature
 */
const wireNotesEvents = () => {
   const textarea = document.getElementById("notes-text");
   const saveBtn = document.getElementById("save-notes-btn");

   if (textarea && saveBtn) {
      textarea.addEventListener("input", () => {
         saveBtn.disabled = false;
      });

      saveBtn.addEventListener("click", async () => {
         await saveNotes();
      });
   }
};


/* =========================
   INIT
========================= */

/**
 * Initialize application
 */
const init = async () => {
  wireQuoteEvents();
  wireTaskEvents();
  wireNotesEvents();

  const select = document.getElementById("quote-category-select");
  const category = select?.value || "general";

  // await loadQuote(category);
  await Promise.all([
   loadQuote(category),
   loadTasks(),
   loadNotes(),
  ]);
};

/* =========================
   EXPORT (DO NOT REMOVE)
========================= */

export { init, loadQuote, wireQuoteEvents };

init();
