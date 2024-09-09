
require('dotenv').config();


const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const Person = require('./models/person');


app.use(express.json());
app.use(cors());



app.use(express.static('dist'));

morgan.token('body', (request) => JSON.stringify(request.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));





let persons = []



app.get('/info', (request, response) => {
  const currentTime = new Date();
  const numberOfPersons = persons.length;

  response.send(`
    <p>Phonebook had info for ${numberOfPersons} people</p>
    <p>${currentTime}</p>
    `);
})





app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    console.log('Fetched persons:', persons)
    response.json(persons);
  })
})






app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find(p => p.id === id);

  if (person) { response.json(person); }
  else { response.status(404).end() }
})






app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  persons = persons.filter(p => p.id !== id);

  response.status(204).end();
})



app.post('/api/persons', (request, response) => {
  
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: 'name is missing' })
  }

  if (!body.number) {
    return response.status(400).json({ error: 'number is missing' })
  }


  const person = new Person ({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson);
  }).catch(error => {
    console.log('Error saving new person:', error);
    response.status(500).json({ error: 'Failed to save person to the database' });

  })

  
})





const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
   });