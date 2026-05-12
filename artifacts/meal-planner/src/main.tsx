import "./lib/installPromptCapture"; // capture beforeinstallprompt before React mounts
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
