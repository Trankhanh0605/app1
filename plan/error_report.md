# 🐛 Error Report — Frontend & Backend

---

## Frontend Errors

### 🔴 Error 1: Wrong Router import in `main.jsx` (CRASH)

**File:** [main.jsx](file:///Users/khanh2006/Desktop/app1/frontend/src/main.jsx#L4-L9)

```jsx
import { Router } from 'react-router-dom'   // ❌ WRONG

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>       // ❌ `Router` is the low-level router, NOT for normal use
    <App />
  </Router>
)
```

**Problem:** You're importing `Router` (the low-level base router) instead of `BrowserRouter`. `Router` requires a `history` prop and a `location` prop — without them, React Router v7 will throw a runtime error like:

> `useHref() may be used only in the context of a <Router> component.`
> or a similar crash about missing `navigator`/`location`.

**Fix:** Import `BrowserRouter` instead:
```jsx
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

---

### 🔴 Error 2: Prop name mismatch in `Note.jsx` — `toggleImportance` vs `toggleImportanceOf`

**File:** [Note.jsx](file:///Users/khanh2006/Desktop/app1/frontend/src/components/Note.jsx#L2) receives `toggleImportance`:
```jsx
const Note = ({ note, toggleImportance, deleteNote }) => {
```

But [App.jsx](file:///Users/khanh2006/Desktop/app1/frontend/src/App.jsx#L78) passes `toggleImportanceOf`:
```jsx
<Note
  note={note}
  toggleImportanceOf={toggleImportanceOf}  // ❌ wrong prop name
  deleteNote={deleteNote}
/>
```

**Problem:** The prop is named `toggleImportanceOf` in App.jsx but the Note component destructures `toggleImportance`. So `toggleImportance` is always `undefined` inside Note.jsx, and clicking the "make important"/"make not important" button does **nothing** (no crash, but silently broken).

**Fix:** Use the same prop name in both places — either rename the prop in App.jsx to `toggleImportance` or rename the destructured prop in Note.jsx to `toggleImportanceOf`.

---

### 🟡 Error 3: Missing `remove` function in notes service

**File:** [notes.js (service)](file:///Users/khanh2006/Desktop/app1/frontend/src/services/notes.js#L27-L31)

The service exports:
```js
export default { getAll, create, update, setToken }
```

But [App.jsx](file:///Users/khanh2006/Desktop/app1/frontend/src/App.jsx#L52) calls:
```js
noteService.remove(id)   // ❌ `remove` is not defined in the service
```

**Problem:** `noteService.remove` is `undefined`. Clicking the "delete" button will crash with:

> `TypeError: noteService.remove is not a function`

**Fix:** Add the `remove` function to the notes service and export it:
```js
const remove = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`)
  return request.then(response => response.data)
}

export default { getAll, create, update, remove, setToken }
```

---

### 🟡 Error 4: Frontend test files use `useNavigate` / `useParams` outside Router context

**File:** [Note.test.jsx](file:///Users/khanh2006/Desktop/app1/frontend/src/components/Note.test.jsx#L10)

```jsx
render(<Note note={note} />)
```

`Note` component uses `useParams()` and `useNavigate()` internally, but the test renders it **without wrapping it in a Router**. This will cause the test to crash with:

> `useParams() may be used only in the context of a <Router> component.`

Similarly, [NoteForm.test.jsx](file:///Users/khanh2006/Desktop/app1/frontend/src/components/NoteForm.test.jsx#L9) renders `<NoteForm />` which calls `useNavigate()` internally — same crash.

**Fix:** Wrap rendered components in `<MemoryRouter>` in tests:
```jsx
import { MemoryRouter } from 'react-router-dom'
render(
  <MemoryRouter>
    <Note note={note} />
  </MemoryRouter>
)
```

---

### 🟡 Error 5: `Togglable` component exported as `Toggleable` (different spelling)

**File:** [Togglable.jsx](file:///Users/khanh2006/Desktop/app1/frontend/src/components/Togglable.jsx#L3)

```jsx
function Toggleable (props) {    // function name is "Toggleable" (extra 'e')
  ...
}
export default Toggleable        // exported as "Toggleable"
```

But the file is named `Togglable.jsx` and is imported as:
```jsx
import Togglable from './Togglable'
```

**Problem:** This is **not** a runtime error (default exports don't depend on the name), but it creates confusion. The component renders as `<Toggleable>` in React DevTools while every import calls it `Togglable`. This inconsistency will be annoying when debugging.

---

### 🟡 Error 6: `NoteList.jsx` imports unused components

**File:** [NoteList.jsx](file:///Users/khanh2006/Desktop/app1/frontend/src/components/NoteList.jsx#L5-L9)

```jsx
import Note from './Note'        // ❌ never used in NoteList
import NoteForm from './NoteForm' // ❌ never used in NoteList
```

These imports are dead code. `Note` and `NoteForm` are used in `App.jsx` via routing, not inside `NoteList`.

---

## Backend Errors

### 🔴 Error 7: `express.static('dist')` is placed BEFORE `express.json()` middleware

**File:** [app.js](file:///Users/khanh2006/Desktop/app1/backend/app.js#L28-L30)

```js
app.use(express.static('dist'))    // line 28
app.use(express.json())            // line 29
app.use(middleware.requestLogger)  // line 30
```

**Problem:** The `requestLogger` middleware logs `request.body`, but for any request that reaches the static middleware first (which is anything matching a file in `dist/`), the body isn't parsed yet. More importantly, `express.static` is placed before `express.json()`, so if a static file matches a route, the JSON body parser never runs. This ordering can cause `request.body` to be `undefined` in edge cases.

> [!NOTE]
> This is a minor issue since static file requests don't have JSON bodies. But best practice is `express.json()` first, then request logger, then static.

---

### 🔴 Error 8: Backend POST `/api/notes` tests will FAIL — no auth token

**File:** [note_api.test.js](file:///Users/khanh2006/Desktop/app1/backend/tests/note_api.test.js#L69-L96)

```js
await api
  .post('/api/notes')
  .send(newNote)
  .expect(201)    // ❌ will get 401, not 201
```

The `POST /api/notes` controller in [notes.js](file:///Users/khanh2006/Desktop/app1/backend/controllers/notes.js#L35) requires a valid JWT token:
```js
const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
```

But the test sends no `Authorization` header. `jwt.verify(null, secret)` will throw a `JsonWebTokenError`, returning a **401** response — the test expects **201** and will **fail**.

The same issue affects the "fails with status code 400 if data invalid" test — it will also get 401 instead of 400.

**Fix:** The test needs to first create a user, log in, get a token, and include `Authorization: Bearer <token>` in the POST request.

---

### 🟡 Error 9: MongoDB password hardcoded in `mongo.js`

**File:** [mongo.js](file:///Users/khanh2006/Desktop/app1/backend/mongo.js#L10)

```js
const url = `mongodb+srv://khanh2006:${password}@cluster0.94oisi6.mongodb.net/noteApp?appName=Cluster0`
```

> [!WARNING]
> This file also reveals your MongoDB Atlas username format. While the file takes the password from CLI args, combined with the `.env` file (which contains the full credentials and **is NOT in `.gitignore`** based on the gitignore size), your credentials may be committed to Git.

---

### 🟡 Error 10: `.env` file may be committed to Git

**File:** [.env](file:///Users/khanh2006/Desktop/app1/backend/.env)

The `.env` contains your MongoDB password (`khanh060506`) and your JWT secret in plain text. Verify that `.env` is in your [.gitignore](file:///Users/khanh2006/Desktop/app1/backend/.gitignore) (the file is only 33 bytes, which is suspicious — it may only contain `node_modules`).

---

## Summary Table

| #  | Severity | Location | Error |
|----|----------|----------|-------|
| 1  | 🔴 Crash | Frontend `main.jsx` | Wrong `Router` import — should be `BrowserRouter` |
| 2  | 🔴 Bug | Frontend `App.jsx` → `Note.jsx` | Prop name mismatch: `toggleImportanceOf` vs `toggleImportance` |
| 3  | 🔴 Crash | Frontend `services/notes.js` | Missing `remove()` function — delete button crashes |
| 4  | 🟡 Test failure | Frontend tests | `Note.test.jsx` and `NoteForm.test.jsx` render without Router context |
| 5  | 🟡 Inconsistency | Frontend `Togglable.jsx` | Function name `Toggleable` doesn't match filename `Togglable` |
| 6  | 🟡 Dead code | Frontend `NoteList.jsx` | Unused imports: `Note`, `NoteForm` |
| 7  | 🟡 Ordering | Backend `app.js` | `express.static` before `express.json()` |
| 8  | 🔴 Test failure | Backend `note_api.test.js` | POST note tests have no auth token — will get 401 not 201 |
| 9  | 🟡 Security | Backend `mongo.js` | Hardcoded DB connection pattern |
| 10 | 🟡 Security | Backend `.env` | Credentials possibly committed to Git |
