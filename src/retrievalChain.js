import { OpenAIEmbeddings } from '@langchain/openai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { PlaywrightWebBaseLoader } from '@langchain/community/document_loaders/web/playwright';
import model from './service/chatOpenAI.js';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
export async function chattingAI() {
  const vectorStore = await createVectorStore(
    'https://python.langchain.com/v0.1/docs/modules/chains/'
  );

  const chain = await createChain(vectorStore);

  const chatHistory = [
    new HumanMessage('hello'),
    new AIMessage('Hi, How can I help you?'),
    new HumanMessage('My name is Fahad'),
    new AIMessage('Hi Fahad How can I help you?'),
    new HumanMessage('What is LCEL?'),
    new AIMessage('LCEL Stands for Langchain Expression Language'),
  ];
  return await chain.invoke({
    input: 'what is my name',
    chat_history: chatHistory,
  });
}

const createVectorStore = async (link) => {
  const loader = new PlaywrightWebBaseLoader(link);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap: 20,
    chunkSize: 200,
  });

  const docs = await loader.load();

  const split_docs = await splitter.splitDocuments(docs);

  const embedding = new OpenAIEmbeddings();

  const vectorStore = await MemoryVectorStore.fromDocuments(
    split_docs,
    embedding
  );

  return vectorStore;
};

const createChain = async (vectorStore) => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      "Anwers the user's question for the following context : {context}.",
    ],
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
  ]);

  const chain = await createStuffDocumentsChain({
    llm: model,
    prompt,
  });

  const retriever = vectorStore.asRetriever({
    k: 2,
  });

  const retrieverPrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
    [
      'user',
      'Given the above conversation, generate a search query to look up in order to get info relevant to the conversation.',
    ],
  ]);
  const history_aware_retriever = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: retrieverPrompt,
  });

  const conversation_chain = await createRetrievalChain({
    combineDocsChain: chain,
    retriever: history_aware_retriever,
  });

  return conversation_chain;
};
