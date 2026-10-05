import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding HOMEService Cooperative Marketplace database...');

  // Clear existing
  await prisma.auditLog.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.demandAnalytics.deleteMany();
  await prisma.workerAllocation.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.insuranceClaim.deleteMany();
  await prisma.insuranceCoverage.deleteMany();
  await prisma.workerWelfare.deleteMany();
  await prisma.welfareScheme.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingOffer.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.subscriptionMember.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.workerSubscription.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.workerAvailability.deleteMany();
  await prisma.workerTraining.deleteMany();
  await prisma.workerCertification.deleteMany();
  await prisma.workerSkill.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.society.deleteMany();
  await prisma.cooperative.deleteMany();
  await prisma.user.deleteMany();
  await prisma.pricingConfig.deleteMany();

  // Pricing Config
  await prisma.pricingConfig.create({
    data: {
      key: 'DEFAULT',
      customerAnnualFamilyPrice: 1499,
      workerAnnualMembershipPrice: 499,
      platformFeePct: 5.0,
      cooperativeSharePct: 5.0,
      emergencySurchargePct: 20.0,
    }
  });

  // Cooperative & Societies
  const coop = await prisma.cooperative.create({
    data: {
      name: 'Tamil Nadu Labour Welfare Cooperative Federation Ltd.',
      code: 'TNL-FED-01',
      state: 'Tamil Nadu',
      district: 'Chennai',
      contactEmail: 'contact@tncoopservices.gov.in (Demo)',
      contactPhone: '1800-425-WORK',
      address: 'Cooperative Bhavanam, Gandhi Irwin Road, Egmore, Chennai 600008',
      activeWorkersCount: 48,
    }
  });

  const society1 = await prisma.society.create({
    data: {
      cooperativeId: coop.id,
      name: 'Tambaram Labour & Artisans Cooperative Society',
      code: 'CHN-SOC-01',
      zone: 'Tambaram & Chromepet Zone',
      address: 'GST Road, West Tambaram, Chennai 600045',
    }
  });

  const society2 = await prisma.society.create({
    data: {
      cooperativeId: coop.id,
      name: 'Guindy & Pallavaram Skilled Workers Society',
      code: 'CHN-SOC-02',
      zone: 'Guindy & Pallavaram Zone',
      address: 'Mount-Poonamallee High Rd, Guindy, Chennai 600032',
    }
  });

  // Password hash for all demo users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Customer 001 (Subscribed to Family Plan)
  const userCust1 = await prisma.user.create({
    data: {
      email: 'customer1@homeservice.coop',
      mobile: '9876543210',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      preferredLanguage: 'en',
    }
  });

  const cust1 = await prisma.customer.create({
    data: {
      userId: userCust1.id,
      fullName: 'Aravind Krishnan',
      city: 'Chennai',
      pinCode: '600045',
      address: 'Flat 4B, Shanthi Niketan Apt, GST Road, Tambaram East, Chennai',
      latitude: 12.9250,
      longitude: 80.1470,
    }
  });

  // Subscription for Customer 1
  const subCust1 = await prisma.subscription.create({
    data: {
      customerId: cust1.id,
      planType: 'ANNUAL_FAMILY',
      price: 1499,
      startDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
      endDate: new Date(Date.now() + 335 * 24 * 3600 * 1000),
      status: 'ACTIVE',
      isDemo: true,
    }
  });

  // Family Members for Customer 1 (2 existing members: Meena + Karthik)
  const fam1 = await prisma.familyMember.create({
    data: {
      customerId: cust1.id,
      name: 'Meena Krishnan (Spouse)',
      mobile: '9876543212',
      canBook: true,
      canBookEmergency: true,
      canViewPayments: true,
      status: 'ACTIVE',
    }
  });

  const fam2 = await prisma.familyMember.create({
    data: {
      customerId: cust1.id,
      name: 'Suresh Krishnan (Father)',
      mobile: '9876543213',
      canBook: true,
      canBookEmergency: true,
      canViewPayments: false,
      status: 'ACTIVE',
    }
  });

  await prisma.subscriptionMember.createMany({
    data: [
      { subscriptionId: subCust1.id, familyMemberId: fam1.id },
      { subscriptionId: subCust1.id, familyMemberId: fam2.id },
    ]
  });

  // 2. Customer 002 (Unsubscribed / Individual)
  const userCust2 = await prisma.user.create({
    data: {
      email: 'customer2@homeservice.coop',
      mobile: '9876543211',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      preferredLanguage: 'ta',
    }
  });

  await prisma.customer.create({
    data: {
      userId: userCust2.id,
      fullName: 'Lakshmi Narayanan',
      city: 'Chennai',
      pinCode: '600044',
      address: '18/2, Radha Nagar Main Road, Chromepet, Chennai',
      latitude: 12.9516,
      longitude: 80.1462,
    }
  });

  // 3. Cooperative Admin
  await prisma.user.create({
    data: {
      email: 'admin@homeservice.coop',
      mobile: '9876543240',
      passwordHash,
      role: 'COOPERATIVE_ADMIN',
      status: 'ACTIVE',
    }
  });

  // 4. Federation Admin
  await prisma.user.create({
    data: {
      email: 'federation@homeservice.coop',
      mobile: '9876543250',
      passwordHash,
      role: 'FEDERATION_ADMIN',
      status: 'ACTIVE',
    }
  });

  // Categories & Services
  const categoriesData = [
    {
      slug: 'home-repair',
      name: 'Home & Repair',
      nameTa: 'வீடு & பழுதுபார்ப்பு',
      nameHi: 'घर और मरम्मत',
      nameTe: 'ఇంటి మరమ్మతులు',
      nameKn: 'ಮನೆ ದುರಸ್ತಿ',
      nameMl: 'വീട്ടു അറ്റകുറ്റപ്പണികൾ',
      description: 'Expert electricians, plumbers, carpenters, masonry and painters for all home maintenance needs.',
      iconName: 'Wrench',
      colorChip: 'orange',
      displayOrder: 1,
      services: [
        { slug: 'electrician', name: 'Electrician', nameTa: 'மின்சார வல்லுநர்', basePrice: 299, duration: 60, emergency: true, level: 2 },
        { slug: 'plumber', name: 'Plumber', nameTa: 'பிளம்பர் (குழாய் சரிசெய்பவர்)', basePrice: 299, duration: 60, emergency: true, level: 2 },
        { slug: 'carpenter', name: 'Carpenter', nameTa: 'தச்சர்', basePrice: 349, duration: 90, emergency: false, level: 2 },
        { slug: 'painter', name: 'Painter', nameTa: 'வண்ணம் பூசுபவர்', basePrice: 499, duration: 120, emergency: false, level: 1 },
        { slug: 'mason', name: 'Mason', nameTa: 'கொத்தனார்', basePrice: 599, duration: 120, emergency: false, level: 2 },
        { slug: 'tile-worker', name: 'Tile Worker', nameTa: 'டைல்ஸ் அமைப்பாளர்', basePrice: 549, duration: 120, emergency: false, level: 2 },
        { slug: 'welding', name: 'Welding Specialist', nameTa: 'வெல்டிங் தொழிலாளி', basePrice: 449, duration: 60, emergency: false, level: 2 },
        { slug: 'ac-technician', name: 'AC Technician', nameTa: 'ஏசி மெக்கானிக்', basePrice: 499, duration: 90, emergency: false, level: 3 },
        { slug: 'refrigerator-technician', name: 'Refrigerator Technician', nameTa: 'குளிர்சாதன பெட்டி மெக்கானிக்', basePrice: 399, duration: 60, emergency: false, level: 2 },
        { slug: 'washing-machine-technician', name: 'Washing Machine Technician', nameTa: 'சலவை இயந்திர மெக்கானிக்', basePrice: 399, duration: 60, emergency: false, level: 2 },
        { slug: 'electrical-appliance-repair', name: 'Electrical Appliance Repair', nameTa: 'மின்சாதன பழுதுபார்ப்பு', basePrice: 299, duration: 45, emergency: false, level: 2 },
        { slug: 'ro-water-purifier', name: 'RO / Water Purifier Technician', nameTa: 'RO குடிநீர் வடிகட்டி சர்வீஸ்', basePrice: 349, duration: 45, emergency: false, level: 2 },
      ]
    },
    {
      slug: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      nameTa: 'சுத்தம் & பராமரிப்பு',
      nameHi: 'सफाई और रखरखाव',
      nameTe: 'శుభ్రత మరియు నిర్వహణ',
      nameKn: 'ಸ್ವಚ್ಛತೆ ಮತ್ತು ನಿರ್ವಹಣೆ',
      nameMl: 'ശുചീകരണവും പരിപാലനവും',
      description: 'Full house deep cleaning, sanitization, sofa, carpet and water tank cleansing by trained workers.',
      iconName: 'Sparkles',
      colorChip: 'blue',
      displayOrder: 2,
      services: [
        { slug: 'house-cleaning', name: 'House Cleaning', nameTa: 'வீடு சுத்தம் செய்தல்', basePrice: 799, duration: 150, emergency: false, level: 1 },
        { slug: 'deep-cleaning', name: 'Deep Cleaning', nameTa: 'முழுமையான தீவிர சுத்தம்', basePrice: 1499, duration: 240, emergency: false, level: 2 },
        { slug: 'bathroom-cleaning', name: 'Bathroom Cleaning', nameTa: 'கழிப்பறை தூய்மைப்படுத்துதல்', basePrice: 399, duration: 60, emergency: false, level: 1 },
        { slug: 'kitchen-cleaning', name: 'Kitchen Cleaning', nameTa: 'சமையலறை தூய்மைப்படுத்துதல்', basePrice: 599, duration: 90, emergency: false, level: 1 },
        { slug: 'office-cleaning', name: 'Office Cleaning', nameTa: 'அலுவலகம் சுத்தம் செய்தல்', basePrice: 1299, duration: 180, emergency: false, level: 2 },
        { slug: 'sofa-cleaning', name: 'Sofa Cleaning', nameTa: 'சோபா துவைத்தல்', basePrice: 499, duration: 60, emergency: false, level: 1 },
        { slug: 'carpet-cleaning', name: 'Carpet Cleaning', nameTa: 'கார்பெட் சுத்தம் செய்தல்', basePrice: 449, duration: 60, emergency: false, level: 1 },
        { slug: 'water-tank-cleaning', name: 'Water Tank Cleaning', nameTa: 'தண்ணீர் தொட்டி சுத்தம் செய்தல்', basePrice: 799, duration: 120, emergency: false, level: 2 },
        { slug: 'pest-control', name: 'Pest Control', nameTa: 'பூச்சி கட்டுப்பாடு', basePrice: 899, duration: 90, emergency: false, level: 2 },
        { slug: 'garden-maintenance', name: 'Garden Maintenance', nameTa: 'தோட்டப் பராமரிப்பு', basePrice: 499, duration: 90, emergency: false, level: 1 },
      ]
    },
    {
      slug: 'care-assistance',
      name: 'Care & Assistance',
      nameTa: 'பராமரிப்பு & உதவி',
      nameHi: 'देखभाल और सहायता',
      nameTe: 'సంరక్షణ మరియు సహాయం',
      nameKn: 'ಆರೈಕೆ ಮತ್ತು ನೆರವು',
      nameMl: 'പരിചരണവും സഹായവും',
      description: 'Dedicated caregivers for elderly, patients, domestic assistants and trained home attendants.',
      iconName: 'HeartHandshake',
      colorChip: 'purple',
      displayOrder: 3,
      services: [
        { slug: 'elderly-caregiver', name: 'Elderly Caregiver', nameTa: 'முதியோர் பராமரிப்பாளர்', basePrice: 799, duration: 240, emergency: true, level: 3 },
        { slug: 'patient-caregiver', name: 'Patient Caregiver', nameTa: 'நோயாளி பராமரிப்பாளர்', basePrice: 899, duration: 240, emergency: true, level: 3 },
        { slug: 'home-attendant', name: 'Home Attendant', nameTa: 'வீட்டு உதவியாளர்', basePrice: 699, duration: 180, emergency: false, level: 2 },
        { slug: 'babysitter', name: 'Babysitter', nameTa: 'குழந்தை பராமரிப்பாளர்', basePrice: 599, duration: 180, emergency: false, level: 2 },
        { slug: 'domestic-helper', name: 'Domestic Helper', nameTa: 'வீட்டு வேலை உதவியாளர்', basePrice: 449, duration: 120, emergency: false, level: 1 },
        { slug: 'cook', name: 'Cook', nameTa: 'சமையல் கலைஞர்', basePrice: 549, duration: 90, emergency: false, level: 2 },
        { slug: 'laundry', name: 'Laundry Service', nameTa: 'துணி துவைக்கும் சேவை', basePrice: 299, duration: 60, emergency: false, level: 1 },
        { slug: 'ironing', name: 'Ironing', nameTa: 'இஸ்திரி சேவை', basePrice: 249, duration: 45, emergency: false, level: 1 },
      ]
    },
    {
      slug: 'transport-outdoor',
      name: 'Transport & Outdoor',
      nameTa: 'போக்குவரத்து & வெளிப்புறம்',
      nameHi: 'परिवहन और आउटडोर',
      nameTe: 'రవాణా మరియు బహిరంగ పనులు',
      nameKn: 'ಸಾರಿಗೆ ಮತ್ತು ಹೊರಾಂಗಣ',
      nameMl: 'ഗതാഗതവും പുറംജോലികളും',
      description: 'Professional drivers, loading/unloading helpers, vehicle sanitization and moving assistance.',
      iconName: 'Truck',
      colorChip: 'green',
      displayOrder: 4,
      services: [
        { slug: 'driver', name: 'Professional Driver', nameTa: 'தொழில்முறை ஓட்டுநர்', basePrice: 499, duration: 120, emergency: false, level: 2 },
        { slug: 'delivery-worker', name: 'Delivery Worker', nameTa: 'டெலிவரி தொழிலாளி', basePrice: 299, duration: 60, emergency: false, level: 1 },
        { slug: 'moving-packing-helper', name: 'Moving & Packing Helper', nameTa: 'வீடு மாற்ற பொதிவு உதவியாளர்', basePrice: 799, duration: 180, emergency: false, level: 2 },
        { slug: 'loading-unloading-worker', name: 'Loading / Unloading Worker', nameTa: 'சுமை ஏற்றி இறக்கும் தொழிலாளி', basePrice: 599, duration: 120, emergency: false, level: 1 },
        { slug: 'vehicle-cleaning', name: 'Vehicle Cleaning & Detailing', nameTa: 'வாகன தூய்மைப்படுத்துதல்', basePrice: 399, duration: 60, emergency: false, level: 1 },
        { slug: 'gardening', name: 'Gardening Specialist', nameTa: 'தோட்டக்கலை நிபுணர்', basePrice: 499, duration: 90, emergency: false, level: 2 },
        { slug: 'landscaping', name: 'Landscaping Helper', nameTa: 'நில அலங்கார உதவியாளர்', basePrice: 699, duration: 150, emergency: false, level: 2 },
      ]
    },
    {
      slug: 'technical-professional',
      name: 'Technical & Professional',
      nameTa: 'தொழில்நுட்பம் & தொழில்முறை',
      nameHi: 'तकनीकी और व्यावसायिक',
      nameTe: 'సాంకేతిక మరియు వృత్తిపరమైన',
      nameKn: 'ತಾಂತ್ರಿಕ ಮತ್ತು ವೃತ್ತಿಪರ',
      nameMl: 'സാങ്കേതിക & പ്രൊഫഷണൽ',
      description: 'Computer, Wi-Fi networking, solar panel, CCTV cameras and electronic equipment setup.',
      iconName: 'Cpu',
      colorChip: 'blue',
      displayOrder: 5,
      services: [
        { slug: 'computer-technician', name: 'Computer Technician', nameTa: 'கணினி பழுதுபார்ப்பு தொழில்நுட்ப வல்லுநர்', basePrice: 499, duration: 60, emergency: false, level: 3 },
        { slug: 'mobile-repair', name: 'Mobile Phone Repair', nameTa: 'கைபேசி பழுதுபார்ப்பு', basePrice: 399, duration: 60, emergency: false, level: 2 },
        { slug: 'cctv-installation', name: 'CCTV Installation', nameTa: 'CCTV கேமரா பொருத்துதல்', basePrice: 799, duration: 120, emergency: false, level: 3 },
        { slug: 'wifi-network-technician', name: 'Wi-Fi / Network Technician', nameTa: 'வைஃபை / நெட்வொர்க் வல்லுநர்', basePrice: 399, duration: 60, emergency: false, level: 2 },
        { slug: 'solar-panel-technician', name: 'Solar Panel Technician', nameTa: 'சூரிய மின்தகடு தொழில்நுட்ப வல்லுநர்', basePrice: 899, duration: 120, emergency: false, level: 3 },
        { slug: 'printer-technician', name: 'Printer Technician', nameTa: 'பிரிண்டர் மெக்கானிக்', basePrice: 349, duration: 45, emergency: false, level: 2 },
        { slug: 'appliance-installation', name: 'Appliance Installation', nameTa: 'மின்சாதன பொருத்துதல்', basePrice: 449, duration: 60, emergency: false, level: 2 },
      ]
    },
    {
      slug: 'construction-skilled',
      name: 'Construction & Skilled Labour',
      nameTa: 'கட்டுமானம் & திறமையான தொழிலாளர்',
      nameHi: 'निर्माण और कुशल श्रमिक',
      nameTe: 'నిర్మాణం మరియు నైపుణ్యం కలిగిన శ్రామికులు',
      nameKn: 'ನಿರ್ಮಾಣ ಮತ್ತು ನುರಿತ ಕಾರ್ಮಿಕರು',
      nameMl: 'നിർമ്മാണവും വിദഗ്ദ്ധ തൊഴിലാളികളും',
      description: 'Civil construction, excavation, concrete casting, roofing, steel fabrication and structural plumbing.',
      iconName: 'HardHat',
      colorChip: 'orange',
      displayOrder: 6,
      services: [
        { slug: 'construction-worker', name: 'Construction Worker', nameTa: 'கட்டுமான தொழிலாளி', basePrice: 699, duration: 240, emergency: false, level: 2 },
        { slug: 'excavation-helper', name: 'Excavation Helper', nameTa: 'குழி தோண்டும் தொழிலாளி', basePrice: 599, duration: 180, emergency: false, level: 1 },
        { slug: 'concrete-worker', name: 'Concrete Specialist', nameTa: 'கான்கிரீட் வல்லுநர்', basePrice: 749, duration: 240, emergency: false, level: 2 },
        { slug: 'roofing-worker', name: 'Roofing Worker', nameTa: 'கூரை அமைப்பாளர்', basePrice: 799, duration: 240, emergency: false, level: 2 },
        { slug: 'steel-worker', name: 'Steel Worker & Binder', nameTa: 'இரும்பு கம்பி கட்டுபவர்', basePrice: 699, duration: 180, emergency: false, level: 2 },
        { slug: 'plastering-mason', name: 'Plastering Mason', nameTa: 'பூச்சு வேலை கொத்தனார்', basePrice: 649, duration: 180, emergency: false, level: 2 },
        { slug: 'plumbing-installation', name: 'Plumbing Installation', nameTa: 'புதிய குழாய் பொருத்துதல்', basePrice: 799, duration: 180, emergency: false, level: 3 },
        { slug: 'electrical-installation', name: 'Electrical Installation', nameTa: 'புதிய வயரிங் பொருத்துதல்', basePrice: 899, duration: 180, emergency: false, level: 3 },
      ]
    },
    {
      slug: 'emergency',
      name: 'Emergency Services (SOS)',
      nameTa: 'அவசர சேவைகள் (SOS)',
      nameHi: 'आपातकालीन सेवाएं (SOS)',
      nameTe: 'అత్యవసర సేవలు (SOS)',
      nameKn: 'ತುರ್ತು ಸೇವೆಗಳು (SOS)',
      nameMl: 'അടിയന്തര സേവനങ്ങൾ (SOS)',
      description: 'Rapid-dispatch 24/7 emergency repair for power failures, water pipe bursts, and lockout assistance.',
      iconName: 'AlertTriangle',
      colorChip: 'orange',
      displayOrder: 7,
      services: [
        { slug: 'emergency-electrician', name: 'Emergency Electrician', nameTa: 'அவசர மின்சார உதவி', basePrice: 399, duration: 45, emergency: true, level: 3 },
        { slug: 'emergency-plumber', name: 'Emergency Plumber', nameTa: 'அவசர பிளம்பிங் உதவி', basePrice: 399, duration: 45, emergency: true, level: 3 },
        { slug: 'emergency-locksmith', name: 'Emergency Locksmith', nameTa: 'அவசர பூட்டு திறப்பாளர்', basePrice: 449, duration: 45, emergency: true, level: 3 },
        { slug: 'power-backup-technician', name: 'Power Backup Technician', nameTa: 'இன்வெர்ட்டர் / ஜெனரேட்டர் அவசர உதவி', basePrice: 499, duration: 45, emergency: true, level: 3 },
        { slug: 'water-leakage-repair', name: 'Water Leakage Repair', nameTa: 'நீர் கசிவு உடனடி தீர்வு', basePrice: 399, duration: 45, emergency: true, level: 3 },
        { slug: 'appliance-breakdown', name: 'Appliance Breakdown', nameTa: 'மின்சாதன அவசர செயலிழப்பு', basePrice: 449, duration: 45, emergency: true, level: 3 },
      ]
    }
  ];

  const serviceMap = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.serviceCategory.create({
      data: {
        slug: cat.slug,
        name: cat.name,
        nameTa: cat.nameTa,
        nameHi: cat.nameHi,
        nameTe: cat.nameTe,
        nameKn: cat.nameKn,
        nameMl: cat.nameMl,
        description: cat.description,
        iconName: cat.iconName,
        colorChip: cat.colorChip,
        displayOrder: cat.displayOrder,
      }
    });

    for (const svc of cat.services) {
      const createdSvc = await prisma.service.create({
        data: {
          categoryId: createdCat.id,
          slug: svc.slug,
          name: svc.name,
          nameTa: svc.nameTa,
          basePrice: svc.basePrice,
          durationMinutes: svc.duration,
          isEmergencyEligible: svc.emergency,
          requiredLevel: svc.level,
          description: `${svc.name} - cooperative certified service for households.`,
        }
      });
      serviceMap[svc.slug] = createdSvc;
    }
  }

  console.log(`Created ${categoriesData.length} categories and all 50+ services.`);

  // Workers Data
  const workersSeed = [
    {
      name: 'Kumar Selvam',
      mobile: '9876543220',
      email: 'kumar.plumber@homeservice.coop',
      category: 'Home & Repair',
      experienceYears: 8,
      level: 4, // Advanced
      ratingAvg: 4.8,
      ratingCount: 142,
      totalJobs: 426,
      lat: 12.9260,
      lng: 80.1450,
      address: '24, Kannan Nagar, Tambaram Sanatorium, Chennai',
      kycStatus: 'VERIFIED',
      skills: ['plumber', 'emergency-plumber', 'water-leakage-repair', 'plumbing-installation'],
      certTitle: 'National Trade Certificate in Plumbing (ITI Guindy)',
    },
    {
      name: 'Rajesh Subramanian',
      mobile: '9876543221',
      email: 'rajesh.electrician@homeservice.coop',
      category: 'Home & Repair',
      experienceYears: 10,
      level: 5, // Expert
      ratingAvg: 4.9,
      ratingCount: 198,
      totalJobs: 580,
      lat: 12.9320,
      lng: 80.1480,
      address: '12, Bharathi Street, Chromepet, Chennai',
      kycStatus: 'VERIFIED',
      skills: ['electrician', 'emergency-electrician', 'power-backup-technician', 'electrical-installation'],
      certTitle: 'Wireman License & Central Labour Institute Electrical Safety',
    },
    {
      name: 'Priya Sundaram',
      mobile: '9876543222',
      email: 'priya.care@homeservice.coop',
      category: 'Care & Assistance',
      experienceYears: 6,
      level: 4, // Advanced
      ratingAvg: 4.9,
      ratingCount: 88,
      totalJobs: 215,
      lat: 12.9200,
      lng: 80.1420,
      address: '7, Kamarajar Salai, Tambaram West, Chennai',
      kycStatus: 'VERIFIED',
      skills: ['elderly-caregiver', 'patient-caregiver', 'home-attendant'],
      certTitle: 'Certified Geriatric Care Specialist (Red Cross Society)',
    },
    {
      name: 'Murugan Velu',
      mobile: '9876543223',
      email: 'murugan.carpenter@homeservice.coop',
      category: 'Home & Repair',
      experienceYears: 7,
      level: 3, // Certified
      ratingAvg: 4.7,
      ratingCount: 94,
      totalJobs: 310,
      lat: 12.9400,
      lng: 80.1550,
      address: '45, Station Road, Pallavaram, Chennai',
      kycStatus: 'VERIFIED',
      skills: ['carpenter', 'emergency-locksmith'],
      certTitle: 'Artisan Guild Certificate in Carpentry & Wood Joinery',
    },
    {
      name: 'Lakshmi Ramamoorthy',
      mobile: '9876543224',
      email: 'lakshmi.clean@homeservice.coop',
      category: 'Cleaning & Maintenance',
      experienceYears: 5,
      level: 3, // Certified
      ratingAvg: 4.8,
      ratingCount: 112,
      totalJobs: 340,
      lat: 12.9280,
      lng: 80.1380,
      address: '15, Anna Nagar 2nd Cross, Tambaram, Chennai',
      kycStatus: 'VERIFIED',
      skills: ['deep-cleaning', 'house-cleaning', 'kitchen-cleaning', 'water-tank-cleaning'],
      certTitle: 'Industrial Hygiene & Cleaning Standards Certificate',
    },
    {
      name: 'Karthik Natarajan',
      mobile: '9876543225',
      email: 'karthik.ac@homeservice.coop',
      category: 'Home & Repair',
      experienceYears: 6,
      level: 4, // Advanced
      ratingAvg: 4.8,
      ratingCount: 76,
      totalJobs: 240,
      lat: 12.9450,
      lng: 80.1490,
      address: '33, Nehru Street, Chromepet, Chennai',
      kycStatus: 'VERIFIED',
      skills: ['ac-technician', 'refrigerator-technician', 'appliance-breakdown'],
      certTitle: 'HVAC Specialist Certification & Eco-Refrigerant License',
    },
    {
      name: 'Suresh Mani',
      mobile: '9876543226',
      email: 'suresh.driver@homeservice.coop',
      category: 'Transport & Outdoor',
      experienceYears: 9,
      level: 3, // Certified
      ratingAvg: 4.7,
      ratingCount: 104,
      totalJobs: 380,
      lat: 12.9150,
      lng: 80.1400,
      address: '52, Velachery Main Road, Tambaram, Chennai',
      kycStatus: 'VERIFIED',
      skills: ['driver', 'moving-packing-helper'],
      certTitle: 'Heavy & Commercial Transport Endorsement (RTO Tambaram)',
    },
    {
      name: 'Anitha Balaji',
      mobile: '9876543227',
      email: 'anitha.tech@homeservice.coop',
      category: 'Technical & Professional',
      experienceYears: 5,
      level: 4, // Advanced
      ratingAvg: 4.9,
      ratingCount: 65,
      totalJobs: 195,
      lat: 12.9520,
      lng: 80.1440,
      address: '88, CLC Works Road, Chromepet, Chennai',
      kycStatus: 'VERIFIED',
      skills: ['computer-technician', 'wifi-network-technician', 'cctv-installation'],
      certTitle: 'CompTIA A+ & Certified Network Administrator',
    },
    {
      name: 'Ravi Shankar',
      mobile: '9876543230',
      email: 'ravi.unverified@homeservice.coop',
      category: 'Home & Repair',
      experienceYears: 2,
      level: 1, // Registered
      ratingAvg: 5.0,
      ratingCount: 0,
      totalJobs: 0,
      lat: 12.9300,
      lng: 80.1400,
      address: '10, New Colony, Tambaram, Chennai',
      kycStatus: 'PENDING',
      skills: ['plumber'],
      certTitle: null,
      isPendingUser: true,
    }
  ];

  const createdWorkers = [];

  for (const w of workersSeed) {
    const user = await prisma.user.create({
      data: {
        email: w.email,
        mobile: w.mobile,
        passwordHash,
        role: 'WORKER',
        status: w.isPendingUser ? 'PENDING_VERIFICATION' : 'ACTIVE',
        preferredLanguage: 'ta',
      }
    });

    const worker = await prisma.worker.create({
      data: {
        userId: user.id,
        fullName: w.name,
        mobile: w.mobile,
        primaryCategory: w.category,
        experienceYears: w.experienceYears,
        cooperativeId: coop.id,
        societyId: society1.id,
        currentLevel: w.level,
        profileCompletionPct: w.isPendingUser ? 55 : 95,
        ratingAvg: w.ratingAvg,
        ratingCount: w.ratingCount,
        totalJobsCompleted: w.totalJobs,
        latitude: w.lat,
        longitude: w.lng,
        address: w.address,
        kycStatus: w.kycStatus,
        kycDocType: 'AADHAAR',
        kycDocNumberEncrypted: '•••• •••• 8492',
        bankAccountEncrypted: 'Coop Bank A/c •••• 4129',
        upiIdEncrypted: `${w.mobile}@coopbank`,
        isAvailable: true,
        isBusy: false,
        isOffline: false,
        isEmergencyAvailable: true,
      }
    });

    createdWorkers.push(worker);

    // Active worker subscription
    if (!w.isPendingUser) {
      await prisma.workerSubscription.create({
        data: {
          workerId: worker.id,
          planType: 'ANNUAL_WORKER',
          price: 499,
          startDate: new Date(Date.now() - 60 * 24 * 3600 * 1000),
          endDate: new Date(Date.now() + 305 * 24 * 3600 * 1000),
          status: 'ACTIVE',
        }
      });
    }

    // Availability
    for (let day = 1; day <= 6; day++) {
      await prisma.workerAvailability.create({
        data: {
          workerId: worker.id,
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '18:00',
          isEnabled: true,
        }
      });
    }

    // Skills
    for (const skillSlug of w.skills) {
      const svc = serviceMap[skillSlug];
      if (svc) {
        await prisma.workerSkill.create({
          data: {
            workerId: worker.id,
            serviceId: svc.id,
            experienceYears: w.experienceYears,
            isVerified: !w.isPendingUser,
            verifiedAt: !w.isPendingUser ? new Date() : null,
          }
        });
      }
    }

    // Certificate
    if (w.certTitle) {
      await prisma.workerCertification.create({
        data: {
          workerId: worker.id,
          certificateTitle: w.certTitle,
          issuingAuthority: 'State Board of Technical Education / NSDC',
          status: 'VERIFIED',
          verifiedAt: new Date(),
        }
      });
    }
  }

  console.log(`Created ${createdWorkers.length} demo workers with skills & certifications.`);

  // Welfare Schemes & Insurance
  const welfare1 = await prisma.welfareScheme.create({
    data: {
      title: 'Tamil Nadu Labourers Mutual Health & Accident Scheme',
      description: 'Comprehensive health coverage and disability compensation for cooperative members and their families.',
      category: 'Health & Accident Cover',
      eligibilityCriteria: 'Enrolled cooperative member with minimum Level 2 verification',
      benefitAmount: 'Up to ₹2,00,000 Hospitalization + ₹5,00,000 Accidental Protection',
      providerLabel: 'Tamil Nadu Unorganised Workers Welfare Board (Demo Adapter)',
      isDemo: true,
    }
  });

  const welfare2 = await prisma.welfareScheme.create({
    data: {
      title: 'Artisan Children Higher Education Scholarship',
      description: 'Annual scholarship assistance for children of cooperative trade workers pursuing professional degrees.',
      category: 'Education Assistance',
      eligibilityCriteria: 'Active cooperative membership with 1+ year service history',
      benefitAmount: '₹15,000 / student / academic year',
      providerLabel: 'Cooperative Federation Welfare Trust (Demo)',
      isDemo: true,
    }
  });

  // Enroll Kumar (Plumber) in welfare and insurance
  const kumarWorker = createdWorkers[0];
  await prisma.workerWelfare.create({
    data: {
      workerId: kumarWorker.id,
      schemeId: welfare1.id,
      status: 'ACTIVE',
    }
  });

  await prisma.insuranceCoverage.create({
    data: {
      workerId: kumarWorker.id,
      policyNumber: 'COOP-INS-2026-0982',
      coverageType: 'Accidental & Medical Emergency',
      sumInsured: 250000,
      validTill: new Date(Date.now() + 280 * 24 * 3600 * 1000),
      providerLabel: 'Labour Mutual Assistance Society (Sandbox)',
      isDemo: true,
    }
  });

  // Seed sample completed booking for Customer 1 with Kumar (Plumber)
  const plumberSvc = serviceMap['plumber'];
  const sampleBooking = await prisma.booking.create({
    data: {
      bookingNumber: 'BK-2026-8812',
      customerId: cust1.id,
      workerId: kumarWorker.id,
      serviceId: plumberSvc.id,
      status: 'RATED',
      isEmergency: false,
      scheduledDate: '2026-09-28',
      scheduledTime: '10:00 AM',
      customerAddress: cust1.address,
      customerLat: cust1.latitude,
      customerLng: cust1.longitude,
      approximateArea: 'Tambaram Zone',
      issueDescription: 'Kitchen sink pipe blockage and minor dripping from the main tap.',
      totalAmount: 399,
      platformFee: 20,
      cooperativeShare: 20,
      workerEarnings: 359,
      paymentStatus: 'COMPLETED',
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
    }
  });

  await prisma.bookingStatusHistory.createMany({
    data: [
      { bookingId: sampleBooking.id, status: 'REQUESTED', note: 'Customer requested booking' },
      { bookingId: sampleBooking.id, status: 'ACCEPTED', note: 'Worker Kumar accepted job' },
      { bookingId: sampleBooking.id, status: 'ARRIVED', note: 'Worker arrived at premises' },
      { bookingId: sampleBooking.id, status: 'COMPLETED', note: 'Service completed successfully' },
      { bookingId: sampleBooking.id, status: 'PAYMENT_COMPLETED', note: 'Payment processed via UPI Demo' },
      { bookingId: sampleBooking.id, status: 'RATED', note: 'Customer rated 5 stars' },
    ]
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-7701',
      bookingId: sampleBooking.id,
      customerId: cust1.id,
      workerId: kumarWorker.id,
      amount: 399,
      paymentMethod: 'UPI',
      transactionRef: 'UPI-DEMO-REF-99214',
      status: 'SUCCESS',
      isDemo: true,
      breakdownJson: JSON.stringify({
        baseServiceCharge: 399,
        platformFee: 20,
        cooperativeShare: 20,
        netWorkerPay: 359,
      }),
    }
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-5510',
      bookingId: sampleBooking.id,
      customerId: cust1.id,
      workerId: kumarWorker.id,
      serviceName: 'Plumbing Repair & Faucet Service',
      baseAmount: 359,
      platformFee: 20,
      taxAmount: 20,
      totalAmount: 399,
      status: 'PAID',
    }
  });

  await prisma.rating.create({
    data: {
      bookingId: sampleBooking.id,
      customerId: cust1.id,
      workerId: kumarWorker.id,
      qualityScore: 5,
      professionalismScore: 5,
      timelinessScore: 5,
      averageScore: 5.0,
      comment: 'Kumar arrived right on time, explained the issue clearly, and fixed the blockage cleanly. Outstanding cooperative work!',
    }
  });

  // Demand Analytics rows for AI demand forecast
  const dates = [
    '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09',
    '2026-10-10', '2026-10-11', '2026-10-12'
  ];

  for (let i = 0; i < dates.length; i++) {
    await prisma.demandAnalytics.create({
      data: {
        societyId: society1.id,
        serviceId: plumberSvc.id,
        date: dates[i],
        historicalBookingsCount: 14 + (i * 2),
        forecastedBookingsCount: 22 + (i * 3),
        demandLevel: i > 3 ? 'HIGH' : 'NORMAL',
        confidencePct: 88,
      }
    });
  }

  // Sample proposed allocation
  await prisma.workerAllocation.create({
    data: {
      societyId: society1.id,
      serviceId: plumberSvc.id,
      fromZoneId: society2.id,
      toZoneId: society1.id,
      recommendedWorkersCount: 3,
      reason: 'Predicted +42% spike in plumbing requests due to seasonal monsoon drainage maintenance in Tambaram zone.',
      status: 'PROPOSED',
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
