import * as jwt from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';

export class JWTUtils {
  static verifyAsync(token: string, key: string, options?: jwt.VerifyOptions) {
    return new Promise<any>((resolve, reject) => {
      jwt.verify(token, key, options, (err, decoded) => {
        if (err) { reject(err); }
        else { resolve(decoded); }
      });
    });
  }
  static signAsync(payload: any, key: string, options?: jwt.SignOptions) {
    return new Promise<string>((resolve, reject) => {
      jwt.sign(payload, key, options, (error, encoded) => {
        if (error) {
          reject(error);
        } else {
          resolve(encoded);
        }
      });
    });
  }
  static decode = jwt.decode;
  static extractJwt = ExtractJwt.fromAuthHeaderAsBearerToken();
}
