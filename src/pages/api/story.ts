import { prisma } from "~/server/db";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { OpenAI } from "openai-streams";
import { StoryInput } from "lib/types";
import { OpenAIStream, OpenAIStreamPayload } from "lib/openai";
import { TransformStream } from "stream/web";

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
    storyType: z.string(),
    readerAge: z.string()
})

const generatePrompt = (storyInput: StoryInput): string => {
    const {text, storyType, readerAge} = storyInput
    const prompt = `
    Du är en författare som kan skriva kreativa berättelser inom alla genrer och för alla målgrupper.
    Skriv en omfattande berättelse utifrån följande krav:

    1. Den önskade berättelsetypen är en ${storyType}. Se till att inkorporera typiska element från denna genre.
    2. Läsaren är ${readerAge}. Snälla se till att innehållet, språket och temat är anpassat för en person i den åldersgruppen.
    3. Läsaren har specifierat följande som bör inkluderas i berättelsen: "${text}"
    4. Berättelsen ska vara 3 kapitel och 500 ord lång.
    5. Skriv berättelsen i markdown
    6. Skriv berättelsen så att den är lätt att läsa för en annan person och undvik korta meningar så att texten är mer flytande.
    `
    return prompt
}

export default async function handler(req: Request, res: Response) {
    //TODO: Validate data
    const body = await req.json()
    const storyInput = StoryInputSchema.parse(body);

    const payload: OpenAIStreamPayload = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "user",
                "content": generatePrompt(storyInput)
            }
        ],
        temperature: 0.5,
        max_tokens: 1500,
        stream: true
    }

    const stream = await OpenAIStream(payload)
    return new Response(stream)
}