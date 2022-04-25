import { sortRecursivelyByNameButFolderFirst } from '../tree';
import { benchmark } from '@thi.ng/bench';
import { createDummyFolderTree } from '../dummy-data';
import { Counter } from '../index';

describe('tree bench', () => {
  it('sortRecursivelyByNameButFolderFirst', () => {
    // 88741 nodes
    const testTree = createDummyFolderTree('root', 17, 4, new Counter());
    const benchResult = benchmark(() => sortRecursivelyByNameButFolderFirst(testTree), { iter: 100 });
    console.log('benchResult:', benchResult);
    expect(benchResult.mean).to.be.lessThan(100);
  });
});

export {};
