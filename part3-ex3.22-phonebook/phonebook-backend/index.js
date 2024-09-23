
require('dotenv').config()


const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(cors())

app.use(express.static('dist'))

// Morgan logging
morgan.token('body', (request) => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))





// Info route
app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      const currentTime = new Date()
      response.send(`
        <p>Phonebook had info for ${count} people</p>
        <p>${currentTime}</p>
      `)
    })
    .catch(error => next(error))
})










// Get all persons
app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    console.log('Fetched persons:', persons)
    response.json(persons)
  })
    .catch(error => next(error))
})




// Get person by ID
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})





// Add a new person
app.post('/api/persons', (request, response, next) => {

  const body = request.body

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
    response.json(savedPerson)
  })
    .catch(error => next(error))
})




// Update a person by ID
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  const person = {
    name,
    number,
  }

  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: 'query'  }
  )
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).send({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})




// Delete person by ID
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      if (result) {
        response.status(204).end()
      } else {
        response.status(404).send({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})








// Error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  response.status(500).send({ error: 'Server error' })
}

// Load error handler as last middleware
app.use(errorHandler)

// Listen to port
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})