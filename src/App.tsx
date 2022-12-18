import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Panel from './Panel';
import Player from './Player';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/panel" element={<Panel />} />
                <Route path="/player*" element={<Player />} />
                {/* <Route path="/about" element={<About />} /> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
