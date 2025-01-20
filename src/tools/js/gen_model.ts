/*
  OpenFastTrace UX

 Copyright (C) 2024-2025 itsallcode.org, Bernd Haberstumpf

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
import path from "path";

const TYPE_LABELS: Array<string> = ["feat", "req", "arch", "dsn", "impl", "utest", "itest", "stest"];
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

class FileNode {
    constructor(
        public readonly file: string,
        public readonly path: Array<string>,
        public specItemIndexes: Array<number> = []
    ) {
    }
}

class DirectoryNode {
    constructor(
        public readonly path: Array<string> = [],
        public readonly files: Array<FileNode> = [],
        public readonly directories: Array<DirectoryNode> = [],
    ) {
    }
}

function fileTree(file: string, nodes: Map<string, FileNode>, parentNode: DirectoryNode): DirectoryNode {
    const stats = fs.statSync(file);
    const nodePath: Array<string> = parentNode.path.concat(path.basename(file));
    if (stats.isFile()) {
        const node = new FileNode(file, nodePath);
        const type: string | undefined = nodeToType(node);
        if (type != undefined) {
            console.log("PUsh", type, node);
            nodes.set(type, node);
            parentNode.files.push(node);
        }
        return parentNode;
    } else if (stats.isDirectory()) {
        const node = new DirectoryNode(nodePath);
        parentNode.directories.push(node);
        fs.readdirSync(file).forEach((name) => {
            fileTree(`${file}/${name}`, nodes, node);
        });
        return node;
    }
    return parentNode;
}

function nodeToType(node: FileNode): string | undefined {
    const fileName = node.path[node.path.length - 1];
    const type = fileName.replace(/[.].*$/, '');
    console.log(fileName, type);
    return TYPE_LABELS.includes(type) ? type : undefined;
}

class SpecItem {
    constructor(
        public index: number,
        public type: number,
        public typeStart: number,
        public typeLength: number,
        public path: Array<string> = [],
        public numberOfTypes: number = NUMBER_OF_TYPES,
        public name: string = this.generateName(),
        public version: number = random(1, 3),
        public status: number = random(),
        tags: Array<string> = [],
    ) {
        this.covered = this.generateCovered(type);
        this.uncovered = this.generateUncovered(this.covered);
        this.covering = this.generateCovering(typeStart, typeLength);
        this.coveredBy = this.generateCoveredBy(typeStart, typeLength, numberOfTypes);
        this.tags = this.generateTags();
        this.provides = this.generateCoveredTypes();
        this.needs = this.generateNeededTypes(numberOfTypes);
        this.depends = this.generateDependencies(typeLength, numberOfTypes);
        this.lineNumber = random(1, 1000);
        this.comments = this.generateContent(1, 8);
    }

    public readonly covered: Array<number>;
    public readonly uncovered: Array<number>;
    public readonly covering: Array<number>;
    public readonly coveredBy: Array<number>;
    public readonly tags: Array<number>;
    public readonly provides: Array<number>;
    public readonly needs: Array<number>;
    public readonly depends: Array<number>;
    public readonly comments: string;
    public readonly lineNumber: number;

    public generateCode() {
        return `
        {
            index: ${this.index},
            type: ${this.type},
            name: "${this.name}",
            fullName: "${TYPE_LABELS[this.type]}:${this.name}:${this.version}",
            tags: [${this.tags.join(',')}],
            version: ${this.version},
            content: ${this.generateContent()},
            provides: [${this.provides.join(',')}],
            needs: [${this.needs.join(',')}],
            covered: [${this.covered.join(',')}],
            uncovered: [${this.uncovered.join(',')}],
            covering: [${this.covering.join(',')}],
            coveredBy: [${this.coveredBy.join(',')}],
            depends: [${this.depends.join(',')}],             
            status: ${this.status},
            path: ["${this.path.join('","')}"],
            sourceFile: "${this.path.join('/')}.md",
            sourceLine: ${this.lineNumber},
            comments: ${this.comments},                        
        },`
    }

    public static generateSpecItems(type: number, startIndex: number, size: number, nodes: Map<string, FileNode>): Array<SpecItem> {
        const node: FileNode = nodes.get(TYPE_LABELS[type])!;
        node.specItemIndexes = node.specItemIndexes.concat(Array.from({length: size}, (_, index) => index + startIndex));
        return Array.from({length: size}, (_, index) => new SpecItem(
            index + startIndex,
            type,
            startIndex,
            size,
            node.path
        ));
    }

    private generateName() {
        return new LoremIpsum({wordsPerSentence: {min: 3, max: 6}}, "plain", "")
            .generateSentences(1)
            .replace(/\s+/g, "-")
            .toLocaleLowerCase()
            .slice(0, -1);
    }

    private generateContent(paragraphs: number = 2, threshold: number = 15) {
        return splitString(new LoremIpsum({
                    wordsPerSentence: {min: Math.round(threshold / 3), max: threshold},
                    sentencesPerParagraph: {min: Math.round(threshold / 4), max: Math.round(threshold / 2)}
                },
                "plain",
                "\n")
                .generateParagraphs(paragraphs)
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
        return this.uniquesAndSort(Array.from({length: random(1, 4)})
            .map(() => random(previousTypeStart, previousTypeEnd)));
    }

    private generateCoveredBy(typeStart: number, typeLength: number, numberOfTypes: number): Array<number> {
        if ((typeStart / typeLength) >= (numberOfTypes - 1)) return [];

        const nextTypeStart: number = typeStart + typeLength;
        const nextTypeEnd: number = nextTypeStart + typeLength - 1;
        return this.uniquesAndSort(Array.from({length: random(1, 10)})
            .map(() => random(nextTypeStart, nextTypeEnd)));
    }

    private generateTags(highest: number = 4): Array<number> {
        return this.uniquesAndSort(Array.from({length: random(0, 5)})
            .map(() => random(0, highest)));
    }

    private generateCoveredTypes(): Array<number> {
        if (this.type == 0) return [];
        return this.uniquesAndSort(Array.from({length: random(0, 5)})
            .map(() => random(0, this.type - 1)));
    }

    private generateNeededTypes(numberOfTypes: number): Array<number> {
        if (this.type == numberOfTypes - 1) return [];
        return this.uniquesAndSort(Array.from({length: random(0, 5)})
            .map(() => random(this.type + 1, numberOfTypes - 1)));
    }

    private generateDependencies(typeLength: number, numberOfTypes: number): Array<number> {
        return this.uniquesAndSort(Array.from({length: random(0, 3)})
            .map(() => random(0, typeLength * numberOfTypes - 1))
            .filter((value: number) => value != this.index));
    }

    private uniquesAndSort(values: Array<number>): Array<number> {
        return values
            .filter((value: number, index: number, values: Array<number>) => values.indexOf(value) == index)
            .sort();
    }

} // SpecItem

const argv: any = yargs
    .usage("Usage: $0 [--size <number of items per type>] [--paths <path to file structure>] [--output <outputfile>]")
    .option('size', {
        alias: 's',
        describe: 'The size of spec item',
        type: 'number',
        default: 10,
    })
    .option('paths', {
        alias: 'p',
        description: 'path beneath the file tree is derived from',
        type: "string",
        default: "build",
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


const nodes: Map<string, FileNode> = new Map();
const rootNode: DirectoryNode = fileTree(argv.paths, nodes, new DirectoryNode());

let items: Array<SpecItem> = [];
for (let i: number = 0; i < NUMBER_OF_TYPES; i++) {
    console.log("Generating", argv.size, "SpecItems of type ", i, "from", i * argv.size);
    items = items.concat(SpecItem.generateSpecItems(i, i * argv.size, argv.size, nodes));
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

console.log("TREENODES");
console.log(JSON.stringify(rootNode, null, 2));

if (argv.output) {
    fs.writeFileSync(argv.output, generatedCode);
} else {
    console.log(generatedCode);
}