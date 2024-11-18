import {
  getMultipleChoiceQuestions,
  listParserResponse,
  stringParserResponse,
  zodStructuredParserResponse,
} from './ouputParsers/outputParser.js';
import { chattingAI } from './retrievalChain.js';

import express from 'express';
import cors from 'cors';

const port = 8080;
const app = express();
app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  const response = await chattingAI();
  res.send(response);
});

app.post('/getMultipleChoiceQuestion', async (req, res) => {
  try {
    const { subject, standard, limit } = req.body;
    console.log(req.body);
    if (!subject || !standard || !limit) {
      return res.status(400).send({
        error: 'Missing required fields: subject, standard, or limit',
      });
    }

    const response = await getMultipleChoiceQuestions(standard, subject, limit);

    res.status(200).send(response);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res
      .status(500)
      .send({ error: 'An error occurred while fetching questions' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
