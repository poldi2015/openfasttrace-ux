/*
  OpenFastTrace UX

 Copyright (C) 2016 - 2024 itsallcode.org

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public
 License along with this program.  If not, see
 <http://www.gnu.org/licenses/gpl-3.0.html>.
*/
import {LoremIpsum} from "lorem-ipsum";
import * as fs from "node:fs";
import yargs from "yargs";

const TYPE_LABELS: Array<String> = ["feat", "req", "arch", "dsn", "impl", "utest", "itest", "stest"];
const NUMBER_OF_TYPES: number = TYPE_LABELS.length;

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
        public typeStart : number,
        public typeLength : number,
        public numberOfTypes : number,
        public name: string = this.generateName(),
        public version: number = random(1, 3),
        public status: number = random(),
        public path: Array<string> = ['project', 'spec', 'content'],
    ) {
        this.covered = this.generateCovered(type);
        this.uncovered = this.generateUncovered(this.covered);
        this.covering = this.generateCovering(typeStart,typeLength);
        this.coveredBy = this.generateCoveredBy(typeStart,typeLength,numberOfTypes);
    }

    public readonly covered: Array<number>;
    public readonly uncovered: Array<number>;
    public readonly covering: Array<number>;
    public readonly coveredBy: Array<number>;

    public generateCode() {
        return `
        {
            index: ${this.index},
            type: ${this.type},
            name: "${this.name}",
            fullName: "${TYPE_LABELS[this.type]}:${this.name}:${this.version}",
            version: ${this.version},
            content: ${this.generateContent()},
            covered: [${this.covered.join(',')}],
            uncovered: [${this.uncovered.join(',')}],
            covering: [${this.covering.join(',')}],
            coveredBy: [${this.coveredBy.join(',')}],            
            status: ${this.status},
            path: ["${this.path.join('","')}"],            
        },`
    }

    public static generateSpecItems(type: number, startIndex: number, size: number): Array<SpecItem> {
        return Array.from({length: random(1, size)}, (_, index) => new SpecItem(
            index + startIndex,
            type,
            startIndex,
            size,
            NUMBER_OF_TYPES
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

    private generateCovered(type: number): Array<number> {
        return Array.from({length: 7}, (_, index) => {
            return index <= type ? 0 : random(1, 2);
        });
    }

    private generateUncovered(covered: Array<number>): Array<number> {
        return covered
            .map((value: number, index: number): number => value == 1 ? index - 1 : -1)
            .filter((value: number): boolean => value != -1);
    }

    private generateCovering(typeStart: number, typeLength: number): Array<number> {
        if (typeStart < typeLength) return [];

        const previousTypeStart: number = typeStart - typeLength;
        const previousTypeEnd: number = typeStart - 1;
        return Array.from({length: random(1, 4)})
            .map(() => random(previousTypeStart, previousTypeEnd))
            .filter((value: number, _, values: Array<number>) => values.includes(value));
    }

    private generateCoveredBy(typeStart:number, typeLength:number,numberOfTypes:number): Array<number> {
        if( (typeStart/ typeLength) >=(numberOfTypes-1) ) return [];

        const nextTypeStart : number = typeStart + typeLength;
        const nextTypeEnd: number = nextTypeStart + typeLength - 1;
        return Array.from({length: random(1, 10)})
            .map(() => random(nextTypeStart, nextTypeEnd))
            .filter((value: number, _, values: Array<number>) => values.includes(value));
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
for (let i: number = 0; i < NUMBER_OF_TYPES; i++) {
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