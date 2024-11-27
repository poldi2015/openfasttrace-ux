declare global {
    interface Window {
        specitem: any;
    }
}

export interface SpecItem {
    index:number,
    name:string,
    content:string,
    covered:[number],
    status:number,
    path:Array<string>,
}