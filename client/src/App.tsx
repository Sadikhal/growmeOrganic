import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Artworks from './pages/Artworks';
        

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Artworks />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
