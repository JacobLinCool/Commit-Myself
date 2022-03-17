import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import ora from "ora";
import { program } from "commander";

const DAY = 1000 * 60 * 60 * 24;

program.version(
    "v" + JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8")).version,
);

program
    .option("-d, --dir <dir>", "Directory to commit", "./me")
    .option("-b, --birthday <birthday>", "Your Birthday", "2003-03-17")
    .option("-n, --name <name>", "Your Name", "Jacob Lin")
    .action(() => {
        const opts = program.opts();
        const birthday = new Date(opts.birthday);
        commit({ birthday, name: opts.name, dir: opts.dir });
    })
    .parse();

async function commit({ dir, birthday, name }: { dir: string; birthday: Date; name: string }) {
    dir = path.resolve(dir);
    const spinner = ora("Preparing...").start();

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const now = new Date().getTime();
    let time = birthday.getTime();
    const days = Math.floor((now - time) / DAY);

    spinner.text = `Committing ${days} days...`;
    for (let i = 0; i <= days; i++) {
        const date = get_date(time);
        const iso = new Date(time).toISOString();
        const file = path.resolve(dir, `${date.join("-")}.log`);
        if (!fs.existsSync(file)) {
            const msg = message(birthday, name, time);
            const env = `GIT_COMMITTER_DATE=${iso}`;
            fs.writeFileSync(file, msg);
            execSync(`git add ${file}`, { encoding: "utf8" });
            execSync(`${env}} git commit -m "${msg}" --date="${iso}" --no-edit`, {
                encoding: "utf8",
            });
            await sleep(10);
        }
        spinner.text = `Committing... [ ${i} / ${days} ] ${date.join("-")}`;
        time += DAY;
    }

    spinner.succeed("Done!");
}

function message(birthday: Date, name: string, time: number): string {
    const birth = get_date(birthday.getTime());
    const today = get_date(time);
    const age_year = today[0] - birth[0];
    const age_days = Math.floor((time - birthday.getTime()) / DAY);
    return birth[1] === today[1] && birth[2] === today[2]
        ? `Happy Birthday! Today is ${name}'s ${age_year} year-old birthday.`
        : `${name} has been here for ${age_days} days.`;
}

function get_date(n: number): [number, number, number] {
    const d = new Date(n);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return [year, month, day];
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
