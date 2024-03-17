import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { Logger, NotFoundException } from '@nestjs/common';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;
  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createdDoc = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDoc.save()).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const doc = await this.model.findOne(filterQuery).lean<TDocument>(true);

    if (!doc) {
      this.logger.warn('Document was not foud with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }
    return doc;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const doc = await this.model
      .findByIdAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<TDocument>(true);

    if (!doc) {
      this.logger.warn('Document was not foud with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return doc;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return await this.model.find(filterQuery).lean<TDocument[]>(true);
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    return await this.model
      .findByIdAndDelete(filterQuery)
      .lean<TDocument>(true);
  }
}
