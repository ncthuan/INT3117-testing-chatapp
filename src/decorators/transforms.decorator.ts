/* tslint:disable:naming-convention */

import { Transform, TransformFnParams } from 'class-transformer';

/**
 * @description trim spaces from start and end.
 * @example
 * @ApiProperty()
 * @IsString()
 * @Trim()
 * name: string;
 * @returns {(target: any, key: string) => void}
 * @constructor
 */
export function Trim() {
  return Transform((params: TransformFnParams) => {
    const value = params.value;
    if (Array.isArray(value)) {
      return value.map((v) => v.trim());
    }
    return value.trim();
  });
}
/**
 * @description trim spaces from start and end.
 * @example
 * @ApiProperty()
 * @IsString()
 * @Lowercased()
 * name: string;
 * @constructor
 */
export function Lowercased() {
  return Transform((params: TransformFnParams) => {
    const value = params.value;
    if (Array.isArray(value)) {
      return value.map((v) => v.toLowerCase());
    }
    return value.toLowerCase();
  });
}



export function ToBoolean() {
  return Transform((params: TransformFnParams) => {
    const value = params.value ?? '';
    if (value.length === 0) return undefined;
    if (params.value === 'true') return true;
    if (params.value === 'false') return false;
    return Boolean(params.value);
  });
}
