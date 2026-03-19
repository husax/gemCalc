<script>
  import { tick } from 'svelte';
  import { marked } from 'marked';
  import katex from 'katex';
  import 'katex/dist/katex.min.css';

  let messages = [
    { role: 'assistant', content: '¡Hola! Soy tu **Mentor de Cálculo**. ¿Qué concepto o ejercicio te gustaría explorar hoy?' }
  ];
  let userInput = '';
  let chatContainer;

  // El System Prompt que definimos anteriormente
  const SystemPrompt = `Eres "Mentor de Cálculo", un tutor experto, paciente y entusiasta`+
          ` especializado en Cálculo Diferencial e Integral. Tu objetivo no es resolver la tarea del estudiante,`+
          ` sino guiarlo para que desarrolle pensamiento matemático y autonomía.`+
          `Directrices de Comportamiento:Prioriza la Intuición: Antes de mostrar una fórmula, explica el concepto físico o geométrico.`+
          ` Usa analogías (ej. velocidad, crecimiento de poblaciones, pendientes de montañas).Método Socrático:`+
          ` Cuando el estudiante haga una pregunta, responde con una pista o una pregunta orientadora que lo`+
          ` obligue a pensar en el siguiente paso.Validación de Pasos: Si el estudiante muestra un procedimiento,`+
          ` revisa cada línea. Si hay un error de álgebra (que es lo más común), identifícalo antes de avanzar al concepto de cálculo.`+
          `Uso de Notación: Utiliza siempre Markdown y LaTeX para que las fórmulas sean legibles.`+
          ` Ejemplo: $f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$.Fomento del Rigor: Aunque seas amigable, no permitas imprecisiones`+
          ` graves (como olvidar el $+ C$ en una integral indefinida o el $dx$ en la notación).Estructura de Respuesta:Breve validación:`+
          ` "¡Vas por buen camino con esa derivada!" o "Entiendo, los límites al infinito pueden ser confusos al principio".`+
          `El "Andamiaje": Una explicación conceptual o una pregunta clave.Visualización sugerida: Describe cómo se vería la gráfica de la función para ayudar a la abstracción.`;

  // Función para procesar Markdown + LaTeX
  function renderContent(content) {
    // 1. Renderizar Markdown básico
    let html = marked.parse(content);
    
    // 2. Buscar patrones de LaTeX (ej: $f(x)$ o $$f(x)$$) y renderizarlos con KaTeX
    // Nota: Esta es una implementación simplificada.
    return html.replace(/\$+(.*?)\$+/g, (match, formula) => {
      try {
        return katex.renderToString(formula, { throwOnError: false });
      } catch (e) {
        return formula;
      }
    });
  }

  async function sendMessage() {
      if (!userInput.trim()) return;

      const userMsg = { role: 'user', content: userInput };
      // Guardamos el historial localmente para la UI
      messages = [...messages, userMsg];
      
      const textToSend = userInput;
      userInput = '';
      await scrollToBottom();

      try {
          // Llamada real a nuestro backend de Node.js
          const response = await fetch('http://localhost:3000/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  // Enviamos todo el historial menos el primer mensaje de bienvenida
                  messages: messages.map(m => ({ role: m.role, content: m.content })) 
              })
          });

          const data = await response.json();
          
          if (data.message) {
              messages = [...messages, { role: 'assistant', content: data.message }];
          } else {
              throw new Error("Respuesta vacía");
          }

          await scrollToBottom();
      } catch (error) {
          console.error("Error al conectar:", error);
          messages = [...messages, { 
              role: 'assistant', 
              content: 'Lo siento, tuve un problema de conexión. ¿Puedes repetir?' 
          }];
      }
  }

  async function scrollToBottom() {
    await tick();
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Simulación de respuesta del IA para pruebas
  async function fakeApiCall(text) {
    return "Entiendo tu duda. Antes de aplicar la fórmula, visualicemos la función. Si tenemos $f(x) = x^2$, la pendiente en cualquier punto es $2x$. ¿Qué sucede si intentamos calcular el límite $\\lim_{h \\to 0} \\frac{(x+h)^2 - x^2}{h}$?";
  }
</script>

<main class="chat-wrapper">
  <header>
    <h1>Calculus Mentor</h1>
  </header>

  <div class="chat-box" bind:this={chatContainer}>
    {#each messages as msg}
      <div class="message {msg.role}">
        <div class="bubble">
          {@html renderContent(msg.content)}
        </div>
      </div>
    {/each}
  </div>

  <div class="input-area">
    <input 
      bind:value={userInput} 
      on:keypress={(e) => e.key === 'Enter' && sendMessage()}
      placeholder="Escribe tu duda sobre derivadas o integrales..."
    />
    <button on:click={sendMessage}>Enviar</button>
  </div>
</main>

<style>
  :global(body) { background: #f4f7f6; font-family: sans-serif; }
  
  .chat-wrapper {
    max-width: 600px;
    margin: 2rem auto;
    display: flex;
    flex-direction: column;
    height: 80vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }

  header { background: #2c3e50; color: white; padding: 1rem; border-radius: 12px 12px 0 0; text-align: center; }

  .chat-box {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message { display: flex; width: 100%; }
  .message.user { justify-content: flex-end; }
  
  .bubble {
    max-width: 80%;
    padding: 0.8rem 1.2rem;
    border-radius: 15px;
    line-height: 1.5;
  }

  .assistant .bubble { background: #e8f0fe; color: #2c3e50; border-bottom-left-radius: 2px; }
  .user .bubble { background: #2c3e50; color: white; border-bottom-right-radius: 2px; }

  .input-area {
    display: flex;
    padding: 1rem;
    border-top: 1px solid #eee;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    outline: none;
  }

  button {
    padding: 0.8rem 1.5rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
</style>
