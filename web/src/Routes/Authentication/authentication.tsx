import React from "react";
import AuthLogo from "@components/Auth_Logo/auth_logo";
import AuthForm from "@components/Auth_Form/auth_form";

import "./authentication.css";

const Authentication: React.FC = () => {
   return (
      <div className="auth_container">
        <AuthLogo/>
        <AuthForm/>
      </div>
   );
};

export default Authentication;