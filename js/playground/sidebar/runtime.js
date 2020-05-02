define(["require", "exports", "../localizeWithFallback"], function (require, exports, localizeWithFallback_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let allLogs = "";
    exports.runPlugin = (i, utils) => {
        const plugin = {
            id: "logs",
            displayName: i("play_sidebar_logs"),
            willMount: (sandbox, container) => {
                if (allLogs.length === 0) {
                    const noErrorsMessage = document.createElement("div");
                    noErrorsMessage.id = "empty-message-container";
                    container.appendChild(noErrorsMessage);
                    const message = document.createElement("div");
                    message.textContent = localizeWithFallback_1.localize("play_sidebar_logs_no_logs", "No logs");
                    message.classList.add("empty-plugin-message");
                    noErrorsMessage.appendChild(message);
                }
                const errorUL = document.createElement("div");
                errorUL.id = "log-container";
                container.appendChild(errorUL);
                const logs = document.createElement("div");
                logs.id = "log";
                logs.innerHTML = allLogs;
                errorUL.appendChild(logs);
            },
        };
        return plugin;
    };
    exports.runWithCustomLogs = (closure, i) => {
        const noLogs = document.getElementById("empty-message-container");
        if (noLogs) {
            noLogs.style.display = "none";
        }
        rewireLoggingToElement(() => document.getElementById("log"), () => document.getElementById("log-container"), closure, true, i);
    };
    // Thanks SO: https://stackoverflow.com/questions/20256760/javascript-console-log-to-html/35449256#35449256
    function rewireLoggingToElement(eleLocator, eleOverflowLocator, closure, autoScroll, i) {
        fixLoggingFunc("log", "LOG");
        fixLoggingFunc("debug", "DBG");
        fixLoggingFunc("warn", "WRN");
        fixLoggingFunc("error", "ERR");
        fixLoggingFunc("info", "INF");
        closure.then(js => {
            try {
                eval(js);
            }
            catch (error) {
                console.error(i("play_run_js_fail"));
                console.error(error);
            }
            allLogs = allLogs + "<hr />";
            undoLoggingFunc("log");
            undoLoggingFunc("debug");
            undoLoggingFunc("warn");
            undoLoggingFunc("error");
            undoLoggingFunc("info");
        });
        function undoLoggingFunc(name) {
            // @ts-ignore
            console[name] = console["old" + name];
        }
        function fixLoggingFunc(name, id) {
            // @ts-ignore
            console["old" + name] = console[name];
            // @ts-ignore
            console[name] = function (...objs) {
                const output = produceOutput(objs);
                const eleLog = eleLocator();
                const prefix = '[<span class="log-' + name + '">' + id + "</span>]: ";
                const eleContainerLog = eleOverflowLocator();
                allLogs = allLogs + prefix + output + "<br>";
                if (eleLog && eleContainerLog) {
                    if (autoScroll) {
                        const atBottom = eleContainerLog.scrollHeight - eleContainerLog.clientHeight <= eleContainerLog.scrollTop + 1;
                        eleLog.innerHTML = allLogs;
                        if (atBottom)
                            eleContainerLog.scrollTop = eleContainerLog.scrollHeight - eleContainerLog.clientHeight;
                    }
                    else {
                        eleLog.innerHTML = allLogs;
                    }
                }
                // @ts-ignore
                console["old" + name].apply(undefined, objs);
            };
        }
        function produceOutput(args) {
            return args.reduce((output, arg, index) => {
                const isObj = typeof arg === "object";
                let textRep = "";
                if (arg && arg.stack && arg.message) {
                    // special case for err
                    textRep = arg.message;
                }
                else if (isObj) {
                    textRep = JSON.stringify(arg, null, 2);
                }
                else {
                    textRep = arg;
                }
                const showComma = index !== args.length - 1;
                const comma = showComma ? "<span class='comma'>, </span>" : "";
                return output + textRep + comma + "&nbsp;";
            }, "");
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvcnVudGltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFHQSxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFFSCxRQUFBLFNBQVMsR0FBa0IsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDbkQsTUFBTSxNQUFNLEdBQXFCO1lBQy9CLEVBQUUsRUFBRSxNQUFNO1lBQ1YsV0FBVyxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztZQUNuQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3hCLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ3JELGVBQWUsQ0FBQyxFQUFFLEdBQUcseUJBQXlCLENBQUE7b0JBQzlDLFNBQVMsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUE7b0JBRXRDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQzdDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsK0JBQVEsQ0FBQywyQkFBMkIsRUFBRSxTQUFTLENBQUMsQ0FBQTtvQkFDdEUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtvQkFDN0MsZUFBZSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtpQkFDckM7Z0JBRUQsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDN0MsT0FBTyxDQUFDLEVBQUUsR0FBRyxlQUFlLENBQUE7Z0JBQzVCLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7Z0JBRTlCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQzFDLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFBO2dCQUNmLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFBO2dCQUN4QixPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQzNCLENBQUM7U0FDRixDQUFBO1FBRUQsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDLENBQUE7SUFFWSxRQUFBLGlCQUFpQixHQUFHLENBQUMsT0FBd0IsRUFBRSxDQUFXLEVBQUUsRUFBRTtRQUN6RSxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLHlCQUF5QixDQUFDLENBQUE7UUFDakUsSUFBSSxNQUFNLEVBQUU7WUFDVixNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUE7U0FDOUI7UUFFRCxzQkFBc0IsQ0FDcEIsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUUsRUFDckMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUUsRUFDL0MsT0FBTyxFQUNQLElBQUksRUFDSixDQUFDLENBQ0YsQ0FBQTtJQUNILENBQUMsQ0FBQTtJQUVELDJHQUEyRztJQUUzRyxTQUFTLHNCQUFzQixDQUM3QixVQUF5QixFQUN6QixrQkFBaUMsRUFDakMsT0FBd0IsRUFDeEIsVUFBbUIsRUFDbkIsQ0FBVztRQUVYLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDNUIsY0FBYyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM5QixjQUFjLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQzdCLGNBQWMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDOUIsY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUU3QixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2hCLElBQUk7Z0JBQ0YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2FBQ1Q7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUE7Z0JBQ3BDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDckI7WUFFRCxPQUFPLEdBQUcsT0FBTyxHQUFHLFFBQVEsQ0FBQTtZQUU1QixlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdEIsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ3hCLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUN2QixlQUFlLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDeEIsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3pCLENBQUMsQ0FBQyxDQUFBO1FBRUYsU0FBUyxlQUFlLENBQUMsSUFBWTtZQUNuQyxhQUFhO1lBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDdkMsQ0FBQztRQUVELFNBQVMsY0FBYyxDQUFDLElBQVksRUFBRSxFQUFVO1lBQzlDLGFBQWE7WUFDYixPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNyQyxhQUFhO1lBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsR0FBRyxJQUFXO2dCQUN0QyxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ2xDLE1BQU0sTUFBTSxHQUFHLFVBQVUsRUFBRSxDQUFBO2dCQUMzQixNQUFNLE1BQU0sR0FBRyxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxZQUFZLENBQUE7Z0JBQ3JFLE1BQU0sZUFBZSxHQUFHLGtCQUFrQixFQUFFLENBQUE7Z0JBQzVDLE9BQU8sR0FBRyxPQUFPLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUE7Z0JBRTVDLElBQUksTUFBTSxJQUFJLGVBQWUsRUFBRTtvQkFDN0IsSUFBSSxVQUFVLEVBQUU7d0JBQ2QsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLFlBQVksR0FBRyxlQUFlLENBQUMsWUFBWSxJQUFJLGVBQWUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFBO3dCQUM3RyxNQUFNLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQTt3QkFFMUIsSUFBSSxRQUFROzRCQUFFLGVBQWUsQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLFlBQVksR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFBO3FCQUN0Rzt5QkFBTTt3QkFDTCxNQUFNLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQTtxQkFDM0I7aUJBQ0Y7Z0JBRUQsYUFBYTtnQkFDYixPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUE7WUFDOUMsQ0FBQyxDQUFBO1FBQ0gsQ0FBQztRQUVELFNBQVMsYUFBYSxDQUFDLElBQVc7WUFDaEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBVyxFQUFFLEdBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDbEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFBO2dCQUNyQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7Z0JBQ2hCLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRTtvQkFDbkMsdUJBQXVCO29CQUN2QixPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQTtpQkFDdEI7cUJBQU0sSUFBSSxLQUFLLEVBQUU7b0JBQ2hCLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7aUJBQ3ZDO3FCQUFNO29CQUNMLE9BQU8sR0FBRyxHQUFVLENBQUE7aUJBQ3JCO2dCQUVELE1BQU0sU0FBUyxHQUFHLEtBQUssS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtnQkFDM0MsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO2dCQUM5RCxPQUFPLE1BQU0sR0FBRyxPQUFPLEdBQUcsS0FBSyxHQUFHLFFBQVEsQ0FBQTtZQUM1QyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDUixDQUFDO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXlncm91bmRQbHVnaW4sIFBsdWdpbkZhY3RvcnkgfSBmcm9tIFwiLi5cIlxuaW1wb3J0IHsgbG9jYWxpemUgfSBmcm9tIFwiLi4vbG9jYWxpemVXaXRoRmFsbGJhY2tcIlxuXG5sZXQgYWxsTG9ncyA9IFwiXCJcblxuZXhwb3J0IGNvbnN0IHJ1blBsdWdpbjogUGx1Z2luRmFjdG9yeSA9IChpLCB1dGlscykgPT4ge1xuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6IFwibG9nc1wiLFxuICAgIGRpc3BsYXlOYW1lOiBpKFwicGxheV9zaWRlYmFyX2xvZ3NcIiksXG4gICAgd2lsbE1vdW50OiAoc2FuZGJveCwgY29udGFpbmVyKSA9PiB7XG4gICAgICBpZiAoYWxsTG9ncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY29uc3Qgbm9FcnJvcnNNZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICBub0Vycm9yc01lc3NhZ2UuaWQgPSBcImVtcHR5LW1lc3NhZ2UtY29udGFpbmVyXCJcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vRXJyb3JzTWVzc2FnZSlcblxuICAgICAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gbG9jYWxpemUoXCJwbGF5X3NpZGViYXJfbG9nc19ub19sb2dzXCIsIFwiTm8gbG9nc1wiKVxuICAgICAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoXCJlbXB0eS1wbHVnaW4tbWVzc2FnZVwiKVxuICAgICAgICBub0Vycm9yc01lc3NhZ2UuYXBwZW5kQ2hpbGQobWVzc2FnZSlcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXJyb3JVTCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICAgIGVycm9yVUwuaWQgPSBcImxvZy1jb250YWluZXJcIlxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVycm9yVUwpXG5cbiAgICAgIGNvbnN0IGxvZ3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgICBsb2dzLmlkID0gXCJsb2dcIlxuICAgICAgbG9ncy5pbm5lckhUTUwgPSBhbGxMb2dzXG4gICAgICBlcnJvclVMLmFwcGVuZENoaWxkKGxvZ3MpXG4gICAgfSxcbiAgfVxuXG4gIHJldHVybiBwbHVnaW5cbn1cblxuZXhwb3J0IGNvbnN0IHJ1bldpdGhDdXN0b21Mb2dzID0gKGNsb3N1cmU6IFByb21pc2U8c3RyaW5nPiwgaTogRnVuY3Rpb24pID0+IHtcbiAgY29uc3Qgbm9Mb2dzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbXB0eS1tZXNzYWdlLWNvbnRhaW5lclwiKVxuICBpZiAobm9Mb2dzKSB7XG4gICAgbm9Mb2dzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICB9XG5cbiAgcmV3aXJlTG9nZ2luZ1RvRWxlbWVudChcbiAgICAoKSA9PiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvZ1wiKSEsXG4gICAgKCkgPT4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2ctY29udGFpbmVyXCIpISxcbiAgICBjbG9zdXJlLFxuICAgIHRydWUsXG4gICAgaVxuICApXG59XG5cbi8vIFRoYW5rcyBTTzogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjAyNTY3NjAvamF2YXNjcmlwdC1jb25zb2xlLWxvZy10by1odG1sLzM1NDQ5MjU2IzM1NDQ5MjU2XG5cbmZ1bmN0aW9uIHJld2lyZUxvZ2dpbmdUb0VsZW1lbnQoXG4gIGVsZUxvY2F0b3I6ICgpID0+IEVsZW1lbnQsXG4gIGVsZU92ZXJmbG93TG9jYXRvcjogKCkgPT4gRWxlbWVudCxcbiAgY2xvc3VyZTogUHJvbWlzZTxzdHJpbmc+LFxuICBhdXRvU2Nyb2xsOiBib29sZWFuLFxuICBpOiBGdW5jdGlvblxuKSB7XG4gIGZpeExvZ2dpbmdGdW5jKFwibG9nXCIsIFwiTE9HXCIpXG4gIGZpeExvZ2dpbmdGdW5jKFwiZGVidWdcIiwgXCJEQkdcIilcbiAgZml4TG9nZ2luZ0Z1bmMoXCJ3YXJuXCIsIFwiV1JOXCIpXG4gIGZpeExvZ2dpbmdGdW5jKFwiZXJyb3JcIiwgXCJFUlJcIilcbiAgZml4TG9nZ2luZ0Z1bmMoXCJpbmZvXCIsIFwiSU5GXCIpXG5cbiAgY2xvc3VyZS50aGVuKGpzID0+IHtcbiAgICB0cnkge1xuICAgICAgZXZhbChqcylcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihpKFwicGxheV9ydW5fanNfZmFpbFwiKSlcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgfVxuXG4gICAgYWxsTG9ncyA9IGFsbExvZ3MgKyBcIjxociAvPlwiXG5cbiAgICB1bmRvTG9nZ2luZ0Z1bmMoXCJsb2dcIilcbiAgICB1bmRvTG9nZ2luZ0Z1bmMoXCJkZWJ1Z1wiKVxuICAgIHVuZG9Mb2dnaW5nRnVuYyhcIndhcm5cIilcbiAgICB1bmRvTG9nZ2luZ0Z1bmMoXCJlcnJvclwiKVxuICAgIHVuZG9Mb2dnaW5nRnVuYyhcImluZm9cIilcbiAgfSlcblxuICBmdW5jdGlvbiB1bmRvTG9nZ2luZ0Z1bmMobmFtZTogc3RyaW5nKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnNvbGVbbmFtZV0gPSBjb25zb2xlW1wib2xkXCIgKyBuYW1lXVxuICB9XG5cbiAgZnVuY3Rpb24gZml4TG9nZ2luZ0Z1bmMobmFtZTogc3RyaW5nLCBpZDogc3RyaW5nKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnNvbGVbXCJvbGRcIiArIG5hbWVdID0gY29uc29sZVtuYW1lXVxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zb2xlW25hbWVdID0gZnVuY3Rpb24gKC4uLm9ianM6IGFueVtdKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBwcm9kdWNlT3V0cHV0KG9ianMpXG4gICAgICBjb25zdCBlbGVMb2cgPSBlbGVMb2NhdG9yKClcbiAgICAgIGNvbnN0IHByZWZpeCA9ICdbPHNwYW4gY2xhc3M9XCJsb2ctJyArIG5hbWUgKyAnXCI+JyArIGlkICsgXCI8L3NwYW4+XTogXCJcbiAgICAgIGNvbnN0IGVsZUNvbnRhaW5lckxvZyA9IGVsZU92ZXJmbG93TG9jYXRvcigpXG4gICAgICBhbGxMb2dzID0gYWxsTG9ncyArIHByZWZpeCArIG91dHB1dCArIFwiPGJyPlwiXG5cbiAgICAgIGlmIChlbGVMb2cgJiYgZWxlQ29udGFpbmVyTG9nKSB7XG4gICAgICAgIGlmIChhdXRvU2Nyb2xsKSB7XG4gICAgICAgICAgY29uc3QgYXRCb3R0b20gPSBlbGVDb250YWluZXJMb2cuc2Nyb2xsSGVpZ2h0IC0gZWxlQ29udGFpbmVyTG9nLmNsaWVudEhlaWdodCA8PSBlbGVDb250YWluZXJMb2cuc2Nyb2xsVG9wICsgMVxuICAgICAgICAgIGVsZUxvZy5pbm5lckhUTUwgPSBhbGxMb2dzXG5cbiAgICAgICAgICBpZiAoYXRCb3R0b20pIGVsZUNvbnRhaW5lckxvZy5zY3JvbGxUb3AgPSBlbGVDb250YWluZXJMb2cuc2Nyb2xsSGVpZ2h0IC0gZWxlQ29udGFpbmVyTG9nLmNsaWVudEhlaWdodFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZUxvZy5pbm5lckhUTUwgPSBhbGxMb2dzXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY29uc29sZVtcIm9sZFwiICsgbmFtZV0uYXBwbHkodW5kZWZpbmVkLCBvYmpzKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHByb2R1Y2VPdXRwdXQoYXJnczogYW55W10pIHtcbiAgICByZXR1cm4gYXJncy5yZWR1Y2UoKG91dHB1dDogYW55LCBhcmc6IGFueSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGlzT2JqID0gdHlwZW9mIGFyZyA9PT0gXCJvYmplY3RcIlxuICAgICAgbGV0IHRleHRSZXAgPSBcIlwiXG4gICAgICBpZiAoYXJnICYmIGFyZy5zdGFjayAmJiBhcmcubWVzc2FnZSkge1xuICAgICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIGVyclxuICAgICAgICB0ZXh0UmVwID0gYXJnLm1lc3NhZ2VcbiAgICAgIH0gZWxzZSBpZiAoaXNPYmopIHtcbiAgICAgICAgdGV4dFJlcCA9IEpTT04uc3RyaW5naWZ5KGFyZywgbnVsbCwgMilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHRSZXAgPSBhcmcgYXMgYW55XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNob3dDb21tYSA9IGluZGV4ICE9PSBhcmdzLmxlbmd0aCAtIDFcbiAgICAgIGNvbnN0IGNvbW1hID0gc2hvd0NvbW1hID8gXCI8c3BhbiBjbGFzcz0nY29tbWEnPiwgPC9zcGFuPlwiIDogXCJcIlxuICAgICAgcmV0dXJuIG91dHB1dCArIHRleHRSZXAgKyBjb21tYSArIFwiJm5ic3A7XCJcbiAgICB9LCBcIlwiKVxuICB9XG59XG4iXX0=