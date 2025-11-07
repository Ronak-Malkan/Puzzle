import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LoginForm from "@components/Login_Form/login_form";
import SignupForm from "@components/Signup_Form/signup_form";

const Auth_Form: React.FC = () => {
    const [displayLoginForm, setDisplay] = useState<boolean>(true);
   return (
      <div className="relative">
        <AnimatePresence mode="wait">
          {displayLoginForm && <LoginForm key="login" setDisplay={setDisplay}/>}
          {!displayLoginForm && <SignupForm key="signup" setDisplay={setDisplay}/>}
        </AnimatePresence>
      </div>
   );
};

export default Auth_Form;