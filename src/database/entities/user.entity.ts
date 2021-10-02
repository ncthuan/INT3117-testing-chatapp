import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
  ObjectID,
  Index,
  BeforeInsert,
} from 'typeorm';
import { PasswordTransformer } from '../transformers/password.transfomer';

export enum UserGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum UserType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}

export enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
  BUSY = 'BUSY',
  DELETED = 'DELETED',
  BANNED = 'BANNED',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class Email {
  @Column()
  // @Index() partial index, see migration
  address: string;

  @Column()
  verified: boolean;

  constructor(address: string, verified = false) {
    this.address = address;
    this.verified = verified;
  }
}

export class UserSetting {
  @Column()
  enableNotification: boolean;

  @Column()
  language: string;

  @Column()
  preferences: any;

  constructor(enableNotification = true, language = 'en', preferences: any = {}) {
    this.enableNotification = enableNotification;
    this.language = language;
    this.preferences = preferences;
  }
}

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  @Index({ unique: true })
  // text index
  username: string;

  @Column(type => Email, { array: true })
  emails: Email[];

  @Column()
  type: UserType;

  @Column()
  status: UserStatus;

  @Column()
  roles: UserRole[];

  @Column()
  // text index
  fullName: string;

  @Column()
  password: string;

  @Column()
  avatar: string;

  @Column(type => UserSetting)
  settings: UserSetting;

  @BeforeInsert()
  // @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const passwordTransformer = new PasswordTransformer();
      this.password = passwordTransformer.to(this.password)
    }
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
