function Note({note, toggleImportance}){
  // if {} must have the "return" statement, otherwise, it will fail
  const label=note.important?'make not important': 'make important'
  return (
    <li className="note">
      {note.content}
      <button onClick={toggleImportance}>{label}</button>
    </li>
  )
}

export default Note