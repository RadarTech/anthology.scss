import { AnthologyClient } from '../../dist';

const anthology = new AnthologyClient<'small' | 'medium' | 'large'>();
console.log('Breakpoints:', anthology.breakpoints);
console.log('AnthologyRule:', anthology.extract('bg', 'red'));
