import { boardService } from '../../services/kanban/boardService.js';

const createNew = async (req, res) => {
    try {
        const result = await boardService.createNew(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            errors: error.message,
        });
    }
};

export const boardController = { createNew };
