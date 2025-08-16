
# Simple container that serves both frontend and backend
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev || npm install --production
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
