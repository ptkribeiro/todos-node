const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({error: "User not found"});
  }

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (users) => users.username === username
  );
  
  if(userAlreadyExists) {
    return response.status(400).json({error: "User already exists!"});
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).json(users.find(user => user.username === username));
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todos);

  return response.status(201).json(user.todos.find(todo => todo.id === todos.id));
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body;
  const { user } = request;

  const todosExists = user.todos.find(todo => todo.id === id);
  
  if (!todosExists) {
    return response.status(404).json({error: "To-Do not found"}); 
  }

  todosExists.title = title;
  todosExists.deadline = new Date(deadline);
  return response.status(200).json(user.todos.find(todo => todo.id === id));

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todosExists = user.todos.find(todo => todo.id === id);

  if(!todosExists) {
    return response.status(404).json({error: "To-do not found"});
  }

  todosExists.done = true;

  return response.status(200).json(user.todos.find(todo => todo.id === id));
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const todosExists = user.todos.find(todo => todo.id === id);
  
  if(!todosExists) {
    return response.status(404).json({error: "To-Do not found"});
  }
  user.todos.splice(todosExists, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;