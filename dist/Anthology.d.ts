export declare class Anthology<BreakpointNames extends string> {
    private _metadata;
    private _stylesheet;
    private _rules;
    constructor(styleSheet?: StyleSheet);
    /**
     * Get all Anthology-compatible style sheets in the document.
     *
     * @readonly
     * @static
     * @memberof Anthology
     */
    static readonly styleSheets: StyleSheet[];
    readonly breakpoints: {
        [key in BreakpointNames]: string;
    };
    /**
     * Parses `Anthology.scss` metadata.
     */
    parseMetadata(): this;
    /**
     * Extract the `style` object from a `CSSRule` generated by `Anthology.scss`.
     *
     * @param shorthand
     * @param adjective
     * @param options
     */
    extract(shorthand: string, adjective: string, options?: any): CSSStyleDeclaration;
}