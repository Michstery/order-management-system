import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ConfigModule } from '@nestjs/config';
import configuration from '../src/config/configuration';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'test',
      port: 27017,
      storageEngine: 'wiredTiger',
    },
  });
  const uri = await mongod.getUri();
  process.env.MONGODB_URI = uri;

  // Load configuration
  await ConfigModule.forRoot({
    load: [configuration],
  });

  // Connect to the in-memory database
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongod) {
    await mongod.stop();
  }
  await mongoose.disconnect();
}); 