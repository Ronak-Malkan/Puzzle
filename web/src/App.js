import './App.css';
import {Routes, Route}  from "react-router-dom";
import Authentication from './Routes/Authentication/authentication';

function App() {
  return (
    <Routes>
         <Route path='/' element={<Authentication/>}/>
    </Routes>
  );
}

export default App;
