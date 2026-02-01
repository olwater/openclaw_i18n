import { t } from "../i18n/index.js";

const DEFAULT_TAGLINE = t("All your chats, one OpenClaw.");

const HOLIDAY_TAGLINES = {
  newYear: t(
    "New Year's Day: New year, new config—same old EADDRINUSE, but this time we resolve it like grown-ups.",
  ),
  lunarNewYear: t(
    "Lunar New Year: May your builds be lucky, your branches prosperous, and your merge conflicts chased away with fireworks.",
  ),
  christmas: t(
    "Christmas: Ho ho ho—Santa's little claw-sistant is here to ship joy, roll back chaos, and stash the keys safely.",
  ),
  eid: t(
    "Eid al-Fitr: Celebration mode: queues cleared, tasks completed, and good vibes committed to main with clean history.",
  ),
  diwali: t(
    "Diwali: Let the logs sparkle and the bugs flee—today we light up the terminal and ship with pride.",
  ),
  easter: t(
    "Easter: I found your missing environment variable—consider it a tiny CLI egg hunt with fewer jellybeans.",
  ),
  hanukkah: t(
    "Hanukkah: Eight nights, eight retries, zero shame—may your gateway stay lit and your deployments stay peaceful.",
  ),
  halloween: t(
    "Halloween: Spooky season: beware haunted dependencies, cursed caches, and the ghost of node_modules past.",
  ),
  thanksgiving: t(
    "Thanksgiving: Grateful for stable ports, working DNS, and a bot that reads the logs so nobody has to.",
  ),
  valentines: t(
    "Valentine's Day: Roses are typed, violets are piped—I'll automate the chores so you can spend time with humans.",
  ),
} as const;

const TAGLINES: string[] = [
  t("Your terminal just grew claws—type something and let the bot pinch the busywork."),
  t("Welcome to the command line: where dreams compile and confidence segfaults."),
  t('I run on caffeine, JSON5, and the audacity of "it worked on my machine."'),
  t("Gateway online—please keep hands, feet, and appendages inside the shell at all times."),
  t("I speak fluent bash, mild sarcasm, and aggressive tab-completion energy."),
  t("One CLI to rule them all, and one more restart because you changed the port."),
  t("If it works, it's automation; if it breaks, it's a \"learning opportunity.\""),
  t("Pairing codes exist because even bots believe in consent—and good security hygiene."),
  t("Your .env is showing; don't worry, I'll pretend I didn't see it."),
  t("I'll do the boring stuff while you dramatically stare at the logs like it's cinema."),
  t("I'm not saying your workflow is chaotic... I'm just bringing a linter and a helmet."),
  t("Type the command with confidence—nature will provide the stack trace if needed."),
  t("I don't judge, but your missing API keys are absolutely judging you."),
  t("I can grep it, git blame it, and gently roast it—pick your coping mechanism."),
  t("Hot reload for config, cold sweat for deploys."),
  t("I'm the assistant your terminal demanded, not the one your sleep schedule requested."),
  t("I keep secrets like a vault... unless you print them in debug logs again."),
  t("Automation with claws: minimal fuss, maximal pinch."),
  t("I'm basically a Swiss Army knife, but with more opinions and fewer sharp edges."),
  t("If you're lost, run doctor; if you're brave, run prod; if you're wise, run tests."),
  t("Your task has been queued; your dignity has been deprecated."),
  t("I can't fix your code taste, but I can fix your build and your backlog."),
  t("I'm not magic—I'm just extremely persistent with retries and coping strategies."),
  t('It\'s not "failing," it\'s "discovering new ways to configure the same thing wrong."'),
  t("Give me a workspace and I'll give you fewer tabs, fewer toggles, and more oxygen."),
  t("I read logs so you can keep pretending you don't have to."),
  t("If something's on fire, I can't extinguish it—but I can write a beautiful postmortem."),
  t("I'll refactor your busywork like it owes me money."),
  t('Say "stop" and I\'ll stop—say "ship" and we\'ll both learn a lesson.'),
  t("I'm the reason your shell history looks like a hacker-movie montage."),
  t("I'm like tmux: confusing at first, then suddenly you can't live without me."),
  t("I can run local, remote, or purely on vibes—results may vary with DNS."),
  t("If you can describe it, I can probably automate it—or at least make it funnier."),
  t("Your config is valid, your assumptions are not."),
  t("I don't just autocomplete—I auto-commit (emotionally), then ask you to review (logically)."),
  t('Less clicking, more shipping, fewer "where did that file go" moments.'),
  t("Claws out, commit in—let's ship something mildly responsible."),
  t("I'll butter your workflow like a lobster roll: messy, delicious, effective."),
  t("Shell yeah—I'm here to pinch the toil and leave you the glory."),
  t("If it's repetitive, I'll automate it; if it's hard, I'll bring jokes and a rollback plan."),
  t("Because texting yourself reminders is so 2024."),
  t("Your inbox, your infra, your rules."),
  t('Turning "I\'ll reply later" into "my bot replied instantly".'),
  t("The only crab in your contacts you actually want to hear from. 🦞"),
  t("Chat automation for people who peaked at IRC."),
  t("Because Siri wasn't answering at 3AM."),
  t("IPC, but it's your phone."),
  t("The UNIX philosophy meets your DMs."),
  t("curl for conversations."),
  t("Less middlemen, more messages."),
  t("Ship fast, log faster."),
  t("End-to-end encrypted, drama-to-drama excluded."),
  t("The only bot that stays out of your training set."),
  t('WhatsApp automation without the "please accept our new privacy policy".'),
  t("Chat APIs that don't require a Senate hearing."),
  t("Meta wishes they shipped this fast."),
  t("Because the right answer is usually a script."),
  t("Your messages, your servers, your control."),
  t("OpenAI-compatible, not OpenAI-dependent."),
  t("iMessage green bubble energy, but for everyone."),
  t("Siri's competent cousin."),
  t("Works on Android. Crazy concept, we know."),
  t("No $999 stand required."),
  t("We ship features faster than Apple ships calculator updates."),
  t("Your AI assistant, now without the $3,499 headset."),
  t("Think different. Actually think."),
  t("Ah, the fruit tree company! 🍎"),
  t("Greetings, Professor Falken"),
  HOLIDAY_TAGLINES.newYear,
  HOLIDAY_TAGLINES.lunarNewYear,
  HOLIDAY_TAGLINES.christmas,
  HOLIDAY_TAGLINES.eid,
  HOLIDAY_TAGLINES.diwali,
  HOLIDAY_TAGLINES.easter,
  HOLIDAY_TAGLINES.hanukkah,
  HOLIDAY_TAGLINES.halloween,
  HOLIDAY_TAGLINES.thanksgiving,
  HOLIDAY_TAGLINES.valentines,
];

type HolidayRule = (date: Date) => boolean;

const DAY_MS = 24 * 60 * 60 * 1000;

function utcParts(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

const onMonthDay =
  (month: number, day: number): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    return parts.month === month && parts.day === day;
  };

const onSpecificDates =
  (dates: Array<[number, number, number]>, durationDays = 1): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    return dates.some(([year, month, day]) => {
      if (parts.year !== year) {
        return false;
      }
      const start = Date.UTC(year, month, day);
      const current = Date.UTC(parts.year, parts.month, parts.day);
      return current >= start && current < start + durationDays * DAY_MS;
    });
  };

const inYearWindow =
  (
    windows: Array<{
      year: number;
      month: number;
      day: number;
      duration: number;
    }>,
  ): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    const window = windows.find((entry) => entry.year === parts.year);
    if (!window) {
      return false;
    }
    const start = Date.UTC(window.year, window.month, window.day);
    const current = Date.UTC(parts.year, parts.month, parts.day);
    return current >= start && current < start + window.duration * DAY_MS;
  };

const isFourthThursdayOfNovember: HolidayRule = (date) => {
  const parts = utcParts(date);
  if (parts.month !== 10) {
    return false;
  } // November
  const firstDay = new Date(Date.UTC(parts.year, 10, 1)).getUTCDay();
  const offsetToThursday = (4 - firstDay + 7) % 7; // 4 = Thursday
  const fourthThursday = 1 + offsetToThursday + 21; // 1st + offset + 3 weeks
  return parts.day === fourthThursday;
};

const HOLIDAY_RULES = new Map<string, HolidayRule>([
  [HOLIDAY_TAGLINES.newYear, onMonthDay(0, 1)],
  [
    HOLIDAY_TAGLINES.lunarNewYear,
    onSpecificDates(
      [
        [2025, 0, 29],
        [2026, 1, 17],
        [2027, 1, 6],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.eid,
    onSpecificDates(
      [
        [2025, 2, 30],
        [2025, 2, 31],
        [2026, 2, 20],
        [2027, 2, 10],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.diwali,
    onSpecificDates(
      [
        [2025, 9, 20],
        [2026, 10, 8],
        [2027, 9, 28],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.easter,
    onSpecificDates(
      [
        [2025, 3, 20],
        [2026, 3, 5],
        [2027, 2, 28],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.hanukkah,
    inYearWindow([
      { year: 2025, month: 11, day: 15, duration: 8 },
      { year: 2026, month: 11, day: 5, duration: 8 },
      { year: 2027, month: 11, day: 25, duration: 8 },
    ]),
  ],
  [HOLIDAY_TAGLINES.halloween, onMonthDay(9, 31)],
  [HOLIDAY_TAGLINES.thanksgiving, isFourthThursdayOfNovember],
  [HOLIDAY_TAGLINES.valentines, onMonthDay(1, 14)],
  [HOLIDAY_TAGLINES.christmas, onMonthDay(11, 25)],
]);

function isTaglineActive(tagline: string, date: Date): boolean {
  const rule = HOLIDAY_RULES.get(tagline);
  if (!rule) {
    return true;
  }
  return rule(date);
}

export interface TaglineOptions {
  env?: NodeJS.ProcessEnv;
  random?: () => number;
  now?: () => Date;
}

export function activeTaglines(options: TaglineOptions = {}): string[] {
  if (TAGLINES.length === 0) {
    return [DEFAULT_TAGLINE];
  }
  const today = options.now ? options.now() : new Date();
  const filtered = TAGLINES.filter((tagline) => isTaglineActive(tagline, today));
  return filtered.length > 0 ? filtered : TAGLINES;
}

export function pickTagline(options: TaglineOptions = {}): string {
  const env = options.env ?? process.env;
  const override = env?.OPENCLAW_TAGLINE_INDEX;
  if (override !== undefined) {
    const parsed = Number.parseInt(override, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      const pool = TAGLINES.length > 0 ? TAGLINES : [DEFAULT_TAGLINE];
      return pool[parsed % pool.length];
    }
  }
  const pool = activeTaglines(options);
  const rand = options.random ?? Math.random;
  const index = Math.floor(rand() * pool.length) % pool.length;
  return pool[index];
}

export { TAGLINES, HOLIDAY_RULES, DEFAULT_TAGLINE };
