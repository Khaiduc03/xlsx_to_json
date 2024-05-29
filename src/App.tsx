import { RefObject, useEffect, useRef, useState } from "react";
import { FileInput, Title } from "@mantine/core";
import { ACCEPT_TYPE_FILE } from "./type";
import { CopyBlock, dracula } from "react-code-blocks";
import { Code } from "@mantine/core";
import * as XLSX from "xlsx";

import { Tabs, rem } from "@mantine/core";

function App() {
  const inputRef = useRef<HTMLButtonElement>(null); // Change the type of inputRef
  const [jsonResult, setJsonResult] = useState<any>(null);
  const [jsonResultEN, setJsonResultEN] = useState<any>(null);
  const generateRandomKey = () => {
    return "random_key_" + Math.random().toString(36).substring(2, 15);
  };

  const formatKey = (key: string) => {
    return key.toLowerCase().replace(/[^a-z0-9]/g, "_");
  };
  const handleFile = (file: Blob | null) => {
    const reader = new FileReader();
    if (file) {
      reader.readAsBinaryString(file);
      console.log(reader, "reader");

      reader.onload = (e) => {
        const data = e.target?.result;

        const wb = XLSX.read(data, { type: "binary" });
        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        console.log("wbbbbbbbbbbbbbbbbb", ws);
        const json = XLSX.utils.sheet_to_json(ws, {
          skipHidden: false,
        });
        const formattedJson = {};
        json.forEach((row: any, index) => {
          // Explicitly type 'row' as any
          if (!row.Page) {
            row.Page = json[index - 1]?.Page;
          }
        });
        const jsonStructure = json.reduce(
          (acc: Record<string, any>, row: any) => {
            if (!acc[row.Page]) acc[row.Page] = {};
            const key1 = row.KEY || generateRandomKey();
            //how to format string to key
            const formattedKey = formatKey(key1);
            acc[row.Page][formattedKey] = row.vi || "";
            return acc;
          },
          {}
        );

        const jsonStructureEn = json.reduce(
          (acc: Record<string, any>, row: any) => {
            if (!acc[row.Page]) acc[row.Page] = {};
            const key1 = row.KEY || generateRandomKey();
            //how to format string to key
            const formattedKey = formatKey(key1);
            acc[row.Page][formattedKey] = row.en || "";
            return acc;
          },
          {}
        );
        let jsonString = JSON.stringify(jsonStructure, null, 2);
        jsonString = jsonString.replace(/"([^"]+)":/g, "$1:");
        setJsonResult(jsonString);

        let jsonStringEN = JSON.stringify(jsonStructureEn, null, 2);
        jsonStringEN = jsonStringEN.replace(/"([^"]+)":/g, "$1:");
        setJsonResultEN(jsonStringEN);
      };
    }
  };

  return (
    <div>
      <FileInput
        // accept={ACCEPT_TYPE_FILE.join(",")}
        ref={inputRef}
        onChange={handleFile}
        label="Chọn file execl"
        placeholder="Chọn file execl"
      />

      <Tabs
        m="lg"
        defaultChecked
        color="red"
        radius="xs"
        defaultValue="gallery"
      >
        <Tabs.List>
          <Tabs.Tab value="vi">vi</Tabs.Tab>
          <Tabs.Tab value="en">english</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="vi">
          <Title order={2}>Result VN</Title>
          {jsonResult && (
            <CopyBlock codeBlock language="json" text={jsonResult}></CopyBlock>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="en">
          <Title order={2}>Result EN</Title>
          {jsonResultEN && (
            <CopyBlock
              codeBlock
              language="json"
              text={jsonResultEN}
            ></CopyBlock>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default App;
