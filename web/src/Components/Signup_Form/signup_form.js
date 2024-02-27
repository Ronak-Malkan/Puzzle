import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./signup_form.css";

const Signup_Form = ({setDisplay}) => {
    const [message, setMessage] = useState();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signUpHandler = (e) => {
        e.preventDefault();
        if(firstName == '' || lastName == '' || email == '' || password == '') {
            setMessage("Please fill all the fields.")
            setTimeout(() => setMessage(''), 3000);
            return;
        }
    }

   return (
      <div className="form">
        <h2 className="signup_title">Create User</h2>
        <form>
            <input className="signup_inputs" type="text" placeholder="first name" value={firstName} onChange={(event) => setFirstName(event.target.value)}/><br/>
            <input className="signup_inputs" type="text" placeholder="last name" value={lastName} onChange={(event) => setLastName(event.target.value)}/><br/>
            <input className="signup_inputs" type="email" placeholder="email" value={email} onChange={(event) => setEmail(event.target.value)}/><br/>
            <input className="signup_inputs" type="password" placeholder="password" value={password} onChange={(event) => setPassword(event.target.value)}/><br/>
            <button className="signup_button" onClick={signUpHandler}>Sign Up</button>
        </form>
        <p className="login_prompt">have an account already? <span onClick={() => setDisplay(true)}>&nbsp;log in!</span></p>
        <p className="error_message">{message}</p>
      </div>
   );
};

export default Signup_Form;