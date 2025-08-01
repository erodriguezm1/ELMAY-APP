// ELMAY-APP/frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Importa los componentes de las páginas
import Home from './pages/Home';
import Login from './pages/Login';

// Importa tus componentes universales (como Header y Footer)
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

function App() {
  return (
    <Router>
      <Header/>
      <div>
        <Routes>
          <Route path="/" element={<Home />} exact />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
      <Footer/>
    </Router>
  );
}

export default App;
