import { useState, useEffect } from 'react'
import Navbar from "./components/Navbar.jsx";
import { FaRegEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [todo, setTodo] = useState("")
  const [todos, setTodos] = useState([])
  const [showfinished, setshowfinished] = useState(true)
  const [editMessage, setEditMessage] = useState("")
  const [deleteMessage, setDeleteMessage] = useState("")
  
  useEffect(() => {
    let todoString = localStorage.getItem("todos")
    if (todoString) {
      let todos = JSON.parse(todoString)
      setTodos(todos)
    }
  }, [])

  useEffect(() => {
    saveToLS();
  }, [todos]);

  const saveToLS = () => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }

  const toggleFinished = () => {
    setshowfinished(!showfinished)
  }

  const handleEdit = (e, id) => {
    let t = todos.find(i => i.id === id);
    setTodo(t.todo);
    let newTodos = todos.filter(item => item.id !== id);
    setTodos(newTodos);
    setEditMessage("Todo edited successfully!");
    setTimeout(() => setEditMessage(""), 2000); // Clear message after 2 seconds
  }

  const handleSaveEdit = () => {
    if (todo.trim().length > 0) {
      setTodos([...todos, { id: uuidv4(), todo, isCompleted: false }]);
      setTodo("");
      setEditMessage("Edit saved successfully!");
      setTimeout(() => setEditMessage(""), 2000);
    }
  }

  const handleDelete = (e, id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete your note?");
    if (isConfirmed) {
      let newTodos = todos.filter(item => item.id !== id);
      setTodos(newTodos);
      setDeleteMessage("Todo deleted successfully!");
      setTimeout(() => setDeleteMessage(""), 2000);
    }
  };

  const handleChange = (e) => {
    setTodo(e.target.value)
  }

  const handleCheckbox = (e) => {
    let id = e.target.name
    let index = todos.findIndex(item => item.id === id);
    let newTodos = [...todos];
    newTodos[index].isCompleted = !newTodos[index].isCompleted;
    setTodos(newTodos)
  }

  return (
    <>
      <Navbar />
      <div className="mx-3 md:container md:mx-auto my-5 rounded-xl py-5 bg-violet-100 min-h-[80vh] w-full md:w-1/2 p-4 md:p-6 lg:p-8">
        <h1 className='font-bold text-center text-2xl md:text-3xl'>Task Manager - Manage Your Todos</h1>
        {editMessage && <div className="text-green-600 text-center font-bold mt-2">{editMessage}</div>}
        {deleteMessage && <div className="text-red-600 text-center font-bold mt-2">{deleteMessage}</div>}
        <div className="addTodo flex flex-col gap-4 mt-4">
          <h2 className='text-xl md:text-2xl font-bold'>Add a Todo</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input onChange={handleChange} value={todo} type="text" className='w-full rounded-full px-5 py-2 border' />
            <button onClick={handleSaveEdit} disabled={todo.length <= 3} className='bg-violet-800 mx-2 rounded-full hover:bg-violet-950 disabled:bg-violet-700 px-4 py-2 text-sm font-bold text-white'>Save</button>
          </div>
        </div>
        <div className='flex items-center gap-2 my-4'>
          <input id='show' onChange={toggleFinished} className='cursor-pointer' type="checkbox" checked={showfinished} />
          <label htmlFor="show">Show Finished</label>
        </div>
        <div className='h-[1px] bg-black opacity-15 w-full my-2'></div>
        <h2 className='text-xl md:text-2xl font-bold'>Your Todos</h2>
        <div className="todos mt-4">
          {todos.length === 0 && <div className='m-5 text-center'>No Todos to display</div>}
          {todos.map(item => (
            (showfinished || !item.isCompleted) && (
              <div key={item.id} className="todo flex flex-col md:flex-row md:items-center justify-between gap-3 my-3 p-2 border rounded-lg bg-white shadow-sm">
                <div className='flex items-center gap-3'>
                  <input name={item.id} onChange={handleCheckbox} type="checkbox" checked={item.isCompleted} className='cursor-pointer' />
                  <div className={item.isCompleted ? "line-through text-gray-500" : ""}>{item.todo}</div>
                </div>
                <div className="buttons flex gap-2">
                  <button onClick={(e) => handleEdit(e, item.id)} className='bg-violet-800 hover:bg-violet-950 p-2 text-sm font-bold text-white rounded-md'><FaRegEdit /></button>
                  <button onClick={(e) => handleDelete(e, item.id)} className='bg-red-600 hover:bg-red-700 p-2 text-sm font-bold text-white rounded-md'><AiFillDelete /></button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </>
  )
}

export default App;
