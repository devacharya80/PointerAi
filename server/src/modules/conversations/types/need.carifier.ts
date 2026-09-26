export interface Clarifier{
    needsClarification: boolean,
    question: string | null,
    options: string[] | null
}