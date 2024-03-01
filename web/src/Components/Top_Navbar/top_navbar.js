import { useState } from "react";
import { ReactComponent as ArrowRight } from "../../Utils/Double_Arrow_Right.svg";
import { ReactComponent as ArrowLeft } from "../../Utils/Double_Arrow_Left.svg";
import { ReactComponent as Logout } from "../../Utils/Logout.svg";
import { useNavigate } from "react-router-dom";
import "./top_navbar.css";

const TopNavbar = ({showSideNavBar, setShow}) => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate('/');
    }

    return (
        <div className="top-navbar-container">
            {!showSideNavBar && <span className="nav-bar-arrow" onClick={() => setShow(!showSideNavBar)}><ArrowRight/></span>}
            {showSideNavBar && <span className="nav-bar-arrow" onClick={() => setShow(!showSideNavBar)}><ArrowLeft/></span>}
            <h2 className="page-name">Page Name</h2>
            <span className="logout" onClick={handleLogout}><Logout/></span>
        </div>
    )
}

export default TopNavbar;