import * as fs from 'fs';
import { PackingError } from './PackingError';
class Item {
  index!: number;
  weight!: number;
  cost!: number;
}

class Test {
  weightLimit!: number;
  items!: Item[];
}

export class Packer {

  async pack(filePath: string): Promise<string> {
    try {
      const testCases = await this.readFile(filePath);
      const results = testCases.map(this.solve);
      return this.formatResults(results);
    } catch (error: any) {
      throw new PackingError(error.message);
    }
  }

  private readFile(filePath: string): Promise<Test[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          reject(new PackingError(err.message));
        } else {
          const lines = data.split('\n');
          const parsedLines: Test[] = [];

          for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const line = lines[lineNumber].trim();
            if (line.length > 0) {
              try {
                const parsedLine = this.parseLine(lineNumber, line);
                parsedLines.push(parsedLine);
              } catch (parseError: any) {
                reject(new PackingError(parseError.message));
              }
            }
          }

          resolve(parsedLines);
        }
      });
    });
  }

  private solve(testData: Test): number[] {
    const items = testData.items;
    const capacity = Math.floor(testData.weightLimit * 100); // Scale up to cents
    const n = items.length;

    // Create a 2D array to store the results of subproblems
    const dp: number[][] = new Array(n + 1);
    for (let i = 0; i <= n; i++) {
      dp[i] = new Array(capacity + 1).fill(0);
    }

    // Fill dp array
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        const weight = Math.floor(items[i - 1].weight * 100); // Scale up to cents
        const cost = Math.floor(items[i - 1].cost * 100); // Scale up to cents

        if (weight <= w) {
          dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight] + cost);
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }

    // Reconstruct the selected items
    const selectedItems: number[] = [];
    let i = n;
    let w = capacity;

    while (i > 0 && w > 0) {
      const weight = Math.floor(items[i - 1].weight * 100); // Scale up to cents

      if (dp[i][w] !== dp[i - 1][w]) {
        selectedItems.push(items[i - 1].index);
        w -= weight;
      }
      i--;
    }

    selectedItems.reverse();

    return selectedItems;
  }

  private formatResults(results: number[][]): string {
    return results.map((result) => (result.length > 0 ? result.map(item => Math.floor(item * 100) / 100).join(',') : '-')).join('\n');
  }

  private parseLine(lineNumber: number, line: string): Test {
    const test = new Test();
    const items: Item[] = [];

    // Split the line by colon to separate the weight limit from items
    const parts = line.split(':');

    if (parts.length !== 2) {
      throw new PackingError(`Line ${lineNumber + 1}: Invalid format: ${line}`);
    }

    // Parse the weight limit (the first part)
    test.weightLimit = Math.floor(parseFloat(parts[0].trim()) * 100); // Scale up to cents

    if (isNaN(test.weightLimit)) {
      throw new PackingError(`Line ${lineNumber + 1}: Invalid weight limit: ${parts[0].trim()}`);
    }

    // Split the second part by spaces to get individual items
    const itemStrings = parts[1].trim().split(' ');

    for (let i = 0; i < itemStrings.length; i++) {
      const itemParts = itemStrings[i].match(/\((\d+),([\d.]+),€([\d.]+)\)/);

      if (!itemParts || itemParts.length !== 4) {
        throw new PackingError(`Line ${lineNumber + 1}: Invalid item format: ${itemStrings[i]}`);
      }

      const item = new Item();
      item.index = parseInt(itemParts[1]);
      item.weight = Math.floor(parseFloat(itemParts[2]) * 100); // Scale up to cents
      item.cost = Math.floor(parseFloat(itemParts[3]) * 100); // Scale up to cents

      if (isNaN(item.index) || isNaN(item.weight) || isNaN(item.cost)) {
        throw new PackingError(`Line ${lineNumber + 1}: Invalid item data: ${itemStrings[i]}`);
      }

      items.push(item);
    }

    test.items = items;
    return test;
  }
}
