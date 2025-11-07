import { Routes, Route } from 'react-router-dom';
import Authentication from '@routes/Authentication/authentication';
import Home from '@routes/Home/home';
import './App.css';

function App() {
  return (
    <Routes>
         <Route path='/' element={<Authentication/>}/>
         <Route path='/home' element={<Home/>}/>
    </Routes>
  );
}

export default App;
