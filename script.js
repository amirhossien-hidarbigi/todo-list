// بازیابی پارامترهای URL
const urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get("id");
console.log(userId);

const form = document.getElementById("task-form");
async function api() {
  const response = await fetch(`http://localhost:3000/tasks/${userId}`);
  return await response.json();
}
// تابعی برای نمایش ویرایش یا ایجاد فرم کار
async function logForm() {
  if (userId === null) {
    form.innerHTML = ` 
        <div class="input-box"> 
          <input type="text" name="title" id="title" placeholder="Title" required> 
        </div> 
        <div class="input-box"> 
          <input type="text" name="description" id="text" placeholder="Description"> 
        </div> 
        <div class="input-box"> 
          <input type="date" name="due-date" id="date" placeholder="Due Date" required> 
        </div> 
        <button type="submit" class="edit-btn" id="submit-btn">Submit</button> 
    `;
  } else {
    const data = await api();
    form.innerHTML = ` 
      <div class="input-box"> 
        <input type="text" name="title" id="title" placeholder="Title" value="${data.title}" required> 
      </div> 
      <div class="input-box"> 
        <input type="text" name="description" id="text" placeholder="Description" value="${data.text}"> 
      </div> 
      <div class="input-box"> 
        <input type="date" name="due-date" id="date" placeholder="Due Date" value="${data.date}" required> 
      </div> 
      <button type="submit" class="edit-btn" id="save-btn">Save</button> 
    `;
  }
}

logForm();
const saveBtn = document.getElementById("save-btn");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async () => {
  const formData = new FormData(form);
  const title = formData.get("title");
  const description = formData.get("description");
  const dueDate = formData.get("due-date");

  if (userId !== null) {
    await fetch(`http://localhost:3000/tasks/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: title,
        date: dueDate,
        text: description === undefined ? "" : description,
        updatedAt: formatTimestamp(Date.now()),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response => {
      if (response.ok) {
        Toastify({
          text: "Changes were successfully saved",
          duration: 1000,
          className: "info",
          style: {
            background: "#8284FA",
          },
        });
        setTimeout(() => {
          userId = null;
          window.history.pushState(undefined, undefined, "/home.html");
          logForm();
        }, 1000);
      } else {
        if (!response.status === 404) {
          window.location.href = "404.html";
        }
      }
    });
  } else {
    await fetch(`http://localhost:3000/tasks`, {
      method: "POST",
      body: JSON.stringify({
        id: Date.now(),
        title: title,
        date: dueDate,
        text: description === undefined ? "" : description,
        createdAt: formatTimestamp(Date.now()),
        updatedAt: formatTimestamp(Date.now()),
        completed: false,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response => {
      if (response.ok) {
        Toastify({
          text: "New task successfully registered",
          duration: 1000,
          className: "info",
          style: {
            background: "#8284FA",
          },
        });
        setTimeout(() => {
          logForm();
        }, 1000);
      } else {
        if (response.status === 404) {
          window.location.href = "404.html";
        } else {
          // Handle other errors here
        }
      }
    });
  }
});

// تابعی برای قالب بندی مهر زمانی
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  return formattedDate;
}
