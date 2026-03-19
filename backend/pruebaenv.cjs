require('dotenv').config({path: '/Users/husaxmac/Documents/GitHub/repos/gemCalc/backend/.env'}); // <-- Aquí ocurre la magia

console.log(process.env.PORT);   // Imprime: 8080
console.log(process.env.OPENAI_API_KEY); // Imprime: 12345abcde