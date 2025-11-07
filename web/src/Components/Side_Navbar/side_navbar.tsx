import React, { useContext, useEffect, useState } from "react";
import Plus from "@utils/Plus.svg?react";
import Page from "@utils/page.svg?react";
import Delete from "@utils/Delete.svg?react";
import Settings from "@utils/Settings.svg?react";
import type { Page as PageType } from "@/types";
import { BLOCK_TYPES } from "@utils/block_types";
import { BlockContext } from "@context/block-context";

import "./side_navbar.css";

interface SideNavbarProps {
    showSideNavBar: boolean;
}

const SideNavbar: React.FC<SideNavbarProps> = ({ showSideNavBar }) => {
    const [name, setName] = useState<string>('');
    const [token, setToken] = useState<string>('');
    const { selectedPage, setPage, setPageName, pageList, setPageList } = useContext(BlockContext);

    useEffect(() => {
        setName(localStorage.getItem('username') || '');
        setToken(localStorage.getItem('token') || '');
    }, []);

    useEffect(() => {
        fetchPageList();
        // eslint-disable-next-line
    }, [token])

    const fetchPageList = (): void => {
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
            .then((res: { message: string; pages?: PageType[]; error?: string }) => {
                if(res.message === 'pages retrieved') {
                    setPageList(res.pages || []);
                }else {
                    console.log(res.error);
                }
            })
        }
    }

    const addNewPage = (): void => {
        if(token !== ''){
            const pageData: PageType = {
                block_type: BLOCK_TYPES.PAGE,
                position: 0,
                parent: null,
                properties: true,
                children: false,
                propertiesList: [
                    {
                        property_name: "title",
                        value: "Untitled"
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
            .then((res: { message: string; id?: string; error?: string }) => {
                if(res.message === 'block created' && res.id) {
                    const newPage: PageType = { ...pageData, id: res.id };
                    const pages = [...pageList, newPage];
                    setPageList(pages);
                }else {
                    console.log(res.error);
                }
            })
        }
    }

    const provideClassName = (pageId: string): string => {
        if(pageId === selectedPage) {
            if(pageId === 'settingsSelected') return 'settings selected'
            return 'page-item selected';
        }
        else {
            if(pageId === 'settingsSelected') return 'settings'
            return 'page-item';
        }
    }

    const handlePageClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        const target = e.target as HTMLElement;
        if(target.dataset.pageid !== undefined){
            setPage(target.dataset.pageid);
            setPageName(target.dataset.title || '');
        }
        else if(target.parentNode && (target.parentNode as HTMLElement).dataset) {
            const parentNode = target.parentNode as HTMLElement;
            setPage(parentNode.dataset.pageid || '');
            setPageName(parentNode.dataset.title || '');
        }
    }

    const deletePage = (e: React.MouseEvent<SVGSVGElement>): void => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        let pageId: string | undefined;
        if(target.dataset.pageid !== undefined){
            pageId = target.dataset.pageid;
        }
        else if(target.parentNode && (target.parentNode as HTMLElement).dataset) {
            pageId = (target.parentNode as HTMLElement).dataset.pageid;
        }

        if(!pageId) return;

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
        .then((res: { message: string; error?: string }) => {
            if(res.message === 'block deleted') {
               const updatedList = pageList.filter((page) => page.id !== pageId);
               setPageList(updatedList);
               setPage('');
               setPageName('');
            }else {
                console.log(res.error);
            }
        })
    }

    const openSettings = (): void => {
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
                            let title: string = '';
                            for(let property of page.propertiesList){
                                if(property.property_name === 'title') title = property.value;
                            }
                            return (
                                <div onClick={handlePageClick} className={provideClassName(page.id || '')} key={page.id} data-title={title} data-pageid={`${page.id}`}>
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