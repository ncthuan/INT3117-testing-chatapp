import * as zlib from 'zlib';

export class PageTokenBuilder {
  static createToken(object: any) {
    const jsonString = JSON.stringify(object);
    return zlib.deflateSync(jsonString).toString('base64');
  }
  static extractToken(token: string) {
    const jsonString = zlib.inflateSync(Buffer.from(token, 'base64')).toString();
    console.log({jsonString});
    return JSON.parse(jsonString);
  }
}
