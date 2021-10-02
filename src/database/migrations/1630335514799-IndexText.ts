import {MigrationInterface, QueryRunner} from "typeorm";
import { Room } from "../entities/room.entity";
import { User } from "../entities/user.entity";

export class IndexText1630335514799 implements MigrationInterface {

  async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * text index for searching: https://docs.mongodb.com/manual/text-search/
     */
    await queryRunner.connection.mongoManager.createCollectionIndex(Room, { name: 'text' });
    await queryRunner.connection.mongoManager.createCollectionIndex(User, { username: 'text', fullName: 'text' });
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // TODO: reverse
  }

}
