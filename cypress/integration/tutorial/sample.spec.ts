import { SimpleIndexDB } from '../../../src/utils/index-db';

describe('SimpleIndexDB', () => {
  it('return undefined for unknown keys', async () => {
    const simpleIndexDB = new SimpleIndexDB();
    expect(await simpleIndexDB.get('23')).to.equal(undefined);
  });
});
