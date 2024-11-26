import {LoremIpsum} from "lorem-ipsum";
import * as fs from "node:fs";
import yargs from "yargs";

const TYPES: Array<string> = ["feat", "req", "arch", "dsn", "impl", "utest", "itest"];

function random(min: number = 0, max: number = 1): number {
    return Math.round(Math.random() * (max - min)) + min;
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
        const len: number = random(0, TYPES.length - type - 1);
        this.covered = Array.from({length: len}, (_, index) => (index + type + 1));
        this.needs = type != TYPES.length - 1 ? [type + 1] : [];
    }

    public readonly covered: Array<number>;
    public readonly needs: Array<number>;

    public generateCode() {
        return `
        {
            index: ${this.index},
            types: "${TYPES[this.type]}",
            name: "${this.name}",
            version: ${this.version},
            content: "${this.generateContent()}",
            covered: [${this.covered.join(',')}],
            needs: [${this.needs.join(',')}],
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
        return new LoremIpsum({
                wordsPerSentence: {min: 15, max: 20},
                sentencesPerParagraph: {min: 10, max: 15}
            },
            "plain",
            "\n")
            .generateParagraphs(3);
    }

} // SpecItem

const argv:any = yargs
    .usage("Usage: $0 [--size <number of items per type>] [--output <output file>]")
    .option('size', {
        alias: 's',
        describe: 'The size of spec item',
        type: 'number',
    })
    .option('output', {
            alias: 'o',
            describe: 'The output filename',
            type: "string",
        }
    )
    .help()
    .alias('help','h')
    .argv;

let items: Array<SpecItem> = [];
for (let i: number = 0; i < 5; i++) {
    items = items.concat(SpecItem.generateSpecItems(i, i * argv.size,argv.size));
}

let generatedCode: string = `
(function (window,undefined) {
    window.specitem = {
        specitems: [
            ${items.map((item) => item.generateCode()).join("\n")}
        }
    }
})(window);
`;

if( argv.output) {
    fs.writeFileSync(argv.output, generatedCode);
} else {
    console.log(generatedCode);
}