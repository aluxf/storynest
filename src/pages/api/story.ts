import { z } from "zod";
import { StoryInput } from "lib/types";
import { OpenAIStream, OpenAIStreamPayload, promptTemplate } from "lib/openai";
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
    storyTypeID: z.number(),
    readerAgeID: z.number()
})

const generatePrompt = (storyInput: StoryInput): string => {
    const {text, storyTypeID, readerAgeID} = storyInput
    const storyType = promptOptions.storyTypes?.[storyTypeID] as {type: string, description:string}
    const readerAge = promptOptions.readerAges?.[readerAgeID] as string

    return promptTemplate.prompt_1({text, storyType, readerAge})
}

export default async function handler(req: Request, res: Response) {
    //TODO: Validate data
    const body = await req.json()
    let storyInput = null
    let prompt = null
    try {
        storyInput = StoryInputSchema.parse(body);
        prompt = generatePrompt(storyInput)
    }
    catch (err) {
        console.log(err)
        return new Response(`Bad Request: ${err}`, {status: 400})
    }


    console.log(prompt)
    const payload: OpenAIStreamPayload = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        stream: true
    }

    const stream = await OpenAIStream(payload)
    return new Response(stream)
}