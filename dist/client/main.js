import { getPongScreen } from "../client/render/render2D.js";
document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    console.log("DOM loaded, starting...");
    if (app) {
        const pongScreen = getPongScreen(app);
        app.appendChild(pongScreen);
    }
});
