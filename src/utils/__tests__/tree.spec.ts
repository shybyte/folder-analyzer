import { FileSystemNode } from '../../components/common/FolderPicker';
import { sortRecursivelyByName } from '../tree';

describe('tree', () => {
  it('sortRecursivelyByName', () => {
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
      ],
    };
    const sorted = sortRecursivelyByName(tree);
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
