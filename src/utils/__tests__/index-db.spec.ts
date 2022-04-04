import { SimpleIndexDB } from '../index-db';

const TEST_DB_NAME = 'TestDB';

describe('SimpleIndexDB', () => {
  let simpleIndexDB: SimpleIndexDB;

  beforeEach(async () => {
    await SimpleIndexDB.delete(TEST_DB_NAME);
    simpleIndexDB = await SimpleIndexDB.create(TEST_DB_NAME);
  });

  afterEach(() => {
    simpleIndexDB.close();
  });

  it('return undefined for unknown keys', async () => {
    expect(await simpleIndexDB.get('23')).to.equal(undefined);
  });

  it('store strings', async () => {
    await simpleIndexDB.set('23', '42');
    expect(await simpleIndexDB.get('23')).to.equal('42');
  });

  it('store objects', async () => {
    const savedObject = { myValue: 42 };
    await simpleIndexDB.set('23', savedObject);
    expect(await simpleIndexDB.get('23')).to.deep.equal(savedObject);
  });
});
