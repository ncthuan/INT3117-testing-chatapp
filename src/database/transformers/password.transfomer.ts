// import * as bcrypt from 'bcrypt';
import { ValueTransformer } from 'typeorm';
import bcrypt = require('bcrypt');

export class PasswordTransformer implements ValueTransformer {
  to(value) {
    return value ? bcrypt.hashSync(value, 10) : value;
  }
  from(value) {
    return value;
  }

  static async compare(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }
}
