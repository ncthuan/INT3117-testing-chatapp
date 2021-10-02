import * as dotenv from 'dotenv';
import * as Joi from 'joi';

export interface DBConfig {
  url: string;
  log: boolean;
}

export interface RmqConfig {
  url: string;
  name: string;
}

export interface SMTPEmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export interface S3Config {
  bucket: string;
  s3url: string;
  key: string;
  secret: string;
  region: string;
}

export class ConfigService {
  private readonly envConfig: dotenv.DotenvParseOutput;
  private readonly validationScheme = {
    PORT: Joi.number().default(3000),
    BASE_PATH: Joi.string().default('/'),

    JWT_SECRET: Joi.string().default('gXmEgPHW'),
    JWT_EXPIRATION_TIME: Joi.string().default('1h'),
    JWT_REFRESH_TOKEN_SECRET: Joi.string().default('gXmEgPHD'),
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().default('1y'),

    LOG_LEVEL: Joi.string().default('debug'),

    DB_MONGO_URL: Joi.string().required(),
    DB_LOG: Joi.boolean().default(false),
    DB_DROP: Joi.boolean().default(false), // set DB_DROP=true in .env.test

    REDIS_URL: Joi.string().empty(''),

    AWS_BUCKET: Joi.string().required(),
    AWS_S3URL: Joi.string().required(),
    AWS_KEY: Joi.string().required(),
    AWS_SECRET: Joi.string().required(),
    AWS_REGION: Joi.string().required(),
  };

  constructor() {
    const nodeEnv = process.env.NODE_ENV;
    console.log('NODE_ENV:', nodeEnv);
    // Try to load environment config base on current NODE_ENV

    const configs: dotenv.DotenvParseOutput[] = [];

    // It will load, for example, .env.test when running script like "NODE_ENV=test ts-node main.ts"
    const defaultEnvConfigPath = nodeEnv ? `.env.${nodeEnv}` : '.env';

    const defaultEnvConfig = dotenv.config({ path: defaultEnvConfigPath });

    if (defaultEnvConfig.error) {
      // tslint:disable-next-line: no-console
      console.log(`No config file at path: ${defaultEnvConfigPath}`);
    } else {
      configs.push(defaultEnvConfig.parsed);
      // tslint:disable-next-line: no-console
      console.log(`Loaded config file at path: ${defaultEnvConfigPath}`);
    }

    configs.push(process.env as dotenv.DotenvParseOutput);
    this.envConfig = this.validateInput(...configs);
  }

  public get(key: string): string {
    return this.envConfig[key];
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  get port(): number {
    return Number(this.envConfig.PORT);
  }
  get basePath(): string {
    return this.envConfig.BASE_PATH;
  }

  get jwt() {
    return {
      accessTokenSecret: this.envConfig.JWT_SECRET,
      accessTokenExpireTime: this.envConfig.JWT_EXPIRATION_TIME,
      refreshTokenSecret: this.envConfig.JWT_REFRESH_TOKEN_SECRET,
      refreshTokenExpireTime: this.envConfig.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    };
  }

  get logLevel(): string {
    return this.envConfig.LOG_LEVEL;
  }

  get db(): DBConfig {
    return {
      url: String(this.envConfig.DB_MONGO_URL),
      log: Boolean(this.envConfig.DB_LOG),
    }
  }

  get redisUrl(): string {
    return this.envConfig.REDIS_URL;
  }

  get aws(): S3Config {
    return {
      bucket: String(this.envConfig.AWS_BUCKET),
      s3url: String(this.envConfig.AWS_S3URL),
      key: String(this.envConfig.AWS_KEY),
      secret: String(this.envConfig.AWS_SECRET),
      region: String(this.envConfig.AWS_REGION),
    };
  }

  private validateInput(...envConfig: dotenv.DotenvParseOutput[]): dotenv.DotenvParseOutput {
    const mergedConfig: dotenv.DotenvParseOutput = {};

    envConfig.forEach((config) => Object.assign(mergedConfig, config));

    const envVarsSchema: Joi.ObjectSchema = Joi.object(this.validationScheme);

    const result = envVarsSchema.validate(mergedConfig, { allowUnknown: true });
    if (result.error) {
      throw new Error(`Config validation error: ${result.error.message}`);
    }
    return result.value;
  }
}
