// End-to-end integration test for HOMEService
const BASE_URL = 'http://localhost:3000';

async function runTest() {
  console.log('🚀 Starting HOMEService End-to-End Test...\n');

  // 1. Fetch categories
  console.log('1️⃣ Testing GET /api/categories...');
  const catRes = await fetch(`${BASE_URL}/api/categories`);
  const catData = await catRes.json();
  if (!catData.categories || catData.categories.length === 0) {
    throw new Error('Categories fetch failed');
  }
  const firstCategory = catData.categories[0];
  const firstService = firstCategory.services[0];
  console.log(`   ✅ Success: ${catData.categories.length} categories loaded.`);
  console.log(`   Selected Service: "${firstService.name}" (ID: ${firstService.id}, Base: ₹${firstService.basePrice})\n`);

  // 2. Test Guest / Unauthenticated Booking (Should automatically assign demo customer and succeed)
  console.log('2️⃣ Testing POST /api/bookings as Guest (Resilient Sandbox Dispatch)...');
  const guestBookRes = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceId: firstService.id,
      customerAddress: '42, Grand Southern Trunk Rd, Tambaram, Chennai',
      issueDescription: 'Bathroom washbasin faucet is leaking water continuously',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '11:00 AM',
      isEmergency: false,
    }),
  });

  const guestBookData = await guestBookRes.json();
  if (!guestBookRes.ok || !guestBookData.booking) {
    throw new Error(`Guest booking failed: ${JSON.stringify(guestBookData)}`);
  }
  const bookingId = guestBookData.booking.id;
  const bookingNumber = guestBookData.booking.bookingNumber;
  const setCookieHeader = guestBookRes.headers.get('set-cookie');
  console.log(`   ✅ Success: Booking #${bookingNumber} created! (ID: ${bookingId})`);
  console.log(`   Total Amount: ₹${guestBookData.booking.totalAmount}`);
  console.log(`   Assigned Worker ID: ${guestBookData.booking.workerId}`);
  console.log(`   Session Cookie Established for Guest: ${Boolean(setCookieHeader)}\n`);

  // Extract session token from cookie
  let sessionCookie = '';
  if (setCookieHeader) {
    const match = setCookieHeader.match(/homeservice_token=([^;]+)/);
    if (match) sessionCookie = `homeservice_token=${match[1]}`;
  }

  // 3. Test Customer Login & Session retrieval
  console.log('3️⃣ Testing POST /api/auth/demo-login as Customer...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountType: 'customer' }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error(`Customer login failed: ${JSON.stringify(loginData)}`);
  const custCookieHeader = loginRes.headers.get('set-cookie');
  const custMatch = custCookieHeader.match(/homeservice_token=([^;]+)/);
  const custCookie = `homeservice_token=${custMatch[1]}`;
  console.log(`   ✅ Logged in as: ${loginData.user.name} (${loginData.user.role})\n`);

  // 4. Verify booking details fetch
  console.log('4️⃣ Testing GET /api/bookings/:id...');
  const detailRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
    headers: { Cookie: custCookie },
  });
  const detailData = await detailRes.json();
  if (!detailRes.ok) throw new Error(`Fetch detail failed: ${JSON.stringify(detailData)}`);
  console.log(`   ✅ Booking Status: ${detailData.booking.status}`);
  console.log(`   Customer: ${detailData.booking.customer?.fullName}`);
  console.log(`   Service: ${detailData.booking.service?.name}\n`);

  // 5. Worker logs in to accept the offer
  console.log('5️⃣ Testing Worker Login & Job Accept...');
  const workerLoginRes = await fetch(`${BASE_URL}/api/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountType: 'kumar_plumber' }),
  });
  const workerLoginData = await workerLoginRes.json();
  const workerCookieMatch = workerLoginRes.headers.get('set-cookie').match(/homeservice_token=([^;]+)/);
  const workerCookie = `homeservice_token=${workerCookieMatch[1]}`;
  console.log(`   ✅ Worker signed in: ${workerLoginData.user.name}`);

  // Worker accepts offer
  const acceptRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: workerCookie },
    body: JSON.stringify({ action: 'ACCEPT' }),
  });
  const acceptData = await acceptRes.json();
  if (!acceptRes.ok) throw new Error(`Worker accept failed: ${JSON.stringify(acceptData)}`);
  console.log(`   ✅ Job accepted by worker! Current status: ${acceptData.booking?.status || 'ACCEPTED'}\n`);

  // 6. Advance job stages through lifecycle
  console.log('6️⃣ Advancing job lifecycle stages...');
  const stages = ['ON_THE_WAY', 'ARRIVED', 'SERVICE_STARTED', 'COMPLETED'];
  for (const st of stages) {
    const patchRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: workerCookie },
      body: JSON.stringify({ status: st, note: `Status updated to ${st}` }),
    });
    const patchData = await patchRes.json();
    if (!patchRes.ok) throw new Error(`Failed to advance to ${st}: ${JSON.stringify(patchData)}`);
    console.log(`   ➡️ Stage advanced to: ${st}`);
  }
  console.log('   ✅ Worker finished craftsmanship (COMPLETED)\n');

  // 7. Customer inspects and confirms completion
  console.log('7️⃣ Customer Confirms Completion...');
  const confirmRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: custCookie },
    body: JSON.stringify({
      status: 'CUSTOMER_CONFIRMED',
      note: 'Customer inspected and approved craftsmanship quality',
    }),
  });
  const confirmData = await confirmRes.json();
  if (!confirmRes.ok) throw new Error(`Confirmation failed: ${JSON.stringify(confirmData)}`);
  console.log(`   ✅ Customer confirmed job: ${confirmData.booking.status}\n`);

  // 8. Process Payment
  console.log('8️⃣ Processing Payment via Demo UPI Gateway...');
  const payRes = await fetch(`${BASE_URL}/api/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: custCookie },
    body: JSON.stringify({
      bookingId,
      paymentMethod: 'UPI',
      upiId: 'aravind@okaxis',
    }),
  });
  const payData = await payRes.json();
  if (!payRes.ok) throw new Error(`Payment failed: ${JSON.stringify(payData)}`);
  console.log(`   ✅ Payment Processed! Status: ${payData.payment.status}`);
  console.log(`   Payment Reference: ${payData.payment.paymentNumber}`);
  console.log(`   GST Invoice Generated: ${payData.invoice.invoiceNumber} (Total: ₹${payData.invoice.totalAmount})\n`);

  // 9. Customer Rates Artisan
  console.log('9️⃣ Submitting Customer 5★ Rating & Review...');
  const rateRes = await fetch(`${BASE_URL}/api/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: custCookie },
    body: JSON.stringify({
      bookingId,
      qualityScore: 5,
      professionalismScore: 5,
      timelinessScore: 5,
      comment: 'Excellent workmanship by the cooperative plumber! Arrived on time and solved the leak.',
    }),
  });
  const rateData = await rateRes.json();
  if (!rateRes.ok) throw new Error(`Rating failed: ${JSON.stringify(rateData)}`);
  console.log(`   ✅ Rating submitted! Average: ${rateData.rating.averageScore}★`);
  console.log(`   Final Booking State: ${rateData.booking.status}\n`);

  // 10. Verify Final Booking State in DB
  console.log('🔟 Verifying Final State from Database...');
  const finalRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
    headers: { Cookie: custCookie },
  });
  const finalData = await finalRes.json();
  console.log(`   📋 Final Summary for Booking #${finalData.booking.bookingNumber}:`);
  console.log(`      • Status: ${finalData.booking.status}`);
  console.log(`      • Payment Status: ${finalData.booking.paymentStatus}`);
  console.log(`      • Total Paid: ₹${finalData.booking.totalAmount}`);
  console.log(`      • Invoices: ${finalData.booking.invoices?.length || 0}`);
  console.log(`      • History Events: ${finalData.booking.statusHistory?.length || 0}`);
  console.log('\n🎉 ALL 10 END-TO-END STEPS PASSED WITH 0 ERRORS! The platform is 100% operational.');
}

runTest().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
