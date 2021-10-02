import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectIdColumn, ObjectID, Index } from 'typeorm';

export enum RoomType {
  direct = 'direct',
  group = 'group',
}

@Entity()
export class Room {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  // text index
  name: string;

  @Column()
  type: RoomType;

  @Column()
  createdBy: string;

  @Column()
  @Index()
  userIds: string[];

  @Column()
  blockList: string[];

  @Column()
  avatar: string;

  @Column()
  lastMessage: string;

  @Column()
  lastMessageId: string;

  @Column()
  lastMessageTime: Date;

  @Column()
  lastMessageUserId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
