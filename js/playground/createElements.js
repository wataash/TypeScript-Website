define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDragBar = () => {
        const sidebar = document.createElement("div");
        sidebar.className = "playground-dragbar";
        let left, right;
        const drag = (e) => {
            if (left && right) {
                // Get how far right the mouse is from the right
                const rightX = right.getBoundingClientRect().right;
                const offset = rightX - e.pageX;
                const screenClampLeft = window.innerWidth - 320;
                const clampedOffset = Math.min(Math.max(offset, 280), screenClampLeft);
                // Set the widths
                left.style.width = `calc(100% - ${clampedOffset}px)`;
                right.style.width = `${clampedOffset}px`;
                right.style.flexBasis = `${clampedOffset}px`;
                right.style.maxWidth = `${clampedOffset}px`;
                // Save the x coordinate of the
                if (window.localStorage) {
                    window.localStorage.setItem("dragbar-x", "" + clampedOffset);
                    window.localStorage.setItem("dragbar-window-width", "" + window.innerWidth);
                }
                // @ts-ignore - I know what I'm doing
                window.sandbox.editor.layout();
                // Don't allow selection
                e.stopPropagation();
                e.cancelBubble = true;
            }
        };
        sidebar.addEventListener("mousedown", e => {
            var _a;
            left = document.getElementById("editor-container");
            right = (_a = sidebar.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByClassName("playground-sidebar").item(0);
            // Handle dragging all over the screen
            document.addEventListener("mousemove", drag);
            // Remove it when you lt go anywhere
            document.addEventListener("mouseup", () => {
                document.removeEventListener("mousemove", drag);
                document.body.style.userSelect = "auto";
            });
            // Don't allow the drag to select text accidentally
            document.body.style.userSelect = "none";
            e.stopPropagation();
            e.cancelBubble = true;
        });
        return sidebar;
    };
    exports.sidebarHidden = () => !!window.localStorage.getItem("sidebar-hidden");
    exports.createSidebar = () => {
        const sidebar = document.createElement("div");
        sidebar.className = "playground-sidebar";
        // Start with the sidebar hidden on small screens
        const isTinyScreen = window.innerWidth < 800;
        // This is independent of the sizing below so that you keep the same sized sidebar
        if (isTinyScreen || exports.sidebarHidden()) {
            sidebar.style.display = "none";
        }
        if (window.localStorage && window.localStorage.getItem("dragbar-x")) {
            // Don't restore the x pos if the window isn't the same size
            if (window.innerWidth === Number(window.localStorage.getItem("dragbar-window-width"))) {
                // Set the dragger to the previous x pos
                let width = window.localStorage.getItem("dragbar-x");
                if (isTinyScreen) {
                    width = String(Math.min(Number(width), 280));
                }
                sidebar.style.width = `${width}px`;
                sidebar.style.flexBasis = `${width}px`;
                sidebar.style.maxWidth = `${width}px`;
                const left = document.getElementById("editor-container");
                left.style.width = `calc(100% - ${width}px)`;
            }
        }
        return sidebar;
    };
    const toggleIconWhenOpen = "&#x21E5;";
    const toggleIconWhenClosed = "&#x21E4;";
    exports.setupSidebarToggle = () => {
        const toggle = document.getElementById("sidebar-toggle");
        const updateToggle = () => {
            const sidebar = window.document.querySelector(".playground-sidebar");
            const sidebarShowing = sidebar.style.display !== "none";
            toggle.innerHTML = sidebarShowing ? toggleIconWhenOpen : toggleIconWhenClosed;
            toggle.setAttribute("aria-label", sidebarShowing ? "Hide Sidebar" : "Show Sidebar");
        };
        toggle.onclick = () => {
            const sidebar = window.document.querySelector(".playground-sidebar");
            const newState = sidebar.style.display !== "none";
            if (newState) {
                localStorage.setItem("sidebar-hidden", "true");
                sidebar.style.display = "none";
            }
            else {
                localStorage.removeItem("sidebar-hidden");
                sidebar.style.display = "block";
            }
            updateToggle();
            // @ts-ignore - I know what I'm doing
            window.sandbox.editor.layout();
            return false;
        };
        // Ensure its set up at the start
        updateToggle();
    };
    exports.createTabBar = () => {
        const tabBar = document.createElement("div");
        tabBar.classList.add("playground-plugin-tabview");
        return tabBar;
    };
    exports.createPluginContainer = () => {
        const container = document.createElement("div");
        container.classList.add("playground-plugin-container");
        return container;
    };
    exports.createTabForPlugin = (plugin) => {
        const element = document.createElement("button");
        element.textContent = plugin.displayName;
        return element;
    };
    exports.activatePlugin = (plugin, previousPlugin, sandbox, tabBar, container) => {
        let newPluginTab, oldPluginTab;
        // @ts-ignore - This works at runtime
        for (const tab of tabBar.children) {
            if (tab.textContent === plugin.displayName)
                newPluginTab = tab;
            if (previousPlugin && tab.textContent === previousPlugin.displayName)
                oldPluginTab = tab;
        }
        // @ts-ignore
        if (!newPluginTab)
            throw new Error("Could not get a tab for the plugin: " + plugin.displayName);
        // Tell the old plugin it's getting the boot
        // @ts-ignore
        if (previousPlugin && oldPluginTab) {
            if (previousPlugin.willUnmount)
                previousPlugin.willUnmount(sandbox, container);
            oldPluginTab.classList.remove("active");
        }
        // Wipe the sidebar
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        // Start booting up the new plugin
        newPluginTab.classList.add("active");
        // Tell the new plugin to start doing some work
        if (plugin.willMount)
            plugin.willMount(sandbox, container);
        if (plugin.modelChanged)
            plugin.modelChanged(sandbox, sandbox.getModel(), container);
        if (plugin.modelChangedDebounce)
            plugin.modelChangedDebounce(sandbox, sandbox.getModel(), container);
        if (plugin.didMount)
            plugin.didMount(sandbox, container);
        // Let the previous plugin do any slow work after it's all done
        if (previousPlugin && previousPlugin.didUnmount)
            previousPlugin.didUnmount(sandbox, container);
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlRWxlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wbGF5Z3JvdW5kL3NyYy9jcmVhdGVFbGVtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJYSxRQUFBLGFBQWEsR0FBRyxHQUFHLEVBQUU7UUFDaEMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUM3QyxPQUFPLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFBO1FBRXhDLElBQUksSUFBaUIsRUFBRSxLQUFrQixDQUFBO1FBQ3pDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBYSxFQUFFLEVBQUU7WUFDN0IsSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUNqQixnREFBZ0Q7Z0JBQ2hELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssQ0FBQTtnQkFDbEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUE7Z0JBQy9CLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFBO2dCQUMvQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFBO2dCQUV0RSxpQkFBaUI7Z0JBQ2pCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLGVBQWUsYUFBYSxLQUFLLENBQUE7Z0JBQ3BELEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsYUFBYSxJQUFJLENBQUE7Z0JBQ3hDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEdBQUcsYUFBYSxJQUFJLENBQUE7Z0JBQzVDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLEdBQUcsYUFBYSxJQUFJLENBQUE7Z0JBRTNDLCtC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QTtRQUVwQywrQ0FBK0M7UUFDL0MsSUFBSSxNQUFNLENBQUMsU0FBUztZQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQzFELElBQUksTUFBTSxDQUFDLFlBQVk7WUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDcEYsSUFBSSxNQUFNLENBQUMsb0JBQW9CO1lBQUUsTUFBTSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDcEcsSUFBSSxNQUFNLENBQUMsUUFBUTtZQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBRXhELCtEQUErRDtRQUMvRCxJQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsVUFBVTtZQUFFLGNBQWMsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQ2hHLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXlncm91bmRQbHVnaW4gfSBmcm9tIFwiLlwiXG5cbnR5cGUgU2FuZGJveCA9IGltcG9ydChcInR5cGVzY3JpcHQtc2FuZGJveFwiKS5TYW5kYm94XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVEcmFnQmFyID0gKCkgPT4ge1xuICBjb25zdCBzaWRlYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICBzaWRlYmFyLmNsYXNzTmFtZSA9IFwicGxheWdyb3VuZC1kcmFnYmFyXCJcblxuICBsZXQgbGVmdDogSFRNTEVsZW1lbnQsIHJpZ2h0OiBIVE1MRWxlbWVudFxuICBjb25zdCBkcmFnID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICBpZiAobGVmdCAmJiByaWdodCkge1xuICAgICAgLy8gR2V0IGhvdyBmYXIgcmlnaHQgdGhlIG1vdXNlIGlzIGZyb20gdGhlIHJpZ2h0XG4gICAgICBjb25zdCByaWdodFggPSByaWdodC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5yaWdodFxuICAgICAgY29uc3Qgb2Zmc2V0ID0gcmlnaHRYIC0gZS5wYWdlWFxuICAgICAgY29uc3Qgc2NyZWVuQ2xhbXBMZWZ0ID0gd2luZG93LmlubmVyV2lkdGggLSAzMjBcbiAgICAgIGNvbnN0IGNsYW1wZWRPZmZzZXQgPSBNYXRoLm1pbihNYXRoLm1heChvZmZzZXQsIDI4MCksIHNjcmVlbkNsYW1wTGVmdClcblxuICAgICAgLy8gU2V0IHRoZSB3aWR0aHNcbiAgICAgIGxlZnQuc3R5bGUud2lkdGggPSBgY2FsYygxMDAlIC0gJHtjbGFtcGVkT2Zmc2V0fXB4KWBcbiAgICAgIHJpZ2h0LnN0eWxlLndpZHRoID0gYCR7Y2xhbXBlZE9mZnNldH1weGBcbiAgICAgIHJpZ2h0LnN0eWxlLmZsZXhCYXNpcyA9IGAke2NsYW1wZWRPZmZzZXR9cHhgXG4gICAgICByaWdodC5zdHlsZS5tYXhXaWR0aCA9IGAke2NsYW1wZWRPZmZzZXR9cHhgXG5cbiAgICAgIC8vIFNhdmUgdGhlIHggY29vcmRpbmF0ZSBvZiB0aGVcbiAgICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImRyYWdiYXIteFwiLCBcIlwiICsgY2xhbXBlZE9mZnNldClcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiZHJhZ2Jhci13aW5kb3ctd2lkdGhcIiwgXCJcIiArIHdpbmRvdy5pbm5lcldpZHRoKVxuICAgICAgfVxuXG4gICAgICAvLyBAdHMtaWdub3JlIC0gSSBrbm93IHdoYXQgSSdtIGRvaW5nXG4gICAgICB3aW5kb3cuc2FuZGJveC5lZGl0b3IubGF5b3V0KClcblxuICAgICAgLy8gRG9uJ3QgYWxsb3cgc2VsZWN0aW9uXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBlLmNhbmNlbEJ1YmJsZSA9IHRydWVcbiAgICB9XG4gIH1cblxuICBzaWRlYmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZSA9PiB7XG4gICAgbGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZWRpdG9yLWNvbnRhaW5lclwiKSFcbiAgICByaWdodCA9IHNpZGViYXIucGFyZW50RWxlbWVudD8uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInBsYXlncm91bmQtc2lkZWJhclwiKS5pdGVtKDApISBhcyBhbnlcbiAgICAvLyBIYW5kbGUgZHJhZ2dpbmcgYWxsIG92ZXIgdGhlIHNjcmVlblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgZHJhZylcbiAgICAvLyBSZW1vdmUgaXQgd2hlbiB5b3UgbHQgZ28gYW55d2hlcmVcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGRyYWcpXG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnVzZXJTZWxlY3QgPSBcImF1dG9cIlxuICAgIH0pXG5cbiAgICAvLyBEb24ndCBhbGxvdyB0aGUgZHJhZyB0byBzZWxlY3QgdGV4dCBhY2NpZGVudGFsbHlcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnVzZXJTZWxlY3QgPSBcIm5vbmVcIlxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBlLmNhbmNlbEJ1YmJsZSA9IHRydWVcbiAgfSlcblxuICByZXR1cm4gc2lkZWJhclxufVxuXG5leHBvcnQgY29uc3Qgc2lkZWJhckhpZGRlbiA9ICgpID0+ICEhd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic2lkZWJhci1oaWRkZW5cIilcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNpZGViYXIgPSAoKSA9PiB7XG4gIGNvbnN0IHNpZGViYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gIHNpZGViYXIuY2xhc3NOYW1lID0gXCJwbGF5Z3JvdW5kLXNpZGViYXJcIlxuXG4gIC8vIFN0YXJ0IHdpdGggdGhlIHNpZGViYXIgaGlkZGVuIG9uIHNtYWxsIHNjcmVlbnNcbiAgY29uc3QgaXNUaW55U2NyZWVuID0gd2luZG93LmlubmVyV2lkdGggPCA4MDBcblxuICAvLyBUaGlzIGlzIGluZGVwZW5kZW50IG9mIHRoZSBzaXppbmcgYmVsb3cgc28gdGhhdCB5b3Uga2VlcCB0aGUgc2FtZSBzaXplZCBzaWRlYmFyXG4gIGlmIChpc1RpbnlTY3JlZW4gfHwgc2lkZWJhckhpZGRlbigpKSB7XG4gICAgc2lkZWJhci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCJcbiAgfVxuXG4gIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlICYmIHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImRyYWdiYXIteFwiKSkge1xuICAgIC8vIERvbid0IHJlc3RvcmUgdGhlIHggcG9zIGlmIHRoZSB3aW5kb3cgaXNuJ3QgdGhlIHNhbWUgc2l6ZVxuICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA9PT0gTnVtYmVyKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImRyYWdiYXItd2luZG93LXdpZHRoXCIpKSkge1xuICAgICAgLy8gU2V0IHRoZSBkcmFnZ2VyIHRvIHRoZSBwcmV2aW91cyB4IHBvc1xuICAgICAgbGV0IHdpZHRoID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiZHJhZ2Jhci14XCIpXG5cbiAgICAgIGlmIChpc1RpbnlTY3JlZW4pIHtcbiAgICAgICAgd2lkdGggPSBTdHJpbmcoTWF0aC5taW4oTnVtYmVyKHdpZHRoKSwgMjgwKSlcbiAgICAgIH1cblxuICAgICAgc2lkZWJhci5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgICAgc2lkZWJhci5zdHlsZS5mbGV4QmFzaXMgPSBgJHt3aWR0aH1weGBcbiAgICAgIHNpZGViYXIuc3R5bGUubWF4V2lkdGggPSBgJHt3aWR0aH1weGBcblxuICAgICAgY29uc3QgbGVmdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZWRpdG9yLWNvbnRhaW5lclwiKSFcbiAgICAgIGxlZnQuc3R5bGUud2lkdGggPSBgY2FsYygxMDAlIC0gJHt3aWR0aH1weClgXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNpZGViYXJcbn1cblxuY29uc3QgdG9nZ2xlSWNvbldoZW5PcGVuID0gXCImI3gyMUU1O1wiXG5jb25zdCB0b2dnbGVJY29uV2hlbkNsb3NlZCA9IFwiJiN4MjFFNDtcIlxuXG5leHBvcnQgY29uc3Qgc2V0dXBTaWRlYmFyVG9nZ2xlID0gKCkgPT4ge1xuICBjb25zdCB0b2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNpZGViYXItdG9nZ2xlXCIpIVxuXG4gIGNvbnN0IHVwZGF0ZVRvZ2dsZSA9ICgpID0+IHtcbiAgICBjb25zdCBzaWRlYmFyID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGxheWdyb3VuZC1zaWRlYmFyXCIpIGFzIEhUTUxEaXZFbGVtZW50XG4gICAgY29uc3Qgc2lkZWJhclNob3dpbmcgPSBzaWRlYmFyLnN0eWxlLmRpc3BsYXkgIT09IFwibm9uZVwiXG5cbiAgICB0b2dnbGUuaW5uZXJIVE1MID0gc2lkZWJhclNob3dpbmcgPyB0b2dnbGVJY29uV2hlbk9wZW4gOiB0b2dnbGVJY29uV2hlbkNsb3NlZFxuICAgIHRvZ2dsZS5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIHNpZGViYXJTaG93aW5nID8gXCJIaWRlIFNpZGViYXJcIiA6IFwiU2hvdyBTaWRlYmFyXCIpXG4gIH1cblxuICB0b2dnbGUub25jbGljayA9ICgpID0+IHtcbiAgICBjb25zdCBzaWRlYmFyID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGxheWdyb3VuZC1zaWRlYmFyXCIpIGFzIEhUTUxEaXZFbGVtZW50XG4gICAgY29uc3QgbmV3U3RhdGUgPSBzaWRlYmFyLnN0eWxlLmRpc3BsYXkgIT09IFwibm9uZVwiXG5cbiAgICBpZiAobmV3U3RhdGUpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwic2lkZWJhci1oaWRkZW5cIiwgXCJ0cnVlXCIpXG4gICAgICBzaWRlYmFyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIlxuICAgIH0gZWxzZSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInNpZGViYXItaGlkZGVuXCIpXG4gICAgICBzaWRlYmFyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCJcbiAgICB9XG5cbiAgICB1cGRhdGVUb2dnbGUoKVxuXG4gICAgLy8gQHRzLWlnbm9yZSAtIEkga25vdyB3aGF0IEknbSBkb2luZ1xuICAgIHdpbmRvdy5zYW5kYm94LmVkaXRvci5sYXlvdXQoKVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBFbnN1cmUgaXRzIHNldCB1cCBhdCB0aGUgc3RhcnRcbiAgdXBkYXRlVG9nZ2xlKClcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVRhYkJhciA9ICgpID0+IHtcbiAgY29uc3QgdGFiQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICB0YWJCYXIuY2xhc3NMaXN0LmFkZChcInBsYXlncm91bmQtcGx1Z2luLXRhYnZpZXdcIilcbiAgcmV0dXJuIHRhYkJhclxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlUGx1Z2luQ29udGFpbmVyID0gKCkgPT4ge1xuICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwicGxheWdyb3VuZC1wbHVnaW4tY29udGFpbmVyXCIpXG4gIHJldHVybiBjb250YWluZXJcbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVRhYkZvclBsdWdpbiA9IChwbHVnaW46IFBsYXlncm91bmRQbHVnaW4pID0+IHtcbiAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIilcbiAgZWxlbWVudC50ZXh0Q29udGVudCA9IHBsdWdpbi5kaXNwbGF5TmFtZVxuICByZXR1cm4gZWxlbWVudFxufVxuXG5leHBvcnQgY29uc3QgYWN0aXZhdGVQbHVnaW4gPSAoXG4gIHBsdWdpbjogUGxheWdyb3VuZFBsdWdpbixcbiAgcHJldmlvdXNQbHVnaW46IFBsYXlncm91bmRQbHVnaW4gfCB1bmRlZmluZWQsXG4gIHNhbmRib3g6IFNhbmRib3gsXG4gIHRhYkJhcjogSFRNTERpdkVsZW1lbnQsXG4gIGNvbnRhaW5lcjogSFRNTERpdkVsZW1lbnRcbikgPT4ge1xuICBsZXQgbmV3UGx1Z2luVGFiOiBFbGVtZW50LCBvbGRQbHVnaW5UYWI6IEVsZW1lbnRcbiAgLy8gQHRzLWlnbm9yZSAtIFRoaXMgd29ya3MgYXQgcnVudGltZVxuICBmb3IgKGNvbnN0IHRhYiBvZiB0YWJCYXIuY2hpbGRyZW4pIHtcbiAgICBpZiAodGFiLnRleHRDb250ZW50ID09PSBwbHVnaW4uZGlzcGxheU5hbWUpIG5ld1BsdWdpblRhYiA9IHRhYlxuICAgIGlmIChwcmV2aW91c1BsdWdpbiAmJiB0YWIudGV4dENvbnRlbnQgPT09IHByZXZpb3VzUGx1Z2luLmRpc3BsYXlOYW1lKSBvbGRQbHVnaW5UYWIgPSB0YWJcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgaWYgKCFuZXdQbHVnaW5UYWIpIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBnZXQgYSB0YWIgZm9yIHRoZSBwbHVnaW46IFwiICsgcGx1Z2luLmRpc3BsYXlOYW1lKVxuXG4gIC8vIFRlbGwgdGhlIG9sZCBwbHVnaW4gaXQncyBnZXR0aW5nIHRoZSBib290XG4gIC8vIEB0cy1pZ25vcmVcbiAgaWYgKHByZXZpb3VzUGx1Z2luICYmIG9sZFBsdWdpblRhYikge1xuICAgIGlmIChwcmV2aW91c1BsdWdpbi53aWxsVW5tb3VudCkgcHJldmlvdXNQbHVnaW4ud2lsbFVubW91bnQoc2FuZGJveCwgY29udGFpbmVyKVxuICAgIG9sZFBsdWdpblRhYi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpXG4gIH1cblxuICAvLyBXaXBlIHRoZSBzaWRlYmFyXG4gIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZClcbiAgfVxuXG4gIC8vIFN0YXJ0IGJvb3RpbmcgdXAgdGhlIG5ldyBwbHVnaW5cbiAgbmV3UGx1Z2luVGFiLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIilcblxuICAvLyBUZWxsIHRoZSBuZXcgcGx1Z2luIHRvIHN0YXJ0IGRvaW5nIHNvbWUgd29ya1xuICBpZiAocGx1Z2luLndpbGxNb3VudCkgcGx1Z2luLndpbGxNb3VudChzYW5kYm94LCBjb250YWluZXIpXG4gIGlmIChwbHVnaW4ubW9kZWxDaGFuZ2VkKSBwbHVnaW4ubW9kZWxDaGFuZ2VkKHNhbmRib3gsIHNhbmRib3guZ2V0TW9kZWwoKSwgY29udGFpbmVyKVxuICBpZiAocGx1Z2luLm1vZGVsQ2hhbmdlZERlYm91bmNlKSBwbHVnaW4ubW9kZWxDaGFuZ2VkRGVib3VuY2Uoc2FuZGJveCwgc2FuZGJveC5nZXRNb2RlbCgpLCBjb250YWluZXIpXG4gIGlmIChwbHVnaW4uZGlkTW91bnQpIHBsdWdpbi5kaWRNb3VudChzYW5kYm94LCBjb250YWluZXIpXG5cbiAgLy8gTGV0IHRoZSBwcmV2aW91cyBwbHVnaW4gZG8gYW55IHNsb3cgd29yayBhZnRlciBpdCdzIGFsbCBkb25lXG4gIGlmIChwcmV2aW91c1BsdWdpbiAmJiBwcmV2aW91c1BsdWdpbi5kaWRVbm1vdW50KSBwcmV2aW91c1BsdWdpbi5kaWRVbm1vdW50KHNhbmRib3gsIGNvbnRhaW5lcilcbn1cbiJdfQ==