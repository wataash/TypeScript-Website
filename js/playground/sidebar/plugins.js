define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const pluginRegistry = [
        {
            module: "typescript-playground-presentation-mode",
            display: "Presentation Mode",
            blurb: "Create presentations inside the TypeScript playground, seamlessly jump between slides and live-code.",
            repo: "https://github.com/orta/playground-slides/#README",
            author: {
                name: "Orta",
                href: "https://orta.io",
            },
        },
    ];
    /** Whether the playground should actively reach out to an existing plugin */
    exports.allowConnectingToLocalhost = () => {
        return !!localStorage.getItem("compiler-setting-connect-dev-plugin");
    };
    exports.activePlugins = () => {
        const existing = customPlugins().map(module => ({ module }));
        return existing.concat(pluginRegistry.filter(p => !!localStorage.getItem("plugin-" + p.module)));
    };
    const removeCustomPlugins = (mod) => {
        const newPlugins = customPlugins().filter(p => p !== mod);
        localStorage.setItem("custom-plugins-playground", JSON.stringify(newPlugins));
    };
    exports.addCustomPlugin = (mod) => {
        const newPlugins = customPlugins();
        newPlugins.push(mod);
        localStorage.setItem("custom-plugins-playground", JSON.stringify(newPlugins));
        // @ts-ignore
        window.appInsights &&
            // @ts-ignore
            window.appInsights.trackEvent({ name: "Added Custom Module", properties: { id: mod } });
    };
    const customPlugins = () => {
        return JSON.parse(localStorage.getItem("custom-plugins-playground") || "[]");
    };
    exports.optionsPlugin = (i, utils) => {
        const plugin = {
            id: "plugins",
            displayName: i("play_sidebar_plugins"),
            // shouldBeSelected: () => true, // uncomment to make this the first tab on reloads
            willMount: (_sandbox, container) => {
                const ds = utils.createDesignSystem(container);
                const restartReq = ds.p(i("play_sidebar_options_restart_required"));
                restartReq.id = "restart-required";
                ds.subtitle(i("play_sidebar_plugins_options_external"));
                const pluginsOL = document.createElement("ol");
                pluginsOL.className = "playground-plugins";
                pluginRegistry.forEach(plugin => {
                    const settingButton = createPlugin(plugin);
                    pluginsOL.appendChild(settingButton);
                });
                container.appendChild(pluginsOL);
                const warning = document.createElement("p");
                warning.className = "warning";
                warning.textContent = i("play_sidebar_plugins_options_external_warning");
                container.appendChild(warning);
                ds.subtitle(i("play_sidebar_plugins_options_modules"));
                const customModulesOL = document.createElement("ol");
                customModulesOL.className = "custom-modules";
                const updateCustomModules = () => {
                    while (customModulesOL.firstChild) {
                        customModulesOL.removeChild(customModulesOL.firstChild);
                    }
                    customPlugins().forEach(module => {
                        const li = document.createElement("li");
                        li.innerHTML = module;
                        const a = document.createElement("a");
                        a.href = "#";
                        a.textContent = "X";
                        a.onclick = () => {
                            removeCustomPlugins(module);
                            updateCustomModules();
                            announceWeNeedARestart();
                            return false;
                        };
                        li.appendChild(a);
                        customModulesOL.appendChild(li);
                    });
                };
                updateCustomModules();
                container.appendChild(customModulesOL);
                const inputForm = createNewModuleInputForm(updateCustomModules, i);
                container.appendChild(inputForm);
                ds.subtitle(i("play_sidebar_plugins_plugin_dev"));
                const pluginsDevOL = document.createElement("ol");
                pluginsDevOL.className = "playground-options";
                const connectToDev = ds.localStorageOption({
                    display: i("play_sidebar_plugins_plugin_dev_option"),
                    blurb: i("play_sidebar_plugins_plugin_dev_copy"),
                    flag: "connect-dev-plugin",
                });
                pluginsDevOL.appendChild(connectToDev);
                container.appendChild(pluginsDevOL);
                // createSection(i("play_sidebar_options"), categoryDiv)
                // settings.forEach(setting => {
                //   const settingButton = createButton(setting)
                //   ol.appendChild(settingButton)
                // })
                // categoryDiv.appendChild(ol)
            },
        };
        return plugin;
    };
    const announceWeNeedARestart = () => {
        document.getElementById("restart-required").style.display = "block";
    };
    const createSection = (title, container) => {
        const pluginDevTitle = document.createElement("h4");
        pluginDevTitle.textContent = title;
        container.appendChild(pluginDevTitle);
    };
    const createPlugin = (plugin) => {
        const li = document.createElement("li");
        const div = document.createElement("div");
        const label = document.createElement("label");
        const top = `<span>${plugin.display}</span> by <a href='${plugin.author.href}'>${plugin.author.name}</a><br/>${plugin.blurb}`;
        const bottom = `<a href='https://www.npmjs.com/package/${plugin.module}'>npm</a> | <a href="${plugin.repo}">repo</a>`;
        label.innerHTML = `${top}<br/>${bottom}`;
        const key = "plugin-" + plugin.module;
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = key;
        input.checked = !!localStorage.getItem(key);
        input.onchange = () => {
            announceWeNeedARestart();
            if (input.checked) {
                // @ts-ignore
                window.appInsights &&
                    // @ts-ignore
                    window.appInsights.trackEvent({ name: "Added Registry Plugin", properties: { id: key } });
                localStorage.setItem(key, "true");
            }
            else {
                localStorage.removeItem(key);
            }
        };
        label.htmlFor = input.id;
        div.appendChild(input);
        div.appendChild(label);
        li.appendChild(div);
        return li;
    };
    const createNewModuleInputForm = (updateOL, i) => {
        const form = document.createElement("form");
        const newModuleInput = document.createElement("input");
        newModuleInput.type = "text";
        newModuleInput.id = "gist-input";
        newModuleInput.placeholder = i("play_sidebar_plugins_options_modules_placeholder");
        form.appendChild(newModuleInput);
        form.onsubmit = e => {
            announceWeNeedARestart();
            exports.addCustomPlugin(newModuleInput.value);
            e.stopPropagation();
            updateOL();
            return false;
        };
        return form;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2lucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvcGx1Z2lucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFFQSxNQUFNLGNBQWMsR0FBRztRQUNyQjtZQUNFLE1BQU0sRUFBRSx5Q0FBeUM7WUFDakQsT0FBTyxFQUFFLG1CQUFtQjtZQUM1QixLQUFLLEVBQUUsc0dBQXNHO1lBQzdHLElBQUksRUFBRSxtREFBbUQ7WUFDekQsTUFBTSxFQUFFO2dCQUNOLElBQUksRUFBRSxNQUFNO2dCQUNaLElBQUksRUFBRSxpQkFBaUI7YUFDeEI7U0FDRjtLQUNGLENBQUE7SUFFRCw2RUFBNkU7SUFDaEUsUUFBQSwwQkFBMEIsR0FBRyxHQUFHLEVBQUU7UUFDN0MsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFBO0lBQ3RFLENBQUMsQ0FBQTtJQUVZLFFBQUEsYUFBYSxHQUFHLEdBQUcsRUFBRTtRQUNoQyxNQUFNLFFBQVEsR0FBRyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzVELE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDbEcsQ0FBQyxDQUFBO0lBRUQsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLEdBQVcsRUFBRSxFQUFFO1FBQzFDLE1BQU0sVUFBVSxHQUFHLGFBQWEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQTtRQUN6RCxZQUFZLENBQUMsT0FB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LENBQUE7UUFDdEIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUN0QixFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25CLE9BQU8sRUFBRSxDQUFBO0lBQ1gsQ0FBQyxDQUFBO0lBRUQsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLFFBQWtCLEVBQUUsQ0FBTSxFQUFFLEVBQUU7UUFDOUQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUUzQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3RELGNBQWMsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFBO1FBQzVCLGNBQWMsQ0FBQyxFQUFFLEdBQUcsWUFBWSxDQUFBO1FBQ2hDLGNBQWMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLGtEQUFrRCxDQUFDLENBQUE7UUFDbEYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUVoQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ2xCLHNCQUFzQixFQUFFLENBQUE7WUFDeEIsdUJBQWUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDckMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFBO1lBQ25CLFFBQVEsRUFBRSxDQUFBO1lBQ1YsT0FBTyxLQUFLLENBQUE7UUFDZCxDQUFDLENBQUE7UUFFRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXlncm91bmRQbHVnaW4sIFBsdWdpbkZhY3RvcnkgfSBmcm9tIFwiLi5cIlxuXG5jb25zdCBwbHVnaW5SZWdpc3RyeSA9IFtcbiAge1xuICAgIG1vZHVsZTogXCJ0eXBlc2NyaXB0LXBsYXlncm91bmQtcHJlc2VudGF0aW9uLW1vZGVcIixcbiAgICBkaXNwbGF5OiBcIlByZXNlbnRhdGlvbiBNb2RlXCIsXG4gICAgYmx1cmI6IFwiQ3JlYXRlIHByZXNlbnRhdGlvbnMgaW5zaWRlIHRoZSBUeXBlU2NyaXB0IHBsYXlncm91bmQsIHNlYW1sZXNzbHkganVtcCBiZXR3ZWVuIHNsaWRlcyBhbmQgbGl2ZS1jb2RlLlwiLFxuICAgIHJlcG86IFwiaHR0cHM6Ly9naXRodWIuY29tL29ydGEvcGxheWdyb3VuZC1zbGlkZXMvI1JFQURNRVwiLFxuICAgIGF1dGhvcjoge1xuICAgICAgbmFtZTogXCJPcnRhXCIsXG4gICAgICBocmVmOiBcImh0dHBzOi8vb3J0YS5pb1wiLFxuICAgIH0sXG4gIH0sXG5dXG5cbi8qKiBXaGV0aGVyIHRoZSBwbGF5Z3JvdW5kIHNob3VsZCBhY3RpdmVseSByZWFjaCBvdXQgdG8gYW4gZXhpc3RpbmcgcGx1Z2luICovXG5leHBvcnQgY29uc3QgYWxsb3dDb25uZWN0aW5nVG9Mb2NhbGhvc3QgPSAoKSA9PiB7XG4gIHJldHVybiAhIWxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY29tcGlsZXItc2V0dGluZy1jb25uZWN0LWRldi1wbHVnaW5cIilcbn1cblxuZXhwb3J0IGNvbnN0IGFjdGl2ZVBsdWdpbnMgPSAoKSA9PiB7XG4gIGNvbnN0IGV4aXN0aW5nID0gY3VzdG9tUGx1Z2lucygpLm1hcChtb2R1bGUgPT4gKHsgbW9kdWxlIH0pKVxuICByZXR1cm4gZXhpc3RpbmcuY29uY2F0KHBsdWdpblJlZ2lzdHJ5LmZpbHRlcihwID0+ICEhbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJwbHVnaW4tXCIgKyBwLm1vZHVsZSkpKVxufVxuXG5jb25zdCByZW1vdmVDdXN0b21QbHVnaW5zID0gKG1vZDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IG5ld1BsdWdpbnMgPSBjdXN0b21QbHVnaW5zKCkuZmlsdGVyKHAgPT4gcCAhPT0gbW9kKVxuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImN1c3RvbS1wbHVnaW5zLXBsYXlncm91bmRcIiwgSlNPTi5zdHJpbmdpZnkobmV3UGx1Z2lucykpXG59XG5cbmV4cG9ydCBjb25zdCBhZGRDdXN0b21QbHVnaW4gPSAobW9kOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgbmV3UGx1Z2lucyA9IGN1c3RvbVBsdWdpbnMoKVxuICBuZXdQbHVnaW5zLnB1c2gobW9kKVxuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImN1c3RvbS1wbHVnaW5zLXBsYXlncm91bmRcIiwgSlNPTi5zdHJpbmdpZnkobmV3UGx1Z2lucykpXG4gIC8vIEB0cy1pZ25vcmVcbiAgd2luZG93LmFwcEluc2lnaHRzICYmXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHdpbmRvdy5hcHBJbnNpZ2h0cy50cmFja0V2ZW50KHsgbmFtZTogXCJBZGRlZCBDdXN0b20gTW9kdWxlXCIsIHByb3BlcnRpZXM6IHsgaWQ6IG1vZCB9IH0pXG59XG5cbmNvbnN0IGN1c3RvbVBsdWdpbnMgPSAoKTogc3RyaW5nW10gPT4ge1xuICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImN1c3RvbS1wbHVnaW5zLXBsYXlncm91bmRcIikgfHwgXCJbXVwiKVxufVxuXG5leHBvcnQgY29uc3Qgb3B0aW9uc1BsdWdpbjogUGx1Z2luRmFjdG9yeSA9IChpLCB1dGlscykgPT4ge1xuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6IFwicGx1Z2luc1wiLFxuICAgIGRpc3BsYXlOYW1lOiBpKFwicGxheV9zaWRlYmFyX3BsdWdpbnNcIiksXG4gICAgLy8gc2hvdWxkQmVTZWxlY3RlZDogKCkgPT4gdHJ1ZSwgLy8gdW5jb21tZW50IHRvIG1ha2UgdGhpcyB0aGUgZmlyc3QgdGFiIG9uIHJlbG9hZHNcbiAgICB3aWxsTW91bnQ6IChfc2FuZGJveCwgY29udGFpbmVyKSA9PiB7XG4gICAgICBjb25zdCBkcyA9IHV0aWxzLmNyZWF0ZURlc2lnblN5c3RlbShjb250YWluZXIpXG5cbiAgICAgIGNvbnN0IHJlc3RhcnRSZXEgPSBkcy5wKGkoXCJwbGF5X3NpZGViYXJfb3B0aW9uc19yZXN0YXJ0X3JlcXVpcmVkXCIpKVxuICAgICAgcmVzdGFydFJlcS5pZCA9IFwicmVzdGFydC1yZXF1aXJlZFwiXG5cbiAgICAgIGRzLnN1YnRpdGxlKGkoXCJwbGF5X3NpZGViYXJfcGx1Z2luc19vcHRpb25zX2V4dGVybmFsXCIpKVxuXG4gICAgICBjb25zdCBwbHVnaW5zT0wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib2xcIilcbiAgICAgIHBsdWdpbnNPTC5jbGFzc05hbWUgPSBcInBsYXlncm91bmQtcGx1Z2luc1wiXG4gICAgICBwbHVnaW5SZWdpc3RyeS5mb3JFYWNoKHBsdWdpbiA9PiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdCdXR0b24gPSBjcmVhdGVQbHVnaW4ocGx1Z2luKVxuICAgICAgICBwbHVnaW5zT0wuYXBwZW5kQ2hpbGQoc2V0dGluZ0J1dHRvbilcbiAgICAgIH0pXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocGx1Z2luc09MKVxuXG4gICAgICBjb25zdCB3YXJuaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIilcbiAgICAgIHdhcm5pbmcuY2xhc3NOYW1lID0gXCJ3YXJuaW5nXCJcbiAgICAgIHdhcm5pbmcudGV4dENvbnRlbnQgPSBpKFwicGxheV9zaWRlYmFyX3BsdWdpbnNfb3B0aW9uc19leHRlcm5hbF93YXJuaW5nXCIpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQod2FybmluZylcblxuICAgICAgZHMuc3VidGl0bGUoaShcInBsYXlfc2lkZWJhcl9wbHVnaW5zX29wdGlvbnNfbW9kdWxlc1wiKSlcblxuICAgICAgY29uc3QgY3VzdG9tTW9kdWxlc09MID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9sXCIpXG4gICAgICBjdXN0b21Nb2R1bGVzT0wuY2xhc3NOYW1lID0gXCJjdXN0b20tbW9kdWxlc1wiXG5cbiAgICAgIGNvbnN0IHVwZGF0ZUN1c3RvbU1vZHVsZXMgPSAoKSA9PiB7XG4gICAgICAgIHdoaWxlIChjdXN0b21Nb2R1bGVzT0wuZmlyc3RDaGlsZCkge1xuICAgICAgICAgIGN1c3RvbU1vZHVsZXNPTC5yZW1vdmVDaGlsZChjdXN0b21Nb2R1bGVzT0wuZmlyc3RDaGlsZClcbiAgICAgICAgfVxuICAgICAgICBjdXN0b21QbHVnaW5zKCkuZm9yRWFjaChtb2R1bGUgPT4ge1xuICAgICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gICAgICAgICAgbGkuaW5uZXJIVE1MID0gbW9kdWxlXG4gICAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXG4gICAgICAgICAgYS5ocmVmID0gXCIjXCJcbiAgICAgICAgICBhLnRleHRDb250ZW50ID0gXCJYXCJcbiAgICAgICAgICBhLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICByZW1vdmVDdXN0b21QbHVnaW5zKG1vZHVsZSlcbiAgICAgICAgICAgIHVwZGF0ZUN1c3RvbU1vZHVsZXMoKVxuICAgICAgICAgICAgYW5ub3VuY2VXZU5lZWRBUmVzdGFydCgpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgICAgbGkuYXBwZW5kQ2hpbGQoYSlcblxuICAgICAgICAgIGN1c3RvbU1vZHVsZXNPTC5hcHBlbmRDaGlsZChsaSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHVwZGF0ZUN1c3RvbU1vZHVsZXMoKVxuXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3VzdG9tTW9kdWxlc09MKVxuICAgICAgY29uc3QgaW5wdXRGb3JtID0gY3JlYXRlTmV3TW9kdWxlSW5wdXRGb3JtKHVwZGF0ZUN1c3RvbU1vZHVsZXMsIGkpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5wdXRGb3JtKVxuXG4gICAgICBkcy5zdWJ0aXRsZShpKFwicGxheV9zaWRlYmFyX3BsdWdpbnNfcGx1Z2luX2RldlwiKSlcblxuICAgICAgY29uc3QgcGx1Z2luc0Rldk9MID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9sXCIpXG4gICAgICBwbHVnaW5zRGV2T0wuY2xhc3NOYW1lID0gXCJwbGF5Z3JvdW5kLW9wdGlvbnNcIlxuXG4gICAgICBjb25zdCBjb25uZWN0VG9EZXYgPSBkcy5sb2NhbFN0b3JhZ2VPcHRpb24oe1xuICAgICAgICBkaXNwbGF5OiBpKFwicGxheV9zaWRlYmFyX3BsdWdpbnNfcGx1Z2luX2Rldl9vcHRpb25cIiksXG4gICAgICAgIGJsdXJiOiBpKFwicGxheV9zaWRlYmFyX3BsdWdpbnNfcGx1Z2luX2Rldl9jb3B5XCIpLFxuICAgICAgICBmbGFnOiBcImNvbm5lY3QtZGV2LXBsdWdpblwiLFxuICAgICAgfSlcbiAgICAgIHBsdWdpbnNEZXZPTC5hcHBlbmRDaGlsZChjb25uZWN0VG9EZXYpXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocGx1Z2luc0Rldk9MKVxuXG4gICAgICAvLyBjcmVhdGVTZWN0aW9uKGkoXCJwbGF5X3NpZGViYXJfb3B0aW9uc1wiKSwgY2F0ZWdvcnlEaXYpXG5cbiAgICAgIC8vIHNldHRpbmdzLmZvckVhY2goc2V0dGluZyA9PiB7XG4gICAgICAvLyAgIGNvbnN0IHNldHRpbmdCdXR0b24gPSBjcmVhdGVCdXR0b24oc2V0dGluZylcbiAgICAgIC8vICAgb2wuYXBwZW5kQ2hpbGQoc2V0dGluZ0J1dHRvbilcbiAgICAgIC8vIH0pXG5cbiAgICAgIC8vIGNhdGVnb3J5RGl2LmFwcGVuZENoaWxkKG9sKVxuICAgIH0sXG4gIH1cblxuICByZXR1cm4gcGx1Z2luXG59XG5cbmNvbnN0IGFubm91bmNlV2VOZWVkQVJlc3RhcnQgPSAoKSA9PiB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdGFydC1yZXF1aXJlZFwiKSEuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIlxufVxuXG5jb25zdCBjcmVhdGVTZWN0aW9uID0gKHRpdGxlOiBzdHJpbmcsIGNvbnRhaW5lcjogRWxlbWVudCkgPT4ge1xuICBjb25zdCBwbHVnaW5EZXZUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJoNFwiKVxuICBwbHVnaW5EZXZUaXRsZS50ZXh0Q29udGVudCA9IHRpdGxlXG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChwbHVnaW5EZXZUaXRsZSlcbn1cblxuY29uc3QgY3JlYXRlUGx1Z2luID0gKHBsdWdpbjogdHlwZW9mIHBsdWdpblJlZ2lzdHJ5WzBdKSA9PiB7XG4gIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpXG4gIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcblxuICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKVxuXG4gIGNvbnN0IHRvcCA9IGA8c3Bhbj4ke3BsdWdpbi5kaXNwbGF5fTwvc3Bhbj4gYnkgPGEgaHJlZj0nJHtwbHVnaW4uYXV0aG9yLmhyZWZ9Jz4ke3BsdWdpbi5hdXRob3IubmFtZX08L2E+PGJyLz4ke3BsdWdpbi5ibHVyYn1gXG4gIGNvbnN0IGJvdHRvbSA9IGA8YSBocmVmPSdodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS8ke3BsdWdpbi5tb2R1bGV9Jz5ucG08L2E+IHwgPGEgaHJlZj1cIiR7cGx1Z2luLnJlcG99XCI+cmVwbzwvYT5gXG4gIGxhYmVsLmlubmVySFRNTCA9IGAke3RvcH08YnIvPiR7Ym90dG9tfWBcblxuICBjb25zdCBrZXkgPSBcInBsdWdpbi1cIiArIHBsdWdpbi5tb2R1bGVcbiAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIilcbiAgaW5wdXQudHlwZSA9IFwiY2hlY2tib3hcIlxuICBpbnB1dC5pZCA9IGtleVxuICBpbnB1dC5jaGVja2VkID0gISFsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpXG5cbiAgaW5wdXQub25jaGFuZ2UgPSAoKSA9PiB7XG4gICAgYW5ub3VuY2VXZU5lZWRBUmVzdGFydCgpXG4gICAgaWYgKGlucHV0LmNoZWNrZWQpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHdpbmRvdy5hcHBJbnNpZ2h0cyAmJlxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHdpbmRvdy5hcHBJbnNpZ2h0cy50cmFja0V2ZW50KHsgbmFtZTogXCJBZGRlZCBSZWdpc3RyeSBQbHVnaW5cIiwgcHJvcGVydGllczogeyBpZDoga2V5IH0gfSlcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgXCJ0cnVlXCIpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSlcbiAgICB9XG4gIH1cblxuICBsYWJlbC5odG1sRm9yID0gaW5wdXQuaWRcblxuICBkaXYuYXBwZW5kQ2hpbGQoaW5wdXQpXG4gIGRpdi5hcHBlbmRDaGlsZChsYWJlbClcbiAgbGkuYXBwZW5kQ2hpbGQoZGl2KVxuICByZXR1cm4gbGlcbn1cblxuY29uc3QgY3JlYXRlTmV3TW9kdWxlSW5wdXRGb3JtID0gKHVwZGF0ZU9MOiBGdW5jdGlvbiwgaTogYW55KSA9PiB7XG4gIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZm9ybVwiKVxuXG4gIGNvbnN0IG5ld01vZHVsZUlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpXG4gIG5ld01vZHVsZUlucHV0LnR5cGUgPSBcInRleHRcIlxuICBuZXdNb2R1bGVJbnB1dC5pZCA9IFwiZ2lzdC1pbnB1dFwiXG4gIG5ld01vZHVsZUlucHV0LnBsYWNlaG9sZGVyID0gaShcInBsYXlfc2lkZWJhcl9wbHVnaW5zX29wdGlvbnNfbW9kdWxlc19wbGFjZWhvbGRlclwiKVxuICBmb3JtLmFwcGVuZENoaWxkKG5ld01vZHVsZUlucHV0KVxuXG4gIGZvcm0ub25zdWJtaXQgPSBlID0+IHtcbiAgICBhbm5vdW5jZVdlTmVlZEFSZXN0YXJ0KClcbiAgICBhZGRDdXN0b21QbHVnaW4obmV3TW9kdWxlSW5wdXQudmFsdWUpXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHVwZGF0ZU9MKClcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiBmb3JtXG59XG4iXX0=