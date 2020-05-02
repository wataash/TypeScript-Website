var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "./typeAcquisition", "./theme", "./compilerOptions", "./vendor/lzstring.min", "./releases", "./getInitialCode", "./twoslashSupport", "./vendor/typescript-vfs"], function (require, exports, typeAcquisition_1, theme_1, compilerOptions_1, lzstring_min_1, releases_1, getInitialCode_1, twoslashSupport_1, tsvfs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    lzstring_min_1 = __importDefault(lzstring_min_1);
    tsvfs = __importStar(tsvfs);
    const languageType = (config) => (config.useJavaScript ? "javascript" : "typescript");
    /** Default Monaco settings for playground */
    const sharedEditorOptions = {
        automaticLayout: true,
        scrollBeyondLastLine: true,
        scrollBeyondLastColumn: 3,
        minimap: {
            enabled: false,
        },
    };
    /** The default settings which we apply a partial over */
    function defaultPlaygroundSettings() {
        const config = {
            text: "",
            domID: "",
            compilerOptions: {},
            acquireTypes: true,
            useJavaScript: false,
            supportTwoslashCompilerOptions: false,
            logger: console,
        };
        return config;
    }
    exports.defaultPlaygroundSettings = defaultPlaygroundSettings;
    function defaultFilePath(config, compilerOptions, monaco) {
        const isJSX = compilerOptions.jsx !== monaco.languages.typescript.JsxEmit.None;
        const fileExt = config.useJavaScript ? "js" : "ts";
        const ext = isJSX ? fileExt + "x" : fileExt;
        return "input." + ext;
    }
    /** Creates a monaco file reference, basically a fancy path */
    function createFileUri(config, compilerOptions, monaco) {
        return monaco.Uri.file(defaultFilePath(config, compilerOptions, monaco));
    }
    /** Creates a sandbox editor, and returns a set of useful functions and the editor */
    exports.createTypeScriptSandbox = (partialConfig, monaco, ts) => {
        const config = Object.assign(Object.assign({}, defaultPlaygroundSettings()), partialConfig);
        if (!("domID" in config) && !("elementToAppend" in config))
            throw new Error("You did not provide a domID or elementToAppend");
        const defaultText = config.suppressAutomaticallyGettingDefaultText
            ? config.text
            : getInitialCode_1.getInitialCode(config.text, document.location);
        // Defaults
        const compilerDefaults = compilerOptions_1.getDefaultSandboxCompilerOptions(config, monaco);
        // Grab the compiler flags via the query params
        let compilerOptions;
        if (!config.suppressAutomaticallyGettingCompilerFlags) {
            const params = new URLSearchParams(location.search);
            let queryParamCompilerOptions = compilerOptions_1.getCompilerOptionsFromParams(compilerDefaults, params);
            if (Object.keys(queryParamCompilerOptions).length)
                config.logger.log("[Compiler] Found compiler options in query params: ", queryParamCompilerOptions);
            compilerOptions = Object.assign(Object.assign({}, compilerDefaults), queryParamCompilerOptions);
        }
        else {
            compilerOptions = compilerDefaults;
        }
        const language = languageType(config);
        const filePath = createFileUri(config, compilerOptions, monaco);
        const element = "domID" in config ? document.getElementById(config.domID) : config.elementToAppend;
        const model = monaco.editor.createModel(defaultText, language, filePath);
        monaco.editor.defineTheme("sandbox", theme_1.sandboxTheme);
        monaco.editor.defineTheme("sandbox-dark", theme_1.sandboxThemeDark);
        monaco.editor.setTheme("sandbox");
        const monacoSettings = Object.assign({ model }, sharedEditorOptions, config.monacoSettings || {});
        const editor = monaco.editor.create(element, monacoSettings);
        const getWorker = config.useJavaScript
            ? monaco.languages.typescript.getJavaScriptWorker
            : monaco.languages.typescript.getTypeScriptWorker;
        const defaults = config.useJavaScript
            ? monaco.languages.typescript.javascriptDefaults
            : monaco.languages.typescript.typescriptDefaults;
        // In the future it'd be good to add support for an 'add many files'
        const addLibraryToRuntime = (code, path) => {
            defaults.addExtraLib(code, path);
            config.logger.log(`[ATA] Adding ${path} to runtime`);
        };
        const getTwoSlashComplierOptions = twoslashSupport_1.extractTwoSlashComplierOptions(ts);
        // Then update it when the model changes, perhaps this could be a debounced plugin instead in the future?
        editor.onDidChangeModelContent(() => {
            const code = editor.getModel().getValue();
            if (config.supportTwoslashCompilerOptions) {
                const configOpts = getTwoSlashComplierOptions(code);
                updateCompilerSettings(configOpts);
            }
            if (config.acquireTypes) {
                typeAcquisition_1.detectNewImportsToAcquireTypeFor(code, addLibraryToRuntime, window.fetch.bind(window), config);
            }
        });
        config.logger.log("[Compiler] Set compiler options: ", compilerOptions);
        defaults.setCompilerOptions(compilerOptions);
        // Grab types last so that it logs in a logical way
        if (config.acquireTypes) {
            // Take the code from the editor right away
            const code = editor.getModel().getValue();
            typeAcquisition_1.detectNewImportsToAcquireTypeFor(code, addLibraryToRuntime, window.fetch.bind(window), config);
        }
        // To let clients plug into compiler settings changes
        let didUpdateCompilerSettings = (opts) => { };
        const updateCompilerSettings = (opts) => {
            config.logger.log("[Compiler] Updating compiler options: ", opts);
            compilerOptions = Object.assign(Object.assign({}, opts), compilerOptions);
            defaults.setCompilerOptions(compilerOptions);
            didUpdateCompilerSettings(compilerOptions);
        };
        const updateCompilerSetting = (key, value) => {
            config.logger.log("[Compiler] Setting compiler options ", key, "to", value);
            compilerOptions[key] = value;
            defaults.setCompilerOptions(compilerOptions);
            didUpdateCompilerSettings(compilerOptions);
        };
        const setCompilerSettings = (opts) => {
            config.logger.log("[Compiler] Setting compiler options: ", opts);
            compilerOptions = opts;
            defaults.setCompilerOptions(compilerOptions);
            didUpdateCompilerSettings(compilerOptions);
        };
        const getCompilerOptions = () => {
            return compilerOptions;
        };
        const setDidUpdateCompilerSettings = (func) => {
            didUpdateCompilerSettings = func;
        };
        /** Gets the results of compiling your editor's code */
        const getEmitResult = () => __awaiter(void 0, void 0, void 0, function* () {
            const model = editor.getModel();
            const client = yield getWorkerProcess();
            return yield client.getEmitOutput(model.uri.toString());
        });
        /** Gets the JS  of compiling your editor's code */
        const getRunnableJS = () => __awaiter(void 0, void 0, void 0, function* () {
            if (config.useJavaScript) {
                return getText();
            }
            const result = yield getEmitResult();
            const firstJS = result.outputFiles.find((o) => o.name.endsWith(".js") || o.name.endsWith(".jsx"));
            return (firstJS && firstJS.text) || "";
        });
        /** Gets the DTS for the JS/TS  of compiling your editor's code */
        const getDTSForCode = () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield getEmitResult();
            return result.outputFiles.find((o) => o.name.endsWith(".d.ts")).text;
        });
        const getWorkerProcess = () => __awaiter(void 0, void 0, void 0, function* () {
            const worker = yield getWorker();
            // @ts-ignore
            return yield worker(model.uri);
        });
        const getDomNode = () => editor.getDomNode();
        const getModel = () => editor.getModel();
        const getText = () => getModel().getValue();
        const setText = (text) => getModel().setValue(text);
        /**
         * Warning: Runs on the main thread
         */
        const createTSProgram = () => __awaiter(void 0, void 0, void 0, function* () {
            const fsMap = yield tsvfs.createDefaultMapFromCDN(compilerOptions, ts.version, true, ts, lzstring_min_1.default);
            fsMap.set(filePath.path, getText());
            const system = tsvfs.createSystem(fsMap);
            const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts);
            const program = ts.createProgram({
                rootNames: [...fsMap.keys()],
                options: compilerOptions,
                host: host.compilerHost,
            });
            return program;
        });
        const getAST = () => __awaiter(void 0, void 0, void 0, function* () {
            const program = yield createTSProgram();
            program.emit();
            return program.getSourceFile(filePath.path);
        });
        // Pass along the supported releases for the playground
        const supportedVersions = releases_1.supportedReleases;
        return {
            /** The same config you passed in */
            config,
            /** A list of TypeScript versions you can use with the TypeScript sandbox */
            supportedVersions,
            /** The monaco editor instance */
            editor,
            /** Either "typescript" or "javascript" depending on your config */
            language,
            /** The outer monaco module, the result of require("monaco-editor")  */
            monaco,
            /** Gets a monaco-typescript worker, this will give you access to a language server. Note: prefer this for language server work because it happens on a webworker . */
            getWorkerProcess,
            /** A copy of require("@typescript/vfs") this can be used to quickly set up an in-memory compiler runs for ASTs, or to get complex language server results (anything above has to be serialized when passed)*/
            tsvfs,
            /** Get all the different emitted files after TypeScript is run */
            getEmitResult,
            /** Gets just the JavaScript for your sandbox, will transpile if in TS only */
            getRunnableJS,
            /** Gets the DTS output of the main code in the editor */
            getDTSForCode,
            /** The monaco-editor dom node, used for showing/hiding the editor */
            getDomNode,
            /** The model is an object which monaco uses to keep track of text in the editor. Use this to directly modify the text in the editor */
            getModel,
            /** Gets the text of the main model, which is the text in the editor */
            getText,
            /** Shortcut for setting the model's text content which would update the editor */
            setText,
            /** Gets the AST of the current text in monaco - uses `createTSProgram`, so the performance caveat applies there too */
            getAST,
            /** The module you get from require("typescript") */
            ts,
            /** Create a new Program, a TypeScript data model which represents the entire project.
             *
             * The first time this is called it has to download all the DTS files which is needed for an exact compiler run. Which
             * at max is about 1.5MB - after that subsequent downloads of dts lib files come from localStorage.
             *
             * Try to use this sparingly as it can be computationally expensive, at the minimum you should be using the debounced setup.
             *
             * TODO: It would be good to create an easy way to have a single program instance which is updated for you
             * when the monaco model changes.
             */
            createTSProgram,
            /** The Sandbox's default compiler options  */
            compilerDefaults,
            /** The Sandbox's current compiler options */
            getCompilerOptions,
            /** Replace the Sandbox's compiler options */
            setCompilerSettings,
            /** Overwrite the Sandbox's compiler options */
            updateCompilerSetting,
            /** Update a single compiler option in the SAndbox */
            updateCompilerSettings,
            /** A way to get callbacks when compiler settings have changed */
            setDidUpdateCompilerSettings,
            /** A copy of lzstring, which is used to archive/unarchive code */
            lzstring: lzstring_min_1.default,
            /** Returns compiler options found in the params of the current page */
            createURLQueryWithCompilerOptions: compilerOptions_1.createURLQueryWithCompilerOptions,
            /** Returns compiler options in the source code using twoslash notation */
            getTwoSlashComplierOptions,
            /** Gets to the current monaco-language, this is how you talk to the background webworkers */
            languageServiceDefaults: defaults,
            /** The path which represents the current file using the current compiler options */
            filepath: filePath.path,
        };
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zYW5kYm94L3NyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrREEsTUFBTSxZQUFZLEdBQUcsQ0FBQyxNQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUE7SUFFdkcsNkNBQTZDO0lBQzdDLE1BQU0sbUJBQW1CLEdBQWtEO1FBQ3pFLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLG9CQUFvQixFQUFFLElBQUk7UUFDMUIsc0JBQXNCLEVBQUUsQ0FBQztRQUN6QixPQUFPLEVBQUU7WUFDUCxPQUFPLEVBQUUsS0FBSztTQUNmO0tBQ0YsQ0FBQTtJQUVELHlEQUF5RDtJQUN6RCxTQUFnQix5QkFBeUI7UUFDdkMsTUFBTSxNQUFNLEdBQXFCO1lBQy9CLElBQUksRUFBRSxFQUFFO1lBQ1IsS0FBSyxFQUFFLEVBQUU7WUFDVCxlQUFlLEVBQUUsRUFBRTtZQUNuQixZQUFZLEVBQUUsSUFBSTtZQUNsQixhQUFhLEVBQUUsS0FBSztZQUNwQiw4QkFBOEIsRUFBRSxLQUFLO1lBQ3JDLE1BQU0sRUFBRSxPQUFPO1NBQ2hCLENBQUE7UUFDRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7SUFYRCw4REFXQztJQUVELFNBQVMsZUFBZSxDQUFDLE1BQXdCLEVBQUUsZUFBZ0MsRUFBRSxNQUFjO1FBQ2pHLE1BQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQyxHQUFHLEtBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQTtRQUM5RSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtRQUNsRCxNQUFNLEdBQUcs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QUFrRTtZQUNsRSxhQUFhO1lBQ2IsOEVBQThFO1lBQzlFLGFBQWE7WUFDYix5REFBeUQ7WUFDekQsYUFBYTtZQUNiLHFFQUFxRTtZQUNyRSxVQUFVO1lBQ1YsdUlBQXVJO1lBQ3ZJLFFBQVE7WUFDUix1RUFBdUU7WUFDdkUsT0FBTztZQUNQLGtGQUFrRjtZQUNsRixPQUFPO1lBQ1AsdUhBQXVIO1lBQ3ZILE1BQU07WUFDTixvREFBb0Q7WUFDcEQsRUFBRTtZQUNGOzs7Ozs7Ozs7ZUFTRztZQUNILGVBQWU7WUFDZiw4Q0FBOEM7WUFDOUMsZ0JBQWdCO1lBQ2hCLDZDQUE2QztZQUM3QyxrQkFBa0I7WUFDbEIsNkNBQTZDO1lBQzdDLG1CQUFtQjtZQUNuQiwrQ0FBK0M7WUFDL0MscUJBQXFCO1lBQ3JCLHFEQUFxRDtZQUNyRCxzQkFBc0I7WUFDdEIsaUVBQWlFO1lBQ2pFLDRCQUE0QjtZQUM1QixrRUFBa0U7WUFDbEUsUUFBUSxFQUFSLHNCQUFRO1lBQ1IsdUVBQXVFO1lBQ3ZFLGlDQUFpQyxFQUFqQyxtREFBaUM7WUFDakMsMEVBQTBFO1lBQzFFLDBCQUEwQjtZQUMxQiw2RkFBNkY7WUFDN0YsdUJBQXVCLEVBQUUsUUFBUTtZQUNqQyxvRkFBb0Y7WUFDcEYsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1NBQ3hCLENBQUE7SUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZXRlY3ROZXdJbXBvcnRzVG9BY3F1aXJlVHlwZUZvciB9IGZyb20gXCIuL3R5cGVBY3F1aXNpdGlvblwiXG5pbXBvcnQgeyBzYW5kYm94VGhlbWUsIHNhbmRib3hUaGVtZURhcmsgfSBmcm9tIFwiLi90aGVtZVwiXG5pbXBvcnQgeyBUeXBlU2NyaXB0V29ya2VyIH0gZnJvbSBcIi4vdHNXb3JrZXJcIlxuaW1wb3J0IHtcbiAgZ2V0RGVmYXVsdFNhbmRib3hDb21waWxlck9wdGlvbnMsXG4gIGdldENvbXBpbGVyT3B0aW9uc0Zyb21QYXJhbXMsXG4gIGNyZWF0ZVVSTFF1ZXJ5V2l0aENvbXBpbGVyT3B0aW9ucyxcbn0gZnJvbSBcIi4vY29tcGlsZXJPcHRpb25zXCJcbmltcG9ydCBsenN0cmluZyBmcm9tIFwiLi92ZW5kb3IvbHpzdHJpbmcubWluXCJcbmltcG9ydCB7IHN1cHBvcnRlZFJlbGVhc2VzIH0gZnJvbSBcIi4vcmVsZWFzZXNcIlxuaW1wb3J0IHsgZ2V0SW5pdGlhbENvZGUgfSBmcm9tIFwiLi9nZXRJbml0aWFsQ29kZVwiXG5pbXBvcnQgeyBleHRyYWN0VHdvU2xhc2hDb21wbGllck9wdGlvbnMgfSBmcm9tIFwiLi90d29zbGFzaFN1cHBvcnRcIlxuaW1wb3J0ICogYXMgdHN2ZnMgZnJvbSBcIi4vdmVuZG9yL3R5cGVzY3JpcHQtdmZzXCJcblxudHlwZSBDb21waWxlck9wdGlvbnMgPSBpbXBvcnQoXCJtb25hY28tZWRpdG9yXCIpLmxhbmd1YWdlcy50eXBlc2NyaXB0LkNvbXBpbGVyT3B0aW9uc1xudHlwZSBNb25hY28gPSB0eXBlb2YgaW1wb3J0KFwibW9uYWNvLWVkaXRvclwiKVxuXG4vKipcbiAqIFRoZXNlIGFyZSBzZXR0aW5ncyBmb3IgdGhlIHBsYXlncm91bmQgd2hpY2ggYXJlIHRoZSBlcXVpdmFsZW50IHRvIHByb3BzIGluIFJlYWN0XG4gKiBhbnkgY2hhbmdlcyB0byBpdCBzaG91bGQgcmVxdWlyZSBhIG5ldyBzZXR1cCBvZiB0aGUgcGxheWdyb3VuZFxuICovXG5leHBvcnQgdHlwZSBQbGF5Z3JvdW5kQ29uZmlnID0ge1xuICAvKiogVGhlIGRlZmF1bHQgc291cmNlIGNvZGUgZm9yIHRoZSBwbGF5Z3JvdW5kICovXG4gIHRleHQ6IHN0cmluZ1xuICAvKiogU2hvdWxkIGl0IHJ1biB0aGUgdHMgb3IganMgSURFIHNlcnZpY2VzICovXG4gIHVzZUphdmFTY3JpcHQ6IGJvb2xlYW5cbiAgLyoqIENvbXBpbGVyIG9wdGlvbnMgd2hpY2ggYXJlIGF1dG9tYXRpY2FsbHkganVzdCBmb3J3YXJkZWQgb24gKi9cbiAgY29tcGlsZXJPcHRpb25zOiBDb21waWxlck9wdGlvbnNcbiAgLyoqIE9wdGlvbmFsIG1vbmFjbyBzZXR0aW5ncyBvdmVycmlkZXMgKi9cbiAgbW9uYWNvU2V0dGluZ3M/OiBpbXBvcnQoXCJtb25hY28tZWRpdG9yXCIpLmVkaXRvci5JRWRpdG9yT3B0aW9uc1xuICAvKiogQWNxdWlyZSB0eXBlcyB2aWEgdHlwZSBhY3F1aXNpdGlvbiAqL1xuICBhY3F1aXJlVHlwZXM6IGJvb2xlYW5cbiAgLyoqIFN1cHBvcnQgdHdvc2xhc2ggY29tcGlsZXIgb3B0aW9ucyAqL1xuICBzdXBwb3J0VHdvc2xhc2hDb21waWxlck9wdGlvbnM6IGJvb2xlYW5cbiAgLyoqIEdldCB0aGUgdGV4dCB2aWEgcXVlcnkgcGFyYW1zIGFuZCBsb2NhbCBzdG9yYWdlLCB1c2VmdWwgd2hlbiB0aGUgZWRpdG9yIGlzIHRoZSBtYWluIGV4cGVyaWVuY2UgKi9cbiAgc3VwcHJlc3NBdXRvbWF0aWNhbGx5R2V0dGluZ0RlZmF1bHRUZXh0PzogdHJ1ZVxuICAvKiogU3VwcHJlc3Mgc2V0dGluZyBjb21waWxlciBvcHRpb25zIGZyb20gdGhlIGNvbXBpbGVyIGZsYWdzIGZyb20gcXVlcnkgcGFyYW1zICovXG4gIHN1cHByZXNzQXV0b21hdGljYWxseUdldHRpbmdDb21waWxlckZsYWdzPzogdHJ1ZVxuICAvKiogTG9nZ2luZyBzeXN0ZW0gKi9cbiAgbG9nZ2VyOiB7XG4gICAgbG9nOiAoLi4uYXJnczogYW55W10pID0+IHZvaWRcbiAgICBlcnJvcjogKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkXG4gICAgZ3JvdXBDb2xsYXBzZWQ6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZFxuICAgIGdyb3VwRW5kOiAoLi4uYXJnczogYW55W10pID0+IHZvaWRcbiAgfVxufSAmIChcbiAgfCB7IC8qKiB0aGVJRCBvZiBhIGRvbSBub2RlIHRvIGFkZCBtb25hY28gdG8gKi8gZG9tSUQ6IHN0cmluZyB9XG4gIHwgeyAvKiogdGhlSUQgb2YgYSBkb20gbm9kZSB0byBhZGQgbW9uYWNvIHRvICovIGVsZW1lbnRUb0FwcGVuZDogSFRNTEVsZW1lbnQgfVxuKVxuXG5jb25zdCBsYW5ndWFnZVR5cGUgPSAoY29uZmlnOiBQbGF5Z3JvdW5kQ29uZmlnKSA9PiAoY29uZmlnLnVzZUphdmFTY3JpcHQgPyBcImphdmFzY3JpcHRcIiA6IFwidHlwZXNjcmlwdFwiKVxuXG4vKiogRGVmYXVsdCBNb25hY28gc2V0dGluZ3MgZm9yIHBsYXlncm91bmQgKi9cbmNvbnN0IHNoYXJlZEVkaXRvck9wdGlvbnM6IGltcG9ydChcIm1vbmFjby1lZGl0b3JcIikuZWRpdG9yLklFZGl0b3JPcHRpb25zID0ge1xuICBhdXRvbWF0aWNMYXlvdXQ6IHRydWUsXG4gIHNjcm9sbEJleW9uZExhc3RMaW5lOiB0cnVlLFxuICBzY3JvbGxCZXlvbmRMYXN0Q29sdW1uOiAzLFxuICBtaW5pbWFwOiB7XG4gICAgZW5hYmxlZDogZmFsc2UsXG4gIH0sXG59XG5cbi8qKiBUaGUgZGVmYXVsdCBzZXR0aW5ncyB3aGljaCB3ZSBhcHBseSBhIHBhcnRpYWwgb3ZlciAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRQbGF5Z3JvdW5kU2V0dGluZ3MoKSB7XG4gIGNvbnN0IGNvbmZpZzogUGxheWdyb3VuZENvbmZpZyA9IHtcbiAgICB0ZXh0OiBcIlwiLFxuICAgIGRvbUlEOiBcIlwiLFxuICAgIGNvbXBpbGVyT3B0aW9uczoge30sXG4gICAgYWNxdWlyZVR5cGVzOiB0cnVlLFxuICAgIHVzZUphdmFTY3JpcHQ6IGZhbHNlLFxuICAgIHN1cHBvcnRUd29zbGFzaENvbXBpbGVyT3B0aW9uczogZmFsc2UsXG4gICAgbG9nZ2VyOiBjb25zb2xlLFxuICB9XG4gIHJldHVybiBjb25maWdcbn1cblxuZnVuY3Rpb24gZGVmYXVsdEZpbGVQYXRoKGNvbmZpZzogUGxheWdyb3VuZENvbmZpZywgY29tcGlsZXJPcHRpb25zOiBDb21waWxlck9wdGlvbnMsIG1vbmFjbzogTW9uYWNvKSB7XG4gIGNvbnN0IGlzSlNYID0gY29tcGlsZXJPcHRpb25zLmpzeCAhPT0gbW9uYWNvLmxhbmd1YWdlcy50eXBlc2NyaXB0LkpzeEVtaXQuTm9uZVxuICBjb25zdCBmaWxlRXh0ID0gY29uZmlnLnVzZUphdmFTY3JpcHQgPyBcImpzXCIgOiBcInRzXCJcbiAgY29uc3QgZXh0ID0gaXNKU1ggPyBmaWxlRXh0ICsgXCJ4XCIgOiBmaWxlRXh0XG4gIHJldHVybiBcImlucHV0LlwiICsgZXh0XG59XG5cbi8qKiBDcmVhdGVzIGEgbW9uYWNvIGZpbGUgcmVmZXJlbmNlLCBiYXNpY2FsbHkgYSBmYW5jeSBwYXRoICovXG5mdW5jdGlvbiBjcmVhdGVGaWxlVXJpKGNvbmZpZzogUGxheWdyb3VuZENvbmZpZywgY29tcGlsZXJPcHRpb25zOiBDb21waWxlck9wdGlvbnMsIG1vbmFjbzogTW9uYWNvKSB7XG4gIHJldHVybiBtb25hY28uVXJpLmZpbGUoZGVmYXVsdEZpbGVQYXRoKGNvbmZpZywgY29tcGlsZXJPcHRpb25zLCBtb25hY28pKVxufVxuXG4vKiogQ3JlYXRlcyBhIHNhbmRib3ggZWRpdG9yLCBhbmQgcmV0dXJucyBhIHNldCBvZiB1c2VmdWwgZnVuY3Rpb25zIGFuZCB0aGUgZWRpdG9yICovXG5leHBvcnQgY29uc3QgY3JlYXRlVHlwZVNjcmlwdFNhbmRib3ggPSAoXG4gIHBhcnRpYWxDb25maWc6IFBhcnRpYWw8UGxheWdyb3VuZENvbmZpZz4sXG4gIG1vbmFjbzogTW9uYWNvLFxuICB0czogdHlwZW9mIGltcG9ydChcInR5cGVzY3JpcHRcIilcbikgPT4ge1xuICBjb25zdCBjb25maWcgPSB7IC4uLmRlZmF1bHRQbGF5Z3JvdW5kU2V0dGluZ3MoKSwgLi4ucGFydGlhbENvbmZpZyB9XG4gIGlmICghKFwiZG9tSURcIiBpbiBjb25maWcpICYmICEoXCJlbGVtZW50VG9BcHBlbmRcIiBpbiBjb25maWcpKVxuICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBkaWQgbm90IHByb3ZpZGUgYSBkb21JRCBvciBlbGVtZW50VG9BcHBlbmRcIilcblxuICBjb25zdCBkZWZhdWx0VGV4dCA9IGNvbmZpZy5zdXBwcmVzc0F1dG9tYXRpY2FsbHlHZXR0aW5nRGVmYXVsdFRleHRcbiAgICA/IGNvbmZpZy50ZXh0XG4gICAgOiBnZXRJbml0aWFsQ29kZShjb25maWcudGV4dCwgZG9jdW1lbnQubG9jYXRpb24pXG5cbiAgLy8gRGVmYXVsdHNcbiAgY29uc3QgY29tcGlsZXJEZWZhdWx0cyA9IGdldERlZmF1bHRTYW5kYm94Q29tcGlsZXJPcHRpb25zKGNvbmZpZywgbW9uYWNvKVxuXG4gIC8vIEdyYWIgdGhlIGNvbXBpbGVyIGZsYWdzIHZpYSB0aGUgcXVlcnkgcGFyYW1zXG4gIGxldCBjb21waWxlck9wdGlvbnM6IENvbXBpbGVyT3B0aW9uc1xuICBpZiAoIWNvbmZpZy5zdXBwcmVzc0F1dG9tYXRpY2FsbHlHZXR0aW5nQ29tcGlsZXJGbGFncykge1xuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKVxuICAgIGxldCBxdWVyeVBhcmFtQ29tcGlsZXJPcHRpb25zID0gZ2V0Q29tcGlsZXJPcHRpb25zRnJvbVBhcmFtcyhjb21waWxlckRlZmF1bHRzLCBwYXJhbXMpXG4gICAgaWYgKE9iamVjdC5rZXlzKHF1ZXJ5UGFyYW1Db21waWxlck9wdGlvbnMpLmxlbmd0aClcbiAgICAgIGNvbmZpZy5sb2dnZXIubG9nKFwiW0NvbXBpbGVyXSBGb3VuZCBjb21waWxlciBvcHRpb25zIGluIHF1ZXJ5IHBhcmFtczogXCIsIHF1ZXJ5UGFyYW1Db21waWxlck9wdGlvbnMpXG4gICAgY29tcGlsZXJPcHRpb25zID0geyAuLi5jb21waWxlckRlZmF1bHRzLCAuLi5xdWVyeVBhcmFtQ29tcGlsZXJPcHRpb25zIH1cbiAgfSBlbHNlIHtcbiAgICBjb21waWxlck9wdGlvbnMgPSBjb21waWxlckRlZmF1bHRzXG4gIH1cblxuICBjb25zdCBsYW5ndWFnZSA9IGxhbmd1YWdlVHlwZShjb25maWcpXG4gIGNvbnN0IGZpbGVQYXRoID0gY3JlYXRlRmlsZVVyaShjb25maWcsIGNvbXBpbGVyT3B0aW9ucywgbW9uYWNvKVxuICBjb25zdCBlbGVtZW50ID0gXCJkb21JRFwiIGluIGNvbmZpZyA/IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbmZpZy5kb21JRCkgOiAoY29uZmlnIGFzIGFueSkuZWxlbWVudFRvQXBwZW5kXG5cbiAgY29uc3QgbW9kZWwgPSBtb25hY28uZWRpdG9yLmNyZWF0ZU1vZGVsKGRlZmF1bHRUZXh0LCBsYW5ndWFnZSwgZmlsZVBhdGgpXG4gIG1vbmFjby5lZGl0b3IuZGVmaW5lVGhlbWUoXCJzYW5kYm94XCIsIHNhbmRib3hUaGVtZSlcbiAgbW9uYWNvLmVkaXRvci5kZWZpbmVUaGVtZShcInNhbmRib3gtZGFya1wiLCBzYW5kYm94VGhlbWVEYXJrKVxuICBtb25hY28uZWRpdG9yLnNldFRoZW1lKFwic2FuZGJveFwiKVxuXG4gIGNvbnN0IG1vbmFjb1NldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7IG1vZGVsIH0sIHNoYXJlZEVkaXRvck9wdGlvbnMsIGNvbmZpZy5tb25hY29TZXR0aW5ncyB8fCB7fSlcbiAgY29uc3QgZWRpdG9yID0gbW9uYWNvLmVkaXRvci5jcmVhdGUoZWxlbWVudCwgbW9uYWNvU2V0dGluZ3MpXG5cbiAgY29uc3QgZ2V0V29ya2VyID0gY29uZmlnLnVzZUphdmFTY3JpcHRcbiAgICA/IG1vbmFjby5sYW5ndWFnZXMudHlwZXNjcmlwdC5nZXRKYXZhU2NyaXB0V29ya2VyXG4gICAgOiBtb25hY28ubGFuZ3VhZ2VzLnR5cGVzY3JpcHQuZ2V0VHlwZVNjcmlwdFdvcmtlclxuXG4gIGNvbnN0IGRlZmF1bHRzID0gY29uZmlnLnVzZUphdmFTY3JpcHRcbiAgICA/IG1vbmFjby5sYW5ndWFnZXMudHlwZXNjcmlwdC5qYXZhc2NyaXB0RGVmYXVsdHNcbiAgICA6IG1vbmFjby5sYW5ndWFnZXMudHlwZXNjcmlwdC50eXBlc2NyaXB0RGVmYXVsdHNcblxuICAvLyBJbiB0aGUgZnV0dXJlIGl0J2QgYmUgZ29vZCB0byBhZGQgc3VwcG9ydCBmb3IgYW4gJ2FkZCBtYW55IGZpbGVzJ1xuICBjb25zdCBhZGRMaWJyYXJ5VG9SdW50aW1lID0gKGNvZGU6IHN0cmluZywgcGF0aDogc3RyaW5nKSA9PiB7XG4gICAgZGVmYXVsdHMuYWRkRXh0cmFMaWIoY29kZSwgcGF0aClcbiAgICBjb25maWcubG9nZ2VyLmxvZyhgW0FUQV0gQWRkaW5nICR7cGF0aH0gdG8gcnVudGltZWApXG4gIH1cblxuICBjb25zdCBnZXRUd29TbGFzaENvbXBsaWVyT3B0aW9ucyA9IGV4dHJhY3RUd29TbGFzaENvbXBsaWVyT3B0aW9ucyh0cylcblxuICAvLyBUaGVuIHVwZGF0ZSBpdCB3aGVuIHRoZSBtb2RlbCBjaGFuZ2VzLCBwZXJoYXBzIHRoaXMgY291bGQgYmUgYSBkZWJvdW5jZWQgcGx1Z2luIGluc3RlYWQgaW4gdGhlIGZ1dHVyZT9cbiAgZWRpdG9yLm9uRGlkQ2hhbmdlTW9kZWxDb250ZW50KCgpID0+IHtcbiAgICBjb25zdCBjb2RlID0gZWRpdG9yLmdldE1vZGVsKCkhLmdldFZhbHVlKClcbiAgICBpZiAoY29uZmlnLnN1cHBvcnRUd29zbGFzaENvbXBpbGVyT3B0aW9ucykge1xuICAgICAgY29uc3QgY29uZmlnT3B0cyA9IGdldFR3b1NsYXNoQ29tcGxpZXJPcHRpb25zKGNvZGUpXG4gICAgICB1cGRhdGVDb21waWxlclNldHRpbmdzKGNvbmZpZ09wdHMpXG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5hY3F1aXJlVHlwZXMpIHtcbiAgICAgIGRldGVjdE5ld0ltcG9ydHNUb0FjcXVpcmVUeXBlRm9yKGNvZGUsIGFkZExpYnJhcnlUb1J1bnRpbWUsIHdpbmRvdy5mZXRjaC5iaW5kKHdpbmRvdyksIGNvbmZpZylcbiAgICB9XG4gIH0pXG5cbiAgY29uZmlnLmxvZ2dlci5sb2coXCJbQ29tcGlsZXJdIFNldCBjb21waWxlciBvcHRpb25zOiBcIiwgY29tcGlsZXJPcHRpb25zKVxuICBkZWZhdWx0cy5zZXRDb21waWxlck9wdGlvbnMoY29tcGlsZXJPcHRpb25zKVxuXG4gIC8vIEdyYWIgdHlwZXMgbGFzdCBzbyB0aGF0IGl0IGxvZ3MgaW4gYSBsb2dpY2FsIHdheVxuICBpZiAoY29uZmlnLmFjcXVpcmVUeXBlcykge1xuICAgIC8vIFRha2UgdGhlIGNvZGUgZnJvbSB0aGUgZWRpdG9yIHJpZ2h0IGF3YXlcbiAgICBjb25zdCBjb2RlID0gZWRpdG9yLmdldE1vZGVsKCkhLmdldFZhbHVlKClcbiAgICBkZXRlY3ROZXdJbXBvcnRzVG9BY3F1aXJlVHlwZUZvcihjb2RlLCBhZGRMaWJyYXJ5VG9SdW50aW1lLCB3aW5kb3cuZmV0Y2guYmluZCh3aW5kb3cpLCBjb25maWcpXG4gIH1cblxuICAvLyBUbyBsZXQgY2xpZW50cyBwbHVnIGludG8gY29tcGlsZXIgc2V0dGluZ3MgY2hhbmdlc1xuICBsZXQgZGlkVXBkYXRlQ29tcGlsZXJTZXR0aW5ncyA9IChvcHRzOiBDb21waWxlck9wdGlvbnMpID0+IHt9XG5cbiAgY29uc3QgdXBkYXRlQ29tcGlsZXJTZXR0aW5ncyA9IChvcHRzOiBDb21waWxlck9wdGlvbnMpID0+IHtcbiAgICBjb25maWcubG9nZ2VyLmxvZyhcIltDb21waWxlcl0gVXBkYXRpbmcgY29tcGlsZXIgb3B0aW9uczogXCIsIG9wdHMpXG4gICAgY29tcGlsZXJPcHRpb25zID0geyAuLi5vcHRzLCAuLi5jb21waWxlck9wdGlvbnMgfVxuICAgIGRlZmF1bHRzLnNldENvbXBpbGVyT3B0aW9ucyhjb21waWxlck9wdGlvbnMpXG4gICAgZGlkVXBkYXRlQ29tcGlsZXJTZXR0aW5ncyhjb21waWxlck9wdGlvbnMpXG4gIH1cblxuICBjb25zdCB1cGRhdGVDb21waWxlclNldHRpbmcgPSAoa2V5OiBrZXlvZiBDb21waWxlck9wdGlvbnMsIHZhbHVlOiBhbnkpID0+IHtcbiAgICBjb25maWcubG9nZ2VyLmxvZyhcIltDb21waWxlcl0gU2V0dGluZyBjb21waWxlciBvcHRpb25zIFwiLCBrZXksIFwidG9cIiwgdmFsdWUpXG4gICAgY29tcGlsZXJPcHRpb25zW2tleV0gPSB2YWx1ZVxuICAgIGRlZmF1bHRzLnNldENvbXBpbGVyT3B0aW9ucyhjb21waWxlck9wdGlvbnMpXG4gICAgZGlkVXBkYXRlQ29tcGlsZXJTZXR0aW5ncyhjb21waWxlck9wdGlvbnMpXG4gIH1cblxuICBjb25zdCBzZXRDb21waWxlclNldHRpbmdzID0gKG9wdHM6IENvbXBpbGVyT3B0aW9ucykgPT4ge1xuICAgIGNvbmZpZy5sb2dnZXIubG9nKFwiW0NvbXBpbGVyXSBTZXR0aW5nIGNvbXBpbGVyIG9wdGlvbnM6IFwiLCBvcHRzKVxuICAgIGNvbXBpbGVyT3B0aW9ucyA9IG9wdHNcbiAgICBkZWZhdWx0cy5zZXRDb21waWxlck9wdGlvbnMoY29tcGlsZXJPcHRpb25zKVxuICAgIGRpZFVwZGF0ZUNvbXBpbGVyU2V0dGluZ3MoY29tcGlsZXJPcHRpb25zKVxuICB9XG5cbiAgY29uc3QgZ2V0Q29tcGlsZXJPcHRpb25zID0gKCkgPT4ge1xuICAgIHJldHVybiBjb21waWxlck9wdGlvbnNcbiAgfVxuXG4gIGNvbnN0IHNldERpZFVwZGF0ZUNvbXBpbGVyU2V0dGluZ3MgPSAoZnVuYzogKG9wdHM6IENvbXBpbGVyT3B0aW9ucykgPT4gdm9pZCkgPT4ge1xuICAgIGRpZFVwZGF0ZUNvbXBpbGVyU2V0dGluZ3MgPSBmdW5jXG4gIH1cblxuICAvKiogR2V0cyB0aGUgcmVzdWx0cyBvZiBjb21waWxpbmcgeW91ciBlZGl0b3IncyBjb2RlICovXG4gIGNvbnN0IGdldEVtaXRSZXN1bHQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgbW9kZWwgPSBlZGl0b3IuZ2V0TW9kZWwoKSFcblxuICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IGdldFdvcmtlclByb2Nlc3MoKVxuICAgIHJldHVybiBhd2FpdCBjbGllbnQuZ2V0RW1pdE91dHB1dChtb2RlbC51cmkudG9TdHJpbmcoKSlcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBKUyAgb2YgY29tcGlsaW5nIHlvdXIgZWRpdG9yJ3MgY29kZSAqL1xuICBjb25zdCBnZXRSdW5uYWJsZUpTID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmIChjb25maWcudXNlSmF2YVNjcmlwdCkge1xuICAgICAgcmV0dXJuIGdldFRleHQoKVxuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldEVtaXRSZXN1bHQoKVxuICAgIGNvbnN0IGZpcnN0SlMgPSByZXN1bHQub3V0cHV0RmlsZXMuZmluZCgobzogYW55KSA9PiBvLm5hbWUuZW5kc1dpdGgoXCIuanNcIikgfHwgby5uYW1lLmVuZHNXaXRoKFwiLmpzeFwiKSlcbiAgICByZXR1cm4gKGZpcnN0SlMgJiYgZmlyc3RKUy50ZXh0KSB8fCBcIlwiXG4gIH1cblxuICAvKiogR2V0cyB0aGUgRFRTIGZvciB0aGUgSlMvVFMgIG9mIGNvbXBpbGluZyB5b3VyIGVkaXRvcidzIGNvZGUgKi9cbiAgY29uc3QgZ2V0RFRTRm9yQ29kZSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnZXRFbWl0UmVzdWx0KClcbiAgICByZXR1cm4gcmVzdWx0Lm91dHB1dEZpbGVzLmZpbmQoKG86IGFueSkgPT4gby5uYW1lLmVuZHNXaXRoKFwiLmQudHNcIikpIS50ZXh0XG4gIH1cblxuICBjb25zdCBnZXRXb3JrZXJQcm9jZXNzID0gYXN5bmMgKCk6IFByb21pc2U8VHlwZVNjcmlwdFdvcmtlcj4gPT4ge1xuICAgIGNvbnN0IHdvcmtlciA9IGF3YWl0IGdldFdvcmtlcigpXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiBhd2FpdCB3b3JrZXIobW9kZWwudXJpKVxuICB9XG5cbiAgY29uc3QgZ2V0RG9tTm9kZSA9ICgpID0+IGVkaXRvci5nZXREb21Ob2RlKCkhXG4gIGNvbnN0IGdldE1vZGVsID0gKCkgPT4gZWRpdG9yLmdldE1vZGVsKCkhXG4gIGNvbnN0IGdldFRleHQgPSAoKSA9PiBnZXRNb2RlbCgpLmdldFZhbHVlKClcbiAgY29uc3Qgc2V0VGV4dCA9ICh0ZXh0OiBzdHJpbmcpID0+IGdldE1vZGVsKCkuc2V0VmFsdWUodGV4dClcblxuICAvKipcbiAgICogV2FybmluZzogUnVucyBvbiB0aGUgbWFpbiB0aHJlYWRcbiAgICovXG4gIGNvbnN0IGNyZWF0ZVRTUHJvZ3JhbSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBmc01hcCA9IGF3YWl0IHRzdmZzLmNyZWF0ZURlZmF1bHRNYXBGcm9tQ0ROKGNvbXBpbGVyT3B0aW9ucywgdHMudmVyc2lvbiwgdHJ1ZSwgdHMsIGx6c3RyaW5nKVxuICAgIGZzTWFwLnNldChmaWxlUGF0aC5wYXRoLCBnZXRUZXh0KCkpXG5cbiAgICBjb25zdCBzeXN0ZW0gPSB0c3Zmcy5jcmVhdGVTeXN0ZW0oZnNNYXApXG4gICAgY29uc3QgaG9zdCA9IHRzdmZzLmNyZWF0ZVZpcnR1YWxDb21waWxlckhvc3Qoc3lzdGVtLCBjb21waWxlck9wdGlvbnMsIHRzKVxuXG4gICAgY29uc3QgcHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0oe1xuICAgICAgcm9vdE5hbWVzOiBbLi4uZnNNYXAua2V5cygpXSxcbiAgICAgIG9wdGlvbnM6IGNvbXBpbGVyT3B0aW9ucyxcbiAgICAgIGhvc3Q6IGhvc3QuY29tcGlsZXJIb3N0LFxuICAgIH0pXG5cbiAgICByZXR1cm4gcHJvZ3JhbVxuICB9XG5cbiAgY29uc3QgZ2V0QVNUID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHByb2dyYW0gPSBhd2FpdCBjcmVhdGVUU1Byb2dyYW0oKVxuICAgIHByb2dyYW0uZW1pdCgpXG4gICAgcmV0dXJuIHByb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlUGF0aC5wYXRoKSFcbiAgfVxuXG4gIC8vIFBhc3MgYWxvbmcgdGhlIHN1cHBvcnRlZCByZWxlYXNlcyBmb3IgdGhlIHBsYXlncm91bmRcbiAgY29uc3Qgc3VwcG9ydGVkVmVyc2lvbnMgPSBzdXBwb3J0ZWRSZWxlYXNlc1xuXG4gIHJldHVybiB7XG4gICAgLyoqIFRoZSBzYW1lIGNvbmZpZyB5b3UgcGFzc2VkIGluICovXG4gICAgY29uZmlnLFxuICAgIC8qKiBBIGxpc3Qgb2YgVHlwZVNjcmlwdCB2ZXJzaW9ucyB5b3UgY2FuIHVzZSB3aXRoIHRoZSBUeXBlU2NyaXB0IHNhbmRib3ggKi9cbiAgICBzdXBwb3J0ZWRWZXJzaW9ucyxcbiAgICAvKiogVGhlIG1vbmFjbyBlZGl0b3IgaW5zdGFuY2UgKi9cbiAgICBlZGl0b3IsXG4gICAgLyoqIEVpdGhlciBcInR5cGVzY3JpcHRcIiBvciBcImphdmFzY3JpcHRcIiBkZXBlbmRpbmcgb24geW91ciBjb25maWcgKi9cbiAgICBsYW5ndWFnZSxcbiAgICAvKiogVGhlIG91dGVyIG1vbmFjbyBtb2R1bGUsIHRoZSByZXN1bHQgb2YgcmVxdWlyZShcIm1vbmFjby1lZGl0b3JcIikgICovXG4gICAgbW9uYWNvLFxuICAgIC8qKiBHZXRzIGEgbW9uYWNvLXR5cGVzY3JpcHQgd29ya2VyLCB0aGlzIHdpbGwgZ2l2ZSB5b3UgYWNjZXNzIHRvIGEgbGFuZ3VhZ2Ugc2VydmVyLiBOb3RlOiBwcmVmZXIgdGhpcyBmb3IgbGFuZ3VhZ2Ugc2VydmVyIHdvcmsgYmVjYXVzZSBpdCBoYXBwZW5zIG9uIGEgd2Vid29ya2VyIC4gKi9cbiAgICBnZXRXb3JrZXJQcm9jZXNzLFxuICAgIC8qKiBBIGNvcHkgb2YgcmVxdWlyZShcIkB0eXBlc2NyaXB0L3Zmc1wiKSB0aGlzIGNhbiBiZSB1c2VkIHRvIHF1aWNrbHkgc2V0IHVwIGFuIGluLW1lbW9yeSBjb21waWxlciBydW5zIGZvciBBU1RzLCBvciB0byBnZXQgY29tcGxleCBsYW5ndWFnZSBzZXJ2ZXIgcmVzdWx0cyAoYW55dGhpbmcgYWJvdmUgaGFzIHRvIGJlIHNlcmlhbGl6ZWQgd2hlbiBwYXNzZWQpKi9cbiAgICB0c3ZmcyxcbiAgICAvKiogR2V0IGFsbCB0aGUgZGlmZmVyZW50IGVtaXR0ZWQgZmlsZXMgYWZ0ZXIgVHlwZVNjcmlwdCBpcyBydW4gKi9cbiAgICBnZXRFbWl0UmVzdWx0LFxuICAgIC8qKiBHZXRzIGp1c3QgdGhlIEphdmFTY3JpcHQgZm9yIHlvdXIgc2FuZGJveCwgd2lsbCB0cmFuc3BpbGUgaWYgaW4gVFMgb25seSAqL1xuICAgIGdldFJ1bm5hYmxlSlMsXG4gICAgLyoqIEdldHMgdGhlIERUUyBvdXRwdXQgb2YgdGhlIG1haW4gY29kZSBpbiB0aGUgZWRpdG9yICovXG4gICAgZ2V0RFRTRm9yQ29kZSxcbiAgICAvKiogVGhlIG1vbmFjby1lZGl0b3IgZG9tIG5vZGUsIHVzZWQgZm9yIHNob3dpbmcvaGlkaW5nIHRoZSBlZGl0b3IgKi9cbiAgICBnZXREb21Ob2RlLFxuICAgIC8qKiBUaGUgbW9kZWwgaXMgYW4gb2JqZWN0IHdoaWNoIG1vbmFjbyB1c2VzIHRvIGtlZXAgdHJhY2sgb2YgdGV4dCBpbiB0aGUgZWRpdG9yLiBVc2UgdGhpcyB0byBkaXJlY3RseSBtb2RpZnkgdGhlIHRleHQgaW4gdGhlIGVkaXRvciAqL1xuICAgIGdldE1vZGVsLFxuICAgIC8qKiBHZXRzIHRoZSB0ZXh0IG9mIHRoZSBtYWluIG1vZGVsLCB3aGljaCBpcyB0aGUgdGV4dCBpbiB0aGUgZWRpdG9yICovXG4gICAgZ2V0VGV4dCxcbiAgICAvKiogU2hvcnRjdXQgZm9yIHNldHRpbmcgdGhlIG1vZGVsJ3MgdGV4dCBjb250ZW50IHdoaWNoIHdvdWxkIHVwZGF0ZSB0aGUgZWRpdG9yICovXG4gICAgc2V0VGV4dCxcbiAgICAvKiogR2V0cyB0aGUgQVNUIG9mIHRoZSBjdXJyZW50IHRleHQgaW4gbW9uYWNvIC0gdXNlcyBgY3JlYXRlVFNQcm9ncmFtYCwgc28gdGhlIHBlcmZvcm1hbmNlIGNhdmVhdCBhcHBsaWVzIHRoZXJlIHRvbyAqL1xuICAgIGdldEFTVCxcbiAgICAvKiogVGhlIG1vZHVsZSB5b3UgZ2V0IGZyb20gcmVxdWlyZShcInR5cGVzY3JpcHRcIikgKi9cbiAgICB0cyxcbiAgICAvKiogQ3JlYXRlIGEgbmV3IFByb2dyYW0sIGEgVHlwZVNjcmlwdCBkYXRhIG1vZGVsIHdoaWNoIHJlcHJlc2VudHMgdGhlIGVudGlyZSBwcm9qZWN0LlxuICAgICAqXG4gICAgICogVGhlIGZpcnN0IHRpbWUgdGhpcyBpcyBjYWxsZWQgaXQgaGFzIHRvIGRvd25sb2FkIGFsbCB0aGUgRFRTIGZpbGVzIHdoaWNoIGlzIG5lZWRlZCBmb3IgYW4gZXhhY3QgY29tcGlsZXIgcnVuLiBXaGljaFxuICAgICAqIGF0IG1heCBpcyBhYm91dCAxLjVNQiAtIGFmdGVyIHRoYXQgc3Vic2VxdWVudCBkb3dubG9hZHMgb2YgZHRzIGxpYiBmaWxlcyBjb21lIGZyb20gbG9jYWxTdG9yYWdlLlxuICAgICAqXG4gICAgICogVHJ5IHRvIHVzZSB0aGlzIHNwYXJpbmdseSBhcyBpdCBjYW4gYmUgY29tcHV0YXRpb25hbGx5IGV4cGVuc2l2ZSwgYXQgdGhlIG1pbmltdW0geW91IHNob3VsZCBiZSB1c2luZyB0aGUgZGVib3VuY2VkIHNldHVwLlxuICAgICAqXG4gICAgICogVE9ETzogSXQgd291bGQgYmUgZ29vZCB0byBjcmVhdGUgYW4gZWFzeSB3YXkgdG8gaGF2ZSBhIHNpbmdsZSBwcm9ncmFtIGluc3RhbmNlIHdoaWNoIGlzIHVwZGF0ZWQgZm9yIHlvdVxuICAgICAqIHdoZW4gdGhlIG1vbmFjbyBtb2RlbCBjaGFuZ2VzLlxuICAgICAqL1xuICAgIGNyZWF0ZVRTUHJvZ3JhbSxcbiAgICAvKiogVGhlIFNhbmRib3gncyBkZWZhdWx0IGNvbXBpbGVyIG9wdGlvbnMgICovXG4gICAgY29tcGlsZXJEZWZhdWx0cyxcbiAgICAvKiogVGhlIFNhbmRib3gncyBjdXJyZW50IGNvbXBpbGVyIG9wdGlvbnMgKi9cbiAgICBnZXRDb21waWxlck9wdGlvbnMsXG4gICAgLyoqIFJlcGxhY2UgdGhlIFNhbmRib3gncyBjb21waWxlciBvcHRpb25zICovXG4gICAgc2V0Q29tcGlsZXJTZXR0aW5ncyxcbiAgICAvKiogT3ZlcndyaXRlIHRoZSBTYW5kYm94J3MgY29tcGlsZXIgb3B0aW9ucyAqL1xuICAgIHVwZGF0ZUNvbXBpbGVyU2V0dGluZyxcbiAgICAvKiogVXBkYXRlIGEgc2luZ2xlIGNvbXBpbGVyIG9wdGlvbiBpbiB0aGUgU0FuZGJveCAqL1xuICAgIHVwZGF0ZUNvbXBpbGVyU2V0dGluZ3MsXG4gICAgLyoqIEEgd2F5IHRvIGdldCBjYWxsYmFja3Mgd2hlbiBjb21waWxlciBzZXR0aW5ncyBoYXZlIGNoYW5nZWQgKi9cbiAgICBzZXREaWRVcGRhdGVDb21waWxlclNldHRpbmdzLFxuICAgIC8qKiBBIGNvcHkgb2YgbHpzdHJpbmcsIHdoaWNoIGlzIHVzZWQgdG8gYXJjaGl2ZS91bmFyY2hpdmUgY29kZSAqL1xuICAgIGx6c3RyaW5nLFxuICAgIC8qKiBSZXR1cm5zIGNvbXBpbGVyIG9wdGlvbnMgZm91bmQgaW4gdGhlIHBhcmFtcyBvZiB0aGUgY3VycmVudCBwYWdlICovXG4gICAgY3JlYXRlVVJMUXVlcnlXaXRoQ29tcGlsZXJPcHRpb25zLFxuICAgIC8qKiBSZXR1cm5zIGNvbXBpbGVyIG9wdGlvbnMgaW4gdGhlIHNvdXJjZSBjb2RlIHVzaW5nIHR3b3NsYXNoIG5vdGF0aW9uICovXG4gICAgZ2V0VHdvU2xhc2hDb21wbGllck9wdGlvbnMsXG4gICAgLyoqIEdldHMgdG8gdGhlIGN1cnJlbnQgbW9uYWNvLWxhbmd1YWdlLCB0aGlzIGlzIGhvdyB5b3UgdGFsayB0byB0aGUgYmFja2dyb3VuZCB3ZWJ3b3JrZXJzICovXG4gICAgbGFuZ3VhZ2VTZXJ2aWNlRGVmYXVsdHM6IGRlZmF1bHRzLFxuICAgIC8qKiBUaGUgcGF0aCB3aGljaCByZXByZXNlbnRzIHRoZSBjdXJyZW50IGZpbGUgdXNpbmcgdGhlIGN1cnJlbnQgY29tcGlsZXIgb3B0aW9ucyAqL1xuICAgIGZpbGVwYXRoOiBmaWxlUGF0aC5wYXRoLFxuICB9XG59XG5cbmV4cG9ydCB0eXBlIFNhbmRib3ggPSBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVUeXBlU2NyaXB0U2FuZGJveD5cbiJdfQ==