var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.settingsPlugin = (i, utils) => {
        const settings = [
            {
                display: i("play_sidebar_options_disable_ata"),
                blurb: i("play_sidebar_options_disable_ata_copy"),
                flag: "disable-ata",
            },
            {
                display: i("play_sidebar_options_disable_save"),
                blurb: i("play_sidebar_options_disable_save_copy"),
                flag: "disable-save-on-type",
            },
        ];
        const plugin = {
            id: "settings",
            displayName: i("play_subnav_settings"),
            didMount: (sandbox, container) => __awaiter(void 0, void 0, void 0, function* () {
                const ds = utils.createDesignSystem(container);
                ds.subtitle(i("play_subnav_settings"));
                const ol = document.createElement("ol");
                ol.className = "playground-options";
                settings.forEach(setting => {
                    const settingButton = ds.localStorageOption(setting);
                    ol.appendChild(settingButton);
                });
                container.appendChild(ol);
            }),
        };
        return plugin;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wbGF5Z3JvdW5kL3NyYy9zaWRlYmFyL3NldHRpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUVhLFFBQUEsY0FBYyxHQUFrQixDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUN4RCxNQUFNLFFBQVEsR0FBRztZQUNmO2dCQUNFLE9BQU8sRUFBRSxDQUFDLENBQUMsa0NBQWtDLENBQUM7Z0JBQzlDLEtBQUssRUFBRSxDQUFDLENBQUMsdUNBQXVDLENBQUM7Z0JBQ2pELElBQUksRUFBRSxhQUFhO2FBQ3BCO1lBQ0Q7Z0JBQ0UsT0FBTyxFQUFFLENBQUMsQ0FBQyxtQ0FBbUMsQ0FBQztnQkFDL0MsS0FBSyxFQUFFLENBQUMsQ0FBQyx3Q0FBd0MsQ0FBQztnQkFDbEQsSUFBSSxFQUFFLHNCQUFzQjthQUM3QjtTQU1GLENBQUE7UUFFRCxNQUFNLE1BQU0sR0FBcUI7WUFDL0IsRUFBRSxFQUFFLFVBQVU7WUFDZCxXQUFXLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQixDQUFDO1lBQ3RDLFFBQVEsRUFBRSxDQUFPLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRTtnQkFDckMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFBO2dCQUU5QyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUE7Z0JBRXRDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ3ZDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUE7Z0JBRW5DLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3pCLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtvQkFDcEQsRUFBRSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtnQkFDL0IsQ0FBQyxDQUFDLENBQUE7Z0JBRUYsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUMzQixDQUFDLENBQUE7U0FDRixDQUFBO1FBRUQsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbGF5Z3JvdW5kUGx1Z2luLCBQbHVnaW5GYWN0b3J5IH0gZnJvbSBcIi4uXCJcblxuZXhwb3J0IGNvbnN0IHNldHRpbmdzUGx1Z2luOiBQbHVnaW5GYWN0b3J5ID0gKGksIHV0aWxzKSA9PiB7XG4gIGNvbnN0IHNldHRpbmdzID0gW1xuICAgIHtcbiAgICAgIGRpc3BsYXk6IGkoXCJwbGF5X3NpZGViYXJfb3B0aW9uc19kaXNhYmxlX2F0YVwiKSxcbiAgICAgIGJsdXJiOiBpKFwicGxheV9zaWRlYmFyX29wdGlvbnNfZGlzYWJsZV9hdGFfY29weVwiKSxcbiAgICAgIGZsYWc6IFwiZGlzYWJsZS1hdGFcIixcbiAgICB9LFxuICAgIHtcbiAgICAgIGRpc3BsYXk6IGkoXCJwbGF5X3NpZGViYXJfb3B0aW9uc19kaXNhYmxlX3NhdmVcIiksXG4gICAgICBibHVyYjogaShcInBsYXlfc2lkZWJhcl9vcHRpb25zX2Rpc2FibGVfc2F2ZV9jb3B5XCIpLFxuICAgICAgZmxhZzogXCJkaXNhYmxlLXNhdmUtb24tdHlwZVwiLFxuICAgIH0sXG4gICAgLy8ge1xuICAgIC8vICAgZGlzcGxheTogJ1ZlcmJvc2UgTG9nZ2luZycsXG4gICAgLy8gICBibHVyYjogJ1R1cm4gb24gc3VwZXJmbHVvdXMgbG9nZ2luZycsXG4gICAgLy8gICBmbGFnOiAnZW5hYmxlLXN1cGVyZmx1b3VzLWxvZ2dpbmcnLFxuICAgIC8vIH0sXG4gIF1cblxuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6IFwic2V0dGluZ3NcIixcbiAgICBkaXNwbGF5TmFtZTogaShcInBsYXlfc3VibmF2X3NldHRpbmdzXCIpLFxuICAgIGRpZE1vdW50OiBhc3luYyAoc2FuZGJveCwgY29udGFpbmVyKSA9PiB7XG4gICAgICBjb25zdCBkcyA9IHV0aWxzLmNyZWF0ZURlc2lnblN5c3RlbShjb250YWluZXIpXG5cbiAgICAgIGRzLnN1YnRpdGxlKGkoXCJwbGF5X3N1Ym5hdl9zZXR0aW5nc1wiKSlcblxuICAgICAgY29uc3Qgb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib2xcIilcbiAgICAgIG9sLmNsYXNzTmFtZSA9IFwicGxheWdyb3VuZC1vcHRpb25zXCJcblxuICAgICAgc2V0dGluZ3MuZm9yRWFjaChzZXR0aW5nID0+IHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ0J1dHRvbiA9IGRzLmxvY2FsU3RvcmFnZU9wdGlvbihzZXR0aW5nKVxuICAgICAgICBvbC5hcHBlbmRDaGlsZChzZXR0aW5nQnV0dG9uKVxuICAgICAgfSlcblxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG9sKVxuICAgIH0sXG4gIH1cblxuICByZXR1cm4gcGx1Z2luXG59XG4iXX0=