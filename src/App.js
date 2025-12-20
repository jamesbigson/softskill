import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Module from './pages/Module';
import MockInterview from './pages/MockInterview';


import Quiz from './pages/Quiz';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/modules" element={<Module />} />
          <Route path="/mock-interview" element={<MockInterview />} />

          <Route path="/quiz/:moduleId" element={<Quiz />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
