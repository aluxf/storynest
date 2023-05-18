import {
    createParser,
    ParsedEvent,
    ReconnectInterval,
  } from "eventsource-parser";

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
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY ?? ""}`
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
        { type: "Godnattsaga", description: "En lugnande berättelse som hjälper barn att somna." },
        { type: "Äventyr", description: "En spännande resa med utmaningar och överraskningar längs vägen." },
        { type: "Pedagogisk", description: "En berättelse som syftar till att lära ut något, som moraliska värden eller akademiska kunskaper." },
        { type: "Däckare", description: "En mysteriumhistoria där karaktärer löser pussel eller brott." },
        { type: "Science fiction", description: "En berättelse baserad på vetenskapliga spekulationer och framtida teknologier." },
        { type: "Realistisk fiction", description: "En berättelse som kan hända i verkligheten med vardagliga karaktärer och händelser." }
      ]
      
    readerAges: string[] = [
        "1-2 år", 
        "2-3 år", 
        "3-4 år", 
        "4-6 år", 
        "6-8 år", 
        "8-10 år", 
        "10-12 år", 
        "12+ år", 
        "Vuxen"
    ];
}

export const promptOptions = new PromptOptions()