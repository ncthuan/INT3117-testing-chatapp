export const AppConfig = {
  OTP: {
    MAX_TRIES: 5,
    LENGTH: 4,
    EXPIRE_TIME: 10 * 60 * 1000,
  },
  UPLOAD_FILE: {
    AVARTAR: 'avatar',
    CONVERSATION: 'conversation',
    VIDEO_FOLDER: 'videos',
    IMAGE_FOLDER: 'images',
    FILE_FOLDER: 'files'
  },
  APP_LINK: {
    IOS: 'https://play.google.com',
    ANDROID: 'https://play.google.com',
  },
  DB: {
    WRITE: 'DB_WRITE',
    READ: 'DB_READ',
    MIGRATION: 'default',
  },
  PAGE_SIZE_DEFAULT: 100
};

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}
