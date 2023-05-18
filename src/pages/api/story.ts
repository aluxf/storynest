import { z } from "zod";
import { StoryInput } from "lib/types";
import { OpenAIStream, OpenAIStreamPayload } from "lib/openai";
import { promptOptions } from "lib/openai";

//https://dev.to/sneakysensei/nextjs-api-routes-global-error-handling-and-clean-code-practices-3g9p

/**
 * 
 * gameplan:
 * skapa db för story
 *
 * skapa db för storytypes?
 * skapa db för storyage?
 * - alt. ha dessa hårdkodade i server
 * 
 * "/create" => call till server => server skapar en ny story med metadata och returnerar id
 * "/create" går till "/story/?streaming=storyid" => call till server =>
 * 
 */

export const config = {
    runtime: "edge"
}

const StoryInputSchema = z.object({
    text: z.string(),
    storyType: z.number(),
    readerAge: z.number()
})

const generatePrompt = (storyInput: StoryInput): string => {
    const {text, storyType, readerAge} = storyInput
    const prompt = `
    Du är en författare som kan skriva kreativa berättelser inom alla genrer och för alla målgrupper. Du MÅSTE följa alla instruktioner.
    Skriv en berättelse utifrån följande krav:

    1. Den önskade berättelsetypen är "${promptOptions.storyTypes[storyType]?.type}: ${promptOptions.storyTypes[storyType]?.description}"
    2. Läsaren är ${promptOptions.readerAges[readerAge]}. Snälla se till att innehållet, språket och temat är anpassat för en person i den åldersgruppen.
    3. Läsaren har specifierat följande som bör inkluderas i berättelsen: "${text}"
    4. Berättelsen ska vara 3 kapitel och 500 ord lång.
    5. Skriv berättelsen i markdown. Skriv endast berättelsen, inga sammanfattningar eller liknande.
    6. Skriv berättelsen så att den är lätt att läsa inför en annan person och undvik korta meningar så att texten är mer flytande.
    `
    return prompt
}

export default async function handler(req: Request, res: Response) {
    //TODO: Validate data
    const body = await req.json()
    let storyInput = null
    try {
        storyInput = StoryInputSchema.parse(body);
    }
    catch (err) {
        return new Response(`Bad Request: ${err}`, {status: 400})
    }

    const payload: OpenAIStreamPayload = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "user",
                "content": generatePrompt(storyInput)
            }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        stream: true
    }

    const stream = await OpenAIStream(payload)
    return new Response(stream)
}