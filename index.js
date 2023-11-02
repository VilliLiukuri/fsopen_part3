const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

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

let persons = [
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
]

app.get('/info', (req, res) => {
    const date = new Date()
    const currentDate = date.toDateString();
    const timeZone = date.toString().match(/\(([^)]+)\)$/)[1]
    const currentTime = date.toLocaleTimeString()
  
    res.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p> ${currentDate} ${currentTime} ${timeZone}</p>
    `)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => {
      //console.log(person.id, typeof person.id, id, typeof id, person.id === id)
      return person.id === id
    })
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
})


app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

const generateRandomId = () => {
    return Math.floor(Math.random() * 1000)
}

app.post('/api/persons', (request, response) => {
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
    const person = {
        name: body.name,
        number: body.number,
        id: generateRandomId(),
    }
    persons = persons.concat(person)
    response.status(201).json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})