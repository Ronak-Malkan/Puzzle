import { Router, Response } from 'express';
import * as TableModel from '../models/table.model';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import redisClient from '../config/redis';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new table
router.post('/create', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { page_id, position, columns, rows } = req.body;

    if (!page_id || position === undefined || !columns || !Array.isArray(columns)) {
      res.status(400).json({
        error: 'Missing required fields: page_id, position, columns',
      });
      return;
    }

    const tableId = await TableModel.createTable({
      user_id: req.user.id,
      page_id,
      position,
      columns,
      rows: rows || 1,
    });

    // Invalidate cache
    await redisClient.del(`user:pages:${req.user.id}`);
    await redisClient.del(`page:blocks:${page_id}`);

    res.status(201).json({ message: 'Table created', id: tableId });
  } catch (error: any) {
    logger.error({ error }, 'Create table error');
    res.status(500).json({ error: error.message || 'Failed to create table' });
  }
});

// Get table with all rows and cells
router.get('/:tableId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { tableId } = req.params;

    const table = await TableModel.getTable(tableId);

    res.status(200).json({ message: 'Table retrieved', table });
  } catch (error: any) {
    logger.error({ error }, 'Get table error');
    res.status(500).json({ error: error.message || 'Failed to get table' });
  }
});

// Update a cell value
router.put(
  '/:tableId/cell',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { tableId } = req.params;
      const { row, column, value } = req.body;

      if (row === undefined || column === undefined || value === undefined) {
        res.status(400).json({
          error: 'Missing required fields: row, column, value',
        });
        return;
      }

      await TableModel.updateCellValue(tableId, row, column, value);

      res.status(200).json({ message: 'Cell updated' });
    } catch (error: any) {
      logger.error({ error }, 'Update cell error');
      res.status(500).json({ error: error.message || 'Failed to update cell' });
    }
  }
);

// Add a column
router.post(
  '/:tableId/column',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { tableId } = req.params;
      const { name, type, width } = req.body;

      if (!name || !type || !width) {
        res.status(400).json({
          error: 'Missing required fields: name, type, width',
        });
        return;
      }

      await TableModel.addColumn(tableId, { name, type, width }, req.user.id);

      res.status(201).json({ message: 'Column added' });
    } catch (error: any) {
      logger.error({ error }, 'Add column error');
      res.status(500).json({ error: error.message || 'Failed to add column' });
    }
  }
);

// Add a row
router.post(
  '/:tableId/row',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { tableId } = req.params;

      await TableModel.addRow(tableId, req.user.id);

      res.status(201).json({ message: 'Row added' });
    } catch (error: any) {
      logger.error({ error }, 'Add row error');
      res.status(500).json({ error: error.message || 'Failed to add row' });
    }
  }
);

// Delete a column
router.delete(
  '/:tableId/column/:columnIndex',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { tableId, columnIndex } = req.params;

      await TableModel.deleteColumn(tableId, parseInt(columnIndex));

      res.status(200).json({ message: 'Column deleted' });
    } catch (error: any) {
      logger.error({ error }, 'Delete column error');
      res.status(500).json({ error: error.message || 'Failed to delete column' });
    }
  }
);

// Delete a row
router.delete(
  '/:tableId/row/:rowIndex',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { tableId, rowIndex } = req.params;

      await TableModel.deleteRow(tableId, parseInt(rowIndex));

      res.status(200).json({ message: 'Row deleted' });
    } catch (error: any) {
      logger.error({ error }, 'Delete row error');
      res.status(500).json({ error: error.message || 'Failed to delete row' });
    }
  }
);

export default router;
