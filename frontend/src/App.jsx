// ELMAY-APP/frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Importa los componentes de las páginas
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} exact />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
