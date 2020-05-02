define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const booleanConfigRegexp = /^\/\/\s?@(\w+)$/;
    // https://regex101.com/r/8B2Wwh/1
    const valuedConfigRegexp = /^\/\/\s?@(\w+):\s?(.+)$/;
    /**
     * This is a port of the twoslash bit which grabs compiler options
     * from the source code
     */
    exports.extractTwoSlashComplierOptions = (ts) => (code) => {
        const codeLines = code.split('\n');
        const options = {};
        codeLines.forEach((line) => {
            let match;
            if ((match = booleanConfigRegexp.exec(line))) {
                options[match[1]] = true;
                setOption(match[1], 'true', options, ts);
            }
            else if ((match = valuedConfigRegexp.exec(line))) {
                setOption(match[1], match[2], options, ts);
            }
        });
        return options;
    };
    function setOption(name, value, opts, ts) {
        // @ts-ignore - optionDeclarations is not public API
        for (const opt of ts.optionDeclarations) {
            if (opt.name.toLowerCase() === name.toLowerCase()) {
                switch (opt.type) {
                    case 'number':
                    case 'string':
                    case 'boolean':
                        opts[opt.name] = parsePrimitive(value, opt.type);
                        break;
                    case 'list':
                        opts[opt.name] = value.split(',').map((v) => parsePrimitive(v, opt.element.type));
                        break;
                    default:
                        opts[opt.name] = opt.type.get(value.toLowerCase());
                        if (opts[opt.name] === undefined) {
                            const keys = Array.from(opt.type.keys());
                            throw new Error(`Invalid value ${value} for ${opt.name}. Allowed values: ${keys.join(',')}`);
                        }
                        break;
                }
                return;
            }
        }
        // Skip the note of errors
        if (name !== 'errors') {
            throw new Error(`No compiler setting named '${name}' exists!`);
        }
    }
    function parsePrimitive(value, type) {
        switch (type) {
            case 'number':
                return +value;
            case 'string':
                return value;
            case 'boolean':
                return value.toLowerCase() === 'true' || value.length === 0;
        }
        console.log(`Unknown primitive type ${type} with - ${value}`);
    }
    exports.parsePrimitive = parsePrimitive;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHdvc2xhc2hTdXBwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc2FuZGJveC9zcmMvdHdvc2xhc2hTdXBwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUFBLE1BQU0sbUJBQW1CLEdBQUcsaUJBQWlCLENBQUE7SUFFN0Msa0NBQWtDO0lBQ2xDLE1BQU0sa0JBQWtCLEdBQUcseUJBQXlCLENBQUE7SUFNcEQ7OztPQUdHO0lBRVUsUUFBQSw4QkFBOEIsR0FBRyxDQUFDLEVBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRTtRQUN6RSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2xDLE1BQU0sT0FBTyxHQUFHLEVBQVMsQ0FBQTtRQUV6QixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDekIsSUFBSSxLQUFLLENBQUE7WUFDVCxJQUFJLENBQUMsS0FBSyxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUM1QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO2dCQUN4QixTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUE7YUFDekM7aUJBQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDbEQsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBO2FBQzNDO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDRixPQUFPLE9BQU8sQ0FBQTtJQUNoQixDQUFDLENBQUE7SUFFRCxTQUFTLFNBQVMsQ0FBQyxJQUFZLEVBQUUsS0FBYSxFQUFFLElBQXFCLEVBQUUsRUFBTTtRQUMzRSxvREFBb0Q7UUFDcEQsS0FBSyxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsa0JBQWtCLEVBQUU7WUFDdkMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDakQsUUFBUSxHQUFHLENBQUMsSUFBSSxFQUFFO29CQUNoQixLQUFLLFFBQVEsQ0FBQztvQkFDZCxLQUFLLFFBQVEsQ0FBQztvQkFDZCxLQUFLLFNBQVM7d0JBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTt3QkFDaEQsTUFBSztvQkFFUCxLQUFLLE1BQU07d0JBQ1QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsT0FBUSxDQUFDLElBQWMsQ0FBQyxDQUFDLENBQUE7d0JBQzVGLE1BQUs7b0JBRVA7d0JBQ0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTt3QkFFbEQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTs0QkFDaEMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBUyxDQUFDLENBQUE7NEJBQy9DLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLEtBQUssUUFBUSxHQUFHLENBQUMsSUFBSSxxQkFBcUIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7eUJBQzdGO3dCQUNELE1BQUs7aUJBQ1I7Z0JBQ0QsT0FBTTthQUNQO1NBQ0Y7UUFFRCwwQkFBMEI7UUFDMUIsSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLElBQUksV0FBVyxDQUFDLENBQUE7U0FDL0Q7SUFDSCxDQUFDO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLEtBQWEsRUFBRSxJQUFZO1FBQ3hELFFBQVEsSUFBSSxFQUFFO1lBQ1osS0FBSyxRQUFRO2dCQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUE7WUFDZixLQUFLLFFBQVE7Z0JBQ1gsT0FBTyxLQUFLLENBQUE7WUFDZCxLQUFLLFNBQVM7Z0JBQ1osT0FBTyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFBO1NBQzlEO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsSUFBSSxXQUFXLEtBQUssRUFBRSxDQUFDLENBQUE7SUFDL0QsQ0FBQztJQVZELHdDQVVDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgYm9vbGVhbkNvbmZpZ1JlZ2V4cCA9IC9eXFwvXFwvXFxzP0AoXFx3KykkL1xuXG4vLyBodHRwczovL3JlZ2V4MTAxLmNvbS9yLzhCMld3aC8xXG5jb25zdCB2YWx1ZWRDb25maWdSZWdleHAgPSAvXlxcL1xcL1xccz9AKFxcdyspOlxccz8oLispJC9cblxudHlwZSBTYW5kYm94ID0gUmV0dXJuVHlwZTx0eXBlb2YgaW1wb3J0KCcuJykuY3JlYXRlVHlwZVNjcmlwdFNhbmRib3g+XG50eXBlIFRTID0gdHlwZW9mIGltcG9ydCgndHlwZXNjcmlwdCcpXG50eXBlIENvbXBpbGVyT3B0aW9ucyA9IGltcG9ydCgndHlwZXNjcmlwdCcpLkNvbXBpbGVyT3B0aW9uc1xuXG4vKipcbiAqIFRoaXMgaXMgYSBwb3J0IG9mIHRoZSB0d29zbGFzaCBiaXQgd2hpY2ggZ3JhYnMgY29tcGlsZXIgb3B0aW9uc1xuICogZnJvbSB0aGUgc291cmNlIGNvZGVcbiAqL1xuXG5leHBvcnQgY29uc3QgZXh0cmFjdFR3b1NsYXNoQ29tcGxpZXJPcHRpb25zID0gKHRzOiBUUykgPT4gKGNvZGU6IHN0cmluZykgPT4ge1xuICBjb25zdCBjb2RlTGluZXMgPSBjb2RlLnNwbGl0KCdcXG4nKVxuICBjb25zdCBvcHRpb25zID0ge30gYXMgYW55XG5cbiAgY29kZUxpbmVzLmZvckVhY2goKGxpbmUpID0+IHtcbiAgICBsZXQgbWF0Y2hcbiAgICBpZiAoKG1hdGNoID0gYm9vbGVhbkNvbmZpZ1JlZ2V4cC5leGVjKGxpbmUpKSkge1xuICAgICAgb3B0aW9uc1ttYXRjaFsxXV0gPSB0cnVlXG4gICAgICBzZXRPcHRpb24obWF0Y2hbMV0sICd0cnVlJywgb3B0aW9ucywgdHMpXG4gICAgfSBlbHNlIGlmICgobWF0Y2ggPSB2YWx1ZWRDb25maWdSZWdleHAuZXhlYyhsaW5lKSkpIHtcbiAgICAgIHNldE9wdGlvbihtYXRjaFsxXSwgbWF0Y2hbMl0sIG9wdGlvbnMsIHRzKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG9wdGlvbnNcbn1cblxuZnVuY3Rpb24gc2V0T3B0aW9uKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0czogQ29tcGlsZXJPcHRpb25zLCB0czogVFMpIHtcbiAgLy8gQHRzLWlnbm9yZSAtIG9wdGlvbkRlY2xhcmF0aW9ucyBpcyBub3QgcHVibGljIEFQSVxuICBmb3IgKGNvbnN0IG9wdCBvZiB0cy5vcHRpb25EZWNsYXJhdGlvbnMpIHtcbiAgICBpZiAob3B0Lm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBzd2l0Y2ggKG9wdC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgIG9wdHNbb3B0Lm5hbWVdID0gcGFyc2VQcmltaXRpdmUodmFsdWUsIG9wdC50eXBlKVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSAnbGlzdCc6XG4gICAgICAgICAgb3B0c1tvcHQubmFtZV0gPSB2YWx1ZS5zcGxpdCgnLCcpLm1hcCgodikgPT4gcGFyc2VQcmltaXRpdmUodiwgb3B0LmVsZW1lbnQhLnR5cGUgYXMgc3RyaW5nKSlcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgb3B0c1tvcHQubmFtZV0gPSBvcHQudHlwZS5nZXQodmFsdWUudG9Mb3dlckNhc2UoKSlcblxuICAgICAgICAgIGlmIChvcHRzW29wdC5uYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBrZXlzID0gQXJyYXkuZnJvbShvcHQudHlwZS5rZXlzKCkgYXMgYW55KVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZhbHVlICR7dmFsdWV9IGZvciAke29wdC5uYW1lfS4gQWxsb3dlZCB2YWx1ZXM6ICR7a2V5cy5qb2luKCcsJyl9YClcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIC8vIFNraXAgdGhlIG5vdGUgb2YgZXJyb3JzXG4gIGlmIChuYW1lICE9PSAnZXJyb3JzJykge1xuICAgIHRocm93IG5ldyBFcnJvcihgTm8gY29tcGlsZXIgc2V0dGluZyBuYW1lZCAnJHtuYW1lfScgZXhpc3RzIWApXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUHJpbWl0aXZlKHZhbHVlOiBzdHJpbmcsIHR5cGU6IHN0cmluZyk6IGFueSB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gK3ZhbHVlXG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICd0cnVlJyB8fCB2YWx1ZS5sZW5ndGggPT09IDBcbiAgfVxuICBjb25zb2xlLmxvZyhgVW5rbm93biBwcmltaXRpdmUgdHlwZSAke3R5cGV9IHdpdGggLSAke3ZhbHVlfWApXG59XG4iXX0=