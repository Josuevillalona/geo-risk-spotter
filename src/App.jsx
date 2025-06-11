import { useState } from 'react';
import Map from './Map';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* Render the Map component */}
      <Map />
    </>
  )
}

export default App
