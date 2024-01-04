import React, { useEffect, useState } from "react";
import { urls } from "./urls";
import { Card, ICard } from "./Card";
import { clearIndex, crawlDocument } from "./utils";
// import { Select, Option } from "@material-tailwind/react";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';


import CircularProgress from '@mui/material/CircularProgress';

import { Button } from "./Button";
import Header from "../Header";
interface ContextProps {
  className: string;
  selected: string[] | null;
  refreshIndex: () => void;
}

const style = {
  contextWrapper: {
    display: "flex",
    padding: "var(--spacer-huge, 64px) var(--spacer-m, 32px) var(--spacer-m, 32px) var(--spacer-m, 32px)",
    alignItems: "flex-start",
    gap: "var(--Spacing-0, 0px)",
    alignSelf: "stretch",
    backgroundColor: "#FBFBFC"
  },
  textHeaderWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    alignSelf: "stretch"
  },
  entryUrl: {
    // width: '90%',
    fontSize: 'small',
    color: 'grey',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: "400px"
  }
}

export const Context: React.FC<ContextProps> = ({ className, selected, refreshIndex }) => {
  const [entries, setEntries] = useState(urls);
  const [cards, setCards] = useState<ICard[]>([]);

  const [splittingMethod, setSplittingMethod] = useState<string>("markdown");
  const [chunkSize, setChunkSize] = useState<number>(256);
  const [overlap, setOverlap] = useState<number>(1);

  const [url, setUrl] = useState<string>(entries[0].url);

  const [clearIndexComplete, setClearIndexCompleteMessageVisible] = useState<boolean>(false)
  const [crawling, setCrawling] = useState<boolean>(false)
  const [crawlingDoneVisible, setCrawlingDoneVisible] = useState<boolean>(false)

  // Scroll to selected card
  useEffect(() => {
    const element = selected && document.getElementById(selected[0]);
    element?.scrollIntoView({ behavior: "smooth" });
  }, [selected]);

  const DropdownLabel: React.FC<
    React.PropsWithChildren<{ htmlFor: string }>
  > = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor}>
      {children}
    </label>
  );

  const handleUrlChange = (event: SelectChangeEvent<typeof url>) => {
    const {
      target: { value },
    } = event;

    setUrl(value)
  }

  const handleSplittingMethodChange = (event: SelectChangeEvent<typeof splittingMethod>) => {
    const {
      target: { value },
    } = event;

    setSplittingMethod(value)
  }


  const buttons = entries.map((entry, key) => (
    <MenuItem
      key={key} value={entry.url}
    ><div className="flex-col" >
        <div>{entry.title}</div>
        <div style={{ ...style.entryUrl, whiteSpace: 'nowrap' as 'nowrap' }}>{entry.url}</div>
      </div>
    </MenuItem>

  ));

  return (
    <div
      className="w-full"
      style={{ ...style.contextWrapper, flexDirection: "column" as "column" }}
    >

      <div style={{ ...style.textHeaderWrapper, flexDirection: "column" as "column" }} className="w-full">
        <Header />
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          This RAG chatbot uses Pinecone and Vercel&apos;s AI SDK to demonstrate a URL crawl, data chunking and embedding, and semantic questioning.
        </div>

      </div>
      <div className="flex flex-column w-full" style={{ ...style.textHeaderWrapper, flexDirection: "column", }}>
        <div className="mb-3 w-full">
          <h4 style={{ fontWeight: 700, marginBottom: 7 }}>Select demo url to index</h4>




          <Select className="w-full" value={url} onChange={handleUrlChange} MenuProps={{
            keepMounted: true,
            PaperProps: {
              style: {
                width: 'fit-content',
              },
            },
          }}>
            {buttons}
          </Select>


        </div>

        <div className="mb-3 w-full">
          <h4 style={{ fontWeight: 700, marginBottom: 7 }}>Splitting method</h4>
          <Select value={splittingMethod} className="w-full" onChange={handleSplittingMethodChange} >
            <MenuItem value="markdown">Markdown Splitting</MenuItem>
            <MenuItem value="recursive">Recursive Text Splitting</MenuItem>
          </Select>
        </div>
        {splittingMethod === "recursive" && (
          <div className="w-full">
            <div className="my-4 flex flex-col">
              <div className="flex flex-col w-full">
                <DropdownLabel htmlFor="chunkSize">
                  Chunk Size: <span className="font-bold">{chunkSize}</span>
                </DropdownLabel>
                <input
                  className="p-2"
                  type="range"
                  id="chunkSize"
                  min={1}
                  max={2048}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                />
              </div>
              <div className="flex flex-col w-full">
                <DropdownLabel htmlFor="overlap">
                  Overlap: <span className="font-bold">{overlap}</span>
                </DropdownLabel>
                <input
                  className="p-2"
                  type="range"
                  id="overlap"
                  min={1}
                  max={200}
                  onChange={(e) => setOverlap(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        <Button
          className="my-2 duration-100 button-primary"
          style={{ backgroundColor: `${crawlingDoneVisible ? "#15B077" : "#1B17F5"}`, color: "white", fontWeight: 500, padding: "12px 32px", transition: "all 0.5s ease-in-out" }}

          onClick={async () => {
            setCrawling(true)
            await crawlDocument(
              url,
              setEntries,
              setCards,
              splittingMethod,
              chunkSize,
              overlap
            )
            setCrawling(false)
            setCrawlingDoneVisible(true)
            setTimeout(() => {
              setCrawlingDoneVisible(false)
            }, 2000),
              refreshIndex()
          }}
        >
          {!crawling ? (crawlingDoneVisible ? "Success" : "Embed and upsert") : (<div className="flex">
            <CircularProgress size={20} sx={{
              color: "white",
            }} />
            <div className="ml-5">In progress</div>
          </div>)}
        </Button>
      </div>

      <div className="flex flex-wrap w-full mt-5" style={{ paddingBottom: 8, borderBottom: "1px solid #738FAB1F" }}>
        <div className="uppercase" style={{ fontSize: 12 }}>Index records</div>
        <div style={{ color: "#1B17F5", fontSize: 12, cursor: "pointer" }} className="right ml-auto" onClick={async () => {
          await clearIndex(setEntries, setCards)
          setClearIndexCompleteMessageVisible(true)
          refreshIndex()
          setTimeout(() => {
            setClearIndexCompleteMessageVisible(false)
          }, 2000)
        }}>Clear</div>
      </div>
      {(
        <div style={{ fontSize: 12, marginTop: 10, transition: "all 0.5s ease-in-out", transform: `${clearIndexComplete ? "translateY(0%)" : "translateY(60%)"}`, opacity: `${clearIndexComplete ? "1" : "0"}` }}>
          Index cleared
        </div>
      )}

      <div className="flex flex-wrap w-full">
        <div>
          {cards && cards.length > 0 ? <div className="mt-2">{cards.length} results</div> : <div></div>}
        </div>
        {cards &&
          cards.map((card, key) => (
            <Card key={key} card={card} selected={selected} />
          ))}
      </div>


    </div>
  );
};
