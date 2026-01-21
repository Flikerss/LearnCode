import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

let mongoServer;
let mongoClient;

beforeAll(async () => {
  // Запускаем MongoDB Memory Server для тестов
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  
  // Устанавливаем тестовую базу данных в глобальную область
  global.testDb = mongoClient.db('test');
  global.testClient = mongoClient;
});

afterAll(async () => {
  if (mongoClient) {
    await mongoClient.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Очищаем все коллекции перед каждым тестом
  if (global.testDb) {
    const collections = await global.testDb.listCollections().toArray();
    for (const collection of collections) {
      await global.testDb.collection(collection.name).deleteMany({});
    }
  }
});


