import express from 'express';
//import OpenAI from 'openai';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config({path: 'C:\\repos\\gemCalc\\backend\\.env'});

const app = express();
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json());

console.log(process.env.GEMINI_API_KEY);
console.log(process.env.PORT);

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// El System Prompt que define al Mentor
const SYSTEM_PROMPT =`Eres 'Mentor de Cálculo', un tutor experto, paciente y entusiasta. 
    Tu objetivo no es resolver la tarea, sino guiar al estudiante.
    - Prioriza la intuición antes que las fórmulas.
    - Usa el Método Socrático (responde con pistas o preguntas).
    - Valida errores de álgebra.
    - Usa LaTeX para fórmulas: ejemplo $f'(x) = 2x$.
    - No olvides el +C en integrales indefinidas.`
;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    history: [
        {
            role: "user",
            parts: [{ text: "hola" }]
        },
        {
            role: "model",
            parts: [{ text: SYSTEM_PROMPT }] 
        }
    ]
});



app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body; // Recibimos el historial del chat del cliente



        // Buscamos el índice del primer mensaje que realmente envió el usuario
        //const firstUserIndex = messages.findIndex(m => m.role === 'user');
        
        // Si no hay mensajes del usuario todavía, enviamos un historial vacío
        // Si los hay, empezamos el historial desde ese primer mensaje del usuario
        //const validHistory = firstUserIndex !== -1 ? messages.slice(firstUserIndex, -1) : [];
 
        // 2. Traducir el historial del formato OpenAI/Svelte al formato Gemini
        // Gemini usa "user" y "model" (en lugar de "assistant")
        // Además, el contenido va dentro de un array de "parts"
        /* const history = validHistory.slice(0, -1).map(m => ({ 
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));
         */
        const lastMessage = messages[messages.length - 1].parts[0].text; // El último mensaje del usuario (el que acaba de enviar)

        // 3. Iniciar chat con historial y enviar el nuevo mensaje
        /* const chat = model.startChat({
            history: history,
        });
 */
        const result = await chat.sendMessage({message: lastMessage});
        //const response = await result.response;
        console.log("Respuesta de GEMINI:", result.text);
        const text = result.text;

        res.json({ message: text });

    } catch (error) {
        console.error("Error en GEMINI:", error);
        res.status(500).json({ error: "Error al conectar con Google AI." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Gemini corriendo en http://localhost:${PORT}`));