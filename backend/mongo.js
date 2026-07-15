const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://khanh2006:${password}@cluster0.94oisi6.mongodb.net/noteApp?appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

// define schema
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

// create and saving objects
// const note1 = new Note({
//   content: 'HTML is easy',
//   important: true,
// })

// note1.save().then(result => {
//   console.log('note1 saved!')
//   mongoose.connection.close()
// })

// const note2=new Note({
//   content: 'learning to code', 
//   important: false,
// })

// note2.save().then(result=>{
//   console.log('note2 saved successfully')
//   mongoose.connection.close()
// })

Note.find({important: true}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})

