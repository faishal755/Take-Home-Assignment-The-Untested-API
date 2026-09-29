# Take-Home Assignment Submission Note

- **What I'd test next if I had more time:**
  I'd want to write some tests around edge cases like weird date formats or timezones messing up the due dates, and maybe test what happens if two requests try to update the exact same task at the same time.

- **Anything that surprised me in the codebase:**
  Definitely the pagination bug. It was a classic off-by-one error with how page offsets were being calculated, which completely threw off the tests until I dug into it. It was a good reminder of how helpful tests are for catching silly math bugs early.

- **Any questions I'd ask before shipping this to production:**
  1. Since we're currently using an in-memory store that wipes on restart, what database are we planning to hook this up to?
  2. Are we adding any auth (like API keys or JWTs) before this goes live, or is it supposed to stay completely open?
  3. For the task assignment feature, do we just care about who the current assignee is, or do we need a history log tracking who worked on it previously?
