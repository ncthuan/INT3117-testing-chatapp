/* tslint:disable:naming-convention */

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidUsername(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: any, propertyName: string) => {
    registerDecorator({
      propertyName,
      name: 'isPassword',
      target: object.constructor,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: string, _args: ValidationArguments) {
          return /^[a-zA-Z0-9_.]*$/.test(value);
        },
      },
    });
  };
}

export function IsNonPrimitiveArray(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsNonPrimitiveArray',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions
        ? validationOptions
        : { message: propertyName + ' must be array of objects' },
      validator: {
        validate(value: any) {
          return (
            Array.isArray(value) &&
            value.reduce(
              (a, b) => a && typeof b === 'object' && !Array.isArray(b),
              true,
            )
          );
        },
      },
    });
  };
}
