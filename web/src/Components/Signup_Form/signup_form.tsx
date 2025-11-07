import React, { useState } from "react";

import "./signup_form.css";

interface SignupFormProps {
    setDisplay: (display: boolean) => void;
}

interface SignupResponse {
    message: string;
}

const Signup_Form: React.FC<SignupFormProps> = ({ setDisplay }) => {
    const [message, setMessage] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const signUpHandler = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(firstName === '' || lastName === '' || email === '' || password === '') {
            setMessage("Please fill all the fields.")
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        const sendData = {
            firstname: firstName,
            lastname: lastName,
            email,
            password
        }
        fetch('/api/user/signup', {
            method: 'POST',
            headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(sendData)
         })
         .then(res => res.json())
         .then((data: SignupResponse) => {
            if(data.message === 'User signed up') {
                setTimeout(() => setDisplay(true), 500);
                return;
            }
            setMessage(data.message)
            setTimeout(() => setMessage(''), 4000);
            return;
         })
    }

   return (
      <div className="form">
        <h2 className="signup_title">Create User</h2>
        <form>
            <input className="signup_inputs" type="text" placeholder="first name" value={firstName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFirstName(event.target.value)}/><br/>
            <input className="signup_inputs" type="text" placeholder="last name" value={lastName} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLastName(event.target.value)}/><br/>
            <input className="signup_inputs" type="email" placeholder="email" value={email} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}/><br/>
            <input className="signup_inputs" type="password" placeholder="password" value={password} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}/><br/>
            <button className="signup_button" onClick={signUpHandler}>Sign Up</button>
        </form>
        <p className="login_prompt">have an account already? <span onClick={() => setDisplay(true)}>&nbsp;log in!</span></p>
        <p className="error_message">{message}</p>
      </div>
   );
};

export default Signup_Form;