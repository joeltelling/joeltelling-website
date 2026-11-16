/* Lock Buster — all the jokes live here. Add more! */
(function (g) {
  'use strict';
  const LB = (g.LB = g.LB || {});

  LB.content = {
    // Shown above the lock: "whose stuff are we stealing?"
    OWNERS: [
      "Grandma's Cookie Jar",
      'Gym Locker #12 (Smells)',
      "Dave's Diary (PRIVATE!!)",
      'Suspiciously Large Cheese Vault',
      "Mr. Whiskers' Treat Safe",
      'Office Fridge: Yogurt Is Labeled',
      "Intern's Bike (Not Even Nice)",
      'The Garden Gnome Vault',
      "Mom's Secret Chocolate Stash",
      'Mildly Cursed Pirate Chest',
      'A Bank (Allegedly)',
      "Wizard's Sock Drawer",
      "Dentist's Lollipop Safe",
      "Little Brother's KEEP OUT Box",
      "Final Boss's Mini Fridge",
      "The Mayor's Toupee Locker",
      'Moon Cheese Safe',
      'Shed of Unfinished Projects',
      'Pigeon Union HQ',
      'Time Capsule (Opened Early)',
      "Local Raccoon's Lunchbox",
      'Suspicious Casserole Container',
      "Ex's Hot Sauce Collection",
      "Janitor's Closet of Secrets",
      "Uncle Rick's 'Investments'",
      "Magician's Hat Box",
      "Sasquatch's Mailbox",
      "Neighbor's Leaf Blower Safe",
      'Lost & Found (Mostly Lost)',
      'Emergency Donut Reserve',
      'School Locker: Nostalgia Edition',
      "Pirate Ship's Snack Hold",
    ],

    // Shown after each unlock: "LOOT: ..."
    LOOT: [
      'one (1) grape',
      '47 pennies and regret',
      'a recipe. It is just butter',
      'mismatched socks',
      'an IOU from Gerald',
      'a half-eaten sandwich',
      'a participation trophy',
      "yesterday's lottery ticket",
      '3 loose buttons',
      'a very small violin',
      'a map to a slightly bigger safe',
      'a rubber duck in a tiny hat',
      'emergency pudding',
      "someone's retainer. Ew",
      "a sticky note: 'nice try'",
      'a gift card. For a gym',
      'tax documents (thrilling)',
      'a single, glorious donut',
      'a cursed fidget spinner',
      'coupons. Expired in 2009',
      'a tiny tuxedo for a hamster',
      'a pamphlet about locks',
      '40 packets of ketchup',
      "a VHS tape: 'Part 2 of 3'",
      'a toupee. Not the mayor\'s. Probably',
      "a note: 'The real treasure was patience'",
      'a smug fish',
      'a banana. Just a banana',
    ],

    UNLOCK: [
      'Smooth.', 'Click!', 'Too easy.', 'Nobody saw that.', 'Nice hands!',
      'Crime? Never heard of it.', 'Locksmiths hate you.', "Chef's kiss.",
      'Cracked it!', "Oh, you're good.", 'Silky.', 'Open sesame!',
      'Sneaky sneaky.', 'Like butter.',
    ],
    UNLOCK_FAST: [
      'LIGHTNING!', 'Blink and it opened!', 'SPEEDY!', 'Hands of a pianist!',
      'Faster than a pigeon!', 'ZOOM!',
    ],
    STREAK: {
      3: 'Hot streak!',
      6: 'ON FIRE!',
      9: 'UNSTOPPABLE!',
      12: 'Suspiciously good...',
      15: 'Are you even human?',
    },

    WRONG: [
      'Nope.', 'The lock judges you.', 'Bzzzt!', 'Oof.',
      'Fingers: 1. Brain: 0.', 'Even the gnome saw that.', 'Try numbers that exist.',
      'So close! (Not close.)',
    ],
    WRONG_WAY: [
      'Wrong way, spinner!', 'Other direction!', 'The dial disagrees.',
      'Dials have two directions. Pick right.',
    ],

    // first time a modifier shows up in a run, explain it (with attitude)
    MOD_INTRO: {
      peek: ['PEEK!', 'The code vanishes soon. Tap the note to look again (-1.5s)'],
      shuffle: ['SHUFFLE!', 'The keys move after every tap. Good luck, have fun'],
    },
    PEEK_AGAIN: ['Cheater!', 'Memory: not great.', 'Okay, one more look.', 'Peeking costs. Nothing is free.'],

    // Practice run (first launch, or the "How to play" button): [coach title, coach text] per lock
    TRAIN: [
      ['Tap the code!', 'The code is on the sticky note. Tap those same digits on the keypad.'],
      ['Spin the wheels!', 'Swipe each wheel until it matches the note. It opens by itself.'],
      ['Crank the dial!', 'Spin to the number, following the arrow. Lift your finger to lock it.'],
      ['Slide it!', 'Drag each handle onto its pink notch, then let go.'],
      ['Final exam: the clock', 'That bar is the time you would EARN. It drains while you dither. Be quick!'],
    ],
    TRAIN_OWNERS: [
      'Practice Lock (Be Gentle)',
      'Practice Wheels (They Spin!)',
      'Practice Dial (Very Retro)',
      'Practice Sliders (Slippery)',
      'The Final Practice Lock',
    ],
    TRAIN_OK: ['Nailed it!', 'Natural talent!', 'The lock is scared.', 'Look at you go!', 'Crime pays!', 'Easy, right?'],
    TRAIN_WRONG: ['Oops! Practice is free.', 'Nope! (No penalty. Yet.)', 'Mistakes are free in here.'],

    // Level names + a tagline each. Past the last one the list laps (see levelName in game.js).
    LEVELS: [
      ["Grandma's Shed", 'Warm-up. Mostly cookies.'],
      ['The Gym Locker Room', 'It smells. You will cope.'],
      ['Office Basement', "Somebody's labeled yogurt lives here."],
      ['Pirate Ship', 'Arr. The locks are mildly cursed.'],
      ['Suspicious Cheese Vault', 'Cheddar security, gouda guards.'],
      ["The Mayor's Mansion", 'Wigs. So many wigs.'],
      ['Wizard Tower', 'The locks are rude on purpose.'],
      ['Moon Base', 'Zero gravity, full anxiety.'],
      ["Dragon's Pantry", 'Do not wake the snacks.'],
      ["The Final Boss's Fridge", 'Nobody has ever opened this.'],
      ['Pigeon Illuminati HQ', 'They have been watching.'],
      ['Heist Headquarters', "You made it. Don't blink."],
    ],
    LEVEL_CLEAR: [
      'Vault cleared!', 'Crime wave!', 'Snacks secured.', 'Another one bites the dust.',
      'Locksmiths are filing complaints.', 'Getaway time!', 'Nobody saw a thing.',
    ],
    LEVEL_FLAWLESS: ['Flawless!', 'Not a single oops!', 'Surgeon hands!', 'Suspiciously perfect.'],
    // shown on the level card when a curveball debuts
    NEW_MOD: {
      peek: ['NEW: PEEK', 'The code vanishes after a few seconds. Tap the note to look again (-1.5s).'],
      shuffle: ['NEW: SHUFFLE', 'Keypad keys move after every tap. Stay sharp.'],
    },

    BUSTED_TITLES: ['BUSTED!', "TIME'S UP!", 'CAUGHT!', 'OH NO!'],
    BUSTED_QUIPS: [
      'The owner came home with snacks.',
      'The cops arrived. They were also confused.',
      'A pigeon witnessed everything.',
      'The alarm went off. It was just your phone.',
      'Your getaway car is a unicycle.',
      'Security cameras: 1. You: 0.',
      'You were arrested for being too slow.',
      'The lock owner wants a word.',
    ],
    NO_HAUL: 'You stole nothing. The locks pity you.',

    // [minimum locks cracked, rank title]
    RANKS: [
      [0, 'Confused Bystander'],
      [3, 'Pocket Lint Thief'],
      [7, 'Shed Burglar'],
      [12, 'Sneaky Raccoon'],
      [18, 'Smooth Operator'],
      [25, 'Vault Menace'],
      [35, 'Master Cracker'],
      [50, 'Legend of the Lock'],
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
