import { type NextPage } from "next";
import Head from "next/head";
import { useState, useRef } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

const CreateStory: NextPage = () => {
  const [text, setText] = useState("");
  const [storyType, setStoryType] = useState("Godnattsaga");
  const [readerAge, setReaderAge] = useState("6-8 år");
  const [story, setStory] = useState("");
  const [failedStory, setFailedStory] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null)

  const scrollToStory = () => {
    if (storyRef.current) {
        storyRef.current.scrollIntoView({behavior: "smooth"});
    }
  }

  const updateStoryType = (type: string) => {
    setStoryType(type);
  };

  const updateReaderAge = (slot: string) => {
    setReaderAge(slot);
  };

  const updateText = (text: string) => {
    setText(text);
  };

  const renderStory = async (e: any) => {
    e.preventDefault();
    setStory("");

    const response = await fetch("api/story", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        storyType,
        readerAge,
      }),
    });
    if (!response.ok) {
      setFailedStory(true);
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
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const content = decoder.decode(value);
      setStory((prev) => prev + content);
    }
  };

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen min-w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-[#ffffff] to-[#f3f3f3]">
        <div className="container h-24"></div>
        <div className="container flex flex-col items-center justify-center gap-12 ">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-600">
            Skapa en ny Story
          </h1>
          <textarea
            className="textarea textarea-lg h-48 w-11/12"
            placeholder="Till exempel, 'En get som lever på en båt'"
            name=""
            id=""
            cols={30}
            rows={10}
            value={text}
            onChange={(e) => updateText(e.target.value)}
          />
          <button className="btn" onClick={(e) => renderStory(e)}>
            {" "}
            Generera
          </button>
        </div>
        <div className="items-left container flex h-60 w-10/12 flex-col gap-4">
          <h2 className="text-2xl font-extrabold text-slate-600">
            {" "}
            Inställningar{" "}
          </h2>
          <div className="flex flex-col">
            <span className="font-bold text-slate-600"> Berättelsetyp </span>
            <select
              value={storyType}
              onChange={(e) => updateStoryType(e.target.value)}
              className="select select-sm"
              name=""
              id=""
            >
              <option value={"Godnattsaga"}>Godnattsaga</option>
              <option value={"Äventyr"}>Äventyr</option>
              <option value={"Pedagogisk"}>Pedagogisk</option>
              <option value={"Däckare"}>Däckare</option>
              <option value={"Science fiction"}>Science fiction</option>
              <option value={"Realistisk fiction"}>Realistisk fiction</option>
            </select>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-600"> Läsarens ålder </span>
            <select
              value={readerAge}
              onChange={(e) => updateReaderAge(e.target.value)}
              className="select select-sm"
              name=""
              id=""
            >
              <option value={"1-2 år"}>1-2 år</option>
              <option value={"2-3 år"}>2-3 år</option>
              <option value={"3-4 år"}>3-4 år</option>
              <option value={"4-6 år"}>4-6 år</option>
              <option value={"6-8 år"}>6-8 år</option>
              <option value={"8-10 år"}>8-10 år</option>
              <option value={"10-12 år"}>10-12 år</option>
              <option value={"12+ år"}>12+ år</option>
              <option value={"Vuxen"}>Jag är faktiskt vuxen!!</option>
            </select>
          </div>
          <div className="">
            {failedStory && (
              <p className="font-bold text-red-800">
                {" "}
                Misslyckades - Försök igen om ett par minuter.
              </p>
            )}
          </div>
        </div>
        <div ref={storyRef} className="flex flex-col gap-8 items-center w-11/12 container h-screen">
            <h2 className="mt-4 text-3xl font-extrabold text-slate-600">Story</h2>
            <div  className="mb-4 flex-grow bg-white border-4 p-3 w-full rounded-lg overflow-auto">
                <ReactMarkdown children={story}/>
            </div>
        </div>
        
      </main>
    </>
  );
};

export default CreateStory;
