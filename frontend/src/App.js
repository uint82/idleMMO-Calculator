import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import NavBar from './components/NavBar';
import Footer from './components/Footer';

import Woodcutting from './routes/Woodcutting';
import Mining from './routes/Mining';
import Fishing from './routes/Fishing';
import Alchemy from './routes/Alchemy';
import Smelting from './routes/Smelting';
import Cooking from './routes/Cooking';
import Forge from './routes/Forge';
import Combat from './routes/Combat';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
          <Routes>
            <Route path="/" element={<Navigate to="/woodcutting" replace />} />
            <Route path="/woodcutting" element={<Woodcutting />} />
            <Route path="/mining" element={<Mining />} />
            <Route path="/fishing" element={<Fishing />} />
            <Route path="/alchemy" element={<Alchemy />} />
            <Route path="/smelting" element={<Smelting />} />
            <Route path="/cooking" element={<Cooking />} />
            <Route path="/forge" element={<Forge />} />
            <Route path="/combat" element={<Combat />} />
            {/* Add more routes as needed */}
          </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;