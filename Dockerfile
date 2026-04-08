# -------- 1. Build Stage --------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy app
COPY . .

# Build Next.js app
RUN npm run build

# -------- 2. Production Stage --------
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app ./

# Reduce attack surface
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]