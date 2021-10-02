import {MigrationInterface, QueryRunner} from "typeorm";
import { UserRoom } from "../entities/user-room.entity";
import { ObjectId } from 'mongodb';

export class UserRoomObjectId1630471713683 implements MigrationInterface {

  async up(queryRunner: QueryRunner): Promise<void> {

    const mongoManager = queryRunner.connection.mongoManager;

    const userRooms = await queryRunner.connection.mongoManager.find(UserRoom);

    console.log(1630471713683);

    await Promise.all(
      userRooms.map(async (userRoom)=> {
        await mongoManager.updateOne(UserRoom, {_id: userRoom._id}, {
          $set: {
            userId: ObjectId(userRoom.userId),
            roomId: ObjectId(userRoom.roomId),
          }
        });
      })
    );
    
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    
    const mongoManager = queryRunner.connection.mongoManager;

    const userRooms = await queryRunner.connection.mongoManager.find(UserRoom);

    await Promise.all(
      userRooms.map(async (userRoom)=> {
        await mongoManager.updateOne(UserRoom, {_id: userRoom._id}, {
          $set: {
            userId: userRoom.userId.toHexString(),
            roomId: userRoom.roomId.toHexString(),
          }
        });
      })
    );

  }

}