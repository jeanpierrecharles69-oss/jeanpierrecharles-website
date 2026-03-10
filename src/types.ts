/**
 * Types v3.1 — Copie partielle depuis root types.ts
 * Seul ChatMessage est nécessaire pour AegisChat.tsx
 */

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}
