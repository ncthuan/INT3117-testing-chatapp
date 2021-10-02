import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn, ObjectID } from 'typeorm';

export enum DevicePlatform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  BROWSER = 'BROWSER',
  OTHER = 'OTHER',
}

@Entity()
export class Device {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  token: string;

  @Column()
  platform: DevicePlatform;

  @Column()
  appVersion: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
