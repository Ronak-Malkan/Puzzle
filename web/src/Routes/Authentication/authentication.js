import AuthLogo from "../../Components/Auth_Logo/auth_logo";
import AuthForm from "../../Components/Auth_Form/auth_form";

import "./authentication.css";

const Authentication = () => {
   return (
      <div className="auth_container">
        <AuthLogo/>
        <AuthForm/>
      </div>
   );
};

export default Authentication;