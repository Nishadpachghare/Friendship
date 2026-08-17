// ============================================================================
// This is your "database" starting point. Everything here is a placeholder --
// replace the text, dates and image URLs with your real memories.
// Once the site is running, you can ALSO add new memories/photos/jokes
// directly from the Memories and Inside Jokes pages -- no code needed for those,
// they get saved in the browser automatically.
// ============================================================================

export const STORY_META = {
  namesShort: 'B & N',                  // shows in the nav / footer
  firstMeetDate: 'May 22th, 2026',
  firstMeetLocation: 'Nagpur, Lokmanya Nagar Metro Station',
  firstMeetTime: '12:16 PM',
  firstMeetSong: 'Jhol',
  firstFavSong: 'Jhol',
  firstFavSongYoutubeId: 'pCh7TvoAkHg', // YouTube video ID — update if wrong: go to YouTube, find the song, copy ?v=XXXX from URL
  firstImpression: 'I thought you were way too loud for a first meeting -- turns out that never changed.',
  firstConversation: 'We ended up arguing about which chai stall was better for forty-five minutes straight.',
}

export const TIMELINE = [
  { id: 't7', title: 'First Sorry', emoji: '\uD83E\uDD79', date: '2026-07-14', text: 'I knew I was wrong, so I made you a little coding website to say sorry. I\'ve never had an ego with you; losing you matters more.' },
  { id: 't2', title: 'First Chat', emoji: '\uD83D\uDCAC', date: '2025-09-20', text: 'It all started with one random mention about a BMW drift, and somehow that one little moment turned into a journey this thrilling.' },
  { id: 't1', title: 'First Meet', emoji: '\u2728', date: '2026-05-22', text: 'I was so nervous when I first met you, but somehow that nervous day turned into memories we\'re still making together.' },
  { id: 't3', title: 'First Hangout', emoji: '\u2615', date: '2026-05-22', text: 'My first and favourite hangout singing our hearts out, enjoying every little moment, and somehow making memories we\'re still making today.' },
  { id: 't8', title: 'Best Memory (so far)', emoji: '\u2764\uFE0F', date: '2026-05-22', text: 'For me, every memory with you is a best memory and there is no so far about it. It is infinity.' },
  { id: 't5', title: 'First Photo', emoji: '\uD83D\uDCF8', date: '2026-07-03', text: 'Our first photo was actually from our second meet both in our Brazil T-shirts, capturing a moment that somehow became one of my favourite pictures of us.' },
  { id: 't6', title: 'First Fight', emoji: '\uD83D\uDE2D', date: '2026-08-03', text: 'I still remember that day, and I know I was wrong. I\'m truly sorry, yaar. Both our fights taught me a lot not just about my mistakes, but about how much this friendship really means to me.' },
]

export const MEMORIES = [
  { id: 'm1', category: 'Hangouts', date: '2024-09-18', caption: 'We had absolutely no idea this would become a memory.', image: '' },
  { id: 'm2', category: 'Dumb Moments', date: '2024-10-02', caption: 'This is the face of someone about to say something incredibly stupid.', image: '' },
  { id: 'm3', category: 'Special Days', date: '2025-02-18', caption: 'A completely ordinary day that turned into a core memory.', image: '' },
]

export const MEMORY_CATEGORIES = ['Random Moments', 'Dumb Moments', 'Emotional Moments', 'Hangouts', 'Special Days', 'Screenshots']

export const INSIDE_JOKES = [
  { id: 'j1', line: 'Bro remember ______?', story: 'You had to be there. It still doesn\u2019t make sense out loud, and that\u2019s the point.' },
  { id: 'j2', line: 'The chai stall incident', story: 'We are still, to this day, banned from ordering there together.' },
]

export const FIGHT_STORY = {
  intro: 'Every friendship has one.',
  whatHappened: 'A misunderstanding over something neither of us even remembers clearly now.',
  whatIThought: 'I thought you didn\u2019t care as much as I did.',
  whatTheyThought: 'You thought I was overreacting over nothing.',
  whatActuallyHappened: '“We both thought something was wrong, but it was really just a misunderstanding and a little miscommunication between us.” ❤️',
  howWeFixed: 'A 2.3hr long  phone call and one very awkward "hey".',
  whatWeLearned: 'To control my emotions, communicate sooner, and never let misunderstandings get in the way we’re mature enough to understand each other now.',
  closing: 'And somehow, we were still here.',
}

export const QUIZ_QUESTIONS = [
  { id: 'q1', question: 'What is my favourite food?', options: ['Pizza', 'Biryani', 'Momos', 'Maggi'], answer: 'Momos' },
  { id: 'q2', question: 'Where did we first meet?', options: ['College', 'Cafe', 'Hostel', 'Someone\u2019s birthday'], answer: 'College' },
  { id: 'q3', question: 'What do I always order at our usual spot?', options: ['Cold coffee', 'Chai', 'Lemonade', 'Nothing, I steal yours'], answer: 'Chai' },
  { id: 'q4', question: 'What\u2019s my most-used reaction to your jokes?', options: ['A real laugh', 'An eye roll', 'Silence', 'A slow clap'], answer: 'An eye roll' },
  { id: 'q5', question: 'What do we always fight about?', options: ['Food', 'Being late', 'Music', 'Who texted first'], answer: 'Being late' },
]

export const GUESS_PHOTO_ROUNDS = [
  { id: 'g1', image: '', options: ['College', 'Cafe', 'Hostel', 'Somewhere else'], answer: 'College' },
  { id: 'g2', image: '', options: ['College', 'Cafe', 'Hostel', 'Somewhere else'], answer: 'Cafe' },
]

export const FUTURE_MEMORIES = [
  'Our next trip',
  'Our next crazy plan',
  'That one thing we still haven\u2019t done',
  '5 years from now',
  '10 years from now',
]

export const STATS = {
  laughs: '999+',
  hangouts: 27,
  messages: 15482,
  emotionalMoments: 18,
  fights: 3,
  memories: 86,
  stupidDecisions: '\u221E',
  argumentsWonByMe: 0,
}
