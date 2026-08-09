import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function NoteForm({ createNote }) {
  const [newNote, setNewNote] = useState('')
  const navigate = useNavigate()

  const addNote = (event) => {
    event.preventDefault()
    createNote({
      content: newNote,
      important: true
    })

    // after adding a new note, the user is navigated to the page containing all notes
    navigate('/notes')
    setNewNote('')
  }
  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={event => setNewNote(event.target.value)}
          placeholder='write your note here'
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default NoteForm