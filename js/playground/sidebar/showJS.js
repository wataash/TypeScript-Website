define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compiledJSPlugin = (i, utils) => {
        let codeElement;
        const plugin = {
            id: "js",
            displayName: i("play_sidebar_js"),
            willMount: (_, container) => {
                const { code } = utils.createDesignSystem(container);
                codeElement = code("");
            },
            modelChangedDebounce: (sandbox, model) => {
                sandbox.getRunnableJS().then(js => {
                    sandbox.monaco.editor.colorize(js, "javascript", {}).then(coloredJS => {
                        codeElement.innerHTML = coloredJS;
                    });
                });
            },
        };
        return plugin;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvd0pTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcGxheWdyb3VuZC9zcmMvc2lkZWJhci9zaG93SlMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBRWEsUUFBQSxnQkFBZ0IsR0FBa0IsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDMUQsSUFBSSxXQUF3QixDQUFBO1FBRTVCLE1BQU0sTUFBTSxHQUFxQjtZQUMvQixFQUFFLEVBQUUsSUFBSTtZQUNSLFdBQVcsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUM7WUFDakMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUMxQixNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFBO2dCQUNwRCxXQUFXLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ3hCLENBQUM7WUFDRCxvQkFBb0IsRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtnQkFDdkMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFDaEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUNwRSxXQUFXLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtvQkFDbkMsQ0FBQyxDQUFDLENBQUE7Z0JBQ0osQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDO1NBQ0YsQ0FBQTtRQUVELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGxheWdyb3VuZFBsdWdpbiwgUGx1Z2luRmFjdG9yeSB9IGZyb20gXCIuLlwiXG5cbmV4cG9ydCBjb25zdCBjb21waWxlZEpTUGx1Z2luOiBQbHVnaW5GYWN0b3J5ID0gKGksIHV0aWxzKSA9PiB7XG4gIGxldCBjb2RlRWxlbWVudDogSFRNTEVsZW1lbnRcblxuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6IFwianNcIixcbiAgICBkaXNwbGF5TmFtZTogaShcInBsYXlfc2lkZWJhcl9qc1wiKSxcbiAgICB3aWxsTW91bnQ6IChfLCBjb250YWluZXIpID0+IHtcbiAgICAgIGNvbnN0IHsgY29kZSB9ID0gdXRpbHMuY3JlYXRlRGVzaWduU3lzdGVtKGNvbnRhaW5lcilcbiAgICAgIGNvZGVFbGVtZW50ID0gY29kZShcIlwiKVxuICAgIH0sXG4gICAgbW9kZWxDaGFuZ2VkRGVib3VuY2U6IChzYW5kYm94LCBtb2RlbCkgPT4ge1xuICAgICAgc2FuZGJveC5nZXRSdW5uYWJsZUpTKCkudGhlbihqcyA9PiB7XG4gICAgICAgIHNhbmRib3gubW9uYWNvLmVkaXRvci5jb2xvcml6ZShqcywgXCJqYXZhc2NyaXB0XCIsIHt9KS50aGVuKGNvbG9yZWRKUyA9PiB7XG4gICAgICAgICAgY29kZUVsZW1lbnQuaW5uZXJIVE1MID0gY29sb3JlZEpTXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gIH1cblxuICByZXR1cm4gcGx1Z2luXG59XG4iXX0=