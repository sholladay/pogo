import { walk } from "https://deno.land/std@0.66.0/fs/walk.ts";
import { parse } from "https://deno.land/std@0.66.0/flags/mod.ts";
import * as path from "https://deno.land/std@0.66.0/path/mod.ts";

interface dateInfo {
  filename: string;
  date: Date | null;
}

const mainFile = parse(Deno.args).main;
let args = parse(Deno.args)._.map((elem) => `--${elem}`);
if (args.length === 0) {
  args = ["-A"];
} else if (args[0] === "--allow-none") {
  args = [];
}
if (mainFile === undefined) {
  throw Error("Main File not found");
}
const files = await findFiles(mainFile);
const dir = path.dirname(mainFile);
const basename = path.basename(mainFile);
const cmd = ["deno", "run"].concat(args, [`${basename}`]);

let process = startProcess(cmd, dir);

while (true) {
  await new Promise((r) => setTimeout(r, 500));
  if (await reloadFiles(files)) {
    console.log("Detected Change in File.");
    console.log("Reloading the process...");
    process.close();
    process = startProcess(cmd, dir);
    console.log("Process Reloaded");
    console.log("---------------------------");
  }
}

async function findFiles(mainFile: string): Promise<dateInfo[]> {
  const info = await Deno.lstat(mainFile);
  const folder = path.dirname(mainFile);
  let dates: dateInfo[] = [];
  if (!info.isFile) {
    throw Error("Argument supplied is not a file");
  } else if (!mainFile.endsWith(".ts") && !mainFile.endsWith(".js")) {
    throw Error("Main File is not a javascript of typescript file");
  }

  for await (let entry of walk(folder)) {
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".js")) {
      const date = (await Deno.lstat(entry.path)).mtime;
      dates.push({ date: date, filename: entry.path });
    }
  }
  return dates;
}

async function reloadFiles(files: dateInfo[]): Promise<boolean> {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const newTime = (await Deno.lstat(file.filename)).mtime;
    if (newTime == null || file.date == null) {
      continue;
    } else {
      if (+newTime !== +file.date) {
        files[i].date = newTime;
        return true;
      }
    }
  }
  return false;
}

  function startProcess(cmd: string[], dir: string){
  return Deno.run({ cmd: cmd, cwd: dir });
}
export default startProcess