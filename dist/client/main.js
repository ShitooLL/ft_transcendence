import { getAllScreen } from "./client.js";
document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    console.log("DOM loaded, starting...");
    if (app) {
        const AllScreen = getAllScreen();
        app.appendChild(AllScreen);
    }
});
