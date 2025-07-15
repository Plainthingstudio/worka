import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import test utility for debugging
import './utils/testBriefConnection.ts'

createRoot(document.getElementById("root")!).render(<App />);
