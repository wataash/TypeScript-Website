define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showDTSPlugin = (i, utils) => {
        let codeElement;
        const plugin = {
            id: "dts",
            displayName: i("play_sidebar_dts"),
            willMount: (_, container) => {
                const { code } = utils.createDesignSystem(container);
                codeElement = code("");
            },
            modelChanged: (sandbox, model) => {
                sandbox.getDTSForCode().then(dts => {
                    sandbox.monaco.editor.colorize(dts, "typescript", {}).then(coloredDTS => {
                        codeElement.innerHTML = coloredDTS;
                    });
                });
            },
        };
        return plugin;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvd0RUUy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvc2hvd0RUUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFFYSxRQUFBLGFBQWEsR0FBa0IsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDdkQsSUFBSSxXQUF3QixDQUFBO1FBRTVCLE1BQU0sTUFBTSxHQUFxQjtZQUMvQixFQUFFLEVBQUUsS0FBSztZQUNULFdBQVcsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUM7WUFDbEMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUMxQixNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFBO2dCQUNwRCxXQUFXLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ3hCLENBQUM7WUFDRCxZQUFZLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQy9CLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2pDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDdEUsV0FBVyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUE7b0JBQ3BDLENBQUMsQ0FBQyxDQUFBO2dCQUNKLENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQztTQUNGLENBQUE7UUFFRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXlncm91bmRQbHVnaW4sIFBsdWdpbkZhY3RvcnkgfSBmcm9tIFwiLi5cIlxuXG5leHBvcnQgY29uc3Qgc2hvd0RUU1BsdWdpbjogUGx1Z2luRmFjdG9yeSA9IChpLCB1dGlscykgPT4ge1xuICBsZXQgY29kZUVsZW1lbnQ6IEhUTUxFbGVtZW50XG5cbiAgY29uc3QgcGx1Z2luOiBQbGF5Z3JvdW5kUGx1Z2luID0ge1xuICAgIGlkOiBcImR0c1wiLFxuICAgIGRpc3BsYXlOYW1lOiBpKFwicGxheV9zaWRlYmFyX2R0c1wiKSxcbiAgICB3aWxsTW91bnQ6IChfLCBjb250YWluZXIpID0+IHtcbiAgICAgIGNvbnN0IHsgY29kZSB9ID0gdXRpbHMuY3JlYXRlRGVzaWduU3lzdGVtKGNvbnRhaW5lcilcbiAgICAgIGNvZGVFbGVtZW50ID0gY29kZShcIlwiKVxuICAgIH0sXG4gICAgbW9kZWxDaGFuZ2VkOiAoc2FuZGJveCwgbW9kZWwpID0+IHtcbiAgICAgIHNhbmRib3guZ2V0RFRTRm9yQ29kZSgpLnRoZW4oZHRzID0+IHtcbiAgICAgICAgc2FuZGJveC5tb25hY28uZWRpdG9yLmNvbG9yaXplKGR0cywgXCJ0eXBlc2NyaXB0XCIsIHt9KS50aGVuKGNvbG9yZWREVFMgPT4ge1xuICAgICAgICAgIGNvZGVFbGVtZW50LmlubmVySFRNTCA9IGNvbG9yZWREVFNcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgfVxuXG4gIHJldHVybiBwbHVnaW5cbn1cbiJdfQ==