import { PrismaClient, BlockType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ServerFactory database...\n');

  // ─── Admin user ──────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@serverfactory.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345';
  const hash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', passwordHash: hash },
    create: {
      email: adminEmail,
      name: 'Admin',
      passwordHash: hash,
      role: 'ADMIN',
    },
  });
  console.log(`✔ Admin user: ${adminEmail} / ${adminPassword}`);

  // ─── Categories (hierarchical — up to 3 levels) ──
  type SeedCat = { slug: string; name: string; description?: string; children?: SeedCat[] };
  const catData: SeedCat[] = [
    { slug: 'servers', name: 'Servers', description: 'Enterprise-grade servers for every workload', children: [
      { slug: 'rack-servers', name: 'Rack Servers', children: [
        { slug: 'rack-1u', name: '1U Rack Servers' },
        { slug: 'rack-2u', name: '2U Rack Servers' },
        { slug: 'rack-4u', name: '4U Rack Servers' },
      ]},
      { slug: 'gpu-servers', name: 'GPU Servers', children: [
        { slug: 'gpu-ai-training', name: 'AI Training' },
        { slug: 'gpu-inference', name: 'Inference' },
      ]},
      { slug: 'storage-servers', name: 'Storage Servers' },
      { slug: 'backup-servers', name: 'Backup Servers' },
      { slug: 'dedicated-servers', name: 'Dedicated Servers' },
    ]},
    { slug: 'workstations', name: 'Workstations', description: 'High-performance workstations for professionals', children: [
      { slug: 'dell-precision', name: 'Dell Precision', children: [
        { slug: 'precision-tower', name: 'Tower' },
        { slug: 'precision-mobile', name: 'Mobile' },
      ]},
      { slug: 'hp-z-series', name: 'HP Z Series' },
      { slug: 'lenovo-thinkstation', name: 'Lenovo ThinkStation' },
    ]},
    { slug: 'components', name: 'Components', description: 'Server-grade CPUs, RAM, storage and more', children: [
      { slug: 'processors', name: 'Processors', children: [
        { slug: 'intel-xeon', name: 'Intel Xeon' },
        { slug: 'amd-epyc', name: 'AMD EPYC' },
      ]},
      { slug: 'memory', name: 'Memory' },
      { slug: 'storage', name: 'Storage', children: [
        { slug: 'ssd', name: 'SSD' },
        { slug: 'nvme', name: 'NVMe' },
        { slug: 'hdd', name: 'HDD' },
      ]},
    ]},
    { slug: 'rentals', name: 'Rentals', description: 'Rent enterprise hardware by the month' },
  ];

  const categoryMap: Record<string, string> = {};

  async function upsertCat(c: SeedCat, parentId: string | null, sortOrder: number) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description ?? null, parentId, sortOrder },
      create: { slug: c.slug, name: c.name, description: c.description ?? null, parentId, sortOrder },
    });
    categoryMap[c.slug] = row.id;
    if (c.children?.length) {
      for (const [cidx, child] of c.children.entries()) {
        await upsertCat(child, row.id, cidx);
      }
    }
  }

  for (const [idx, top] of catData.entries()) {
    await upsertCat(top, null, idx);
  }
  console.log(`✔ Categories seeded`);

  // ─── Products with configurator options ───
  // Wipe existing demo products to keep seed idempotent
  await prisma.optionValue.deleteMany({});
  await prisma.optionGroup.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});

  const products = [
    {
      sku: 'DELL-R740-01',
      name: 'Dell PowerEdge R740',
      slug: 'dell-poweredge-r740',
      brand: 'Dell',
      shortDesc: '2U rack server, dual Xeon Scalable, up to 3TB RAM',
      description: 'The Dell PowerEdge R740 is a highly versatile 2U rack server delivering exceptional performance for the most demanding workloads — from AI/ML to virtualisation, databases and HPC.',
      basePrice: 185000,
      stock: 12,
      isFeatured: true,
      categorySlug: 'rack-servers',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
    },
    {
      sku: 'HPE-DL380-01',
      name: 'HPE ProLiant DL380 Gen10',
      slug: 'hpe-proliant-dl380-gen10',
      brand: 'HPE',
      shortDesc: 'Industry-standard 2U rack server',
      description: 'The HPE ProLiant DL380 Gen10 delivers security, agility and flexibility without compromise. Supports a wide range of Intel Xeon Scalable processors and memory options.',
      basePrice: 165000,
      stock: 8,
      isFeatured: true,
      categorySlug: 'rack-servers',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80',
    },
    {
      sku: 'NVIDIA-DGX-A100',
      name: 'NVIDIA DGX A100 GPU Server',
      slug: 'nvidia-dgx-a100-gpu-server',
      brand: 'NVIDIA',
      shortDesc: 'Universal system for AI infrastructure',
      description: 'Purpose-built for AI, the DGX A100 packs eight NVIDIA A100 Tensor Core GPUs and delivers 5 petaFLOPS of AI performance in a single node.',
      basePrice: 1450000,
      stock: 3,
      isFeatured: true,
      categorySlug: 'gpu-servers',
      image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=1200&q=80',
    },
    {
      sku: 'DELL-R750XS-01',
      name: 'Dell PowerEdge R750xs',
      slug: 'dell-poweredge-r750xs',
      brand: 'Dell',
      shortDesc: '2U storage-focused server, up to 16 drives',
      description: 'Optimised for software-defined storage and dense data workloads.',
      basePrice: 220000,
      stock: 6,
      categorySlug: 'storage-servers',
      image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=1200&q=80',
    },
    {
      sku: 'DELL-PREC-7960',
      name: 'Dell Precision 7960 Tower',
      slug: 'dell-precision-7960-tower',
      brand: 'Dell',
      shortDesc: 'Flagship workstation for AI & rendering',
      description: 'The most powerful Dell Precision ever built. Configure with Xeon-W, up to 2TB RAM and dual RTX 6000 Ada.',
      basePrice: 325000,
      stock: 4,
      isFeatured: true,
      categorySlug: 'dell-precision',
      image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1200&q=80',
    },
    {
      sku: 'HP-Z8-G5',
      name: 'HP Z8 G5 Workstation',
      slug: 'hp-z8-g5-workstation',
      brand: 'HP',
      shortDesc: 'Dual-socket workstation for extreme workloads',
      description: 'Dual Intel Xeon W, support for up to 4 GPUs and massive memory capacity.',
      basePrice: 340000,
      stock: 3,
      categorySlug: 'hp-z-series',
      image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&q=80',
    },
    {
      sku: 'LEN-TS-P620',
      name: 'Lenovo ThinkStation P620',
      slug: 'lenovo-thinkstation-p620',
      brand: 'Lenovo',
      shortDesc: 'Threadripper PRO workstation',
      description: 'The world\'s first AMD Ryzen Threadripper PRO workstation. Up to 64 cores.',
      basePrice: 295000,
      stock: 5,
      isFeatured: true,
      categorySlug: 'lenovo-thinkstation',
      image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84a94?w=1200&q=80',
    },
    {
      sku: 'CPU-XEON-GOLD-6248',
      name: 'Intel Xeon Gold 6248',
      slug: 'intel-xeon-gold-6248',
      brand: 'Intel',
      shortDesc: '20 cores / 40 threads, 2.5 GHz base',
      description: 'Intel Xeon Gold 6248 processor. Ideal for enterprise servers and high-performance computing.',
      basePrice: 42000,
      stock: 50,
      categorySlug: 'processors',
      image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=1200&q=80',
    },
    {
      sku: 'RAM-DDR4-64G',
      name: 'Samsung 64GB DDR4 ECC RDIMM',
      slug: 'samsung-64gb-ddr4-ecc-rdimm',
      brand: 'Samsung',
      shortDesc: 'Server-grade ECC memory, 3200 MT/s',
      description: 'Enterprise-grade 64GB DDR4-3200 ECC Registered DIMM for mission-critical servers.',
      basePrice: 18500,
      stock: 80,
      categorySlug: 'memory',
      image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=1200&q=80',
    },
    {
      sku: 'SSD-U2-NVME-3T',
      name: 'Kioxia CM6 3.2TB U.2 NVMe SSD',
      slug: 'kioxia-cm6-3-2tb-u2-nvme-ssd',
      brand: 'Kioxia',
      shortDesc: 'Enterprise NVMe SSD, PCIe Gen4',
      description: 'Mixed-use enterprise NVMe SSD, 6,900 MB/s sequential read.',
      basePrice: 68000,
      stock: 25,
      categorySlug: 'storage',
      image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1200&q=80',
    },
  ];

  // Configurator presets
  const cpuOptions = [
    { label: 'Intel Xeon Silver 4210R (10C/2.4GHz)', priceDelta: 0, isDefault: true },
    { label: 'Intel Xeon Gold 5218 (16C/2.3GHz)', priceDelta: 35000 },
    { label: 'Intel Xeon Gold 6248 (20C/2.5GHz)', priceDelta: 78000 },
    { label: 'Intel Xeon Platinum 8280 (28C/2.7GHz)', priceDelta: 185000 },
    { label: 'Dual Intel Xeon Gold 6248', priceDelta: 165000 },
  ];
  const ramOptions = [
    { label: '32 GB DDR4 ECC', priceDelta: 0, isDefault: true },
    { label: '64 GB DDR4 ECC', priceDelta: 12000 },
    { label: '128 GB DDR4 ECC', priceDelta: 36000 },
    { label: '256 GB DDR4 ECC', priceDelta: 82000 },
    { label: '512 GB DDR4 ECC', priceDelta: 175000 },
    { label: '1 TB DDR4 ECC', priceDelta: 380000 },
  ];
  const storageOptions = [
    { label: '2× 480 GB SATA SSD (RAID 1)', priceDelta: 0, isDefault: true },
    { label: '2× 1 TB SATA SSD (RAID 1)', priceDelta: 8000 },
    { label: '4× 1.92 TB SSD (RAID 10)', priceDelta: 48000 },
    { label: '2× 1.6 TB U.2 NVMe (RAID 1)', priceDelta: 68000 },
    { label: '4× 3.84 TB U.2 NVMe (RAID 10)', priceDelta: 240000 },
  ];
  const osOptions = [
    { label: 'No OS (bare metal)', priceDelta: 0, isDefault: true },
    { label: 'Ubuntu Server 22.04 LTS', priceDelta: 0 },
    { label: 'Rocky Linux 9', priceDelta: 0 },
    { label: 'RHEL 9 (licensed)', priceDelta: 28000 },
    { label: 'Windows Server 2022 Standard', priceDelta: 42000 },
    { label: 'Windows Server 2022 Datacenter', priceDelta: 125000 },
  ];
  const panelOptions = [
    { label: 'None', priceDelta: 0, isDefault: true },
    { label: 'cPanel / WHM (Admin Cloud)', priceDelta: 15000 },
    { label: 'Plesk Web Host Edition', priceDelta: 12000 },
  ];
  const addonOptions = [
    { label: 'None', priceDelta: 0, isDefault: true },
    { label: 'Managed Backup (1 TB)', priceDelta: 6500 },
    { label: 'Hardware Firewall', priceDelta: 18000 },
    { label: '24×7 Monitoring', priceDelta: 9000 },
    { label: 'Full Management Bundle', priceDelta: 32000 },
  ];

  // Simpler option sets for components (single build option, mostly)
  const simpleWarranty = [
    { label: '1-Year Warranty', priceDelta: 0, isDefault: true },
    { label: '3-Year Warranty', priceDelta: 4500 },
    { label: '5-Year Warranty', priceDelta: 9000 },
  ];

  for (const p of products) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) throw new Error(`Missing category: ${p.categorySlug}`);

    const created = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        shortDesc: p.shortDesc,
        description: p.description,
        basePrice: p.basePrice,
        stock: p.stock,
        isFeatured: p.isFeatured ?? false,
        categoryId,
        metaTitle: `${p.name} | Buy ${p.brand} at ServerFactory`,
        metaDescription: `${p.shortDesc}. Configure & buy ${p.name} with customisable CPU, RAM, storage. Fast delivery across India.`,
        images: { create: [{ url: p.image, alt: p.name, sortOrder: 0 }] },
      },
    });

    const isServerOrWorkstation = ['servers', 'workstations'].some((root) =>
      ['rack-servers', 'gpu-servers', 'storage-servers', 'backup-servers', 'dedicated-servers',
       'dell-precision', 'hp-z-series', 'lenovo-thinkstation'].includes(p.categorySlug)
    );

    if (isServerOrWorkstation) {
      // Full configurator
      const groups = [
        { name: 'cpu', label: 'CPU', values: cpuOptions, sortOrder: 0 },
        { name: 'ram', label: 'RAM', values: ramOptions, sortOrder: 1 },
        { name: 'storage', label: 'Storage', values: storageOptions, sortOrder: 2 },
        { name: 'os', label: 'Operating System', values: osOptions, sortOrder: 3 },
        { name: 'control-panel', label: 'Control Panel', values: panelOptions, sortOrder: 4 },
        { name: 'addons', label: 'Add-ons', values: addonOptions, sortOrder: 5 },
      ];
      for (const g of groups) {
        await prisma.optionGroup.create({
          data: {
            productId: created.id,
            name: g.name,
            label: g.label,
            sortOrder: g.sortOrder,
            values: { create: g.values.map((v, i) => ({ ...v, sortOrder: i })) },
          },
        });
      }
    } else {
      // Simple warranty selector for components
      await prisma.optionGroup.create({
        data: {
          productId: created.id,
          name: 'warranty',
          label: 'Warranty',
          sortOrder: 0,
          values: { create: simpleWarranty.map((v, i) => ({ ...v, sortOrder: i })) },
        },
      });
    }

    console.log(`  ✔ ${p.name}`);
  }

  // ─── Sample tiers for flagship products ──
  // Attach Basic/Intermediate/Advanced presets to a couple of products as examples.
  const tieredProducts = await prisma.product.findMany({
    where: { slug: { in: ['dell-poweredge-r740', 'dell-precision-7960-tower'] } },
    include: { optionGroups: { include: { values: true } } },
  });

  for (const p of tieredProducts) {
    const getVal = (groupName: string, labelIncludes: string) => {
      const group = p.optionGroups.find((g) => g.name === groupName);
      return group?.values.find((v) => v.label.toLowerCase().includes(labelIncludes.toLowerCase()))?.id;
    };

    const tierDefs = [
      {
        name: 'BASIC' as const,
        label: 'Basic',
        description: 'Great for small workloads, web servers, and development environments.',
        picks: {
          cpu: 'silver 4210r',
          ram: '32 gb',
          storage: '2× 480',
          os: 'ubuntu',
          'control-panel': 'none',
          addons: 'none',
        },
      },
      {
        name: 'INTERMEDIATE' as const,
        label: 'Intermediate',
        description: 'Balanced configuration for mid-sized teams, databases, and virtualization.',
        picks: {
          cpu: 'gold 5218',
          ram: '128 gb',
          storage: '4× 1.92',
          os: 'ubuntu',
          'control-panel': 'none',
          addons: '24×7 monitoring',
        },
      },
      {
        name: 'ADVANCED' as const,
        label: 'Advanced',
        description: 'High-performance build for AI/ML, HPC, and enterprise workloads.',
        picks: {
          cpu: 'gold 6248',
          ram: '256 gb',
          storage: '4× 3.84',
          os: 'rhel',
          'control-panel': 'cpanel',
          addons: 'full management',
        },
      },
    ];

    for (const [idx, t] of tierDefs.entries()) {
      const valueIds = Object.entries(t.picks)
        .map(([groupName, label]) => getVal(groupName, label))
        .filter(Boolean) as string[];

      await prisma.productTier.create({
        data: {
          productId: p.id,
          name: t.name,
          label: t.label,
          description: t.description,
          sortOrder: idx,
          selections: { create: valueIds.map((vid) => ({ optionValueId: vid })) },
        },
      });
    }
    console.log(`  ✔ Tiers added for ${p.name}`);
  }

  // ─── Landing page blocks ─────────────────
  await prisma.landingBlock.deleteMany({});
  await prisma.landingBlock.createMany({
    data: [
      {
        type: BlockType.HERO_CAROUSEL,
        title: 'Homepage hero',
        sortOrder: 0,
        data: {
          slides: [
            {
              imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80',
              heading: 'Find Your Perfect Server',
              subheading: 'Search over 60+ enterprise configurations from Dell, HP, and Lenovo.',
              ctaText: 'Shop Servers',
              ctaLink: '/category/servers',
            },
            {
              imageUrl: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=1920&q=80',
              heading: 'Next-Gen GPU Workstations',
              subheading: 'Built for AI, rendering and extreme workloads.',
              ctaText: 'Explore GPU Servers',
              ctaLink: '/category/gpu-servers',
            },
          ],
        },
      },
      {
        type: BlockType.PROMO_BANNER,
        title: 'Sale banner',
        sortOrder: 1,
        data: {
          text: '🎉 Financial Year End Sale — Save up to ₹1,50,000 on Dell PowerEdge configurations. Ends March 31.',
          link: '/category/servers',
          bgColor: '#71BC0A',
        },
      },
      {
        type: BlockType.FEATURED_PRODUCTS,
        title: 'Featured Products',
        sortOrder: 2,
        data: { heading: 'Featured Hardware', limit: 8 },
      },
      {
        type: BlockType.CATEGORY_GRID,
        title: 'Shop by Category',
        sortOrder: 3,
        data: { heading: 'Shop by Category' },
      },
      {
        type: BlockType.BRAND_LOGOS,
        title: 'Brands',
        sortOrder: 4,
        data: { heading: 'Trusted by the best', brands: ['Dell', 'HP', 'Lenovo', 'NVIDIA', 'Intel', 'Cisco'] },
      },
      {
        type: BlockType.CTA,
        title: 'Bottom CTA',
        sortOrder: 5,
        data: {
          heading: 'Not sure what you need?',
          subheading: 'Our engineers will spec the perfect server for your workload — free consultation.',
          ctaText: 'Talk to an engineer',
          ctaLink: '/contact',
        },
      },
    ],
  });

  // ─── Site settings ───────────────────────
  await prisma.siteSetting.upsert({
    where: { key: 'contact' },
    update: {
      value: {
        email: 'sales@serverfactory.com',
        phone: '+91 80 4000 0000',
        address: 'Bengaluru, Karnataka, India',
      },
    },
    create: {
      key: 'contact',
      value: {
        email: 'sales@serverfactory.com',
        phone: '+91 80 4000 0000',
        address: 'Bengaluru, Karnataka, India',
      },
    },
  });

  console.log('\n✨ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
