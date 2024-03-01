import dotenv from 'dotenv'
import * as Block_CRUD from '../database/Block_CRUD.js';

dotenv.config();

export async function createBlock(blockData){
    try {
        const id = await Block_CRUD.insertBlock(blockData);
        console.log("Id: ", id);
        return id;
    }catch(err) {
        throw err;
    }
}

export async function updateBlock(blockData) {
    try {
        await Block_CRUD.updateBlock(blockData);
    }catch(err) {
        throw err;
    }
}

export async function getAllPages(userId) {
    try {
        const pages = await Block_CRUD.getAllPageBlocks(userId);
        return pages;
    }catch (err) {
        throw err;
    }
}

export async function getAllBlocks(pageId) {
    try {
        console.log("Block Service: ", pageId);
        const blocks = await Block_CRUD.getBlocks(pageId);
        return blocks;
    }catch (err) {
        throw err;
    }
}