import { type NextPage } from "next";
import Head from "next/head";

import { Button } from "components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "components/ui/card"

import {Input} from "components/ui/input"
import {Label} from "components/ui/label"

const LoginPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Storynest</title>
        <meta name="description" content="Storynest" />
        <link rel="icon" href="/sn_logo_2.png" />
      </Head>
      <main className="flex gap-4 text-gray-800 min-h-screen min-w-full  flex-col items-center justify-center  ">
        <div className="space-y-2 flex flex-col items-center">
            <img src="/sn_logo_2.png" className="flex h-16 w-16 rounded-xl mb-2 " alt="" />
            <h1 className="text-3xl font-semibold tracking-tight">
                Välkommen
            </h1>
            <p className="text-md text-muted-foreground">Logga in med</p>
        </div>
        <Button className="inline-flex gap-2 w-80 border h-10 border-slate-200 bg-transparent hover:bg-slate-100 text-gray-800"> 
        <img src="/google.png" className="h-[14px] w-[14px]" alt="" />
        Google
        </Button>
      </main>
    </>
  );
};

export default LoginPage;
