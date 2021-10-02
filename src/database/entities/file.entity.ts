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
  videp = 'video',
  other = 'other'
}
export enum UploadStatus {
  init = 'init',
  uploading = 'uploading',
  completed = 'completed'
}

@Entity()
export class File {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  roomId: string;

  @Column()
  path: string;

  @Column()
  previewImagePath: string;

  @Column()
  type: FileType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
