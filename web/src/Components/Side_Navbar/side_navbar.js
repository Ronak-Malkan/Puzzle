import { useContext, useEffect, useState } from "react";
import { ReactComponent as Plus } from "../../Utils/Plus.svg";
import { ReactComponent as Page } from "../../Utils/page.svg";
import { ReactComponent as Delete } from "../../Utils/Delete.svg";
import { ReactComponent as Settings } from "../../Utils/Settings.svg";

import "./side_navbar.css";
import { BlockContext } from "../../context/block-context";
import { BLOCK_TYPES } from "../../Utils/block_types";


const SideNavbar = ({showSideNavBar}) => {
    const [name, setName] = useState('');
    const [token, setToken] = useState('');
    const {selectedPage, setPage, setPageName, pageList, setPageList} = useContext(BlockContext);

    useEffect(() => {
        setName(localStorage.getItem('username'));
        setToken(localStorage.getItem('token'));
    }, []);

    useEffect(() => {
        fetchPageList();
    }, [token])

    const fetchPageList = () => {
        if(token !== '') {
            fetch('api/block/pages', {
                method: 'GET',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(res => {
                if(res.message === 'pages retrieved') {
                    setPageList(res.pages);
                }else {
                    console.log(res.error);
                }
            })
        }
    }

    const addNewPage = () => {
        if(token !== ''){
            const pageData = {
                block_type: BLOCK_TYPES.PAGE,
                position: 0,
                parent: null,
                properties: true,
                children: false,
                propertiesList: [
                    {
                        "property_name": "title",
                        "value": "Untitled"
                    }
                ]
            }

            fetch('api/block/create', {
                method: 'POST',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pageData)
            })
            .then(res => res.json())
            .then(res => {
                if(res.message === 'block created') {
                    pageData.id = res.id;
                    let pages = pageList;
                    pages.push(pageData);
                    setPageList([...pages]);
                }else {
                    console.log(res.error);
                }
            })
        }
    }

    const provideClassName = (pageId) => {
        if(pageId === selectedPage) {
            if(pageId === 'settingsSelected') return 'settings selected'
            return 'page-item selected';
        }
        else {
            if(pageId === 'settingsSelected') return 'settings'
            return 'page-item';
        }
    }

    const handlePageClick = (e) => {
        if(e.target.dataset.pageid !== undefined){
            setPage(e.target.dataset.pageid);
            setPageName(e.target.dataset.title);
        }
        else {
            setPage(e.target.parentNode.dataset.pageid);
            setPageName(e.target.parentNode.dataset.title);
        }
    }

    const deletePage = (e) => {
        e.stopPropagation();
        let pageId;
        if(e.target.dataset.pageid !== undefined){
            pageId = e.target.dataset.pageid;  
        }
        else {
            pageId = e.target.parentNode.dataset.pageid;
        }
        fetch(`api/block/delete`, {
            method: 'DELETE',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({blockId: pageId})
        })
        .then(res => res.json())
        .then(res => {
            if(res.message === 'block deleted') {
               const updatedList = pageList.filter((page) => page.id !== pageId);
               setPageList([...updatedList]);
               setPage('');
               setPageName('');
            }else {
                console.log(res.error);
            }
        })  

    }

    const openSettings = () => {
        setPage('settingsSelected');
        setPageName('Settings');
    }

    return (
        <div className="side-navbar-container">
            {
                showSideNavBar && 
                <div>
                    <h2 className="name">{name}</h2>
                    <div className="add-new-page" onClick={addNewPage}>
                        <Plus/>
                        &nbsp;
                        Add New Page
                    </div>
                    <div className="page-list-container">
                        {pageList.map((page) =>{
                            let title;
                            for(let property of page.propertiesList){
                                if(property.property_name === 'title') title = property.value;
                            }
                            return (
                                <div onClick={handlePageClick} className={provideClassName(page.id)} key={page.id} data-title={title} data-pageid={`${page.id}`}>
                                    <div className="pagelogo-id-container">
                                        <Page data-title={title} data-pageid={`${page.id}`}/>
                                        &nbsp;&nbsp;
                                        <div data-title={title} data-pageid={`${page.id}`}>{title}</div>
                                    </div>
                                    <Delete onClick={deletePage} data-title={title} data-pageid={`${page.id}`} className="delete-icon" />
                                </div>
                            );
                        })}
                        <div className={provideClassName('settingsSelected')} onClick={openSettings}>
                            <Settings/>&nbsp;
                            Settings
                        </div>
                    </div>
                </div>
            }           
        </div>
    )
}

export default SideNavbar;