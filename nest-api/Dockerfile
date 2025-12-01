FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# ⚠️ Adicionado para mostrar erros de compilação TS
RUN npm run build || (echo "❌ BUILD FAILED" && cat /app/dist/*.js 2>/dev/null && exit 1)

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
