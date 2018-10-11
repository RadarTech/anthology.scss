import { AnthologyClient } from '../../src/index';

const anthology = new AnthologyClient<'small' | 'medium' | 'large'>();
console.log(anthology.breakpoints);
console.log(anthology.extract('bg', 'red'));
