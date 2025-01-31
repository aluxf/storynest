import { type NextPage } from "next";
import Head from "next/head";
import {FC, useState, useRef, ChangeEvent, useEffect } from "react";
import { ReactMarkdown} from "react-markdown/lib/react-markdown";
import { ReactMarkdownProps } from "react-markdown/lib/ast-to-react";
import { promptOptions } from "lib/openai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select"

import {Textarea} from "components/ui/textarea"
import { Button } from "components/ui/button";


interface SelectProps {
    title: string
    value: number
    options: string[]
    onChange: (value: number) => void
}

const SettingSelection: FC<SelectProps> = ({title, value, options, onChange }) => {
    const handleChange = (value: string) => {
        onChange(Number(value));
    };
  
    return (
        <div className="flex flex-col">
            <Select onValueChange={handleChange} >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={options[value]} />
              </SelectTrigger>
              <SelectContent>
                {options.map((label, index) => (
                <SelectItem key={index} value={String(index)}>
                    {label}
                </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        
      
    );
  }

const mdRenderers = {
  h1: ({node, ...props}: ReactMarkdownProps) => <h1 className={"text-2xl font-bold text-center "} {...props} />,
  h2: ({node, ...props}: ReactMarkdownProps) => <h1 className={"text-lg font-bold "} {...props} />,
}

const CreateStory: NextPage = () => {
  const [text, setText] = useState("");
  const [storyTypeID, setStoryTypeID] = useState(0);
  const [readerAgeID, setReaderAgeID] = useState(5);
  const [story, setStory] = useState("");
  const [failedStory, setFailedStory] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToStory = () => {
    if (storyRef.current) {
        storyRef.current.scrollIntoView({behavior: "smooth"});
    }
  }

  const renderStory = async (e: any) => {
    e.preventDefault();
    setStory("");

    // Abort the previous request, if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

      const response = await fetch("api/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          storyTypeID,
          readerAgeID
        }),
        signal // Pass the AbortSignal to the fetch
    });
    if (response.status != 200) {
      setFailedStory(true);
      return
    }
    setFailedStory(false);

    const data = response.body;

    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    scrollToStory()
    while (!done) {
      // Catch any AbortErrors
      try {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const content = decoder.decode(value);
        setStory((prev) => prev + content);
      } catch (error:any) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        } else {
          throw error; // If it's another kind of error, it might be serious so rethrow it
        }
      }
    }
};

  return (
    <>
      <Head>
        <title>Storynest</title>
        <meta name="description" content="Skapa personliga berättelser till barnen med hjälp av AI." />
        <link rel="icon" href="/sn_logo_2.png" />
      </Head>
      <main className="flex text-gray-800 min-h-screen min-w-full flex-col items-center justify-center  ">
        <div className="h-36 flex items-center justify-center w-full"> 
          <img src="/sn_logo_2.png" className="flex h-20 w-20 rounded-xl " alt="" />
        </div>
        <div className="flex-col lg:flex-row flex w-full items-center p-6 gap-5">
          <div className="w-full flex flex-col flex-1 gap-5 lg:min-h-screen">
            <div className="flex flex-col items-center justify-center gap-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">
                Skapa med AI
              </h1>

              <Textarea 
                className="h-48 bg-white text-lg p-5 resize-none focus-visible:none w-full border-4 rounded-lg"
                placeholder="Till exempel, 'En get som lever på en båt'"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={400}
              />
              <Button onClick={(e) => renderStory(e)}> Generera </Button>
            </div>
          <div className="items-left flex h-60 flex-col gap-4">
            <h2 className="text-2xl font-extrabold ">
              {" "}
              Inställningar{" "}
            </h2>
            <SettingSelection title="Berättelsetyp" value={storyTypeID} onChange={setStoryTypeID} options={promptOptions.storyTypes.map((item) => item.type)}/>
            <SettingSelection title="Läsarens ålder" value={readerAgeID} onChange={setReaderAgeID} options={promptOptions.readerAges}/>
            <div className="">
              {failedStory && (
                <p className="font-bold text-red-800">
                  {" "}
                  Misslyckades - Försök igen om ett par minuter.
                </p>
              )}
            </div>
          </div>
          </div>
          <div ref={storyRef} className="flex flex-1 flex-col gap-8 items-center justify-center w-full lg:w-48 max-h-screen min-h-screen">
              <h2 className="text-4xl font-extrabold ">Story</h2>
              <div  className="mb-4 bg-white border-4 p-5 w-full rounded-lg flex-grow overflow-auto">
                  {story == "" && <p className="opacity-50 text-lg"> Här skapas din personliga AI story... </p> }
                  <ReactMarkdown className="flex flex-col gap-5 " components={mdRenderers} children={story}/>
              </div>
          </div>
          

        </div>
          
      </main>
    </>
  );
};

export default CreateStory;
