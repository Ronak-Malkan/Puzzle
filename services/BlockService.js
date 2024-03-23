import dotenv from 'dotenv'
import * as Block_CRUD from '../database/Block_CRUD.js';

dotenv.config();

export async function createBlock(blockData){
    try {
        const id = await Block_CRUD.insertBlock(blockData);
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

export async function updateProp(blockId, property) {
    try {
        await Block_CRUD.updateProperty(blockId, property);
    }catch(err){
        throw err;
    }
}

export async function updateBlocksPosition(blockArray) {
    try {
        await Block_CRUD.updatePositions(blockArray);
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
        const blocks = await Block_CRUD.getBlocks(pageId);
        return blocks;
    }catch (err) {
        throw err;
    }
}

export async function delBlock(blockId) {
    try {
        await Block_CRUD.deleteBlock(blockId);
    }catch(err){
        throw err;
    }
}