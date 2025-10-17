import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const WEG_API_URL = process.env.WEG_API_URL || 'https://ecatalog.weg.net/tec_cat/tech_motor_sel_functions.asp';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função auxiliar para fazer a requisição para um cd_produto específico
const getEfficiencyAndId = async (cd_produto, poles, outputHP) => {
  const url = WEG_API_URL;

  const payload = {
    mercado: '000B',
    idioma: 'PT',
    cd_produto: cd_produto.toString(),
    standard: 'IEC',
    frequency: '',
    voltage: '',
    poles: poles.toString(),
    outputHP: outputHP.toFixed(2),
    feet: 'YES',
    flange: 'WITHOUT',
    terminalBox: '',
    defaultLimit: '1',
    offset: '0',
    act: 'getTable',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log(`[DEBUG] cd_produto: ${cd_produto}`);
    console.log(`[DEBUG] Resposta completa da API:`, JSON.stringify(data, null, 2));
    console.log(`[DEBUG] Número de motores retornados: ${data.motor ? data.motor.length : 0}`);

    if (data.motor && data.motor.length > 0) {
      console.log(`[DEBUG] Primeiro motor:`, JSON.stringify(data.motor[0], null, 2));

      const efficiency = data.motor[0].efficiencyAt75;
      const motorId = data.motor[0].id;
      const motorUrl = data.motor[0].moreInformation;
      const speed = data.motor[0].speed;

      console.log(
        `[DEBUG] Dados extraídos - cd_produto: ${cd_produto}, motorId: ${motorId}, efficiency: ${efficiency}, speed: ${speed}`,
      );

      return {
        efficiency: efficiency ? parseFloat(efficiency.replace('%', '')) : null,
        motorId: motorId,
        motorUrl: motorUrl,
        speed: speed ? parseFloat(speed) : null,
      };
    }

    console.log(`[DEBUG] Nenhum motor encontrado para cd_produto: ${cd_produto}`);
    return { efficiency: null, motorId: null, motorUrl: null, speed: null };
  } catch (error) {
    console.error(`[ERROR] Erro ao buscar dados para cd_produto ${cd_produto}:`, error.message);
    throw error;
  }
};

// Rota GET para buscar eficiência de motores
// Importante: Mantemos o prefixo "/api" para que em produção (Vercel) a rota pública seja /api/motors/efficiency
app.get('/api/motors/efficiency', async (req, res) => {
  try {
    const { poles, outputHP } = req.query;

    // Validação dos parâmetros
    if (!poles || !outputHP) {
      return res.status(400).json({
        message: 'Parâmetros obrigatórios: poles e outputHP',
        example: '/api/motors/efficiency?poles=2&outputHP=7.5',
      });
    }

    const polesNum = parseInt(poles);
    const outputHPNum = parseFloat(outputHP);

    if (isNaN(polesNum) || isNaN(outputHPNum)) {
      return res.status(400).json({
        message: 'Os parâmetros poles e outputHP devem ser números válidos',
      });
    }

    console.log('[DEBUG] Iniciando busca de dados para motores...');
    console.log(`[DEBUG] Parâmetros recebidos - poles: ${polesNum}, outputHP: ${outputHPNum}`);

    // Buscar eficiência e ID para ambos os motores em paralelo
    const [oldMotorData, newMotorData] = await Promise.all([
      getEfficiencyAndId(1529, polesNum, outputHPNum), // Motor antigo
      getEfficiencyAndId(2063, polesNum, outputHPNum), // Motor novo
    ]);

    console.log('[DEBUG] Dados do motor antigo (1529):', JSON.stringify(oldMotorData, null, 2));
    console.log('[DEBUG] Dados do motor novo (2063):', JSON.stringify(newMotorData, null, 2));

    res.status(200).json({
      success: true,
      data: {
        old: {
          cd_produto: 1529,
          efficiency: oldMotorData.efficiency,
          motorId: oldMotorData.motorId,
          motorUrl: oldMotorData.motorUrl,
          speed: oldMotorData.speed,
        },
        new: {
          cd_produto: 2063,
          efficiency: newMotorData.efficiency,
          motorId: newMotorData.motorId,
          motorUrl: newMotorData.motorUrl,
          speed: newMotorData.speed,
        },
      },
      parameters: {
        poles: polesNum,
        outputHP: outputHPNum,
      },
    });
  } catch (error) {
    console.error('[ERROR] Erro ao buscar eficiência:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar eficiência dos motores',
      error: error.message,
    });
  }
});

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Servidor Proxy Eletron - WEG Motor Efficiency API',
    version: '1.0.0',
    endpoints: {
      efficiency: '/api/motors/efficiency?poles=2&outputHP=7.5',
      health: '/health',
    },
  });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada',
    path: req.path,
    method: req.method,
  });
});

export default app;
