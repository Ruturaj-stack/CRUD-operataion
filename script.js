let userList = [];
let nextId = 0;
let editId = null;
let viewMode = false;
let myModal = null;
let currentView = 'table';

const inputFile = document.getElementById("imgInput");
const previewImg = document.getElementById("imgPreview");

function loadFromLocalStorage() {
  const savedData = localStorage.getItem('userManagementData');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      userList = parsed.users || [];
      nextId = parsed.nextId || 1;
      
      userList.forEach(user => {
        if (!user.status) {
          user.status = 'todo';
        }
      });
      
      console.log('✅ Data loaded from localStorage');
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('userManagementData', JSON.stringify({
      users: userList,
      nextId: nextId
    }));
    console.log('⚡ Data saved');
  } catch (e) {
    console.error('save error');
  }
}

inputFile.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function render() {
  if (currentView === 'table') {
    renderTable();
  } else {
    renderKanban();
  }
}

function renderTable() {
  const container = document.getElementById("tableContainer");
  
  if (userList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <h3>No Users Found</h3>
        <p>Start by adding a new user!</p>
        <button class="btn btn-primary" onclick="document.getElementById('addUserBtn').click()">
          <i class="bi bi-plus-circle"></i> Add Your First User
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-wrapper">
      <table class="table table-hover text-center table-bordered mb-0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Picture</th>
            <th>Name</th>
            <th>Age</th>
            <th>City</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Position</th>
            <th>Start Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="data"></tbody>
      </table>
    </div>
  `;
  
  const data = document.getElementById("data");
  userList.forEach((user) => {
    const statusBadge = getStatusBadge(user.status);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.id}</td>
      <td><img src="${user.img}" width="50" height="50" class="rounded-circle"></td>
      <td>${user.name}</td>
      <td>${user.age}</td>
      <td>${user.city}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td>${user.post}</td>
      <td>${user.sDate}</td>
      <td>${statusBadge}</td>
      <td>
        <button class="btn btn-success action-btn" onclick="viewUser(${user.id})" title="View">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-primary action-btn" onclick="editUser(${user.id})" title="Edit">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-danger action-btn" onclick="deleteUser(${user.id})" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    data.appendChild(row);
  });
}

function getStatusBadge(status) {
  const badges = {
    'todo': '<span class="badge bg-primary">To Do</span>',
    'in-progress': '<span class="badge bg-warning text-dark">In Progress</span>',
    'done': '<span class="badge bg-success">Done</span>'
  };
  return badges[status] || badges['todo'];
}

function renderKanban() {
  const container = document.getElementById("kanbanContainer");
  
  if (userList.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="width: 100%;">
        <i class="bi bi-inbox"></i>
        <h3>No Users Found</h3>
        <p>Start by adding a new user!</p>
        <button class="btn btn-primary" onclick="document.getElementById('addUserBtn').click()">
          <i class="bi bi-plus-circle"></i> Add Your First User
        </button>
      </div>
    `;
    return;
  }

  const todoUsers = userList.filter(u => u.status === 'todo');
  const inProgressUsers = userList.filter(u => u.status === 'in-progress');
  const doneUsers = userList.filter(u => u.status === 'done');

  container.innerHTML = `
    <div class="kanban-column" data-status="todo">
      <div class="kanban-column-header">
        <span><i class="bi bi-circle"></i> To Do</span>
        <span class="count">${todoUsers.length}</span>
      </div>
      <div class="kanban-cards" id="todo-cards"></div>
    </div>
    
    <div class="kanban-column" data-status="in-progress">
      <div class="kanban-column-header">
        <span><i class="bi bi-arrow-repeat"></i> In Progress</span>
        <span class="count">${inProgressUsers.length}</span>
      </div>
      <div class="kanban-cards" id="in-progress-cards"></div>
    </div>
    
    <div class="kanban-column" data-status="done">
      <div class="kanban-column-header">
        <span><i class="bi bi-check-circle"></i> Done</span>
        <span class="count">${doneUsers.length}</span>
      </div>
      <div class="kanban-cards" id="done-cards"></div>
    </div>
  `;

  renderKanbanCards('todo', todoUsers);
  renderKanbanCards('in-progress', inProgressUsers);
  renderKanbanCards('done', doneUsers);

  setupDragAndDrop();
}

function renderKanbanCards(status, users) {
  const container = document.getElementById(`${status}-cards`);
  
  users.forEach(user => {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    card.dataset.userId = user.id;
    
    card.innerHTML = `
      <div class="kanban-card-header">
        <img src="${user.img}" alt="${user.name}">
        <div class="kanban-card-title">${user.name}</div>
      </div>
      <div class="kanban-card-body">
        <div><i class="bi bi-briefcase"></i> ${user.post}</div>
        <div><i class="bi bi-geo-alt"></i> ${user.city}</div>
        <div><i class="bi bi-envelope"></i> ${user.email}</div>
        <div><i class="bi bi-telephone"></i> ${user.phone}</div>
      </div>
      <div class="kanban-card-actions">
        <button class="btn btn-success action-btn" onclick="viewUser(${user.id})" title="View">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-primary action-btn" onclick="editUser(${user.id})" title="Edit">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-danger action-btn" onclick="deleteUser(${user.id})" title="Delete">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function setupDragAndDrop() {
  const cards = document.querySelectorAll('.kanban-card');
  const columns = document.querySelectorAll('.kanban-cards');

  cards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
  });

  columns.forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);
    column.addEventListener('dragleave', handleDragLeave);
  });
}

let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('drag-over');
  return false;
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  
  this.classList.remove('drag-over');
  
  if (draggedElement) {
    const userId = parseInt(draggedElement.dataset.userId);
    const newStatus = this.parentElement.dataset.status;
    
    const user = findUserById(userId);
    if (user) {
      user.status = newStatus;
      saveToLocalStorage();
      renderKanban();
    }
  }
  
  return false;
}

function findUserById(id) {
  return userList.find(u => u.id === id);
}

function viewUser(id) {
  const user = findUserById(id);
  if (!user) return;

  document.getElementById("modalTitle").innerHTML = '<i class="bi bi-eye"></i> View User Details';
  document.getElementById("submitBtn").style.display = "none";

  previewImg.src = user.img;
  document.getElementById("name").value = user.name;
  document.getElementById("age").value = user.age;
  document.getElementById("city").value = user.city;
  document.getElementById("email").value = user.email;
  document.getElementById("phone").value = user.phone;
  document.getElementById("post").value = user.post;
  document.getElementById("sDate").value = user.sDate;
  document.getElementById("status").value = user.status || 'todo';

  editId = id;
  viewMode = true;
  disableFields(true);

  myModal = new bootstrap.Modal(document.getElementById("userForm"));
  myModal.show();
}

function editUser(id) {
  const user = findUserById(id);
  if (!user) return;

  document.getElementById("modalTitle").innerHTML = '<i class="bi bi-pencil-square"></i> Edit User';
  document.getElementById("submitBtn").innerHTML = '<i class="bi bi-save"></i> Update User';
  document.getElementById("submitBtn").style.display = "block";

  previewImg.src = user.img;
  document.getElementById("name").value = user.name;
  document.getElementById("age").value = user.age;
  document.getElementById("city").value = user.city;
  document.getElementById("email").value = user.email;
  document.getElementById("phone").value = user.phone;
  document.getElementById("post").value = user.post;
  document.getElementById("sDate").value = user.sDate;
  document.getElementById("status").value = user.status;

  editId = id;
  viewMode = false;
  disableFields(false);

  myModal = new bootstrap.Modal(document.getElementById("userForm"));
  myModal.show();
}

function deleteUser(id) {
  if (confirm("Are you sure you want to delete this user?")) {
    userList = userList.filter(u => u.id !== id);
    saveToLocalStorage();
    render();
    alert("✅ User deleted successfully!");
  }
}

function disableFields(state) {
  document.getElementById("name").disabled = state;
  document.getElementById("age").disabled = state;
  document.getElementById("city").disabled = state;
  document.getElementById("email").disabled = state;
  document.getElementById("phone").disabled = state;
  document.getElementById("post").disabled = state;
  document.getElementById("sDate").disabled = state;
  document.getElementById("status").disabled = state;
  inputFile.disabled = state;
}

document.getElementById("addUserBtn").addEventListener("click", function() {
  document.getElementById("modalTitle").innerHTML = '<i class="bi bi-plus-circle"></i> Add New User';
  document.getElementById("submitBtn").innerHTML = '<i class="bi bi-save"></i> Save User';
  document.getElementById("submitBtn").style.display = "block";

  previewImg.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Crect width='250' height='250' fill='%23e9ecef'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='60' fill='%23667eea'%3EUser%3C/text%3E%3C/svg%3E";

  document.getElementById("name").value = "";
  document.getElementById("age").value = "";
  document.getElementById("city").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("post").value = "";
  document.getElementById("sDate").value = "";
  document.getElementById("status").value = "todo";
  inputFile.value = "";

  disableFields(false);
  editId = null;
  viewMode = false;

  myModal = new bootstrap.Modal(document.getElementById("userForm"));
  myModal.show();
});

function submitForm() {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value;
  const city = document.getElementById("city").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const post = document.getElementById("post").value.trim();
  const sDate = document.getElementById("sDate").value;
  const status = document.getElementById("status").value;

  if (!name) { alert("⚠️ Please enter the name!"); document.getElementById("name").focus(); return; }
  if (!age || age < 1 || age > 120) { alert("⚠️ Please enter a valid age (1-120)!"); return; }
  if (!city) { alert("⚠️ Please enter the city!"); return; }
  if (!email) { alert("⚠️ Please enter the email!"); return; }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) { alert("⚠️ Please enter a valid email!"); return; }

  const phonePattern = /^[0-9]{10}$/;
  if (!phonePattern.test(phone)) { alert("⚠️ Please enter a valid 10-digit phone number!"); return; }

  if (!post) { alert("⚠️ Please enter the position!"); return; }
  if (!sDate) { alert("⚠️ Please enter the start date!"); return; }

  const user = {
    img: previewImg.src,
    name,
    age,
    city,
    email,
    phone,
    post,
    sDate,
    status
  };

  if (editId === null) {
    user.id = nextId++;
    userList.push(user);
    alert("✅ User added successfully!");
  } else {
    const existingUser = findUserById(editId);
    Object.assign(existingUser, user);
    alert("🎉 User updated successfully!");
  }

  saveToLocalStorage();
  render();
  if (myModal) myModal.hide();
}

document.getElementById("tableViewBtn").addEventListener("click", () => {
  currentView = "table";
  document.getElementById("tableViewBtn").classList.add("active");
  document.getElementById("kanbanViewBtn").classList.remove("active");
  document.getElementById("tableContainer").style.display = "block";
  document.getElementById("kanbanContainer").style.display = "none";
  render();
});

document.getElementById("kanbanViewBtn").addEventListener("click", () => {
  currentView = "kanban";
  document.getElementById("kanbanViewBtn").classList.add("active");
  document.getElementById("tableViewBtn").classList.remove("active");
  document.getElementById("tableContainer").style.display = "none";
  document.getElementById("kanbanContainer").style.display = "flex";
  render();
});

loadFromLocalStorage();
render();

