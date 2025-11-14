import { query } from '../config/database';
import { BlockType } from '../types/block.types';
import * as BlockModel from './block.model';

export interface TableColumn {
  name: string;
  type: string;
  width: number;
}

export interface TableCellValue {
  row: number;
  column: number;
  value: string;
}

export interface CreateTableDTO {
  user_id: number;
  page_id: string;
  position: number;
  columns: TableColumn[];
  rows?: number; // Number of initial empty rows (default: 1)
}

/**
 * Create a table block with header row and optional data rows
 */
export const createTable = async (tableData: CreateTableDTO): Promise<string> => {
  const { user_id, page_id, position, columns, rows = 1 } = tableData;

  // 1. Create the table container block
  const tableId = await BlockModel.createBlock({
    user_id,
    block_type: BlockType.TABLE,
    page_id,
    parent_id: null,
    position,
    properties: false,
    children: true,
  });

  // 2. Create header row
  const headerRowId = await BlockModel.createBlock({
    user_id,
    block_type: BlockType.TABLE_HEADER_ROW,
    page_id,
    parent_id: tableId,
    position: 0,
    properties: false,
    children: true,
  });

  // 3. Create header cells
  for (let i = 0; i < columns.length; i++) {
    await BlockModel.createBlock({
      user_id,
      block_type: BlockType.TABLE_HEADER_CELL,
      page_id,
      parent_id: headerRowId,
      position: i,
      properties: true,
      properties_list: [
        { property_name: 'content', value: columns[i].name },
        { property_name: 'type', value: columns[i].type },
        { property_name: 'width', value: columns[i].width.toString() },
      ],
    });
  }

  // 4. Create data rows with empty cells
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    const rowId = await BlockModel.createBlock({
      user_id,
      block_type: BlockType.TABLE_ROW,
      page_id,
      parent_id: tableId,
      position: rowIndex + 1, // +1 because header row is at position 0
      properties: false,
      children: true,
    });

    // Create cells for this row
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      await BlockModel.createBlock({
        user_id,
        block_type: BlockType.TABLE_CELL,
        page_id,
        parent_id: rowId,
        position: colIndex,
        properties: true,
        properties_list: [{ property_name: 'content', value: '' }],
      });
    }
  }

  return tableId;
};

/**
 * Get table with all rows and cells
 */
export const getTable = async (tableId: string) => {
  // Get table block
  const table = await BlockModel.getBlockById(tableId);
  if (!table || table.block_type !== BlockType.TABLE) {
    throw new Error('Table not found');
  }

  // Get all rows (header + data rows)
  const rowsResult = await query(
    `SELECT * FROM blocks
     WHERE parent_id = $1
     ORDER BY position ASC`,
    [tableId]
  );

  const rows = [];
  for (const row of rowsResult.rows) {
    // Get cells for this row
    const cellsResult = await query(
      `SELECT b.*, p.property_name, p.value
       FROM blocks b
       LEFT JOIN properties p ON b.id = p.block_id
       WHERE b.parent_id = $1
       ORDER BY b.position, p.property_name`,
      [row.id]
    );

    // Group properties by cell
    const cellsMap = new Map();
    for (const cellRow of cellsResult.rows) {
      if (!cellsMap.has(cellRow.id)) {
        cellsMap.set(cellRow.id, {
          id: cellRow.id,
          position: cellRow.position,
          block_type: cellRow.block_type,
          properties: {},
        });
      }
      if (cellRow.property_name) {
        cellsMap.get(cellRow.id).properties[cellRow.property_name] = cellRow.value;
      }
    }

    rows.push({
      id: row.id,
      position: row.position,
      block_type: row.block_type,
      cells: Array.from(cellsMap.values()).sort((a, b) => a.position - b.position),
    });
  }

  return {
    id: table.id,
    rows,
  };
};

/**
 * Update a single cell value
 */
export const updateCellValue = async (
  tableId: string,
  rowIndex: number,
  columnIndex: number,
  value: string
): Promise<void> => {
  // Get the row
  const rowResult = await query(
    `SELECT id FROM blocks
     WHERE parent_id = $1 AND position = $2`,
    [tableId, rowIndex]
  );

  if (rowResult.rows.length === 0) {
    throw new Error('Row not found');
  }

  const rowId = rowResult.rows[0].id;

  // Get the cell
  const cellResult = await query(
    `SELECT id FROM blocks
     WHERE parent_id = $1 AND position = $2`,
    [rowId, columnIndex]
  );

  if (cellResult.rows.length === 0) {
    throw new Error('Cell not found');
  }

  const cellId = cellResult.rows[0].id;

  // Update the cell value
  await query(
    `UPDATE properties
     SET value = $1
     WHERE block_id = $2 AND property_name = 'content'`,
    [value, cellId]
  );
};

/**
 * Add a new column to the table
 */
export const addColumn = async (
  tableId: string,
  columnData: TableColumn,
  userId: number
): Promise<void> => {
  // Get the header row
  const headerResult = await query(
    `SELECT id FROM blocks
     WHERE parent_id = $1 AND block_type = $2`,
    [tableId, BlockType.TABLE_HEADER_ROW]
  );

  if (headerResult.rows.length === 0) {
    throw new Error('Header row not found');
  }

  const headerRowId = headerResult.rows[0].id;

  // Count existing columns
  const columnCountResult = await query(
    `SELECT COUNT(*) as count FROM blocks WHERE parent_id = $1`,
    [headerRowId]
  );
  const newPosition = parseInt(columnCountResult.rows[0].count);

  // Get page_id from table block
  const tableResult = await query('SELECT page_id FROM blocks WHERE id = $1', [tableId]);
  const pageId = tableResult.rows[0].page_id;

  // Add header cell
  await BlockModel.createBlock({
    user_id: userId,
    block_type: BlockType.TABLE_HEADER_CELL,
    page_id: pageId,
    parent_id: headerRowId,
    position: newPosition,
    properties: true,
    properties_list: [
      { property_name: 'content', value: columnData.name },
      { property_name: 'type', value: columnData.type },
      { property_name: 'width', value: columnData.width.toString() },
    ],
  });

  // Add cells to all existing data rows
  const dataRowsResult = await query(
    `SELECT id FROM blocks
     WHERE parent_id = $1 AND block_type = $2
     ORDER BY position`,
    [tableId, BlockType.TABLE_ROW]
  );

  for (const row of dataRowsResult.rows) {
    await BlockModel.createBlock({
      user_id: userId,
      block_type: BlockType.TABLE_CELL,
      page_id: pageId,
      parent_id: row.id,
      position: newPosition,
      properties: true,
      properties_list: [{ property_name: 'content', value: '' }],
    });
  }
};

/**
 * Add a new row to the table
 */
export const addRow = async (tableId: string, userId: number): Promise<void> => {
  // Get column count from header row
  const headerResult = await query(
    `SELECT id FROM blocks
     WHERE parent_id = $1 AND block_type = $2`,
    [tableId, BlockType.TABLE_HEADER_ROW]
  );

  if (headerResult.rows.length === 0) {
    throw new Error('Header row not found');
  }

  const headerRowId = headerResult.rows[0].id;

  const columnCountResult = await query(
    `SELECT COUNT(*) as count FROM blocks WHERE parent_id = $1`,
    [headerRowId]
  );
  const columnCount = parseInt(columnCountResult.rows[0].count);

  // Count existing rows
  const rowCountResult = await query(
    `SELECT COUNT(*) as count FROM blocks
     WHERE parent_id = $1 AND (block_type = $2 OR block_type = $3)`,
    [tableId, BlockType.TABLE_HEADER_ROW, BlockType.TABLE_ROW]
  );
  const newPosition = parseInt(rowCountResult.rows[0].count);

  // Get page_id from table block
  const tableResult = await query('SELECT page_id FROM blocks WHERE id = $1', [tableId]);
  const pageId = tableResult.rows[0].page_id;

  // Create new row
  const rowId = await BlockModel.createBlock({
    user_id: userId,
    block_type: BlockType.TABLE_ROW,
    page_id: pageId,
    parent_id: tableId,
    position: newPosition,
    properties: false,
    children: true,
  });

  // Create empty cells
  for (let i = 0; i < columnCount; i++) {
    await BlockModel.createBlock({
      user_id: userId,
      block_type: BlockType.TABLE_CELL,
      page_id: pageId,
      parent_id: rowId,
      position: i,
      properties: true,
      properties_list: [{ property_name: 'content', value: '' }],
    });
  }
};

/**
 * Delete a column from the table
 */
export const deleteColumn = async (
  tableId: string,
  columnIndex: number
): Promise<void> => {
  // Get header row
  const headerResult = await query(
    `SELECT id FROM blocks
     WHERE parent_id = $1 AND block_type = $2`,
    [tableId, BlockType.TABLE_HEADER_ROW]
  );

  if (headerResult.rows.length === 0) {
    throw new Error('Header row not found');
  }

  // Get all rows (including header)
  const allRowsResult = await query(
    `SELECT id FROM blocks
     WHERE parent_id = $1`,
    [tableId]
  );

  // Delete cells at the specified position for all rows
  for (const row of allRowsResult.rows) {
    await query(
      `DELETE FROM blocks
       WHERE parent_id = $1 AND position = $2`,
      [row.id, columnIndex]
    );
  }

  // Adjust positions for remaining cells
  for (const row of allRowsResult.rows) {
    await query(
      `UPDATE blocks
       SET position = position - 1
       WHERE parent_id = $1 AND position > $2`,
      [row.id, columnIndex]
    );
  }
};

/**
 * Delete a row from the table
 */
export const deleteRow = async (
  tableId: string,
  rowIndex: number
): Promise<void> => {
  if (rowIndex === 0) {
    throw new Error('Cannot delete header row');
  }

  // Get the row
  const rowResult = await query(
    `SELECT id FROM blocks
     WHERE parent_id = $1 AND position = $2 AND block_type = $3`,
    [tableId, rowIndex, BlockType.TABLE_ROW]
  );

  if (rowResult.rows.length === 0) {
    throw new Error('Row not found');
  }

  const rowId = rowResult.rows[0].id;

  // Delete the row (CASCADE will delete all cells)
  await BlockModel.deleteBlock(rowId);

  // Adjust positions for remaining rows
  await query(
    `UPDATE blocks
     SET position = position - 1
     WHERE parent_id = $1 AND position > $2`,
    [tableId, rowIndex]
  );
};
