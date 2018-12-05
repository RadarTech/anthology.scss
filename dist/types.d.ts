export interface ExtractOptions {
    important?: boolean;
    theme?: string;
    breakpoint?: string;
    pseudo?: string;
}
export interface AnthologyRule {
    shorthand: string;
    adjective: string;
    options: ExtractOptions;
    selector: string;
    selectorEscaped: string;
    property: string;
    value: string;
    cssRule: CSSStyleRule;
}
