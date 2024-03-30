import Logo from "../../Utils/Puzzle_Logo.png";

import "./auth_logo.css";

const Auth_Logo = () => {
   return (
      <div className="auth-logo-container">
        <div>
            <img src={Logo} alt="Puzzle Logo"/>
            <h1 className="Puzzle">Puzzle</h1>
        </div>
      </div>
   );
};

export default Auth_Logo;