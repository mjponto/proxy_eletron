# Servidor Proxy Eletron - WEG Motor Efficiency API

Servidor Node.js que funciona como proxy para fazer requisições à API de eficiência de motores WEG.

## 📋 Pré-requisitos

- Node.js (versão 16.x ou superior)
- npm ou yarn

## 🚀 Instalação

1. Clone ou navegue até o diretório do projeto:
```bash
cd ProxyEletron
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (arquivo `.env` já está criado):
```
PORT=3000
NODE_ENV=development
WEG_API_URL=https://ecatalog.weg.net/tec_cat/tech_motor_sel_functions.asp
```

## 🏃 Executando o Servidor

### Modo de produção:
```bash
npm start
```

### Modo de desenvolvimento (com auto-reload):
```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000` (ou na porta definida pela variável `PORT`).

## ☁️ Deploy na Vercel

Este projeto já está preparado para deploy na Vercel como Funções Serverless:

- A pasta `api/` contém o entrypoint `index.js` que exporta o app Express
- O arquivo `vercel.json` define o runtime Node 20 e variáveis de ambiente
- As rotas ficam disponíveis em `https://<seu-projeto>.vercel.app/api/motors/efficiency`

### Passo a passo

1. Faça login na Vercel e importe este repositório
2. Nas configurações do projeto, garanta:
  - Framework Preset: Other
  - Build Command: (em branco)
  - Output Directory: (em branco)
  - Environment Variables: `WEG_API_URL` se desejar sobrescrever
3. Deploy

Após o deploy, teste:

```
GET https://<seu-projeto>.vercel.app/api/motors/efficiency?poles=2&outputHP=7.5
```

## 📡 Endpoints

### 1. Health Check
```
GET /health
```
Retorna o status do servidor.

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-17T10:30:00.000Z",
  "uptime": 1234.56
}
```

### 2. Buscar Eficiência de Motores
```
GET /api/motors/efficiency?poles=2&outputHP=7.5
```

**Parâmetros Query:**
- `poles` (obrigatório): Número de polos do motor (ex: 2, 4, 6, 8)
- `outputHP` (obrigatório): Potência de saída em HP (ex: 7.5, 10, 15)

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "old": {
      "cd_produto": 1529,
      "efficiency": 92.5,
      "motorId": "ABC123",
      "motorUrl": "http://...",
      "speed": 1500
    },
    "new": {
      "cd_produto": 2063,
      "efficiency": 93.2,
      "motorId": "DEF456",
      "motorUrl": "http://...",
      "speed": 1500
    }
  },
  "parameters": {
    "poles": 2,
    "outputHP": 7.5
  }
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "message": "Erro ao buscar eficiência dos motores",
  "error": "Mensagem de erro"
}
```

## 📝 Exemplos de Uso

### Com cURL:
```bash
curl "http://localhost:3000/api/motors/efficiency?poles=2&outputHP=7.5"
```

### Com Fetch (JavaScript/Node.js):
```javascript
const response = await fetch('http://localhost:3000/api/motors/efficiency?poles=2&outputHP=7.5');
const data = await response.json();
console.log(data);
```

### Com Python:
```python
import requests

response = requests.get('http://localhost:3000/api/motors/efficiency', 
                       params={'poles': 2, 'outputHP': 7.5})
print(response.json())
```

## 🔍 Logs e Debug

O servidor imprime logs detalhados no console, inclui informações sobre:
- Parâmetros recebidos
- Respostas da API WEG
- Dados extraídos dos motores
- Erros e exceções

## 📁 Estrutura do Projeto

```
ProxyEletron/
├── server.js          # Arquivo principal do servidor
├── package.json       # Dependências do projeto
├── .env              # Variáveis de ambiente
├── .gitignore        # Arquivos ignorados pelo Git
└── README.md         # Este arquivo
```

## 🛠️ Dependências

- **express**: Framework web para Node.js
- **dotenv**: Gerenciador de variáveis de ambiente
- **node-fetch**: Cliente HTTP para fazer requisições

## 📌 Notas Importantes

- O servidor faz requisições simultâneas para ambos os motores (antigo e novo) para melhor performance
- Os dados são logados no console para fins de debug
- A API WEG requer o User-Agent correto para aceitar as requisições
- Os parâmetros são validados antes de fazer as requisições

## 🐛 Troubleshooting

### Erro: "Cannot find module 'express'"
```bash
npm install
```

### Erro: "PORT already in use"
Mude a porta no arquivo `.env`:
```
PORT=3001
```

### Timeout na requisição para WEG
Verifique a conexão com a internet e se a URL da API WEG está correta.

## 📄 Licença

ISC

---

**Desenvolvido para ProxyEletron**
