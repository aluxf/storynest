import {
    createParser,
    ParsedEvent,
    ReconnectInterval,
  } from "eventsource-parser";

  import { env } from "~/env.mjs";
import { StoryInput } from "./types";

  export interface ChatGPTMessage {
    role: string;
    content: string;
  }
  
  export interface OpenAIStreamPayload {
    model: string;
    messages: ChatGPTMessage[];
    temperature: number;
    max_tokens: number;
    stream: boolean;
  }

export async function OpenAIStream(payload: OpenAIStreamPayload) {
    
    
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.OPENAI_API_KEY ?? ""}`
            },
            body: JSON.stringify(payload)
        })

        let counter = 0;

        const stream = new ReadableStream({
            async start(controller) {
              // callback
              function onParse(event: ParsedEvent | ReconnectInterval) {
                if (event.type === "event") {
                  const data = event.data;
                  // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
                  if (data === "[DONE]") {
                    controller.close();
                    return;
                  }
                  try {
                    const json = JSON.parse(data);
                    const text = json.choices[0].delta?.content || "";
                    if (counter < 2 && (text.match(/\n/) || []).length) {
                      // this is a prefix character (i.e., "\n\n"), do nothing
                      return;
                    }
                    const queue = encoder.encode(text);
                    controller.enqueue(queue);
                    counter++;
                  } catch (e) {
                    // maybe parse error
                    controller.error(e);
                  }
                }
              }
        
              // stream response (SSE) from OpenAI may be fragmented into multiple chunks
              // this ensures we properly read chunks and invoke an event for each SSE event stream
              const parser = createParser(onParse);
              // https://web.dev/streams/#asynchronous-iteration
              for await (const chunk of res.body as any) {
                parser.feed(decoder.decode(chunk));
              }
            },
          });
        
          return stream;
}

class PromptOptions {
    storyTypes: { type: string, description: string }[] = [
      { type: "Bedtime Story", description: "A soothing narrative that helps children fall asleep." },
      { type: "Adventure", description: "An exciting journey with challenges and surprises along the way." },
      { type: "Educational", description: "A story aimed at teaching something, like moral values or academic knowledge." },
      { type: "Detective", description: "A mystery story where characters solve puzzles or crimes." },
      { type: "Science Fiction", description: "A story based on scientific speculations and future technologies." },
      { type: "Realistic Fiction", description: "A story that could happen in real life, with everyday characters and events." }
      ]
      
    readerAges: string[] = [
        "1-2 years old", 
        "2-3 years old", 
        "3-4 years old", 
        "4-6 years old", 
        "6-8 years old", 
        "8-10 years old", 
        "10-12 years old", 
        "12-15 years old", 
        "Adult"
    ];
}


interface Prompt {
  (promptInput: PromptInput): string;
}

interface PromptInput {
  text: string,
  storyType: {
    type: string,
    description: string
  },
  readerAge: string
}

class PromptTemplate {
  prompt_1: Prompt = ({text, storyType, readerAge}: PromptInput) => {
    return `
    You are an author skilled in writing creative Swedish stories of around 1500 tokens in any genre and for any audience. Adhere strictly to all instructions.
  
    Write a story based on these requirements:

    Story Type: "${storyType.type}: ${storyType.description}".
    Targeted Audience: ${readerAge}. Make sure your content, language, and themes suit this age group.
    Must-Have Elements: "${text}".
    Structure: Create a story with a title, 3 chapters and MINIMUM 1500 tokens.
    Formatting: Use Markdown.
    Content: Include ONLY the story. No summaries or anything similar.
    Readability: Make it easy for someone to read aloud. Avoid choppy sentences for smoother flow.
    Language: Write the story in Swedish.
    `
  }

  prompt_2: Prompt = ({text, storyType, readerAge}: PromptInput) => {
    return `Craft a creative story in Swedish with a minimum of 1500 tokens. The story should be of the type "${storyType.type}: ${storyType.description}", and should be suitable for an audience of age ${readerAge}.

    It's important that your content, language, and themes match this age group. Incorporate the following elements into your narrative: "${text}".
    
    Create a structured story with a smooth narrative flow, making it easy for someone to read aloud. Avoid using choppy sentences. Remember, the story should be written in Markdown format and it should only contain the narrative itself, with no summaries or similar content.
    
    Please ensure you meet these requirements throughout the entirety of your story.`
  }
  
  prompt_swedish: Prompt = ({text, storyType, readerAge}: PromptInput) => {
    return `Du är en författare som kan skriva kreativa berättelser inom alla genrer och för alla målgrupper. Du MÅSTE följa alla instruktioner.
    Skriv en berättelse utifrån följande krav:

    1. Den önskade berättelsetypen är "${storyType}: ${storyType.description}"
    2. Läsaren är ${readerAge}. Snälla se till att innehållet, språket och temat är anpassat för en person i den åldersgruppen.
    3. Läsaren har specifierat följande som bör inkluderas i berättelsen: "${text}"
    4. Berättelsen ska vara 3 kapitel och MINST 1500 tokens lång.
    5. Skriv berättelsen i markdown. Skriv endast berättelsen, inga sammanfattningar eller liknande.
    6. Skriv berättelsen så att den är lätt att läsa inför en annan person och undvik korta meningar så att texten är mer flytande.`
  }
}

export const promptOptions = new PromptOptions()
export const promptTemplate = new PromptTemplate()