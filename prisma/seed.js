// prisma/seed.js – Dados iniciais do AltaBus
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PONTOS = [
  { nome: 'Ponto 1 - Posto Castelinho',           latitude: -20.521139, longitude: -40.985417, ordem: 1  },
  { nome: 'Ponto 2 - Posto Beira Rio',             latitude: -20.596750, longitude: -41.023194, ordem: 2  },
  { nome: 'Ponto 3 - Campo de fruteiras',          latitude: -20.604611, longitude: -41.028278, ordem: 3  },
  { nome: 'Ponto 4 - Departamento',                latitude: -20.618194, longitude: -41.024694, ordem: 4  },
  { nome: 'Ponto 5 - Rancho da Lagoa',             latitude: -20.627472, longitude: -41.016222, ordem: 5  },
  { nome: 'Ponto 6 - Ponte do AYD',                latitude: -20.636999, longitude: -41.014028, ordem: 6  },
  { nome: 'Ponto 7 - Supermercado da Vila Esperança', latitude: -20.655694, longitude: -41.019333, ordem: 7 },
  { nome: 'Ponto 8 - Rodoviária de Vargem Alta',  latitude: -20.673694, longitude: -41.010972, ordem: 8  },
  { nome: 'Ponto 9 - Oficina Jacigua',             latitude: -20.706889, longitude: -41.027472, ordem: 9  },
  { nome: 'Ponto 10 - Casarão',                    latitude: -20.705000, longitude: -41.019889, ordem: 10 },
  { nome: 'Ponto 11 - Bar do Machados',            latitude: -20.705500, longitude: -41.017694, ordem: 11 },
  { nome: 'Ponto 12 - Bar da Linha',               latitude: -20.710750, longitude: -41.016222, ordem: 12 },
  { nome: 'Ponto 14 - CEET Giuseppe Altoe',        latitude: -20.721583, longitude: -41.010861, ordem: 14 },
];

const USUARIOS = [
  { nome: 'Motorista AltaBus', email: 'motorista@altabus.com', senha: '123456', tipo: 'motorista' },
  { nome: 'Antonio',           email: 'cliente@altabus.com',   senha: '123456', tipo: 'cliente'   },
  { nome: 'Kaillan',           email: 'cliente1@altabus.com',  senha: '123456', tipo: 'cliente'   },
  { nome: 'Carolina',         email: 'passonicarol@gmail.com', senha: '123456', tipo: 'cliente'   },
];

async function main() {
  console.log('🌱 Iniciando seed do AltaBus...\n');

  // Pontos
  for (const ponto of PONTOS) {
    await prisma.ponto.upsert({
      where: { nome: ponto.nome },
      update: {},
      create: ponto,
    });
  }
  console.log(`✅ ${PONTOS.length} pontos inseridos/verificados`);

  // Usuários
  for (const u of USUARIOS) {
    const senhaHash = await bcrypt.hash(u.senha, 12);
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nome: u.nome,
        email: u.email,
        senhaHash,
        tipo: u.tipo,
      },
    });
  }
  console.log(`✅ ${USUARIOS.length} usuários inseridos/verificados`);

  // Veículo padrão
  await prisma.veiculo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nome: 'Ônibus AltaBus Principal',
      placa: 'XXX-0000',
      deviceIdTraccar: '13519',
      ativo: true,
    },
  });
  console.log('✅ Veículo padrão inserido/verificado');

  console.log('\n🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
