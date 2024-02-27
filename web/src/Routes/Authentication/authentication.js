import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Auth_Logo from "../../Components/Auth_Logo/auth_logo";
import Auth_Form from "../../Components/Auth_Form/auth_form";

import "./authentication.css";

const Authentication = () => {
   return (
      <div className="auth_container">
        <Auth_Logo/>
        <Auth_Form/>
      </div>
   );
};

export default Authentication;