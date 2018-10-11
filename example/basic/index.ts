import { AnthologyClient } from '../../src/index';

const anthology = new AnthologyClient();
console.log(anthology.extract('bg', 'red'));
