import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
  ObjectID,
} from 'typeorm';

export enum FileType {
  image = 'image',
  video = 'video',
  other = 'other'
}

export enum MessageType {
  text = 'text',
  image = 'image',
  video = 'video',
  other = 'other'
}

export class Attachment {
  path: string;
  previewImagePath: string;
  type: FileType;

  constructor(path: string, previewImagePath: string, contentType = FileType.image) {
    this.path = path;
    this.previewImagePath = previewImagePath;
    this.type = contentType;
  }
}

@Entity()
export class Message {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  roomId: string;

  @Column()
  message: string;

  @Column()
  attachments: Attachment[];

  @Column()
  clientId: string;

  @Column()
  senderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  isDeleted: boolean;

  @Column()
  type: MessageType;
}
