define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.twoslashCompletions = exports.parsePrimitive = exports.extractTwoSlashComplierOptions = void 0;
    const booleanConfigRegexp = /^\/\/\s?@(\w+)$/;
    // https://regex101.com/r/8B2Wwh/1
    const valuedConfigRegexp = /^\/\/\s?@(\w+):\s?(.+)$/;
    /**
     * This is a port of the twoslash bit which grabs compiler options
     * from the source code
     */
    const extractTwoSlashComplierOptions = (ts) => {
        let optMap = new Map();
        // @ts-ignore - optionDeclarations is not public API
        for (const opt of ts.optionDeclarations) {
            optMap.set(opt.name.toLowerCase(), opt);
        }
        return (code) => {
            const codeLines = code.split("\n");
            const options = {};
            codeLines.forEach(line => {
                let match;
                if ((match = booleanConfigRegexp.exec(line))) {
                    if (optMap.has(match[1].toLowerCase())) {
                        options[match[1]] = true;
                        setOption(match[1], "true", options, optMap);
                    }
                }
                else if ((match = valuedConfigRegexp.exec(line))) {
                    if (optMap.has(match[1].toLowerCase())) {
                        setOption(match[1], match[2], options, optMap);
                    }
                }
            });
            return options;
        };
    };
    exports.extractTwoSlashComplierOptions = extractTwoSlashComplierOptions;
    function setOption(name, value, opts, optMap) {
        const opt = optMap.get(name.toLowerCase());
        if (!opt)
            return;
        switch (opt.type) {
            case "number":
            case "string":
            case "boolean":
                opts[opt.name] = parsePrimitive(value, opt.type);
                break;
            case "list":
                opts[opt.name] = value.split(",").map(v => parsePrimitive(v, opt.element.type));
                break;
            default:
                opts[opt.name] = opt.type.get(value.toLowerCase());
                if (opts[opt.name] === undefined) {
                    const keys = Array.from(opt.type.keys());
                    console.log(`Invalid value ${value} for ${opt.name}. Allowed values: ${keys.join(",")}`);
                }
        }
    }
    function parsePrimitive(value, type) {
        switch (type) {
            case "number":
                return +value;
            case "string":
                return value;
            case "boolean":
                return value.toLowerCase() === "true" || value.length === 0;
        }
        console.log(`Unknown primitive type ${type} with - ${value}`);
    }
    exports.parsePrimitive = parsePrimitive;
    // Function to generate autocompletion results
    const twoslashCompletions = (ts, monaco) => (model, position, _token) => {
        const result = [];
        // Split everything the user has typed on the current line up at each space, and only look at the last word
        const thisLine = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 0,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
        });
        // Not a comment
        if (!thisLine.startsWith("//")) {
            return { suggestions: [] };
        }
        const words = thisLine.replace("\t", "").split(" ");
        // Not the right amount of
        if (words.length !== 2) {
            return { suggestions: [] };
        }
        const word = words[1];
        if (!word.startsWith("-")) {
            return {
                suggestions: [
                    {
                        label: "---cut---",
                        kind: 14,
                        detail: "Twoslash split output",
                        insertText: "---cut---",
                    },
                ],
            };
        }
        // Not a @ at the first word
        if (!word.startsWith("@")) {
            return { suggestions: [] };
        }
        const knowns = [
            "noErrors",
            "errors",
            "showEmit",
            "showEmittedFile",
            "noStaticSemanticInfo",
            "emit",
            "noErrorValidation",
            "filename",
        ];
        // @ts-ignore - ts.optionDeclarations is private
        const optsNames = ts.optionDeclarations.map(o => o.name);
        knowns.concat(optsNames).forEach(name => {
            if (name.startsWith(word.slice(1))) {
                // somehow adding the range seems to not give autocomplete results?
                result.push({
                    label: name,
                    kind: 14,
                    detail: "Twoslash comment",
                    insertText: name,
                });
            }
        });
        return {
            suggestions: result,
        };
    };
    exports.twoslashCompletions = twoslashCompletions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdvc2xhc2hTdXBwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc2FuZGJveC9zcmMvdHdvc2xhc2hTdXBwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFBQSxNQUFNLG1CQUFtQixHQUFHLGlCQUFpQixDQUFBO0lBRTdDLGtDQUFrQztJQUNsQyxNQUFNLGtCQUFrQixHQUFHLHlCQUF5QixDQUFBO0lBS3BEOzs7T0FHRztJQUVJLE1BQU0sOEJBQThCLEdBQUcsQ0FBQyxFQUFNLEVBQUUsRUFBRTtRQUN2RCxJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFBO1FBRW5DLG9EQUFvRDtRQUNwRCxLQUFLLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRTtZQUN2QyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7U0FDeEM7UUFFRCxPQUFPLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDdEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNsQyxNQUFNLE9BQU8sR0FBRyxFQUFTLENBQUE7WUFFekIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdkIsSUFBSSxLQUFLLENBQUE7Z0JBQ1QsSUFBSSxDQUFDLEtBQUssR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtvQkFDNUMsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFO3dCQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO3dCQUN4QixTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7cUJBQzdDO2lCQUNGO3FCQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQ2xELElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRTt3QkFDdEMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFBO3FCQUMvQztpQkFDRjtZQUNILENBQUMsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxPQUFPLENBQUE7UUFDaEIsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBM0JZLFFBQUEsOEJBQThCLGtDQTJCMUM7SUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZLEVBQUUsS0FBYSxFQUFFLElBQXFCLEVBQUUsTUFBd0I7UUFDN0YsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtRQUMxQyxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU07UUFDaEIsUUFBUSxHQUFHLENBQUMsSUFBSSxFQUFFO1lBQ2hCLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxRQUFRLENBQUM7WUFDZCxLQUFLLFNBQVM7Z0JBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDaEQsTUFBSztZQUVQLEtBQUssTUFBTTtnQkFDVCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsT0FBUSxDQUFDLElBQWMsQ0FBQyxDQUFDLENBQUE7Z0JBQzFGLE1BQUs7WUFFUDtnQkFDRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO2dCQUVsRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFO29CQUNoQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFTLENBQUMsQ0FBQTtvQkFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsS0FBSyxRQUFRLEdBQUcsQ0FBQyxJQUFJLHFCQUFxQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtpQkFDekY7U0FDSjtJQUNILENBQUM7SUFFRCxTQUFnQixjQUFjLENBQUMsS0FBYSxFQUFFLElBQVk7UUFDeEQsUUFBUSxJQUFJLEVBQUU7WUFDWixLQUFLLFFBQVE7Z0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQTtZQUNmLEtBQUssUUFBUTtnQkFDWCxPQUFPLEtBQUssQ0FBQTtZQUNkLEtBQUssU0FBUztnQkFDWixPQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUE7U0FDOUQ7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixJQUFJLFdBQVcsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUMvRCxDQUFDO0lBVkQsd0NBVUM7SUFFRCw4Q0FBOEM7SUFDdkMsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLEVBQU0sRUFBRSxNQUFzQyxFQUFFLEVBQUUsQ0FBQyxDQUNyRixLQUFnRCxFQUNoRCxRQUEwQyxFQUMxQyxNQUFXLEVBQ3VDLEVBQUU7UUFDcEQsTUFBTSxNQUFNLEdBQXVELEVBQUUsQ0FBQTtRQUVyRSwyR0FBMkc7UUFDM0csTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztZQUNyQyxlQUFlLEVBQUUsUUFBUSxDQUFDLFVBQVU7WUFDcEMsV0FBVyxFQUFFLENBQUM7WUFDZCxhQUFhLEVBQUUsUUFBUSxDQUFDLFVBQVU7WUFDbEMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxNQUFNO1NBQzNCLENBQUMsQ0FBQTtRQUVGLGdCQUFnQjtRQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5QixPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxDQUFBO1NBQzNCO1FBRUQsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBRW5ELDBCQUEwQjtRQUMxQixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLENBQUE7U0FDM0I7UUFFRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDekIsT0FBTztnQkFDTCxXQUFXLEVBQUU7b0JBQ1g7d0JBQ0UsS0FBSyxFQUFFLFdBQVc7d0JBQ2xCLElBQUksRUFBRSxFQUFFO3dCQUNSLE1BQU0sRUFBRSx1QkFBdUI7d0JBQy9CLFVBQVUsRUFBRSxXQUFXO3FCQUNqQjtpQkFDVDthQUNGLENBQUE7U0FDRjtRQUVELDRCQUE0QjtRQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN6QixPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxDQUFBO1NBQzNCO1FBRUQsTUFBTSxNQUFNLEdBQUc7WUFDYixVQUFVO1lBQ1YsUUFBUTtZQUNSLFVBQVU7WUFDVixpQkFBaUI7WUFDakIsc0JBQXNCO1lBQ3RCLE1BQU07WUFDTixtQkFBbUI7WUFDbkIsVUFBVTtTQUNYLENBQUE7UUFDRCxnREFBZ0Q7UUFDaEQsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN4RCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNsQyxtRUFBbUU7Z0JBQ25FLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ1YsS0FBSyxFQUFFLElBQUk7b0JBQ1gsSUFBSSxFQUFFLEVBQUU7b0JBQ1IsTUFBTSxFQUFFLGtCQUFrQjtvQkFDMUIsVUFBVSxFQUFFLElBQUk7aUJBQ1YsQ0FBQyxDQUFBO2FBQ1Y7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUVGLE9BQU87WUFDTCxXQUFXLEVBQUUsTUFBTTtTQUNwQixDQUFBO0lBQ0gsQ0FBQyxDQUFBO0lBekVZLFFBQUEsbUJBQW1CLHVCQXlFL0IiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBib29sZWFuQ29uZmlnUmVnZXhwID0gL15cXC9cXC9cXHM/QChcXHcrKSQvXG5cbi8vIGh0dHBzOi8vcmVnZXgxMDEuY29tL3IvOEIyV3doLzFcbmNvbnN0IHZhbHVlZENvbmZpZ1JlZ2V4cCA9IC9eXFwvXFwvXFxzP0AoXFx3Kyk6XFxzPyguKykkL1xuXG50eXBlIFRTID0gdHlwZW9mIGltcG9ydChcInR5cGVzY3JpcHRcIilcbnR5cGUgQ29tcGlsZXJPcHRpb25zID0gaW1wb3J0KFwidHlwZXNjcmlwdFwiKS5Db21waWxlck9wdGlvbnNcblxuLyoqXG4gKiBUaGlzIGlzIGEgcG9ydCBvZiB0aGUgdHdvc2xhc2ggYml0IHdoaWNoIGdyYWJzIGNvbXBpbGVyIG9wdGlvbnNcbiAqIGZyb20gdGhlIHNvdXJjZSBjb2RlXG4gKi9cblxuZXhwb3J0IGNvbnN0IGV4dHJhY3RUd29TbGFzaENvbXBsaWVyT3B0aW9ucyA9ICh0czogVFMpID0+IHtcbiAgbGV0IG9wdE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KClcblxuICAvLyBAdHMtaWdub3JlIC0gb3B0aW9uRGVjbGFyYXRpb25zIGlzIG5vdCBwdWJsaWMgQVBJXG4gIGZvciAoY29uc3Qgb3B0IG9mIHRzLm9wdGlvbkRlY2xhcmF0aW9ucykge1xuICAgIG9wdE1hcC5zZXQob3B0Lm5hbWUudG9Mb3dlckNhc2UoKSwgb3B0KVxuICB9XG5cbiAgcmV0dXJuIChjb2RlOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBjb2RlTGluZXMgPSBjb2RlLnNwbGl0KFwiXFxuXCIpXG4gICAgY29uc3Qgb3B0aW9ucyA9IHt9IGFzIGFueVxuXG4gICAgY29kZUxpbmVzLmZvckVhY2gobGluZSA9PiB7XG4gICAgICBsZXQgbWF0Y2hcbiAgICAgIGlmICgobWF0Y2ggPSBib29sZWFuQ29uZmlnUmVnZXhwLmV4ZWMobGluZSkpKSB7XG4gICAgICAgIGlmIChvcHRNYXAuaGFzKG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgb3B0aW9uc1ttYXRjaFsxXV0gPSB0cnVlXG4gICAgICAgICAgc2V0T3B0aW9uKG1hdGNoWzFdLCBcInRydWVcIiwgb3B0aW9ucywgb3B0TWFwKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKChtYXRjaCA9IHZhbHVlZENvbmZpZ1JlZ2V4cC5leGVjKGxpbmUpKSkge1xuICAgICAgICBpZiAob3B0TWFwLmhhcyhtYXRjaFsxXS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgIHNldE9wdGlvbihtYXRjaFsxXSwgbWF0Y2hbMl0sIG9wdGlvbnMsIG9wdE1hcClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRPcHRpb24obmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBvcHRzOiBDb21waWxlck9wdGlvbnMsIG9wdE1hcDogTWFwPHN0cmluZywgYW55Pikge1xuICBjb25zdCBvcHQgPSBvcHRNYXAuZ2V0KG5hbWUudG9Mb3dlckNhc2UoKSlcbiAgaWYgKCFvcHQpIHJldHVyblxuICBzd2l0Y2ggKG9wdC50eXBlKSB7XG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgb3B0c1tvcHQubmFtZV0gPSBwYXJzZVByaW1pdGl2ZSh2YWx1ZSwgb3B0LnR5cGUpXG4gICAgICBicmVha1xuXG4gICAgY2FzZSBcImxpc3RcIjpcbiAgICAgIG9wdHNbb3B0Lm5hbWVdID0gdmFsdWUuc3BsaXQoXCIsXCIpLm1hcCh2ID0+IHBhcnNlUHJpbWl0aXZlKHYsIG9wdC5lbGVtZW50IS50eXBlIGFzIHN0cmluZykpXG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIG9wdHNbb3B0Lm5hbWVdID0gb3B0LnR5cGUuZ2V0KHZhbHVlLnRvTG93ZXJDYXNlKCkpXG5cbiAgICAgIGlmIChvcHRzW29wdC5uYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBBcnJheS5mcm9tKG9wdC50eXBlLmtleXMoKSBhcyBhbnkpXG4gICAgICAgIGNvbnNvbGUubG9nKGBJbnZhbGlkIHZhbHVlICR7dmFsdWV9IGZvciAke29wdC5uYW1lfS4gQWxsb3dlZCB2YWx1ZXM6ICR7a2V5cy5qb2luKFwiLFwiKX1gKVxuICAgICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVByaW1pdGl2ZSh2YWx1ZTogc3RyaW5nLCB0eXBlOiBzdHJpbmcpOiBhbnkge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICByZXR1cm4gK3ZhbHVlXG4gICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBcInRydWVcIiB8fCB2YWx1ZS5sZW5ndGggPT09IDBcbiAgfVxuICBjb25zb2xlLmxvZyhgVW5rbm93biBwcmltaXRpdmUgdHlwZSAke3R5cGV9IHdpdGggLSAke3ZhbHVlfWApXG59XG5cbi8vIEZ1bmN0aW9uIHRvIGdlbmVyYXRlIGF1dG9jb21wbGV0aW9uIHJlc3VsdHNcbmV4cG9ydCBjb25zdCB0d29zbGFzaENvbXBsZXRpb25zID0gKHRzOiBUUywgbW9uYWNvOiB0eXBlb2YgaW1wb3J0KFwibW9uYWNvLWVkaXRvclwiKSkgPT4gKFxuICBtb2RlbDogaW1wb3J0KFwibW9uYWNvLWVkaXRvclwiKS5lZGl0b3IuSVRleHRNb2RlbCxcbiAgcG9zaXRpb246IGltcG9ydChcIm1vbmFjby1lZGl0b3JcIikuUG9zaXRpb24sXG4gIF90b2tlbjogYW55XG4pOiBpbXBvcnQoXCJtb25hY28tZWRpdG9yXCIpLmxhbmd1YWdlcy5Db21wbGV0aW9uTGlzdCA9PiB7XG4gIGNvbnN0IHJlc3VsdDogaW1wb3J0KFwibW9uYWNvLWVkaXRvclwiKS5sYW5ndWFnZXMuQ29tcGxldGlvbkl0ZW1bXSA9IFtdXG5cbiAgLy8gU3BsaXQgZXZlcnl0aGluZyB0aGUgdXNlciBoYXMgdHlwZWQgb24gdGhlIGN1cnJlbnQgbGluZSB1cCBhdCBlYWNoIHNwYWNlLCBhbmQgb25seSBsb29rIGF0IHRoZSBsYXN0IHdvcmRcbiAgY29uc3QgdGhpc0xpbmUgPSBtb2RlbC5nZXRWYWx1ZUluUmFuZ2Uoe1xuICAgIHN0YXJ0TGluZU51bWJlcjogcG9zaXRpb24ubGluZU51bWJlcixcbiAgICBzdGFydENvbHVtbjogMCxcbiAgICBlbmRMaW5lTnVtYmVyOiBwb3NpdGlvbi5saW5lTnVtYmVyLFxuICAgIGVuZENvbHVtbjogcG9zaXRpb24uY29sdW1uLFxuICB9KVxuXG4gIC8vIE5vdCBhIGNvbW1lbnRcbiAgaWYgKCF0aGlzTGluZS5zdGFydHNXaXRoKFwiLy9cIikpIHtcbiAgICByZXR1cm4geyBzdWdnZXN0aW9uczogW10gfVxuICB9XG5cbiAgY29uc3Qgd29yZHMgPSB0aGlzTGluZS5yZXBsYWNlKFwiXFx0XCIsIFwiXCIpLnNwbGl0KFwiIFwiKVxuXG4gIC8vIE5vdCB0aGUgcmlnaHQgYW1vdW50IG9mXG4gIGlmICh3b3Jkcy5sZW5ndGggIT09IDIpIHtcbiAgICByZXR1cm4geyBzdWdnZXN0aW9uczogW10gfVxuICB9XG5cbiAgY29uc3Qgd29yZCA9IHdvcmRzWzFdXG4gIGlmICghd29yZC5zdGFydHNXaXRoKFwiLVwiKSkge1xuICAgIHJldHVybiB7XG4gICAgICBzdWdnZXN0aW9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6IFwiLS0tY3V0LS0tXCIsXG4gICAgICAgICAga2luZDogMTQsXG4gICAgICAgICAgZGV0YWlsOiBcIlR3b3NsYXNoIHNwbGl0IG91dHB1dFwiLFxuICAgICAgICAgIGluc2VydFRleHQ6IFwiLS0tY3V0LS0tXCIsXG4gICAgICAgIH0gYXMgYW55LFxuICAgICAgXSxcbiAgICB9XG4gIH1cblxuICAvLyBOb3QgYSBAIGF0IHRoZSBmaXJzdCB3b3JkXG4gIGlmICghd29yZC5zdGFydHNXaXRoKFwiQFwiKSkge1xuICAgIHJldHVybiB7IHN1Z2dlc3Rpb25zOiBbXSB9XG4gIH1cblxuICBjb25zdCBrbm93bnMgPSBbXG4gICAgXCJub0Vycm9yc1wiLFxuICAgIFwiZXJyb3JzXCIsXG4gICAgXCJzaG93RW1pdFwiLFxuICAgIFwic2hvd0VtaXR0ZWRGaWxlXCIsXG4gICAgXCJub1N0YXRpY1NlbWFudGljSW5mb1wiLFxuICAgIFwiZW1pdFwiLFxuICAgIFwibm9FcnJvclZhbGlkYXRpb25cIixcbiAgICBcImZpbGVuYW1lXCIsXG4gIF1cbiAgLy8gQHRzLWlnbm9yZSAtIHRzLm9wdGlvbkRlY2xhcmF0aW9ucyBpcyBwcml2YXRlXG4gIGNvbnN0IG9wdHNOYW1lcyA9IHRzLm9wdGlvbkRlY2xhcmF0aW9ucy5tYXAobyA9PiBvLm5hbWUpXG4gIGtub3ducy5jb25jYXQob3B0c05hbWVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgod29yZC5zbGljZSgxKSkpIHtcbiAgICAgIC8vIHNvbWVob3cgYWRkaW5nIHRoZSByYW5nZSBzZWVtcyB0byBub3QgZ2l2ZSBhdXRvY29tcGxldGUgcmVzdWx0cz9cbiAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgbGFiZWw6IG5hbWUsXG4gICAgICAgIGtpbmQ6IDE0LFxuICAgICAgICBkZXRhaWw6IFwiVHdvc2xhc2ggY29tbWVudFwiLFxuICAgICAgICBpbnNlcnRUZXh0OiBuYW1lLFxuICAgICAgfSBhcyBhbnkpXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiB7XG4gICAgc3VnZ2VzdGlvbnM6IHJlc3VsdCxcbiAgfVxufVxuIl19