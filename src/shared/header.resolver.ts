import { I18nResolver } from 'nestjs-i18n';
export class HeaderResolver implements I18nResolver {
  resolve(req: any): string {
    return req.headers['accept-language'];
  }
}
