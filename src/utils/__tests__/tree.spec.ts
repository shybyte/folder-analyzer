import { sortRecursivelyByNameButFolderFirst } from '../tree';
import { FileSystemNode } from '../../types';

describe('tree', () => {
  it('sortRecursivelyByNameButFolderFirst', () => {
    const tree: FileSystemNode = {
      name: 'root',
      children: [
        {
          name: 'alf',
          children: [
            {
              name: 'a',
            },
            {
              name: 'c',
            },
            {
              name: 'B',
            },
          ],
        },
        {
          name: 'picard',
        },
        {
          name: 'bundy',
        },
        {
          name: 'folder-first',
          children: [
            {
              name: 'file',
            },
          ],
        },
      ],
    };
    const sorted = sortRecursivelyByNameButFolderFirst(tree);
    expect(sorted).to.deep.equal({
      name: 'root',
      children: [
        {
          name: 'alf',
          children: [
            {
              name: 'a',
            },
            {
              name: 'B',
            },
            {
              name: 'c',
            },
          ],
        },
        {
          name: 'folder-first',
          children: [
            {
              name: 'file',
            },
          ],
        },
        {
          name: 'bundy',
        },
        {
          name: 'picard',
        },
      ],
    });
  });
});

export {};
