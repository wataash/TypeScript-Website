var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../localizeWithFallback"], function (require, exports, localizeWithFallback_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showErrors = (i, utils) => {
        const plugin = {
            id: "errors",
            displayName: i("play_sidebar_errors"),
            modelChangedDebounce: (sandbox, model, container) => __awaiter(void 0, void 0, void 0, function* () {
                const ds = utils.createDesignSystem(container);
                sandbox.getWorkerProcess().then(worker => {
                    worker.getSemanticDiagnostics(model.uri.toString()).then(diags => {
                        // Bail early if there's nothing to show
                        if (!diags.length) {
                            ds.showEmptyScreen(localizeWithFallback_1.localize("play_sidebar_errors_no_errors", "No errors"));
                            return;
                        }
                        // Clean any potential empty screens
                        ds.clear();
                        ds.listDiags(sandbox, model, diags);
                    });
                });
            }),
        };
        return plugin;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvd0Vycm9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvc2hvd0Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFHYSxRQUFBLFVBQVUsR0FBa0IsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDcEQsTUFBTSxNQUFNLEdBQXFCO1lBQy9CLEVBQUUsRUFBRSxRQUFRO1lBQ1osV0FBVyxFQUFFLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztZQUNyQyxvQkFBb0IsRUFBRSxDQUFPLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUU7Z0JBQ3hELE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtnQkFFOUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUN2QyxNQUFNLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDL0Qsd0NBQXdDO3dCQUN4QyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTs0QkFDakIsRUFBRSxDQUFDLGVBQWUsQ0FBQywrQkFBUSxDQUFDLCtCQUErQixFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUE7NEJBQzFFLE9BQU07eUJBQ1A7d0JBRUQsb0NBQW9DO3dCQUNwQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUE7d0JBQ1YsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFBO29CQUNyQyxDQUFDLENBQUMsQ0FBQTtnQkFDSixDQUFDLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQTtTQUNGLENBQUE7UUFFRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXlncm91bmRQbHVnaW4sIFBsdWdpbkZhY3RvcnkgfSBmcm9tIFwiLi5cIlxuaW1wb3J0IHsgbG9jYWxpemUgfSBmcm9tIFwiLi4vbG9jYWxpemVXaXRoRmFsbGJhY2tcIlxuXG5leHBvcnQgY29uc3Qgc2hvd0Vycm9yczogUGx1Z2luRmFjdG9yeSA9IChpLCB1dGlscykgPT4ge1xuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6IFwiZXJyb3JzXCIsXG4gICAgZGlzcGxheU5hbWU6IGkoXCJwbGF5X3NpZGViYXJfZXJyb3JzXCIpLFxuICAgIG1vZGVsQ2hhbmdlZERlYm91bmNlOiBhc3luYyAoc2FuZGJveCwgbW9kZWwsIGNvbnRhaW5lcikgPT4ge1xuICAgICAgY29uc3QgZHMgPSB1dGlscy5jcmVhdGVEZXNpZ25TeXN0ZW0oY29udGFpbmVyKVxuXG4gICAgICBzYW5kYm94LmdldFdvcmtlclByb2Nlc3MoKS50aGVuKHdvcmtlciA9PiB7XG4gICAgICAgIHdvcmtlci5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKG1vZGVsLnVyaS50b1N0cmluZygpKS50aGVuKGRpYWdzID0+IHtcbiAgICAgICAgICAvLyBCYWlsIGVhcmx5IGlmIHRoZXJlJ3Mgbm90aGluZyB0byBzaG93XG4gICAgICAgICAgaWYgKCFkaWFncy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRzLnNob3dFbXB0eVNjcmVlbihsb2NhbGl6ZShcInBsYXlfc2lkZWJhcl9lcnJvcnNfbm9fZXJyb3JzXCIsIFwiTm8gZXJyb3JzXCIpKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2xlYW4gYW55IHBvdGVudGlhbCBlbXB0eSBzY3JlZW5zXG4gICAgICAgICAgZHMuY2xlYXIoKVxuICAgICAgICAgIGRzLmxpc3REaWFncyhzYW5kYm94LCBtb2RlbCwgZGlhZ3MpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gIH1cblxuICByZXR1cm4gcGx1Z2luXG59XG4iXX0=