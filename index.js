require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/Person')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

morgan.token('body', (req) => {
    if (req.method === 'POST') {
      return JSON.stringify(req.body)
    }
    return ''
  })

app.use(requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

/*let persons = [
    {
        name: 'Arto Hellas',
        number: '040-123456',
        id: 1
    },
    {
        name: 'Ada Lovelace',
        number: '39-44-5323523',
        id: 2
    },
    {
        name: 'Dan Abramov',
        number: '12-43-234345',
        id: 3
    },
    {
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
        id: 4
    },
]*/

app.get('/info', (req, res, next) => {
    Person.countDocuments({}).then(count => {
        const date = new Date()
        const currentDate = date.toDateString()
        const timeZone = date.toString().match(/\(([^)]+)\)$/)[1]
        const currentTime = date.toLocaleTimeString()

        res.send(`
            <p>Phonebook has info for ${count} people</p>
            <p> ${currentDate} ${currentTime} ${timeZone}</p>
        `)
    })
    .catch(error => next(error))
})



app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
  })

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
            response.json(person) 
        })
    .catch(error => next(error))
    })

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })

/*const generateRandomId = () => {
    return Math.floor(Math.random() * 1000)
}*/

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error: 'name and number are required' 
        })
    }
    if (persons.some(person => person.name === body.name)) {
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    }
    const person = new Person({
        name: body.name,
        number: body.number,
    })
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number,
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})