import './App.css';
import {Routes, Route}  from "react-router-dom";
import Authentication from './Routes/Authentication/authentication';
import Home from './Routes/Home/home';

function App() {
  return (
    <Routes>
         <Route path='/' element={<Authentication/>}/>
         <Route path='/home' element={<Home/>}/>
    </Routes>
  );
}

export default App;
