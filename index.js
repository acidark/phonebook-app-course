const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")
app.use(cors())
app.use(express.static('build'))


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]



app.delete("/api/persons/:id",(req,res)=>{
    const id = Number(req.params.id)
    persons = persons.filter((n)=>n.id!==id)
    res.status(204).end()
})
const requestLogger = (request,response,next) => {
    console.log('Method ',request.method)
    console.log('Path ',request.path)
    console.log('Body',request.body)
    console.log('---')
    next()
}
const unknownEndpoint = (request,response)=> {
    response.status(404).send({
        error: "unknown endpoint"
    })
}
app.use(express.json())

// app.use(requestLogger)

morgan.token('body',req=> JSON.stringify(req.body))
app.use(morgan((tokens, req, res)=> {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req,res)
  ].join(' ')
}))
app.get("/api/persons",(request,response)=>{
    console.log("enter get")
    response.json(persons)
})

const generateId = () =>{
    const newId = Math.floor(Math.random()*9999)
    return persons.some((p)=> p.id===newId)
    ? generateId() : newId
}
app.post("/api/persons",(req,res)=>{
    const body = req.body
    console.log('enter')
    const duplicate = () => persons.some((p)=>p.name === body.name)
    if(!body.name||!body.number) {
        res.status(404).json({
            error:"name or number missing"
        })
    }
    else if(duplicate()){
         res.status(404).json({
            error:`${body.name} already in the phonebook`
        })
    } 
    else {
        const person = {
            id : generateId(),
            name : body.name,
            number : body.number            
        }
        persons = persons.concat(person)
        res.json(person)
    }
})

app.get("/api/persons/:id",(req,res)=>{
    const id = Number(req.params.id)
    const person = persons.find((n)=>{
        return id===n.id})
    if(!person){
        res.status(204).end()
    }
    else {
        res.json(person)
    }
})

app.get("/info",(req,res)=>{
    const currentDate = new Date()
    res.send(`<p>Phonebook has response for ${persons.length} people<p><p>${currentDate}<p>`)
})
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT,()=>{
    console.log(`server listening on port ${PORT}`)
})

