import React, { useContext } from "react";
import { ReactComponent as ArrowRight } from "@utils/Double_Arrow_Right.svg";
import { ReactComponent as ArrowLeft } from "@utils/Double_Arrow_Left.svg";
import { ReactComponent as Logout } from "@utils/Logout.svg";
import { useNavigate } from "react-router-dom";
import "./top_navbar.css";
import { BlockContext } from "@context/block-context";

interface TopNavbarProps {
    showSideNavBar: boolean;
    setShow: (show: boolean) => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ showSideNavBar, setShow }) => {
    const { selectedPageName } = useContext(BlockContext);
    const navigate = useNavigate();

    const handleLogout = (): void => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate('/');
    }

    return (
        <div className="top-navbar-container">
            {!showSideNavBar && <span className="nav-bar-arrow" onClick={() => setShow(!showSideNavBar)}><ArrowRight/></span>}
            {showSideNavBar && <span className="nav-bar-arrow" onClick={() => setShow(!showSideNavBar)}><ArrowLeft/></span>}
            <h2 className="page-name">{selectedPageName}</h2>
            <span className="logout" onClick={handleLogout}><Logout/></span>
        </div>
    )
}

export default TopNavbar;