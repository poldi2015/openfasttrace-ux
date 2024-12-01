import {LoremIpsum} from "lorem-ipsum";
import * as fs from "node:fs";
import yargs from "yargs";

import {metadata} from "../resources/meta_data";

const TYPES: Array<string> = ["feat", "req", "arch", "dsn", "impl", "utest", "itest", "stest"];

function random(min: number = 0, max: number = 1): number {
    return Math.round(Math.random() * (max - min)) + min;
}

function splitString(str: string, chunkSize: number): string {
    let newStr = "";
    for (let i = 0; i < str.length; i += chunkSize) {
        newStr += `"${str.slice(i, i + chunkSize)}"`;
        if (i + chunkSize < str.length) {
            newStr += "\n                   + "
        }
    }
    return newStr;
}

class SpecItem {
    constructor(
        public index: number,
        public type: number,
        public name: string = this.generateName(),
        public version: number = random(1, 3),
        public status: number = random(),
        public path: Array<string> = ['project', 'spec', 'content'],
    ) {
        this.covered = Array.from({length: 7}, (_, index) => {
            return index <= type ? 0 : random(1, 2);
        });
    }

    public readonly covered: Array<number>;

    public generateCode() {
        console.log("XXX::: ", metadata.types[this.type], " idx", this.type);
        return `
        {
            index: ${this.index},
            type: "${metadata.types[this.type].label}",
            name: "${this.name}",
            version: ${this.version},
            content: ${this.generateContent()},
            covered: [${this.covered.join(',')}],
            status: ${this.status},
            path: ["${this.path.join('","')}"],            
        },`
    }

    public static generateSpecItems(type: number, startIndex: number, size: number): Array<SpecItem> {
        return Array.from({length: random(1, size)}, (_, index) => new SpecItem(
            index + startIndex,
            type
        ));
    }

    private generateName() {
        return new LoremIpsum({wordsPerSentence: {min: 3, max: 6}}, "plain", "")
            .generateSentences(1)
            .replace(/\s+/g, "-")
            .toLocaleLowerCase()
            .slice(0, -1);
    }

    private generateContent() {
        return splitString(new LoremIpsum({
                    wordsPerSentence: {min: 5, max: 15},
                    sentencesPerParagraph: {min: 4, max: 8}
                },
                "plain",
                "\n")
                .generateParagraphs(2)
                .replace(/["'\n\r]+/g, "")
            , 80);
    }

} // SpecItem

const argv: any = yargs
    .usage("Usage: $0 [--size <number of items per type>] [--output <outputfile>]")
    .option('size', {
        alias: 's',
        describe: 'The size of spec item',
        type: 'number',
        default: 10,
    })
    .option('output', {
            alias: 'o',
            describe: 'The output filename',
            type: "string",
        }
    )
    .help()
    .alias('help', 'h')
    .argv;

let items: Array<SpecItem> = [];
for (let i: number = 0; i < 5; i++) {
    items = items.concat(SpecItem.generateSpecItems(i, i * argv.size, argv.size));
}

let generatedCode: string = `
(function (window,undefined) {
    window.specitem = {
        specitems: [
            ${items.map((item) => item.generateCode()).join("")}
        ]
    }
})(window);
`;

if (argv.output) {
    fs.writeFileSync(argv.output, generatedCode);
} else {
    console.log(generatedCode);
}