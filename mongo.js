const mongoose = require('mongoose')

const password = process.argv[2]
const url = `mongodb+srv://atomikx:${password}@cluster0.ribgxny.mongodb.net/phonebookApp?retryWrites=true&w=majority`
const name = process.argv[3]
const number = process.argv[4]

mongoose.set('strictQuery',false)
mongoose.connect(url)
  .then(() => {
    console.log('Connected')
  })

const entrySchema = new mongoose.Schema({
  name : String,
  number: String
})

const Entry = mongoose.model('Entry',entrySchema)

if(process.argv.length > 3){
  const entry = new Entry ({
    name : name,
    number : number
  })
  entry.save()
    .then(() => {
      console.log(`added ${name} number ${number} to phonebook`)
      mongoose.connection.close()
    })
} else {
  Entry
    .find({})
    .then(persons => {
      persons.forEach(person => {
        console.log(person.name,person.number)
      })
      mongoose.connection.close()
    })
}