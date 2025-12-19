export const basicCommandBusExample =
  `import {CommandBus, Command} from '@collidor/toolkit'

const commandBus = new CommandBus();

class SumCommand extends Command<{a: number, b: number}, number> {}

commandBus.register(SumCommand, ({a, b}) => {
  return a + b;
});

const result = commandBus.execute(new SumCommand({a: 1, b: 2}));
console.log(result); // 3
`;
