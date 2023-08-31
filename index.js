require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

let persons = []
// const requestLogger = (request,response,next) => {
//   console.log('Method ',request.method)
//   console.log('Path ',request.path)
//   console.log('Body',request.body)
//   console.log('---')
//   next()
// }
const unknownEndpoint = (request,response) => {
  response.status(404).send({
    error: 'unknown endpoint'
  })
}
morgan.token('body',req => JSON.stringify(req.body))
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req,res)
  ].join(' ')
}))
const errorHandler = (error,request,response,next) => {
  if(error.name === 'CastError'){
    return response.status(404).send({ error:'malformatted id' })
  }else if(error.name === 'ValidationError'){
    console.log(error.message)
    return response.status(404).json({ error : error.message })
  }
  next(error)
}
const Entry = require('./models/entry')
app.delete('/api/persons/:id',(request,response,next) => {
  const id = request.params.id
  Entry
    .findByIdAndRemove(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => {
      console.log(error)
      next(error)
    })

})

app.put('/api/persons/:id',(request,response,next) => {
  const id = request.params.id
  const { name,number } = request.body
  Entry
    .findByIdAndUpdate(id,
      { name,number },
      { new:true,runValidators:true,context:'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    }).catch(error => next(error))

})
app.get('/api/persons',(request,response) => {

  console.log('enter get')

  Entry
    .find({})
    .then(entries => {
      persons = entries
      response.json(entries)
    })
})

// const generateId = () =>{
//     const newId = Math.floor(Math.random()*9999)
//     return persons.some((p)=> p.id===newId)
//     ? generateId() : newId
// }
app.post('/api/persons',(req,res,next) => {
  const body = req.body
  console.log('enter')
  const duplicate = () => persons.some((p) => p.name === body.name)
  if(!body.name||!body.number) {
    res.status(404).json({
      error:'name or number missing'
    })
  }
  else if(duplicate()){
    console.log('enter duplicate')
    res.status(404).json({
      error:`${body.name} already in the phonebook`
    })
  }
  else {
    const person = new Entry ({
      name : body.name,
      number : body.number
    })
    person
      .save()
      .then(savedEntry => {
        res.json(savedEntry)
      }).catch(error => next(error))
  }
})

app.get('/api/persons/:id',(req,res,next) => {
  Entry
    .findById(req.params.id)
    .then(person => {
      res.json(person)
    }).catch(error => {
      // res.status(404).end()
      console.log('error',error.message)
      next(error)
    })
})

app.get('/info',(req,res) => {
  const currentDate = new Date()
  res.send(`<p>Phonebook has response for ${persons.length} people<p><p>${currentDate}<p>`)
})
app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT,() => {
  console.log(`server listening on port ${PORT}`)
})

