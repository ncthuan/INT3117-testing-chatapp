import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
  ObjectID,
  Index,
} from 'typeorm';
import { UserStatus } from './user.entity';

export type LeaveReason = 'left' | 'kick';

export enum RoomRole {
  owner = 'owner',
  admin = 'admin',
  member = 'member',
}

@Entity()
export class UserRoom {
  @ObjectIdColumn()
  _id: ObjectID;

  @ObjectIdColumn({
    name: 'userId',
    primary: false,
  })
  @Index()
  userId: ObjectID;

  @ObjectIdColumn({
    name: 'roomId',
    primary: false,
  })
  @Index()
  roomId: ObjectID;

  @Column()
  joinAt: Date;

  @Column()
  lastSeenAt: Date;

  @Column()
  unreadCount: number;

  @Column()
  clearAt: Date; //When user clear conversation history on their phone

  @Column()
  leaveAt: Date;

  @Column()
  leaveReason: LeaveReason;

  @Column()
  isMuted: boolean;

  @Column()
  role: RoomRole;

  @Column()
  username: string;
  
  @Column()
  fullName: string;
  
  @Column()
  avatar: string;

  @Column()
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
