import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";


const SelectSetting = (props:any) => {
  const { label, options } = props 
  return (
    <div>
      
    </div>
  )
}
/**
 * 
 * 
 * Godnattsaga
 * Äventyr
 * Pedagogisk
 * Däckare
 * Science fiction
 * Realistisk fiction
 */

/**
 * 
 * Läsarens ålder
 * 1-2
 */
const Home: NextPage = () => {
    const [storyType, setStoryType] = useState(0)
    const [readerAgeSlot, setReaderAgeSlot] = useState(5)
    
    const updateStoryType: any = (type:number) => {
        setStoryType(type)
    }

    const updateReaderAgeSlot: any = (slot:number) => {
        setReaderAgeSlot(slot)
    }

    return (
        <>
        <Head>
            <title>Create T3 App</title>
            <meta name="description" content="Generated by create-t3-app" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="gap-5 flex min-h-screen min-w-full flex-col items-center justify-center bg-gradient-to-b from-[#ffffff] to-[#f3f3f3]">
            <div className="container flex flex-col items-center justify-center gap-12 ">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-600">
                Skapa en ny Story
            </h1>
            <textarea
                className="h-48 w-11/12 textarea textarea-lg"
                placeholder="Till exempel, 'En get som lever på en båt'"
                name=""
                id=""
                cols={30}
                rows={10}
            />
            <button className="btn"> Generera Story</button>
            </div>
            <div className="container flex flex-col items-left w-10/12 gap-4">
            <h2 className="text-2xl font-extrabold text-slate-600"> Inställningar </h2>
            <div className="flex-col flex">
                <span className="font-bold text-slate-600"> Berättelsetyp </span>
                <select value={storyType} onChange={e => updateStoryType(e.target.value)} className="select select-sm" name="" id="">
                    <option selected value={0}>Godnattsaga</option>
                    <option value={1}>Äventyr</option>
                    <option value={2}>Pedagogisk</option>
                    <option value={3}>Däckare</option>
                    <option value={4}>Science fiction</option>
                    <option value={5}>Realistisk fiction</option>
                </select>
            </div>
            <div className="flex-col flex">
                <span className="font-bold text-slate-600"> Läsarens ålder  </span>
                <select value={readerAgeSlot} onChange={e => updateReaderAgeSlot(e.target.value)} className="select select-sm" name="" id="">
                    <option selected value={0}>1-2 år</option>
                    <option value={1}>2-3 år</option>
                    <option value={2}>3-4 år</option>
                    <option value={3}>4-6 år</option>
                    <option value={4}>6-8 år</option>
                    <option value={5}>8-10 år</option>
                    <option value={6}>10-12 år</option>
                    <option value={7}>12 år</option>
                    <option value={8}>Jag är faktiskt vuxen! :D</option>

                </select>
            </div>
            </div>

        </main>
        </>
    );
};

export default Home;
