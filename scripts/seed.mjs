/**
 * FixMate database seed.
 *
 *   node --env-file=.env.local scripts/seed.mjs
 *
 * Idempotent: it wipes previously seeded demo data (and any leftover smoke-test
 * accounts) before writing a fresh copy, so you can run it as often as you like.
 *
 * Creates:
 *   - 5 accounts: 1 admin, 2 technicians, 2 customers (password below)
 *   - 13 approved services spread over every category
 *   - 8 bookings in every status of the pipeline, 2 of them paid
 *   - 2 payment records (Stripe session ids are fake but well-formed)
 */

import { MongoClient } from "mongodb";
import { hashPassword } from "better-auth/crypto";

const URI = process.env.BETTER_AUTH_URI || process.env.MONGODB_URI;
if (!URI) {
  console.error("Missing BETTER_AUTH_URI. Run: node --env-file=.env.local scripts/seed.mjs");
  process.exit(1);
}
const DB_NAME = process.env.BETTER_AUTH_DB || process.env.MONGODB_DB || "fixmate";
const PASSWORD = process.env.SEED_PASSWORD || "Fixmate@123";

const SMOKE_EMAILS = [
  "smoke-1795144742270@example.com",
  "smoke-1795144787910@example.com",
  "smoke-1795145020793@example.com",
  "smoke-1795145383467@example.com",
];

const USERS = [
  {
    name: "FixMate Admin",
    email: "admin@fixmate.dev",
    role: "admin",
    phone: "+880 1700-000001",
    area: "Dhaka",
    bio: "Platform administrator — moderates services and users.",
  },
  {
    name: "Rahim Uddin",
    email: "rahim@fixmate.dev",
    role: "technician",
    phone: "+880 1700-000002",
    area: "Dhanmondi, Dhaka",
    bio: "10+ years repairing phones, laptops and home appliances.",
  },
  {
    name: "Karim Hossain",
    email: "karim@fixmate.dev",
    role: "technician",
    phone: "+880 1700-000003",
    area: "Uttara, Dhaka",
    bio: "AC, refrigerator and electrical specialist with factory training.",
  },
  {
    name: "Sumaiya Akter",
    email: "sumaiya@fixmate.dev",
    role: "customer",
    phone: "+880 1700-000004",
    area: "Mirpur, Dhaka",
    bio: "",
  },
  {
    name: "Tanvir Ahmed",
    email: "tanvir@fixmate.dev",
    role: "customer",
    phone: "+880 1700-000005",
    area: "Banani, Dhaka",
    bio: "",
  },
];

const IMAGE = {
  Smartphone: "/services/smartphone.svg",
  "Laptop & PC": "/services/laptop.svg",
  AC: "/services/ac.svg",
  Refrigerator: "/services/refrigerator.svg",
  TV: "/services/tv.svg",
  "Washing Machine": "/services/washing-machine.svg",
  Electrical: "/services/electrical.svg",
};

const RAHIM = "rahim@fixmate.dev";
const KARIM = "karim@fixmate.dev";

/** 13 approved services (spec asks for 12+). */
const SERVICES = [
  {
    title: "Screen replacement for iPhone & Samsung",
    category: "Smartphone",
    description:
      "Genuine-grade OLED/LCD replacement for cracked screens. Includes free diagnostic, frame check and a 30-day workmanship warranty.",
    basePrice: 79,
    estimatedDuration: "45–60 min",
    serviceMode: "Home Visit",
    serviceArea: "Dhanmondi, Mirpur, Mohammadpur",
    technicianEmail: RAHIM,
    rating: 4.8,
    ratingCount: 2,
  },
  {
    title: "Battery replacement & charging port fix",
    category: "Smartphone",
    description:
      "Weak battery, swollen cell or loose charging port? We replace cells with tested units and reflow damaged charging boards.",
    basePrice: 39,
    estimatedDuration: "30–45 min",
    serviceMode: "Home Visit",
    serviceArea: "Dhanmondi, Mirpur, Uttara",
    technicianEmail: RAHIM,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: "Laptop fan cleaning & thermal paste renewal",
    category: "Laptop & PC",
    description:
      "Full dust removal, fan lubrication and fresh thermal paste. Fixes overheating, throttling and random shutdowns.",
    basePrice: 45,
    estimatedDuration: "60 min",
    serviceMode: "Shop Drop-off",
    serviceArea: "Dhanmondi, Gulshan",
    technicianEmail: RAHIM,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: "Windows reinstall, driver setup & data recovery",
    category: "Laptop & PC",
    description:
      "Clean OS install with all drivers, plus best-effort recovery of documents from failing drives. Data backed up before any wipe.",
    basePrice: 65,
    estimatedDuration: "2–3 hours",
    serviceMode: "Shop Drop-off",
    serviceArea: "Dhanmondi, Uttara",
    technicianEmail: RAHIM,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: "AC gas refill & deep cleaning",
    category: "AC",
    description:
      "Chemical deep clean of filters, cooling coil and drainage, then measured R410a/R32 gas top-up with pressure testing.",
    basePrice: 89,
    estimatedDuration: "60–90 min",
    serviceMode: "Home Visit",
    serviceArea: "Dhanmondi, Mirpur, Banani",
    technicianEmail: KARIM,
    rating: 4.5,
    ratingCount: 1,
  },
  {
    title: "AC installation & seasonal maintenance",
    category: "AC",
    description:
      "Wall-split installation, piping, vacuuming and bracket fitting, or a pre-summer maintenance visit for existing units.",
    basePrice: 120,
    estimatedDuration: "2–3 hours",
    serviceMode: "Home Visit",
    serviceArea: "Uttara, Banani, Gulshan",
    technicianEmail: KARIM,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: "Refrigerator compressor & cooling repair",
    category: "Refrigerator",
    description:
      "Diagnosis of warm fridge/freezer problems: compressor relay, thermostat, gas leak and evaporator faults.",
    basePrice: 95,
    estimatedDuration: "60–120 min",
    serviceMode: "Home Visit",
    serviceArea: "Mirpur, Dhanmondi",
    technicianEmail: KARIM,
    rating: 5,
    ratingCount: 1,
  },
  {
    title: "Fridge gas leak detection & recharging",
    category: "Refrigerator",
    description:
      "Leak tracing with electronic detector, joint repair and controlled gas recharge so your fridge holds temperature again.",
    basePrice: 85,
    estimatedDuration: "90 min",
    serviceMode: "Home Visit",
    serviceArea: "Dhanmondi, Mirpur",
    technicianEmail: KARIM,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: "Smart TV screen & backlight repair",
    category: "TV",
    description:
      "No picture, dim image or lines on screen? We replace LED strips, T-Con boards and panels for 32–65 inch TVs.",
    basePrice: 110,
    estimatedDuration: "1–2 hours",
    serviceMode: "Shop Drop-off",
    serviceArea: "Uttara, Banani",
    technicianEmail: KARIM,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: "TV wall mounting & smart setup",
    category: "TV",
    description:
      "Secure wall mounting with cable concealment, plus Wi-Fi, streaming apps and soundbar pairing configured for you.",
    basePrice: 55,
    estimatedDuration: "60 min",
    serviceMode: "Home Visit",
    serviceArea: "Dhanmondi, Gulshan, Uttara",
    technicianEmail: KARIM,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: "Washing machine drum & bearing replacement",
    category: "Washing Machine",
    description:
      "Loud spinning, leaking or shaking machines? Drum bearing, seal and belt replacement for front and top loaders.",
    basePrice: 105,
    estimatedDuration: "90–120 min",
    serviceMode: "Home Visit",
    serviceArea: "Mirpur, Mohammadpur",
    technicianEmail: RAHIM,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: "Home electrical wiring inspection",
    category: "Electrical",
    description:
      "Room-by-room safety check of sockets, breakers and earthing, with a written report and fix-it priority list.",
    basePrice: 60,
    estimatedDuration: "60–90 min",
    serviceMode: "Home Visit",
    serviceArea: "Dhaka metro area",
    technicianEmail: KARIM,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: "Ceiling fan & light fixture installation",
    category: "Electrical",
    description:
      "Safe installation of fans, chandeliers and recessed lights, including switch testing and old-fixture removal.",
    basePrice: 35,
    estimatedDuration: "45 min",
    serviceMode: "Home Visit",
    serviceArea: "Dhanmondi, Uttara, Mirpur",
    technicianEmail: RAHIM,
    rating: 4,
    ratingCount: 1,
  },
];

const day = 24 * 60 * 60 * 1000;
const ago = (n) => new Date(Date.now() - n * day);
const ahead = (n) => new Date(Date.now() + n * day);

/** Booking fixtures - one per interesting state of the job pipeline. */
function makeBookings(services) {
  const svc = (title) => services.find((s) => s.title === title);
  const sumaiya = { name: "Sumaiya Akter", email: "sumaiya@fixmate.dev", phone: "+880 1700-000004" };
  const tanvir = { name: "Tanvir Ahmed", email: "tanvir@fixmate.dev", phone: "+880 1700-000005" };

  const base = (service, customer, overrides = {}) => {
    const tech = USERS.find((u) => u.email === service.technicianEmail);
    return {
      serviceId: String(service._id),
      serviceTitle: service.title,
      serviceImage: service.image,
      category: service.category,
      basePrice: service.basePrice,
      technicianName: tech.name,
      technicianEmail: service.technicianEmail,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      address: `${customer.name.split(" ")[0]}'s place, ${customer.area || "Dhaka"}`,
      problemDescription:
        "The appliance stopped working properly and needs a professional look. Please bring the required tools and parts.",
      status: "requested",
      statusHistory: [],
      finalAmount: 0,
      paymentStatus: "unpaid",
      rating: null,
      review: "",
      ...overrides,
    };
  };

  const h = (status, changedBy, n) => ({ status, changedAt: ago(n), changedBy });

  return [
    base(svc("AC gas refill & deep cleaning"), sumaiya, {
      status: "requested",
      preferredDate: ahead(2),
      statusHistory: [h("requested", "customer", 0.2)],
    }),
    base(svc("Screen replacement for iPhone & Samsung"), tanvir, {
      status: "accepted",
      preferredDate: ahead(1),
      statusHistory: [h("requested", "customer", 2), h("accepted", "technician", 1)],
    }),
    base(svc("Smart TV screen & backlight repair"), sumaiya, {
      status: "in-progress",
      preferredDate: ago(0.5),
      statusHistory: [
        h("requested", "customer", 4),
        h("accepted", "technician", 3),
        h("in-progress", "technician", 0.5),
      ],
    }),
    base(svc("Laptop fan cleaning & thermal paste renewal"), tanvir, {
      status: "completed",
      preferredDate: ago(3),
      finalAmount: 45,
      statusHistory: [
        h("requested", "customer", 6),
        h("accepted", "technician", 5),
        h("in-progress", "technician", 3),
        h("completed", "technician", 3),
      ],
    }),
    base(svc("Refrigerator compressor & cooling repair"), sumaiya, {
      status: "completed",
      preferredDate: ago(6),
      finalAmount: 120,
      paymentStatus: "paid",
      rating: 5,
      review: "Fast, tidy and explained everything. My fridge has been cold ever since.",
      statusHistory: [
        h("requested", "customer", 9),
        h("accepted", "technician", 8),
        h("in-progress", "technician", 6),
        h("completed", "technician", 6),
        { status: "paid", changedAt: ago(6), changedBy: "customer" },
      ],
    }),
    base(svc("Washing machine drum & bearing replacement"), tanvir, {
      status: "rejected",
      preferredDate: ago(2),
      statusHistory: [
        h("requested", "customer", 5),
        h("rejected", "technician", 4),
      ],
    }),
    base(svc("Battery replacement & charging port fix"), sumaiya, {
      status: "cancelled",
      preferredDate: ago(5),
      statusHistory: [
        h("requested", "customer", 7),
        h("cancelled", "customer", 6),
      ],
    }),
    base(svc("Ceiling fan & light fixture installation"), tanvir, {
      status: "completed",
      preferredDate: ago(9),
      finalAmount: 75,
      paymentStatus: "paid",
      rating: 4,
      review: "Good work overall, arrived a little late but the fan runs perfectly.",
      statusHistory: [
        h("requested", "customer", 12),
        h("accepted", "technician", 11),
        h("in-progress", "technician", 9),
        h("completed", "technician", 9),
        { status: "paid", changedAt: ago(9), changedBy: "customer" },
      ],
    }),
  ];
}

const PAYMENT_FIXTURES = [
  {
    match: { finalAmount: 120, paymentStatus: "paid" },
    stripeSessionId: "cs_test_seed_refrigerator_001",
    transactionId: "ch_test_seed_000000000001",
    amount: 120,
    daysAgo: 6,
  },
  {
    match: { finalAmount: 75, paymentStatus: "paid" },
    stripeSessionId: "cs_test_seed_ceilingfan_002",
    transactionId: "ch_test_seed_000000000002",
    amount: 75,
    daysAgo: 9,
  },
];

async function main() {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const userCol = db.collection("user");
  const accountCol = db.collection("account");
  const sessionCol = db.collection("session");
  const serviceCol = db.collection("services");
  const bookingCol = db.collection("bookings");
  const paymentCol = db.collection("payments");

  console.log(`Connected to "${DB_NAME}"`);

  // --- clean previous demo + smoke data -------------------------------
  const seedEmails = USERS.map((u) => u.email);
  const doomed = [...SMOKE_EMAILS, ...seedEmails];
  const doomedIds = (await userCol.find({ email: { $in: doomed } }).toArray()).map((u) => u._id);

  const delUsers = await userCol.deleteMany({ email: { $in: doomed } });
  const delAccounts = await accountCol.deleteMany({ userId: { $in: doomedIds } });
  const delSessions = await sessionCol.deleteMany({ userId: { $in: doomedIds } });
  const delServices = await serviceCol.deleteMany({});
  const delBookings = await bookingCol.deleteMany({});
  const delPayments = await paymentCol.deleteMany({});

  console.log(
    `Cleaned: ${delUsers.deletedCount} users, ${delAccounts.deletedCount} accounts, ` +
      `${delSessions.deletedCount} sessions, ${delServices.deletedCount} services, ` +
      `${delBookings.deletedCount} bookings, ${delPayments.deletedCount} payments`
  );

  // --- users + credential accounts ------------------------------------
  const passwordHash = await hashPassword(PASSWORD);
  const now = new Date();

  const createdUsers = [];
  for (const u of USERS) {
    const doc = {
      name: u.name,
      email: u.email,
      emailVerified: true,
      image: null,
      role: u.role,
      phone: u.phone,
      area: u.area,
      bio: u.bio,
      plan: u.role === "admin" ? "pro" : "free",
      createdAt: now,
      updatedAt: now,
    };
    const { insertedId } = await userCol.insertOne(doc);
    await accountCol.insertOne({
      accountId: insertedId.toHexString(),
      providerId: "credential",
      userId: insertedId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });
    createdUsers.push({ ...doc, _id: insertedId });
    console.log(`  user  ${u.email.padEnd(24)} role=${u.role}`);
  }

  // --- services -------------------------------------------------------
  const techName = (email) => createdUsers.find((u) => u.email === email).name;
  const serviceDocs = SERVICES.map((s) => ({
    ...s,
    image: IMAGE[s.category] || "/services/default.svg",
    technicianName: techName(s.technicianEmail),
    approvalStatus: "approved",
    isAvailable: true,
    createdAt: ago(30),
    updatedAt: ago(30),
  }));
  const insertedServices = await serviceCol.insertMany(serviceDocs);
  const services = Object.values(insertedServices.insertedIds).map((id, i) => ({
    ...serviceDocs[i],
    _id: id,
  }));
  console.log(`  services: ${services.length} approved`);

  // --- bookings + payments -------------------------------------------
  const bookingDocs = makeBookings(services);
  const insertedBookings = await bookingCol.insertMany(bookingDocs);
  const bookings = Object.values(insertedBookings.insertedIds).map((id, i) => ({
    ...bookingDocs[i],
    _id: id,
  }));
  console.log(`  bookings: ${bookings.length}`);

  const payments = [];
  for (const fixture of PAYMENT_FIXTURES) {
    const booking = bookings.find(
      (b) =>
        b.paymentStatus === fixture.match.paymentStatus &&
        b.finalAmount === fixture.match.finalAmount
    );
    if (!booking) continue;
    const paidAt = ago(fixture.daysAgo);
    payments.push({
      bookingId: String(booking._id),
      serviceTitle: booking.serviceTitle,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      technicianName: booking.technicianName,
      technicianEmail: booking.technicianEmail,
      amount: fixture.amount,
      currency: "usd",
      transactionId: fixture.transactionId,
      stripeSessionId: fixture.stripeSessionId,
      paymentStatus: "paid",
      paidAt,
      createdAt: paidAt,
      updatedAt: paidAt,
    });
  }
  if (payments.length) await paymentCol.insertMany(payments);
  console.log(`  payments: ${payments.length}`);

  console.log("\nSeed complete. Test accounts (password: " + PASSWORD + "):");
  for (const u of USERS) console.log(`  ${u.role.padEnd(11)} ${u.email}`);
  console.log("");

  await client.close();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exitCode = 1;
});
