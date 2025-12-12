// Task Manager Application
class TaskManager {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentFilter = "all";
    this.initializeElements();
    this.attachEventListeners();
    this.renderTasks();
    this.setMinDate();
  }

  // Initialize DOM elements
  initializeElements() {
    this.taskForm = document.getElementById("taskForm");
    this.taskInput = document.getElementById("taskInput");
    this.dateInput = document.getElementById("dateInput");
    this.taskList = document.getElementById("taskList");
    this.taskCount = document.getElementById("taskCount");
    this.emptyState = document.getElementById("emptyState");
    this.filterButtons = document.querySelectorAll(".filter-btn");
    this.taskError = document.getElementById("taskError");
    this.dateError = document.getElementById("dateError");
  }

  // Set minimum date to today
  setMinDate() {
    const today = new Date().toISOString().split("T")[0];
    this.dateInput.setAttribute("min", today);
    this.dateInput.value = today;
  }

  // Attach event listeners
  attachEventListeners() {
    this.taskForm.addEventListener("submit", (e) => this.handleSubmit(e));
    this.filterButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilter(e));
    });

    // Real-time validation
    this.taskInput.addEventListener("input", () => this.validateTaskInput());
    this.dateInput.addEventListener("input", () => this.validateDateInput());
  }

  // Validate task input
  validateTaskInput() {
    const value = this.taskInput.value.trim();

    if (value.length === 0) {
      this.taskError.textContent = "";
      return false;
    }

    if (value.length < 3) {
      this.taskError.textContent = "Tugas minimal 3 karakter";
      return false;
    }

    if (value.length > 100) {
      this.taskError.textContent = "Tugas maksimal 100 karakter";
      return false;
    }

    this.taskError.textContent = "";
    return true;
  }

  // Validate date input
  validateDateInput() {
    const selectedDate = new Date(this.dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.dateInput.value) {
      this.dateError.textContent = "Tanggal harus diisi";
      return false;
    }

    if (selectedDate < today) {
      this.dateError.textContent = "Tanggal tidak boleh di masa lalu";
      return false;
    }

    this.dateError.textContent = "";
    return true;
  }

  // Handle form submission
  handleSubmit(e) {
    e.preventDefault();

    const isTaskValid = this.validateTaskInput();
    const isDateValid = this.validateDateInput();

    if (!isTaskValid || !isDateValid) {
      return;
    }

    const taskText = this.taskInput.value.trim();
    const taskDate = this.dateInput.value;

    if (taskText && taskDate) {
      this.addTask(taskText, taskDate);
      this.taskForm.reset();
      this.setMinDate();
      this.taskError.textContent = "";
      this.dateError.textContent = "";
    }
  }

  // Add new task
  addTask(text, date) {
    const task = {
      id: Date.now(),
      text: text,
      date: date,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(task);
    this.saveTasks();
    this.renderTasks();
    this.showNotification("✅ Tugas berhasil ditambahkan!");
  }

  // Delete task
  deleteTask(id) {
    if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.saveTasks();
      this.renderTasks();
      this.showNotification("🗑️ Tugas berhasil dihapus!");
    }
  }

  // Toggle task completion
  toggleComplete(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
    }
  }

  // Filter tasks
  handleFilter(e) {
    this.filterButtons.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
    this.currentFilter = e.target.dataset.filter;
    this.renderTasks();
  }

  // Get filtered tasks
  getFilteredTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (this.currentFilter) {
      case "today":
        return this.tasks.filter((task) => {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });

      case "upcoming":
        return this.tasks.filter((task) => {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate > today && !task.completed;
        });

      case "completed":
        return this.tasks.filter((task) => task.completed);

      case "all":
      default:
        return this.tasks;
    }
  }

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  }

  // Render tasks
  renderTasks() {
    const filteredTasks = this.getFilteredTasks();
    this.taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
      this.emptyState.classList.add("show");
      this.taskCount.textContent = "0 tugas";
      return;
    }

    this.emptyState.classList.remove("show");
    this.taskCount.textContent = `${filteredTasks.length} tugas`;

    filteredTasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      this.taskList.appendChild(taskElement);
    });
  }

  // Create task element
  createTaskElement(task) {
    const div = document.createElement("div");
    div.className = `task-item ${task.completed ? "completed" : ""}`;

    div.innerHTML = `
            <div class="task-content">
                <h4>${this.escapeHtml(task.text)}</h4>
                <p>📅 ${this.formatDate(task.date)}</p>
            </div>
            <div class="task-actions">
                <button class="btn-complete" onclick="taskManager.toggleComplete(${
                  task.id
                })">
                    ${task.completed ? "↩️ Batal" : "✓ Selesai"}
                </button>
                <button class="btn-delete" onclick="taskManager.deleteTask(${
                  task.id
                })">
                    🗑️ Hapus
                </button>
            </div>
        `;

    return div;
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Show notification
  showNotification(message) {
    // Create notification element
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #000000;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.5);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "fadeOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Save tasks to localStorage
  saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  // Load tasks from localStorage
  loadTasks() {
    const tasks = localStorage.getItem("tasks");
    return tasks ? JSON.parse(tasks) : [];
  }
}

// Initialize the app when DOM is loaded
let taskManager;
document.addEventListener("DOMContentLoaded", () => {
  taskManager = new TaskManager();
});
