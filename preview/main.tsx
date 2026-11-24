// This entry deliberately imports ONLY the public demo, not any auth/backend code.
// It exists for UI review before the owner registers the real DeepSpace app.
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Demo from '../src/fleet/Demo'
import '../src/styles.css'
createRoot(document.getElementById('root')!).render(<BrowserRouter><Demo/></BrowserRouter>)
