import { useParams, useNavigate } from 'react-router-dom'

const Note = ({ note,id, toggleImportance, deleteNote }) => {

  const id = useParams().id
  const navigate = useNavigate()
  const note = notes.find(n => n.id === id)

  const label = note.important ? 'make not important' : 'make important'

  const handleDelete = () => {
    if (window.confirm(`Delete note "${note.content}"?`)) {
      deleteNote(id)
      navigate('/notes')
    }
  }

  return (
    <li className="note">
      <span>{note.content}</span>
      <button onClick={() => toggleImportance(id)}>{label}</button>
      <button onClick={handleDelete}>delete</button>
    </li>
  )
}

export default Note