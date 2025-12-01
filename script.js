// User list with unique IDs
let userList = [];
let nextId = 1;
let editId = null;
let viewMode = false;
let myModal = null;

const inputFile = document.getElementById("imgInput");
const previewImg = document.getElementById("imgPreview");

// Load data from localStorage on page load
function loadFromLocalStorage() {
  const savedData = localStorage.getItem('userManagementData');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      userList = parsed.users || [];
      nextId = parsed.nextId || 1;
      console.log('✅ Data loaded from localStorage');
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }
}

// Save data to localStorage
function saveToLocalStorage() {
  try {
    localStorage.setItem('userManagementData', JSON.stringify({
      users: userList,
      nextId: nextId
    }));
    console.log('✅ Data saved to localStorage');
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

// Image preview handler
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

// Render table or empty state
function render() {
  const container = document.getElementById("tableContainer");
  
  if (userList.length === 0) {
    // Show empty state
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

  // Show table
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="data"></tbody>
      </table>
    </div>
  `;
  
  const data = document.getElementById("data");
  userList.forEach((user) => {
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

// Find user by ID
function findUserById(id) {
  return userList.find(u => u.id === id);
}

// View user
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

  editId = id;
  viewMode = true;
  disableFields(true);

  myModal = new bootstrap.Modal(document.getElementById("userForm"));
  myModal.show();
}

// Edit user
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

  editId = id;
  viewMode = false;
  disableFields(false);

  myModal = new bootstrap.Modal(document.getElementById("userForm"));
  myModal.show();
}

// Delete user
function deleteUser(id) {
  if (confirm("Are you sure you want to delete this user?")) {
    userList = userList.filter(u => u.id !== id);
    saveToLocalStorage();
    render();
    alert("✅ User deleted successfully!");
  }
}

// Disable/enable fields
function disableFields(state) {
  document.getElementById("name").disabled = state;
  document.getElementById("age").disabled = state;
  document.getElementById("city").disabled = state;
  document.getElementById("email").disabled = state;
  document.getElementById("phone").disabled = state;
  document.getElementById("post").disabled = state;
  document.getElementById("sDate").disabled = state;
  inputFile.disabled = state;
}

// Add user button click
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
  inputFile.value = "";
  
  disableFields(false);
  editId = null;
  viewMode = false;
  
  myModal = new bootstrap.Modal(document.getElementById("userForm"));
  myModal.show();
});

// Submit form
function submitForm() {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value;
  const city = document.getElementById("city").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const post = document.getElementById("post").value.trim();
  const sDate = document.getElementById("sDate").value;

  // Validation
  if (!name) {
    alert("⚠️ Please enter the name!");
    document.getElementById("name").focus();
    return;
  }

  if (!age || age < 1 || age > 120) {
    alert("⚠️ Please enter a valid age (1-120)!");
    document.getElementById("age").focus();
    return;
  }

  if (!city) {
    alert("⚠️ Please enter the city!");
    document.getElementById("city").focus();
    return;
  }

  if (!email) {
    alert("⚠️ Please enter the email!");
    document.getElementById("email").focus();
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert("⚠️ Please enter a valid email address!");
    document.getElementById("email").focus();
    return;
  }

  const phonePattern = /^[0-9]{10}$/;
  if (!phone) {
    alert("⚠️ Please enter the phone number!");
    document.getElementById("phone").focus();
    return;
  }

  if (!phonePattern.test(phone)) {
    alert("⚠️ Please enter a valid 10-digit phone number!");
    document.getElementById("phone").focus();
    return;
  }

  if (!post) {
    alert("⚠️ Please enter the position!");
    document.getElementById("post").focus();
    return;
  }

  if (!sDate) {
    alert("⚠️ Please select the start date!");
    document.getElementById("sDate").focus();
    return;
  }

  // Create user object
  const user = {
    img: previewImg.src,
    name: name,
    age: age,
    city: city,
    email: email,
    phone: phone,
    post: post,
    sDate: sDate
  };

  // Add or update
  if (editId === null) {
    user.id = nextId++;
    userList.push(user);
    alert("✅ User added successfully!");
  } else {
    const existingUser = findUserById(editId);
    if (existingUser) {
      Object.assign(existingUser, user);
      existingUser.id = editId; // Keep the same ID
    }
    alert("✅ User updated successfully!");
  }

  // Save to localStorage
  saveToLocalStorage();

  // Update table
  render();

  // Close modal
  if (myModal) {
    myModal.hide();
  }

  // Reset
  editId = null;
  viewMode = false;
}

// Initial load
loadFromLocalStorage();
render();
