/// &lt;reference types="vite/client" /&gt;

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    // Ajoutez d'autres variables d'environnement VITE_ ici si nécessaire
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
