/* eslint-disable no-prototype-builtins */
import {MigrationInterface} from "typeorm";
import { MongoQueryRunner } from "typeorm/driver/mongodb/MongoQueryRunner";
import { Collection } from 'mongodb';

export class PartialIndexEmail1630913068333 implements MigrationInterface {

  async up(queryRunner: MongoQueryRunner): Promise<void> {
    /**
     * partial index: https://docs.mongodb.com/manual/core/index-partial
     */
    const dbName = queryRunner.connection.driver.database;
    const userCollection = queryRunner.databaseConnection.db(dbName).collection('user') as Collection;

    // find index name of 'emails.address'
    const indexes = await userCollection.indexes()
    const emailIndex = indexes.find(indexInfo => indexInfo.key.hasOwnProperty('emails.address') );

    // drop index
    if (emailIndex) {
      await userCollection.dropIndex(emailIndex.name);
    }

    // re-index
    await userCollection.createIndex({'emails.address':1}, {
      unique: true,
      partialFilterExpression: { emails: {$exists: true} },
    })
    
    console.log(1630913068333);
  }

  async down(queryRunner: MongoQueryRunner): Promise<void> {
    // TODO: reverse
  }

}
