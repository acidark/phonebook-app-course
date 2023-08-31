const mongoose = require('mongoose')

mongoose.set('strictQuery',false)
const url = process.env.MONGODB_URI


mongoose.connect(url)
  .then(() => {
    console.log('connected')
  }).catch(error => {
    console.log('error connecting',error.message)
  })

const entrySchema = new mongoose.Schema({
  name:{
    type:String,
    minLength:3,
    required:true },
  number:{
    type:String,
    validate:{
      validator:function(value){
        return /\d{3}-\d{5}/.test(value)||/\d{2}-\d{6}/.test(value)
      },
      message:'invalid format number'
    }
  }
})

entrySchema.set('toJSON',{
  transform:(document,returnedDoc) => {
    returnedDoc.id = returnedDoc._id.toString()
    delete returnedDoc._id
    delete returnedDoc.__v
  }
})

module.exports = mongoose.model('Entry',entrySchema)
