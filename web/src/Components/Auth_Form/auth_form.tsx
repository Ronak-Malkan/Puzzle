import React, { useState } from "react";
import LoginForm from "@components/Login_Form/login_form";
import SignupForm from "@components/Signup_Form/signup_form";

import "./auth_form.css";

const Auth_Form: React.FC = () => {
    const [displayLoginForm, setDisplay] = useState<boolean>(true);
   return (
      <div className="form_container">
        {displayLoginForm && <LoginForm setDisplay={setDisplay}/>}
        {!displayLoginForm && <SignupForm setDisplay={setDisplay}/>}
      </div>
   );
};

export default Auth_Form;