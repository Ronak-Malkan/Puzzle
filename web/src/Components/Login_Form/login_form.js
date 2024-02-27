import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./login_form.css";

const Login_Form = ({setDisplay}) => {

    const [message, setMessage] = useState();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const loginHandler = (e) => {
        e.preventDefault();
        if(email == '' || password == '') {
            setMessage("Please fill all the fields.")
            setTimeout(() => setMessage(''), 3000)
            return;
        }
    }

   return (
    <div className="form">
    <h2 className="login_title">Sign In</h2>
    <form>
        <input className="login_inputs" type="email" placeholder="email" value={email} onChange={(event) => setEmail(event.target.value)}/><br/>
        <input className="login_inputs" type="password" placeholder="password" value={password} onChange={(event) => setPassword(event.target.value)}/><br/>
        <button className="login_button" onClick={loginHandler}>Login</button>
    </form>
    <p className="signup_prompt">don’t have an account? <span onClick={() => setDisplay(false)}>&nbsp;create one!</span></p>
    <p className="error_message">{message}</p>
  </div>
   );
};

export default Login_Form;