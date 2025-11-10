import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.bankEntry.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.route.deleteMany();

  console.log('🧹 Cleared existing data');

  // Seed routes as per specifications
  const routes = [
    {
      routeId: 'R001',
      vesselType: 'Container',
      fuelType: 'HFO',
      year: 2024,
      ghgIntensity: 91.0,
      fuelConsumption: 5000,
      distance: 12000,
      totalEmissions: 5000 * 91.0,
      isBaseline: false
    },
    {
      routeId: 'R002',
      vesselType: 'BulkCarrier',
      fuelType: 'LNG',
      year: 2024,
      ghgIntensity: 88.0,
      fuelConsumption: 4800,
      distance: 11500,
      totalEmissions: 4800 * 88.0,
      isBaseline: false
    },
    {
      routeId: 'R003',
      vesselType: 'Tanker',
      fuelType: 'MGO',
      year: 2024,
      ghgIntensity: 93.5,
      fuelConsumption: 5100,
      distance: 12500,
      totalEmissions: 5100 * 93.5,
      isBaseline: false
    },
    {
      routeId: 'R004',
      vesselType: 'RoRo',
      fuelType: 'HFO',
      year: 2025,
      ghgIntensity: 89.2,
      fuelConsumption: 4900,
      distance: 11800,
      totalEmissions: 4900 * 89.2,
      isBaseline: false
    },
    {
      routeId: 'R005',
      vesselType: 'Container',
      fuelType: 'LNG',
      year: 2025,
      ghgIntensity: 90.5,
      fuelConsumption: 4950,
      distance: 11900,
      totalEmissions: 4950 * 90.5,
      isBaseline: false
    }
  ];

  for (const route of routes) {
    await prisma.route.create({ data: route });
    console.log(`✅ Created route ${route.routeId}`);
  }

  // Set R001 as baseline
  await prisma.route.update({
    where: { routeId: 'R001' },
    data: { isBaseline: true }
  });
  console.log('✅ Set R001 as baseline');

  // Seed some sample compliance data
  const complianceData = [
    {
      shipId: 'SHIP001',
      year: 2024,
      cbGco2eq: 150000.5,
      ghgieActual: 88.5,
      ghgieTarget: 89.3368,
      energyScopeMj: 5500000
    },
    {
      shipId: 'SHIP002',
      year: 2024,
      cbGco2eq: -75000.25,
      ghgieActual: 92.0,
      ghgieTarget: 89.3368,
      energyScopeMj: 5200000
    },
    {
      shipId: 'SHIP003',
      year: 2025,
      cbGco2eq: 200000.75,
      ghgieActual: 87.5,
      ghgieTarget: 89.3368,
      energyScopeMj: 6000000
    }
  ];

  for (const compliance of complianceData) {
    await prisma.shipCompliance.create({ data: compliance });
    console.log(`✅ Created compliance record for ${compliance.shipId}`);
  }

  // Seed some bank entries
  const bankEntries = [
    {
      shipId: 'SHIP001',
      year: 2024,
      amountGco2eq: 100000
    },
    {
      shipId: 'SHIP003',
      year: 2025,
      amountGco2eq: 150000
    }
  ];

  for (const entry of bankEntries) {
    await prisma.bankEntry.create({ data: entry });
    console.log(`✅ Created bank entry for ${entry.shipId}`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
