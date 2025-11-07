import React, { useRef, useState } from "react";
import "./settings.css";

const Settings: React.FC = () => {
    const [firstname, setFirstname] = useState<string>('');
    const [lastname, setLastname] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const updateHandler = (e: React.MouseEvent<HTMLButtonElement>, target: number): void => {
        e.preventDefault();
        if(target === 0) {
            if(firstname === '') firstNameRef.current?.focus();
            else {

            }
        }else if(target === 1) {
            if(lastname === '') lastNameRef.current?.focus();
            else {

            }
        }else if(target === 2) {
            if(email === '') emailRef.current?.focus();
            else {

            }
        }else if(target === 3) {
            if(password === '') passwordRef.current?.focus();
            else {

            }
        }
    }

    return (
        <div className="settings-container">
            <div className="setting-container">
                <form>
                    <input ref={firstNameRef} className="login_inputs" type="text" placeholder="first name" value={firstname} onChange={(event) => setFirstname(event.target.value)}/><br/>
                    <button className="login_button button" onClick={(e) => updateHandler(e, 0)}>Update</button>
                </form>
            </div>
            <div className="setting-container">
                <form>
                    <input ref={lastNameRef} className="login_inputs" type="text" placeholder="last name" value={lastname} onChange={(event) => setLastname(event.target.value)}/><br/>
                    <button className="login_button button" onClick={(e) => updateHandler(e, 1)}>Update</button>
                </form>
            </div>
            <div className="setting-container">
                <form>
                    <input ref={emailRef} className="login_inputs" type="email" placeholder="email" value={email} onChange={(event) => setEmail(event.target.value)}/><br/>
                    <button className="login_button button" onClick={(e) => updateHandler(e, 2)}>Update</button>
                </form>
            </div>
            <div className="setting-container">
                <form>
                    <input ref={passwordRef} className="login_inputs" type="password" placeholder="password" value={password} onChange={(event) => setPassword(event.target.value)}/><br/>
                    <button className="login_button button" onClick={(e) => updateHandler(e, 3)}>Update</button>
                </form>
            </div>
        </div>
    )
}

export default Settings;