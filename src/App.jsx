import { useState, useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import { FaRegEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [todo, setTodo] = useState("");
  const [time, setTime] = useState("");
  const [todos, setTodos] = useState([]);
  const [showFinished, setShowFinished] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let todoString = localStorage.getItem("todos");
    if (todoString) {
      let todos = JSON.parse(todoString);
      setTodos(todos.sort((a, b) => new Date(a.time) - new Date(b.time)));
    }
  }, []);

  useEffect(() => {
    saveToLS();
    scheduleReminders();
  }, [todos]);

  const saveToLS = () => {
    localStorage.setItem("todos", JSON.stringify(todos));
  };

  const handleEdit = (id) => {
    let task = todos.find((t) => t.id === id);
    setTodo(task.todo);
    setTime(task.time);
    setEditId(id);
    setEditMessage("Task is ready to edit!");
    setTimeout(() => setEditMessage(""), 2000);
  };

  const handleSaveEdit = () => {
    if (todo.trim() && time.trim()) {
      if (editId) {
        // Update existing task
        setTodos(
          todos.map((item) =>
            item.id === editId ? { ...item, todo, time } : item
          ).sort((a, b) => new Date(a.time) - new Date(b.time))
        );
        setEditId(null);
      } else {
        // Add new task
        const newTodo = { id: uuidv4(), todo, time, isCompleted: false };
        setTodos([...todos, newTodo].sort((a, b) => new Date(a.time) - new Date(b.time)));
      }
      setTodo("");
      setTime("");
      setSaveMessage("Your task was saved successfully!");
      setTimeout(() => setSaveMessage(""), 2000);
    }
  };

  const customConfirm = (message) => {
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.innerHTML = `
        <div class="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <p class="text-lg font-semibold mb-4">${message}</p>
            <div class="flex justify-end gap-4">
              <button id="yesBtn" class="px-4 py-2 bg-green-600 text-white rounded-lg">Yes</button>
              <button id="noBtn" class="px-4 py-2 bg-red-600 text-white rounded-lg">No</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById("yesBtn").onclick = () => {
        resolve(true);
        document.body.removeChild(modal);
      };

      document.getElementById("noBtn").onclick = () => {
        resolve(false);
        document.body.removeChild(modal);
      };
    });
  };

  const handleDelete = async (id) => {
    const deleteConfirm = await customConfirm("Are you sure you want to delete this task?");
    if (deleteConfirm) {
      setTodos(todos.filter((item) => item.id !== id));
      setDeleteMessage("Todo deleted successfully!");
      setTimeout(() => setDeleteMessage(""), 2000);
    }
  };

  const handleCheckbox = (id) => {
    setTodos(
      todos.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const scheduleReminders = () => {
    todos.forEach((task) => {
      if (task.isCompleted) return;

      const now = new Date().getTime();
      const todoTime = new Date(task.time).getTime();
      const fiveMinutesBefore = todoTime - 5 * 60 * 1000;
      const followUpTime = todoTime;
      const secondReminderTime = todoTime + 10 * 60 * 1000;

      if (now < fiveMinutesBefore) {
        setTimeout(() => {
          showNotification(`⏳ Reminder: 5 minutes left for "${task.todo}"!`);
        }, fiveMinutesBefore - now);
      }

      if (now < followUpTime) {
        setTimeout(() => confirmTaskCompletion(task.id, task.todo), followUpTime - now);
      }

      if (now < secondReminderTime) {
        setTimeout(() => {
          showNotification(`💪 Stay strong! You can still complete "${task.todo}". Keep pushing!`);
        }, secondReminderTime - now);
      }
    });
  };

  const confirmTaskCompletion = async (id, taskName) => {
    const userResponse = await customConfirm(`⏰ Are you up to your work, buddy? Task: "${taskName}"`);

    setTodos((prevTodos) =>
      prevTodos.map((task) => {
        if (task.id === id && !task.isCompleted) {
          if (userResponse) {
            return { ...task, isCompleted: true };
          } else {
            setTimeout(() => {
              showNotification(`💪 You got this! Keep pushing through your task: "${taskName}".`);
            }, 10 * 60 * 1000);
          }
        }
        return task;
      })
    );
  };

  const showNotification = (message) => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Task Reminder", { body: message, icon: "/notification-icon.png" });
        }
      });
    } else {
      alert(message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto my-5 p-6 md:p-8 lg:p-10 bg-violet-100 rounded-xl min-h-[80vh] max-w-2xl">
        <h1 className="font-bold text-center text-2xl md:text-3xl">Task Manager</h1>
        {saveMessage && <div className="text-green-600 text-center font-bold mt-2">{saveMessage}</div>}
        {editMessage && <div className="text-blue-600 text-center font-bold mt-2">{editMessage}</div>}
        {deleteMessage && <div className="text-red-600 text-center font-bold mt-2">{deleteMessage}</div>}

        <div className="mt-4">
          <h2 className="text-xl font-bold">{editId ? "Edit Task" : "Add a Todo"}</h2>
          <div className="flex flex-col md:flex-row gap-3 mt-2">
            <input onChange={(e) => setTodo(e.target.value)} value={todo} type="text" placeholder="Enter task" className="w-full px-4 py-2 border rounded-lg" />
            <input onChange={(e) => setTime(e.target.value)} value={time} type="datetime-local" className="w-full px-4 py-2 border rounded-lg" />
            <button onClick={handleSaveEdit} disabled={!todo || !time} className="bg-violet-700 hover:bg-violet-900 text-white px-4 py-2 rounded-lg">{editId ? "Update" : "Save"}</button>
          </div>
        </div>

        <h2 className="text-xl font-bold mt-4">Your Todos</h2>
        <div className="mt-3">
          {todos.map((item) => (
            (showFinished || !item.isCompleted) && (
              <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-md mt-2">
                <input type="checkbox" checked={item.isCompleted} onChange={() => handleCheckbox(item.id)} />
                <div className={`${item.isCompleted ? "line-through text-gray-500" : ""}`}>{item.todo} <span className="text-sm text-gray-400">({item.time})</span></div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(item.id)} className="text-blue-600"><FaRegEdit /></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600"><AiFillDelete /></button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
