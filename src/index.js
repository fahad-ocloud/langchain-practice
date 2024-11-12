import {
  listParserResponse,
  stringParserResponse,
  structuredParserResponse,
  zodStructuredParserResponse,
} from './ouputParsers/outputParser.js';
import { chattingAI } from './retreivalChain.js';

// const response = await stringParserResponse('goat');
// const response = await listParserResponse('SAD');
// const response = await structuredParserResponse(
//   'list of cars their company are bavarian Motor words'
// );
// const response = await zodStructuredParserResponse(
//   'list of ingredients of making biryani'
// );

const response = await chattingAI();

console.log(response);
