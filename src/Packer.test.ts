import * as fs from 'fs';
import { Packer } from './Packer';
import * as path from 'path';
import { expect } from 'chai';

async function readExpectedOutput(expectedOutputPath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(expectedOutputPath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.trim());
      }
    });
  });
}

describe('Packers', () => {
  const packer = new Packer();
  it('should pack items based on the input file', async () => {
    // Construct an absolute path to the files
    const projectRoot = path.resolve(__dirname, '..'); 

    const inputFilePath = path.join(projectRoot, 'resources', 'example_input.txt');
    const expectedOutputPath = path.join(projectRoot, 'resources', 'example_output.txt');
    const expectedOutput = await readExpectedOutput(expectedOutputPath);

    const result = await packer.pack(inputFilePath);

    expect(result).to.equal(expectedOutput); // Use to.equal here

  });
});