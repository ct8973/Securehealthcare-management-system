import React from 'react';
import { useState } from 'react'
import './App.css'
import Router from './router/AppRouter'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  <h1 className="text-3xl font-bold underline">
    <Router/>
  </h1>
    </>
  )
}

export default App
