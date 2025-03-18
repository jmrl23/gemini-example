import { createInterface } from 'node:readline';

export function input(question: string = ''): Promise<string> {
  const readlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => {
    readlineInterface.question(question, (answer) => {
      resolve(answer);
      readlineInterface.close();
    });
  });
}
