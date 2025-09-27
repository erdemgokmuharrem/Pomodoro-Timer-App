const { cleanup, init } = require('detox');

beforeAll(async () => {
  await init();
});

afterAll(async () => {
  await cleanup();
});
