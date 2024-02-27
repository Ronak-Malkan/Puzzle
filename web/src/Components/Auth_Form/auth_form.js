import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login_Form from "../Login_Form/login_form";
import Signup_Form from "../Signup_Form/signup_form";

import "./auth_form.css";

const Auth_Form = () => {
    const [displayLoginForm, setDisplay] = useState(false);
   return (
      <div className="form_container">
        {displayLoginForm && <Login_Form setDisplay={setDisplay}/>}
        {!displayLoginForm && <Signup_Form setDisplay={setDisplay}/>}
      </div>
   );
};

export default Auth_Form;