import { AnthologyClient } from '../../src/index';

const anthology = new AnthologyClient<'small' | 'medium' | 'large'>();
console.log('Breakpoints:', anthology.breakpoints);
console.log('AnthologyRule:', anthology.extract('bg', 'red'));
