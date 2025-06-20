import { getLocalScreen } from "./client.js";
document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    console.log("DOM loaded, starting...");
    if (app) {
        const localScreen = getLocalScreen(app);
        app.appendChild(localScreen);
        // const multiplayerScreen = getMultiplayerScreen(app);
        // app.appendChild(multiplayerScreen);
    }
});
