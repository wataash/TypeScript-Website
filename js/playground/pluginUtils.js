define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /** Creates a set of util functions which is exposed to Plugins to make it easier to build consistent UIs */
    exports.createUtils = (sb, react) => {
        const sandbox = sb;
        const ts = sandbox.ts;
        const requireURL = (path) => {
            // https://unpkg.com/browse/typescript-playground-presentation-mode@0.0.1/dist/x.js => unpkg/browse/typescript-playground-presentation-mode@0.0.1/dist/x
            const isDev = document.location.host.includes("localhost");
            const prefix = isDev ? "local/" : "unpkg/typescript-playground-presentation-mode/dist/";
            return prefix + path;
        };
        const el = (str, elementType, container) => {
            const el = document.createElement(elementType);
            el.innerHTML = str;
            container.appendChild(el);
            return el;
        };
        // The Playground Plugin design system
        const createDesignSystem = (container) => {
            const clear = () => {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            };
            let decorations = [];
            let decorationLock = false;
            return {
                /** Clear the sidebar */
                clear,
                /** Present code in a pre > code  */
                code: (code) => {
                    const createCodePre = document.createElement("pre");
                    const codeElement = document.createElement("code");
                    codeElement.innerHTML = code;
                    createCodePre.appendChild(codeElement);
                    container.appendChild(createCodePre);
                    return codeElement;
                },
                /** Ideally only use this once, and maybe even prefer using subtitles everywhere */
                title: (title) => el(title, "h3", container),
                /** Used to denote sections, give info etc */
                subtitle: (subtitle) => el(subtitle, "h4", container),
                p: (subtitle) => el(subtitle, "p", container),
                /** When you can't do something, or have nothing to show */
                showEmptyScreen: (message) => {
                    clear();
                    const noErrorsMessage = document.createElement("div");
                    noErrorsMessage.id = "empty-message-container";
                    const messageDiv = document.createElement("div");
                    messageDiv.textContent = message;
                    messageDiv.classList.add("empty-plugin-message");
                    noErrorsMessage.appendChild(messageDiv);
                    container.appendChild(noErrorsMessage);
                    return noErrorsMessage;
                },
                /**
                 * Shows a list of hoverable, and selectable items (errors, highlights etc) which have code representation.
                 * The type is quite small, so it should be very feasible for you to massage other data to fit into this function
                 */
                listDiags: (sandbox, model, diags) => {
                    const errorUL = document.createElement("ul");
                    errorUL.className = "compiler-diagnostics";
                    container.appendChild(errorUL);
                    diags.forEach(diag => {
                        const li = document.createElement("li");
                        li.classList.add("diagnostic");
                        switch (diag.category) {
                            case 0:
                                li.classList.add("warning");
                                break;
                            case 1:
                                li.classList.add("error");
                                break;
                            case 2:
                                li.classList.add("suggestion");
                                break;
                            case 3:
                                li.classList.add("message");
                                break;
                        }
                        if (typeof diag === "string") {
                            li.textContent = diag;
                        }
                        else {
                            li.textContent = sandbox.ts.flattenDiagnosticMessageText(diag.messageText, "\n");
                        }
                        errorUL.appendChild(li);
                        li.onmouseenter = () => {
                            if (diag.start && diag.length && !decorationLock) {
                                const start = model.getPositionAt(diag.start);
                                const end = model.getPositionAt(diag.start + diag.length);
                                decorations = sandbox.editor.deltaDecorations(decorations, [
                                    {
                                        range: new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                                        options: { inlineClassName: "error-highlight" },
                                    },
                                ]);
                            }
                        };
                        li.onmouseleave = () => {
                            if (!decorationLock) {
                                sandbox.editor.deltaDecorations(decorations, []);
                            }
                        };
                        li.onclick = () => {
                            if (diag.start && diag.length) {
                                const start = model.getPositionAt(diag.start);
                                sandbox.editor.revealLine(start.lineNumber);
                                const end = model.getPositionAt(diag.start + diag.length);
                                decorations = sandbox.editor.deltaDecorations(decorations, [
                                    {
                                        range: new sandbox.monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
                                        options: { inlineClassName: "error-highlight", isWholeLine: true },
                                    },
                                ]);
                                decorationLock = true;
                                setTimeout(() => {
                                    decorationLock = false;
                                    sandbox.editor.deltaDecorations(decorations, []);
                                }, 300);
                            }
                        };
                    });
                    return errorUL;
                },
                localStorageOption: (setting) => {
                    const li = document.createElement("li");
                    const label = document.createElement("label");
                    label.innerHTML = `<span>${setting.display}</span><br/>${setting.blurb}`;
                    const key = setting.flag;
                    const input = document.createElement("input");
                    input.type = "checkbox";
                    input.id = key;
                    input.checked = !!localStorage.getItem(key);
                    input.onchange = () => {
                        if (input.checked) {
                            localStorage.setItem(key, "true");
                        }
                        else {
                            localStorage.removeItem(key);
                        }
                    };
                    label.htmlFor = input.id;
                    li.appendChild(input);
                    li.appendChild(label);
                    container.appendChild(li);
                    return li;
                },
            };
        };
        const createASTTree = (node) => {
            const div = document.createElement("div");
            div.className = "ast";
            const infoForNode = (node) => {
                const name = ts.SyntaxKind[node.kind];
                return {
                    name,
                };
            };
            const renderLiteralField = (key, value) => {
                const li = document.createElement("li");
                li.innerHTML = `${key}: ${value}`;
                return li;
            };
            const renderSingleChild = (key, value) => {
                const li = document.createElement("li");
                li.innerHTML = `${key}: <strong>${ts.SyntaxKind[value.kind]}</strong>`;
                return li;
            };
            const renderManyChildren = (key, value) => {
                const li = document.createElement("li");
                const nodes = value.map(n => "<strong>&nbsp;&nbsp;" + ts.SyntaxKind[n.kind] + "<strong>").join("<br/>");
                li.innerHTML = `${key}: [<br/>${nodes}</br>]`;
                return li;
            };
            const renderItem = (parentElement, node) => {
                const ul = document.createElement("ul");
                parentElement.appendChild(ul);
                ul.className = "ast-tree";
                const info = infoForNode(node);
                const li = document.createElement("li");
                ul.appendChild(li);
                const a = document.createElement("a");
                a.textContent = info.name;
                li.appendChild(a);
                const properties = document.createElement("ul");
                properties.className = "ast-tree";
                li.appendChild(properties);
                Object.keys(node).forEach(field => {
                    if (typeof field === "function")
                        return;
                    if (field === "parent" || field === "flowNode")
                        return;
                    const value = node[field];
                    if (typeof value === "object" && Array.isArray(value) && "pos" in value[0] && "end" in value[0]) {
                        //  Is an array of Nodes
                        properties.appendChild(renderManyChildren(field, value));
                    }
                    else if (typeof value === "object" && "pos" in value && "end" in value) {
                        // Is a single child property
                        properties.appendChild(renderSingleChild(field, value));
                    }
                    else {
                        properties.appendChild(renderLiteralField(field, value));
                    }
                });
            };
            renderItem(div, node);
            return div;
        };
        return {
            /** Use this to make a few dumb element generation funcs */
            el,
            /** Get a relative URL for something in your dist folder depending on if you're in dev mode or not */
            requireURL,
            /** Returns a div which has an interactive AST a TypeScript AST by passing in the root node */
            createASTTree,
            /** The Gatsby copy of React */
            react,
            /**
             * The playground plugin design system. Calling any of the functions will append the
             * element to the container you pass into the first param, and return the HTMLElement
             */
            createDesignSystem,
        };
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wbGF5Z3JvdW5kL3NyYy9wbHVnaW5VdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQSw0R0FBNEc7SUFDL0YsUUFBQSxXQUFXLEdBQUcsQ0FBQyxFQUFPLEVBQUUsS0FBbUIsRUFBRSxFQUFFO1FBQzFELE1BQU0sT0FBTyxHQUFZLEVBQUUsQ0FBQTtRQUMzQixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFBO1FBRXJCLE1BQU0sVUFBVSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDbEMsd0pBQXdKO1lBQ3hKLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUMxRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMscURBQXFELENBQUE7WUFDdkYsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFBO1FBQ3RCLENBQUMsQ0FBQTtRQUVELE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBVyxFQUFFLFdBQW1CLEVBQUUsU0FBa0IsRUFBRSxFQUFFO1lBQ2xFLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDOUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUE7WUFDbEIsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN6QixPQUFPLEVBQUUsQ0FBQTtRQUNYLENBQUMsQ0FBQTtRQUVELHNDQUFzQztRQUN0QyxNQUFNLGtCQUFrQixHQUFHLENBQUMsU0FBa0IsRUFBRSxFQUFFO1lBQ2hELE1BQU0sS0FBSyxHQUFHLEdBQUcsRUFBRTtnQkFDakIsT0FBTyxTQUFTLENBQUMsVUFBVSxFQUFFO29CQUMzQixTQUFTLENBQUMsV0FBVyxDQUFDLFNB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O0lBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTYW5kYm94IH0gZnJvbSBcInR5cGVzY3JpcHQtc2FuZGJveFwiXG5pbXBvcnQgeyBOb2RlLCBEaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uIH0gZnJvbSBcInR5cGVzY3JpcHRcIlxuaW1wb3J0IHR5cGUgUmVhY3QgZnJvbSBcInJlYWN0XCJcblxuLyoqIENyZWF0ZXMgYSBzZXQgb2YgdXRpbCBmdW5jdGlvbnMgd2hpY2ggaXMgZXhwb3NlZCB0byBQbHVnaW5zIHRvIG1ha2UgaXQgZWFzaWVyIHRvIGJ1aWxkIGNvbnNpc3RlbnQgVUlzICovXG5leHBvcnQgY29uc3QgY3JlYXRlVXRpbHMgPSAoc2I6IGFueSwgcmVhY3Q6IHR5cGVvZiBSZWFjdCkgPT4ge1xuICBjb25zdCBzYW5kYm94OiBTYW5kYm94ID0gc2JcbiAgY29uc3QgdHMgPSBzYW5kYm94LnRzXG5cbiAgY29uc3QgcmVxdWlyZVVSTCA9IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICAvLyBodHRwczovL3VucGtnLmNvbS9icm93c2UvdHlwZXNjcmlwdC1wbGF5Z3JvdW5kLXByZXNlbnRhdGlvbi1tb2RlQDAuMC4xL2Rpc3QveC5qcyA9PiB1bnBrZy9icm93c2UvdHlwZXNjcmlwdC1wbGF5Z3JvdW5kLXByZXNlbnRhdGlvbi1tb2RlQDAuMC4xL2Rpc3QveFxuICAgIGNvbnN0IGlzRGV2ID0gZG9jdW1lbnQubG9jYXRpb24uaG9zdC5pbmNsdWRlcyhcImxvY2FsaG9zdFwiKVxuICAgIGNvbnN0IHByZWZpeCA9IGlzRGV2ID8gXCJsb2NhbC9cIiA6IFwidW5wa2cvdHlwZXNjcmlwdC1wbGF5Z3JvdW5kLXByZXNlbnRhdGlvbi1tb2RlL2Rpc3QvXCJcbiAgICByZXR1cm4gcHJlZml4ICsgcGF0aFxuICB9XG5cbiAgY29uc3QgZWwgPSAoc3RyOiBzdHJpbmcsIGVsZW1lbnRUeXBlOiBzdHJpbmcsIGNvbnRhaW5lcjogRWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50VHlwZSlcbiAgICBlbC5pbm5lckhUTUwgPSBzdHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWwpXG4gICAgcmV0dXJuIGVsXG4gIH1cblxuICAvLyBUaGUgUGxheWdyb3VuZCBQbHVnaW4gZGVzaWduIHN5c3RlbVxuICBjb25zdCBjcmVhdGVEZXNpZ25TeXN0ZW0gPSAoY29udGFpbmVyOiBFbGVtZW50KSA9PiB7XG4gICAgY29uc3QgY2xlYXIgPSAoKSA9PiB7XG4gICAgICB3aGlsZSAoY29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKVxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgZGVjb3JhdGlvbnM6IHN0cmluZ1tdID0gW11cbiAgICBsZXQgZGVjb3JhdGlvbkxvY2sgPSBmYWxzZVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIC8qKiBDbGVhciB0aGUgc2lkZWJhciAqL1xuICAgICAgY2xlYXIsXG4gICAgICAvKiogUHJlc2VudCBjb2RlIGluIGEgcHJlID4gY29kZSAgKi9cbiAgICAgIGNvZGU6IChjb2RlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgY3JlYXRlQ29kZVByZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwcmVcIilcbiAgICAgICAgY29uc3QgY29kZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY29kZVwiKVxuXG4gICAgICAgIGNvZGVFbGVtZW50LmlubmVySFRNTCA9IGNvZGVcblxuICAgICAgICBjcmVhdGVDb2RlUHJlLmFwcGVuZENoaWxkKGNvZGVFbGVtZW50KVxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3JlYXRlQ29kZVByZSlcblxuICAgICAgICByZXR1cm4gY29kZUVsZW1lbnRcbiAgICAgIH0sXG4gICAgICAvKiogSWRlYWxseSBvbmx5IHVzZSB0aGlzIG9uY2UsIGFuZCBtYXliZSBldmVuIHByZWZlciB1c2luZyBzdWJ0aXRsZXMgZXZlcnl3aGVyZSAqL1xuICAgICAgdGl0bGU6ICh0aXRsZTogc3RyaW5nKSA9PiBlbCh0aXRsZSwgXCJoM1wiLCBjb250YWluZXIpLFxuICAgICAgLyoqIFVzZWQgdG8gZGVub3RlIHNlY3Rpb25zLCBnaXZlIGluZm8gZXRjICovXG4gICAgICBzdWJ0aXRsZTogKHN1YnRpdGxlOiBzdHJpbmcpID0+IGVsKHN1YnRpdGxlLCBcImg0XCIsIGNvbnRhaW5lciksXG4gICAgICBwOiAoc3VidGl0bGU6IHN0cmluZykgPT4gZWwoc3VidGl0bGUsIFwicFwiLCBjb250YWluZXIpLFxuICAgICAgLyoqIFdoZW4geW91IGNhbid0IGRvIHNvbWV0aGluZywgb3IgaGF2ZSBub3RoaW5nIHRvIHNob3cgKi9cbiAgICAgIHNob3dFbXB0eVNjcmVlbjogKG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICAgICAgICBjbGVhcigpXG5cbiAgICAgICAgY29uc3Qgbm9FcnJvcnNNZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICBub0Vycm9yc01lc3NhZ2UuaWQgPSBcImVtcHR5LW1lc3NhZ2UtY29udGFpbmVyXCJcblxuICAgICAgICBjb25zdCBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICBtZXNzYWdlRGl2LnRleHRDb250ZW50ID0gbWVzc2FnZVxuICAgICAgICBtZXNzYWdlRGl2LmNsYXNzTGlzdC5hZGQoXCJlbXB0eS1wbHVnaW4tbWVzc2FnZVwiKVxuICAgICAgICBub0Vycm9yc01lc3NhZ2UuYXBwZW5kQ2hpbGQobWVzc2FnZURpdilcblxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9FcnJvcnNNZXNzYWdlKVxuICAgICAgICByZXR1cm4gbm9FcnJvcnNNZXNzYWdlXG4gICAgICB9LFxuICAgICAgLyoqXG4gICAgICAgKiBTaG93cyBhIGxpc3Qgb2YgaG92ZXJhYmxlLCBhbmQgc2VsZWN0YWJsZSBpdGVtcyAoZXJyb3JzLCBoaWdobGlnaHRzIGV0Yykgd2hpY2ggaGF2ZSBjb2RlIHJlcHJlc2VudGF0aW9uLlxuICAgICAgICogVGhlIHR5cGUgaXMgcXVpdGUgc21hbGwsIHNvIGl0IHNob3VsZCBiZSB2ZXJ5IGZlYXNpYmxlIGZvciB5b3UgdG8gbWFzc2FnZSBvdGhlciBkYXRhIHRvIGZpdCBpbnRvIHRoaXMgZnVuY3Rpb25cbiAgICAgICAqL1xuICAgICAgbGlzdERpYWdzOiAoXG4gICAgICAgIHNhbmRib3g6IFNhbmRib3gsXG4gICAgICAgIG1vZGVsOiBpbXBvcnQoXCJtb25hY28tZWRpdG9yXCIpLmVkaXRvci5JVGV4dE1vZGVsLFxuICAgICAgICBkaWFnczogRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdXG4gICAgICApID0+IHtcbiAgICAgICAgY29uc3QgZXJyb3JVTCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiKVxuICAgICAgICBlcnJvclVMLmNsYXNzTmFtZSA9IFwiY29tcGlsZXItZGlhZ25vc3RpY3NcIlxuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlcnJvclVMKVxuXG4gICAgICAgIGRpYWdzLmZvckVhY2goZGlhZyA9PiB7XG4gICAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIilcbiAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwiZGlhZ25vc3RpY1wiKVxuICAgICAgICAgIHN3aXRjaCAoZGlhZy5jYXRlZ29yeSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwid2FybmluZ1wiKVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwiZXJyb3JcIilcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgbGkuY2xhc3NMaXN0LmFkZChcInN1Z2dlc3Rpb25cIilcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgbGkuY2xhc3NMaXN0LmFkZChcIm1lc3NhZ2VcIilcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGRpYWcgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGxpLnRleHRDb250ZW50ID0gZGlhZ1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaS50ZXh0Q29udGVudCA9IHNhbmRib3gudHMuZmxhdHRlbkRpYWdub3N0aWNNZXNzYWdlVGV4dChkaWFnLm1lc3NhZ2VUZXh0LCBcIlxcblwiKVxuICAgICAgICAgIH1cbiAgICAgICAgICBlcnJvclVMLmFwcGVuZENoaWxkKGxpKVxuXG4gICAgICAgICAgbGkub25tb3VzZWVudGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGRpYWcuc3RhcnQgJiYgZGlhZy5sZW5ndGggJiYgIWRlY29yYXRpb25Mb2NrKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gbW9kZWwuZ2V0UG9zaXRpb25BdChkaWFnLnN0YXJ0KVxuICAgICAgICAgICAgICBjb25zdCBlbmQgPSBtb2RlbC5nZXRQb3NpdGlvbkF0KGRpYWcuc3RhcnQgKyBkaWFnLmxlbmd0aClcbiAgICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBzYW5kYm94LmVkaXRvci5kZWx0YURlY29yYXRpb25zKGRlY29yYXRpb25zLCBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgcmFuZ2U6IG5ldyBzYW5kYm94Lm1vbmFjby5SYW5nZShzdGFydC5saW5lTnVtYmVyLCBzdGFydC5jb2x1bW4sIGVuZC5saW5lTnVtYmVyLCBlbmQuY29sdW1uKSxcbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHsgaW5saW5lQ2xhc3NOYW1lOiBcImVycm9yLWhpZ2hsaWdodFwiIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaS5vbm1vdXNlbGVhdmUgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWRlY29yYXRpb25Mb2NrKSB7XG4gICAgICAgICAgICAgIHNhbmRib3guZWRpdG9yLmRlbHRhRGVjb3JhdGlvbnMoZGVjb3JhdGlvbnMsIFtdKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGlhZy5zdGFydCAmJiBkaWFnLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IG1vZGVsLmdldFBvc2l0aW9uQXQoZGlhZy5zdGFydClcbiAgICAgICAgICAgICAgc2FuZGJveC5lZGl0b3IucmV2ZWFsTGluZShzdGFydC5saW5lTnVtYmVyKVxuXG4gICAgICAgICAgICAgIGNvbnN0IGVuZCA9IG1vZGVsLmdldFBvc2l0aW9uQXQoZGlhZy5zdGFydCArIGRpYWcubGVuZ3RoKVxuICAgICAgICAgICAgICBkZWNvcmF0aW9ucyA9IHNhbmRib3guZWRpdG9yLmRlbHRhRGVjb3JhdGlvbnMoZGVjb3JhdGlvbnMsIFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICByYW5nZTogbmV3IHNhbmRib3gubW9uYWNvLlJhbmdlKHN0YXJ0LmxpbmVOdW1iZXIsIHN0YXJ0LmNvbHVtbiwgZW5kLmxpbmVOdW1iZXIsIGVuZC5jb2x1bW4pLFxuICAgICAgICAgICAgICAgICAgb3B0aW9uczogeyBpbmxpbmVDbGFzc05hbWU6IFwiZXJyb3ItaGlnaGxpZ2h0XCIsIGlzV2hvbGVMaW5lOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgICBkZWNvcmF0aW9uTG9jayA9IHRydWVcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGVjb3JhdGlvbkxvY2sgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHNhbmRib3guZWRpdG9yLmRlbHRhRGVjb3JhdGlvbnMoZGVjb3JhdGlvbnMsIFtdKVxuICAgICAgICAgICAgICB9LCAzMDApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gZXJyb3JVTFxuICAgICAgfSxcblxuICAgICAgbG9jYWxTdG9yYWdlT3B0aW9uOiAoc2V0dGluZzogeyBibHVyYjogc3RyaW5nOyBmbGFnOiBzdHJpbmc7IGRpc3BsYXk6IHN0cmluZyB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpXG4gICAgICAgIGxhYmVsLmlubmVySFRNTCA9IGA8c3Bhbj4ke3NldHRpbmcuZGlzcGxheX08L3NwYW4+PGJyLz4ke3NldHRpbmcuYmx1cmJ9YFxuXG4gICAgICAgIGNvbnN0IGtleSA9IHNldHRpbmcuZmxhZ1xuICAgICAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKVxuICAgICAgICBpbnB1dC50eXBlID0gXCJjaGVja2JveFwiXG4gICAgICAgIGlucHV0LmlkID0ga2V5XG4gICAgICAgIGlucHV0LmNoZWNrZWQgPSAhIWxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSlcblxuICAgICAgICBpbnB1dC5vbmNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoaW5wdXQuY2hlY2tlZCkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCBcInRydWVcIilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxhYmVsLmh0bWxGb3IgPSBpbnB1dC5pZFxuXG4gICAgICAgIGxpLmFwcGVuZENoaWxkKGlucHV0KVxuICAgICAgICBsaS5hcHBlbmRDaGlsZChsYWJlbClcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGxpKVxuICAgICAgICByZXR1cm4gbGlcbiAgICAgIH0sXG4gICAgfVxuICB9XG5cbiAgY29uc3QgY3JlYXRlQVNUVHJlZSA9IChub2RlOiBOb2RlKSA9PiB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgIGRpdi5jbGFzc05hbWUgPSBcImFzdFwiXG5cbiAgICBjb25zdCBpbmZvRm9yTm9kZSA9IChub2RlOiBOb2RlKSA9PiB7XG4gICAgICBjb25zdCBuYW1lID0gdHMuU3ludGF4S2luZFtub2RlLmtpbmRdXG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJlbmRlckxpdGVyYWxGaWVsZCA9IChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIilcbiAgICAgIGxpLmlubmVySFRNTCA9IGAke2tleX06ICR7dmFsdWV9YFxuICAgICAgcmV0dXJuIGxpXG4gICAgfVxuXG4gICAgY29uc3QgcmVuZGVyU2luZ2xlQ2hpbGQgPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBOb2RlKSA9PiB7XG4gICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKVxuICAgICAgbGkuaW5uZXJIVE1MID0gYCR7a2V5fTogPHN0cm9uZz4ke3RzLlN5bnRheEtpbmRbdmFsdWUua2luZF19PC9zdHJvbmc+YFxuICAgICAgcmV0dXJuIGxpXG4gICAgfVxuXG4gICAgY29uc3QgcmVuZGVyTWFueUNoaWxkcmVuID0gKGtleTogc3RyaW5nLCB2YWx1ZTogTm9kZVtdKSA9PiB7XG4gICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKVxuICAgICAgY29uc3Qgbm9kZXMgPSB2YWx1ZS5tYXAobiA9PiBcIjxzdHJvbmc+Jm5ic3A7Jm5ic3A7XCIgKyB0cy5TeW50YXhLaW5kW24ua2luZF0gKyBcIjxzdHJvbmc+XCIpLmpvaW4oXCI8YnIvPlwiKVxuICAgICAgbGkuaW5uZXJIVE1MID0gYCR7a2V5fTogWzxici8+JHtub2Rlc308L2JyPl1gXG4gICAgICByZXR1cm4gbGlcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJJdGVtID0gKHBhcmVudEVsZW1lbnQ6IEVsZW1lbnQsIG5vZGU6IE5vZGUpID0+IHtcbiAgICAgIGNvbnN0IHVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInVsXCIpXG4gICAgICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHVsKVxuICAgICAgdWwuY2xhc3NOYW1lID0gXCJhc3QtdHJlZVwiXG5cbiAgICAgIGNvbnN0IGluZm8gPSBpbmZvRm9yTm9kZShub2RlKVxuXG4gICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKVxuICAgICAgdWwuYXBwZW5kQ2hpbGQobGkpXG5cbiAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgYS50ZXh0Q29udGVudCA9IGluZm8ubmFtZVxuICAgICAgbGkuYXBwZW5kQ2hpbGQoYSlcblxuICAgICAgY29uc3QgcHJvcGVydGllcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiKVxuICAgICAgcHJvcGVydGllcy5jbGFzc05hbWUgPSBcImFzdC10cmVlXCJcbiAgICAgIGxpLmFwcGVuZENoaWxkKHByb3BlcnRpZXMpXG5cbiAgICAgIE9iamVjdC5rZXlzKG5vZGUpLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGZpZWxkID09PSBcImZ1bmN0aW9uXCIpIHJldHVyblxuICAgICAgICBpZiAoZmllbGQgPT09IFwicGFyZW50XCIgfHwgZmllbGQgPT09IFwiZmxvd05vZGVcIikgcmV0dXJuXG5cbiAgICAgICAgY29uc3QgdmFsdWUgPSAobm9kZSBhcyBhbnkpW2ZpZWxkXVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIEFycmF5LmlzQXJyYXkodmFsdWUpICYmIFwicG9zXCIgaW4gdmFsdWVbMF0gJiYgXCJlbmRcIiBpbiB2YWx1ZVswXSkge1xuICAgICAgICAgIC8vICBJcyBhbiBhcnJheSBvZiBOb2Rlc1xuICAgICAgICAgIHByb3BlcnRpZXMuYXBwZW5kQ2hpbGQocmVuZGVyTWFueUNoaWxkcmVuKGZpZWxkLCB2YWx1ZSkpXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIFwicG9zXCIgaW4gdmFsdWUgJiYgXCJlbmRcIiBpbiB2YWx1ZSkge1xuICAgICAgICAgIC8vIElzIGEgc2luZ2xlIGNoaWxkIHByb3BlcnR5XG4gICAgICAgICAgcHJvcGVydGllcy5hcHBlbmRDaGlsZChyZW5kZXJTaW5nbGVDaGlsZChmaWVsZCwgdmFsdWUpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb3BlcnRpZXMuYXBwZW5kQ2hpbGQocmVuZGVyTGl0ZXJhbEZpZWxkKGZpZWxkLCB2YWx1ZSkpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmVuZGVySXRlbShkaXYsIG5vZGUpXG4gICAgcmV0dXJuIGRpdlxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvKiogVXNlIHRoaXMgdG8gbWFrZSBhIGZldyBkdW1iIGVsZW1lbnQgZ2VuZXJhdGlvbiBmdW5jcyAqL1xuICAgIGVsLFxuICAgIC8qKiBHZXQgYSByZWxhdGl2ZSBVUkwgZm9yIHNvbWV0aGluZyBpbiB5b3VyIGRpc3QgZm9sZGVyIGRlcGVuZGluZyBvbiBpZiB5b3UncmUgaW4gZGV2IG1vZGUgb3Igbm90ICovXG4gICAgcmVxdWlyZVVSTCxcbiAgICAvKiogUmV0dXJucyBhIGRpdiB3aGljaCBoYXMgYW4gaW50ZXJhY3RpdmUgQVNUIGEgVHlwZVNjcmlwdCBBU1QgYnkgcGFzc2luZyBpbiB0aGUgcm9vdCBub2RlICovXG4gICAgY3JlYXRlQVNUVHJlZSxcbiAgICAvKiogVGhlIEdhdHNieSBjb3B5IG9mIFJlYWN0ICovXG4gICAgcmVhY3QsXG4gICAgLyoqXG4gICAgICogVGhlIHBsYXlncm91bmQgcGx1Z2luIGRlc2lnbiBzeXN0ZW0uIENhbGxpbmcgYW55IG9mIHRoZSBmdW5jdGlvbnMgd2lsbCBhcHBlbmQgdGhlXG4gICAgICogZWxlbWVudCB0byB0aGUgY29udGFpbmVyIHlvdSBwYXNzIGludG8gdGhlIGZpcnN0IHBhcmFtLCBhbmQgcmV0dXJuIHRoZSBIVE1MRWxlbWVudFxuICAgICAqL1xuICAgIGNyZWF0ZURlc2lnblN5c3RlbSxcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBQbHVnaW5VdGlscyA9IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVV0aWxzPlxuIl19