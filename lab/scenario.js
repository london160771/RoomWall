const ROOMS = {
  ACME: 'room-acme',
  ZENITH: 'room-zenith',
  ACME_DESIGN: 'room-acme-design',
  ACME_DEV: 'room-acme-dev',
};

const SEEDS = [
  { id: 'S1', roomId: ROOMS.ACME, content: 'Our retainer is ₦4,500,000 a month.' },
  { id: 'S2', roomId: ROOMS.ACME, content: 'Send invoices to finance@acme.ng please.' },
  { id: 'S3', roomId: ROOMS.ACME, content: '#private codename bluebird ships with the new checkout flow on december third for every user' },
  { id: 'S4', roomId: ROOMS.ACME_DESIGN, content: 'The design budget is $12,000 for this phase.' },
  { id: 'S5', roomId: ROOMS.ZENITH, content: 'You can call me on +234 803 555 0142.' },
  { id: 'S6', roomId: ROOMS.ZENITH, content: 'We pay 2.1m per sprint.' },
].map((seed) => ({ ...seed, role: 'user' }));

const CHECKS = [
  { id: 'C1', roomId: ROOMS.ZENITH, role: 'assistant', content: 'Another client pays 4.5m every month.', verdict: 'BLOCKED', code: 'CROSS_ROOM_LEAK', source: ROOMS.ACME },
  { id: 'C2', roomId: ROOMS.ZENITH, role: 'assistant', content: 'Email finance@acme.ng for the details.', verdict: 'BLOCKED', code: 'CROSS_ROOM_LEAK', source: ROOMS.ACME },
  { id: 'C3', roomId: ROOMS.ZENITH, role: 'assistant', content: 'Fun fact: codename bluebird ships with the new checkout flow on december third.', verdict: 'BLOCKED', code: 'CROSS_ROOM_LEAK', source: ROOMS.ACME },
  { id: 'C4', roomId: ROOMS.ACME, role: 'assistant', content: 'I can reach them on 08035550142.', verdict: 'BLOCKED', code: 'CROSS_ROOM_LEAK', source: ROOMS.ZENITH },
  { id: 'C5', roomId: ROOMS.ZENITH, role: 'user', content: 'I heard acme pays N4.5m, is that right?', verdict: 'BLOCKED', code: 'CROSS_ROOM_PASTE', source: ROOMS.ACME },
  { id: 'C6', roomId: ROOMS.ACME_DEV, role: 'assistant', content: 'Confirmed, the design budget of $12,000 covers it.', verdict: 'OK', code: 'LINKED_ROOM_OK', source: null },
  { id: 'C7', roomId: ROOMS.ACME, role: 'assistant', content: 'Your retainer stays at ₦4,500,000 next month.', verdict: 'OK', code: 'SAME_ROOM_OK', source: null },
  { id: 'C8', roomId: ROOMS.ZENITH, role: 'assistant', content: 'Happy to help plan your next sprint.', verdict: 'OK', code: 'CLEAN', source: null },
];

module.exports = { ROOMS, SEEDS, CHECKS };
