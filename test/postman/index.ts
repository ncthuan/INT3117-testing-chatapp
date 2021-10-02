import { getConnection} from 'typeorm';
import * as newman from 'newman';
import bootstrap from 'src/bootstrap';

const runTest = async () => {

  const app = await bootstrap();

  await resetDatabase();

  await testPostman();

  if (process.argv.includes('--close')) {
    app.close();
    process.exit();
  }
}

const resetDatabase = async () => {
  const mongoConnection = getConnection();
  await mongoConnection.dropDatabase();
  await mongoConnection.runMigrations()
}

const testPostman = async () => {
  return new Promise((resolve, reject) => {
    newman.run({
      collection: 'test/postman/api.postman.json',
      environment: 'test/postman/api.postman.env.json',
      reporters: 'cli'
    },
    function (err) {
      if (err) return reject(err);

      return resolve(true);
    });
  })
}

runTest();