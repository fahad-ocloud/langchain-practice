import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { PlaywrightWebBaseLoader } from '@langchain/community/document_loaders/web/playwright';
import model from './service/chatOpenAI.js';

export async function chattingAI() {
  const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the user for following
    Context: {context}
    Question {input}
  `);
  const chain = await createStuffDocumentsChain({
    llm: model,
    prompt,
  });
  const loader = new PlaywrightWebBaseLoader(
    'https://python.langchain.com/v0.1/docs/modules/chains/'
  );
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

  const retriever = vectorStore.asRetriever({
    k: 10,
  });

  const retrieve_chain = await createRetrievalChain({
    combineDocsChain: chain,
    retriever,
  });

  return await retrieve_chain.invoke({
    input: 'what is LCEL',
    context: split_docs,
  });
}
