#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const filePath = path.join(__dirname, "todo.json");

async function readTasks() {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") return []; // File not found
    throw new Error(`Error reading tasks: ${err.message}`);
  }
}

async function writeTasks(tasks) {
  try {
    await fs.writeFile(filePath, JSON.stringify(tasks, null, 2));
  } catch (err) {
    throw new Error(`Error writing tasks: ${err.message}`);
  }
}

async function createTask(description) {
  if (!description) throw new Error("Description is required");

  const tasks = await readTasks();
  const newTask = {
    id: tasks.length + 1,
    description,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  tasks.push(newTask);
  await writeTasks(tasks);
  console.log(`Task created with ID: ${newTask.id}`);
}

async function listTasks() {
  const data = await readTasks();
  for (t of data) {
    console.log(`ID: ${t.id} - ${t.description}`);
  }
}

async function deleteTask(id) {
  const tasks = await readTasks();
  newTasks = tasks.filter((t) => t.id !== id);
  await writeTasks(newTasks);
  if (tasks.length === newTasks.length) {
    throw new Error(`Task ${id} not found`);
  }
  console.log(`Task ${id} deleted`);
}

(async () => {
  const action = process.argv[2] || "help";

  try {
    switch (action) {
      case "add":
        const taskDesc = process.argv[3];
        await createTask(taskDesc);
        break;
      case "ls":
        await listTasks();
        break;
      case "del":
        const taskId = process.argv[3];
        await deleteTask(parseInt(taskId));
        break;
      case "help":
        console.log(`
        Usage:
        $ todo add "Task description"
        $ todo ls
        $ todo del taskId
        `);
        break;
      default:
        throw new Error(
          `Unknown action: ${action}\n Use 'todo help' for usage`,
        );
    }
  } catch (err) {
    console.error(err.message);
  }
})();
