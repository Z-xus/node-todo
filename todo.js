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

async function listTasks(status) {
  const data = await readTasks();
  if (!data.length) {
    console.log("No tasks found");
    return;
  }

  if (!["pending", "in-progress", "done", ""].includes(status)) {
    throw new Error("Invalid status. Use 'pending', 'in-progress', 'done'");
  }

  const idWidth = 5;
  const descWidth = 20;
  const statusWidth = 15;

  console.log(
    `ID`.padEnd(idWidth) +
      " | " +
      `Description`.padEnd(descWidth) +
      " | " +
      `Status`.padEnd(statusWidth),
  );
  console.log("-".repeat(idWidth + descWidth + statusWidth + 6));

  for (t of data) {
    if (status && t.status !== status) continue;

    console.log(
      `${t.id}`.padEnd(idWidth) +
        " | " +
        `${t.description}`.padEnd(descWidth) +
        " | " +
        `${t.status}`.padEnd(statusWidth),
    );
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

async function updateTask(updateTaskId, newStatus) {
  if (!["pending", "in-progress", "done"].includes(newStatus)) {
    throw new Error("Invalid status. Use 'pending', 'in-progress', 'done'");
  }
  const data = await readTasks();
  const task = data.find((t) => t.id === updateTaskId);
  if (!task) throw new Error(`Task ${updateTaskId} not found`);
  task.status = newStatus;
  task.updatedAt = new Date();
  await writeTasks(data);
  console.log(`Task ${updateTaskId} updated to ${newStatus}`);
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
        const status = process.argv[3];
        await listTasks(status);
        break;
      case "del":
        const taskId = process.argv[3];
        await deleteTask(parseInt(taskId));
        break;
      case "update":
        const updateTaskId = process.argv[3];
        const newStatus = process.argv[4];
        await updateTask(parseInt(updateTaskId), newStatus);
        break;
      case "help":
        console.log(`
        Usage:
        $ todo add ["Task description"]
        $ todo ls [status]
        $ todo del [task ID]
        $ todo update [task ID] [new status]
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
