import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { getDB } from '../../config/mongodb.js';
import { columnModel } from './columnModel.js';
import { cardModel } from './cardModel.js';

const boardCollectionName = 'boards';
const boardSchema = Joi.object({
    title: Joi.string().required().min(3).max(20).trim(),
    columnOrder: Joi.array().items(Joi.string()).default([]),
    createdAt: Joi.date().timestamp().default(Date.now()),
    updatedAt: Joi.date().timestamp().default(null),
    _destroy: Joi.boolean().default(false),
});

const validateSchema = async (data) => {
    return await boardSchema.validateAsync(data, {
        abortEarly: false,
    });
};

const findOneById = async (id) => {
    try {
        const result = await getDB()
            .collection(boardCollectionName)
            .findOne({ _id: ObjectId(id) });
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const createNew = async (data) => {
    try {
        const value = await validateSchema(data);
        const result = await getDB().collection(boardCollectionName).insertOne(value);
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const update = async (id, data) => {
    try {
        const updateData = { ...data };
        // if (data.boardId) updateData.boardId = ObjectId(data.boardId);

        const result = await getDB()
            .collection(boardCollectionName)
            .findOneAndUpdate({ _id: ObjectId(id) }, { $set: updateData }, { returnDocument: 'after' });
        return result.value;
    } catch (error) {
        throw new Error(error);
    }
};

/**
 * @param {string} boardId
 * @param {string} columnId
 */

const pushColumnOrder = async (boardId, columnId) => {
    try {
        const result = await getDB()
            .collection(boardCollectionName)
            .findOneAndUpdate(
                {
                    _id: ObjectId(boardId),
                },
                {
                    $push: { columnOrder: columnId },
                },
                { returnDocument: 'after' },
            );
        return result.value;
    } catch (error) {
        throw new Error(error);
    }
};

const getAllBoard = async (boardId) => {
    try {
        const result = await getDB()
            .collection(boardCollectionName)
            .aggregate([
                {
                    $match: {
                        _id: ObjectId(boardId),
                        _destroy: false,
                    },
                },
                {
                    $lookup: {
                        from: columnModel.columnCollectionName,
                        localField: '_id',
                        foreignField: 'boardId',
                        as: 'columns',
                    },
                },
                {
                    $lookup: {
                        from: cardModel.cardCollectionName,
                        localField: '_id',
                        foreignField: 'boardId',
                        as: 'cards',
                    },
                },
            ])
            .toArray();
        return result[0] || {};
    } catch (error) {
        throw new Error(error);
    }
};

export const boardModel = { findOneById, createNew, update, pushColumnOrder, getAllBoard };
