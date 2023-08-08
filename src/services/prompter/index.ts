// Dependencies
import * as fs from 'fs';
import * as path from 'path';
import {ChatOpenAI} from 'langchain/chat_models/openai';
import {HumanMessage} from 'langchain/schema';

export async function promptToBody<T>(
  message: string
): Promise<T | undefined> {
  try {
    const chat = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY || '',
      temperature: 0,
    });

    const templatePath = path.join('src', 'services', 'prompter', 'template.json');
    const template = fs.readFileSync(templatePath, 'utf8');
    console.log(`🤖 -> Analizando documento en busca de articulos validos.`);

    const response = await chat.call([
      new HumanMessage(
        `${template}'${message}'`,
      ),
    ]);

    const text = response.content.toString().replaceAll('\n', '');

    return cleanAncConvertToJson(text);
  } catch (error) {
    console.error('🤖' + error + '🤖');
  }
}

export async function promptToText(
  template: string,
  message: string,
): Promise<string> {
  try {
    const chat = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY || '',
      temperature: 0,
    });
    console.log(`Starting conversation chain ${template}'${message}'`);

    const response = await chat.call([
      new HumanMessage(`${template}'${message}`),
    ]);
    return response.content.replaceAll('\n', '');
  } catch (error) {
    console.error('🤖' + error + '🤖');
    return '';
  }
}

function cleanAncConvertToJson(text: string) {
  try {
    const start = text.indexOf('{');
    const end = text.indexOf('}');
    const json = text.substring(start, end + 1);
    return JSON.parse(json);
  } catch (error) {
    console.error(error);
  }
}
