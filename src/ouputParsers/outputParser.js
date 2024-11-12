import model from '../service/chatOpenAI.js';
import {
  CommaSeparatedListOutputParser,
  StringOutputParser,
} from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import z from 'zod';

export async function stringParserResponse(input) {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'Generate a joke based ona word provided by the user'],
    ['human', '{input}'],
  ]);

  const parser = new StringOutputParser();

  const chain = prompt.pipe(model).pipe(parser);

  return await chain.invoke({
    input: input,
  });
}

export async function listParserResponse(input) {
  const prompt = ChatPromptTemplate.fromTemplate(
    'Provide 5 antonym separated by comma for the following word {input}'
  );

  const parser = new CommaSeparatedListOutputParser();

  const chain = prompt.pipe(model).pipe(parser);

  return await chain.invoke({
    input: input,
  });
}

export async function structuredParserResponse(input) {
  const prompt = ChatPromptTemplate.fromTemplate(
    'extract info from the following pharase.{format_instructions}Pharase: {input}'
  );

  const parser = StructuredOutputParser.fromNamesAndDescriptions({
    name: 'the name of the car',
    company: 'the name of the company',
    company_founder: 'the name of company owner',
  });

  const chain = prompt.pipe(model).pipe(parser);

  return await chain.invoke({
    input: input,
    format_instructions: parser.getFormatInstructions(),
  });
}
export async function zodStructuredParserResponse(input) {
  const prompt = ChatPromptTemplate.fromTemplate(
    'extract info from the following pharase.{format_instructions}Pharase: {input}'
  );

  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      recipe: z.string().describe('name of recipe'),
      ingredients: z.array(z.string()).describe('ingredients'),
    })
  );

  const chain = prompt.pipe(model).pipe(parser);

  return await chain.invoke({
    input: input,
    format_instructions: parser.getFormatInstructions(),
  });
}
