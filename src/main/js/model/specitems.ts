declare global {
    interface Window {
        specitem: any;
    }
}

export interface SpecItem {
    index:number,
    type:string,
    name:string,
    version:number,
    content:string,
    covered:[number],
    status:number,
    path:Array<string>,
}