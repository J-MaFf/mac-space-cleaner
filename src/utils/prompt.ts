import readline from 'readline';

export function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export async function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

export async function confirmDelete(rl: readline.Interface, suggestions: number): Promise<boolean> {
  const answer = await prompt(rl, `\nDelete ${suggestions} suggested files? [y/N]: `);
  return answer.toLowerCase() === 'y';
}
