import { useState } from "react";
import LoginForm from "../Login_Form/login_form";
import SignupForm from "../Signup_Form/signup_form";

import "./auth_form.css";

const Auth_Form = () => {
    const [displayLoginForm, setDisplay] = useState(true);
   return (
      <div className="form_container">
        {displayLoginForm && <LoginForm setDisplay={setDisplay}/>}
        {!displayLoginForm && <SignupForm setDisplay={setDisplay}/>}
      </div>
   );
};

export default Auth_Form;