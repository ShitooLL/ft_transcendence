import { getMultiplayerScreen } from "./client.js";
document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    console.log("DOM loaded, starting...");
    if (app) {
        // const pongScreen = getPongScreen(app);
        // app.appendChild(pongScreen);
        const MultiplayerScreen = getMultiplayerScreen(app);
        app.appendChild(MultiplayerScreen);
    }
});
