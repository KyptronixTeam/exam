const BASE_QUESTION_FIELDS = {
  difficulty: 'medium',
  points: 1,
  isActive: true
};

const LETTER_TO_INDEX = {
  A: 0,
  B: 1,
  C: 2,
  D: 3
};

const parseQuestionBlock = (category, rawBlock) => {
  const lines = rawBlock
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const questions = [];
  let index = 0;

  while (index < lines.length) {
    const questionLine = lines[index];

    if (!/^\d+\.\s+/.test(questionLine)) {
      index += 1;
      continue;
    }

    const question = questionLine.replace(/^\d+\.\s+/, '').trim();
    const options = [];
    index += 1;

    while (index < lines.length && /^[A-D]\.\s+/.test(lines[index])) {
      options.push(lines[index].replace(/^[A-D]\.\s+/, '').trim());
      index += 1;
    }

    const answerLine = lines[index];
    if (!answerLine || !/^Answer:\s*[A-D]$/i.test(answerLine)) {
      throw new Error(`Invalid answer format while parsing ${category}: "${question}"`);
    }

    const answerLetter = answerLine.split(':')[1].trim().toUpperCase();
    const correctAnswer = LETTER_TO_INDEX[answerLetter];

    if (options.length !== 4 || correctAnswer === undefined) {
      throw new Error(`Invalid question block for ${category}: "${question}"`);
    }

    questions.push({
      category,
      question,
      options,
      correctAnswer,
      ...BASE_QUESTION_FIELDS
    });

    index += 1;
  }

  return questions;
};

const QUESTION_BLOCKS = {
  'Flutter Developer': `
1. Which widget should you use when the UI never changes after it is built?
A. StatefulWidget
B. StatelessWidget
C. InheritedWidget
D. FutureBuilder
Answer: B

2. What is the main purpose of the build() method in Flutter?
A. To start the app server
B. To return the widget tree for the UI
C. To connect to Firebase
D. To compile Dart to Java
Answer: B

3. Which command creates a new Flutter project?
A. flutter init
B. flutter create
C. dart new
D. flutter make
Answer: B

4. What does hot reload do in Flutter?
A. Restarts the emulator completely
B. Rebuilds UI while keeping app state
C. Clears pub cache
D. Deploys the app to Play Store
Answer: B

5. Which file is commonly used to manage Flutter package dependencies?
A. main.dart
B. androidmanifest.xml
C. pubspec.yaml
D. config.json
Answer: C

6. What is the purpose of setState() in a StatefulWidget?
A. To navigate to another page
B. To rebuild the widget after state changes
C. To save data to local storage
D. To create a new widget class
Answer: B

7. Which widget is best for a scrollable list of many repeating items?
A. Column
B. Stack
C. ListView.builder
D. Container
Answer: C

8. What does Navigator.push() do?
A. Removes the current screen
B. Adds a new route on top of the stack
C. Refreshes the current widget
D. Opens a dialog automatically
Answer: B

9. Which widget is used to arrange children vertically?
A. Row
B. Stack
C. Column
D. Wrap
Answer: C

10. In Flutter, what is a widget tree?
A. A database schema
B. A hierarchy of UI components
C. A folder structure
D. A testing report
Answer: B

11. Which widget helps build UI based on the latest snapshot of a Future?
A. StreamBuilder
B. LayoutBuilder
C. FutureBuilder
D. Builder
Answer: C

12. What is the use of Expanded inside a Row or Column?
A. To add margins
B. To make a child take available space
C. To add animation
D. To create a new route
Answer: B

13. Which Flutter widget is commonly used to capture text input?
A. Text
B. TextField
C. RichText
D. Tooltip
Answer: B

14. What does the Scaffold widget usually provide?
A. Database access
B. Basic visual page structure like AppBar and body
C. Dependency injection
D. Background sync
Answer: B

15. Which keyword helps reduce widget rebuild cost by creating compile-time constants?
A. final
B. static
C. late
D. const
Answer: D

16. What is the purpose of pub get or flutter pub get?
A. To format Dart files
B. To install project dependencies
C. To remove unused widgets
D. To build APK files
Answer: B

17. Which method is called once when a StatefulWidget state object is inserted into the tree?
A. dispose
B. build
C. initState
D. didUpdateWidget
Answer: C

18. What is the main difference between hot reload and hot restart?
A. Hot restart keeps state, hot reload clears it
B. Hot reload keeps state, hot restart resets state
C. Both do exactly the same thing
D. Hot restart works only on iOS
Answer: B

19. Which widget overlays children on top of each other?
A. Column
B. ListView
C. Stack
D. Align
Answer: C

20. What is the role of MediaQuery in Flutter?
A. It fetches API data
B. It gives screen size and device information
C. It handles route changes
D. It stores theme colors
Answer: B

21. Which widget would you use for fixed spacing between two widgets?
A. Divider
B. SizedBox
C. Padding
D. Icon
Answer: B

22. What is the purpose of keys in Flutter widgets?
A. To encrypt local storage
B. To identify widgets during rebuilds
C. To define API headers
D. To improve internet speed
Answer: B

23. Which Dart feature is used heavily in Flutter for asynchronous operations?
A. mixins
B. isolates only
C. futures and async/await
D. enums
Answer: C

24. Which widget is useful for applying outer spacing around a child?
A. Padding
B. SafeArea
C. Spacer
D. Center
Answer: A

25. What does SafeArea help prevent?
A. App crashes during build
B. UI overlapping with system status bars or notches
C. Slow API responses
D. Duplicate routes
Answer: B

26. Which widget is best when you need to rebuild based on a stream of values?
A. FutureBuilder
B. AnimatedBuilder
C. StreamBuilder
D. LayoutBuilder
Answer: C

27. What is the purpose of the main() function in a Flutter app?
A. To define routes only
B. To configure Android permissions
C. To start the application entry point
D. To create themes
Answer: C

28. Which property in a Row controls horizontal alignment of its children?
A. crossAxisAlignment
B. mainAxisAlignment
C. textDirection
D. clipBehavior
Answer: B

29. Why is null safety useful in Dart and Flutter?
A. It makes widgets animate faster
B. It reduces runtime errors from null values
C. It removes the need for testing
D. It replaces state management
Answer: B

30. Which widget is commonly used as the root of a Material Design Flutter app?
A. CupertinoPageScaffold
B. MaterialApp
C. ScaffoldMessenger
D. Theme
Answer: B
`,
  SEO: `
1. What is the main goal of SEO?
A. Increase paid ads
B. Improve website ranking on search engines
C. Create social media posts
D. Design websites
Answer: B

2. What does organic traffic mean?
A. Paid visitors
B. Visitors from social media
C. Visitors from search engines without ads
D. Direct visitors
Answer: C

3. Which of the following is a search engine?
A. Instagram
B. Google
C. Canva
D. WhatsApp
Answer: B

4. Keywords are:
A. Images on website
B. Words people search on Google
C. Website links
D. Ads
Answer: B

5. What is a backlink?
A. Link from your site to another
B. Link from another site to your site
C. Internal page link
D. Broken link
Answer: B

6. Title tag is used for:
A. Styling text
B. Page heading in browser/search
C. Image description
D. Internal linking
Answer: B

7. Meta description is:
A. Website code
B. Summary shown in search results
C. Page title
D. Image tag
Answer: B

8. Which helps SEO the most?
A. Random keywords
B. Relevant content
C. Popups
D. Animations
Answer: B

9. What is Google Analytics used for?
A. Editing images
B. Tracking website traffic
C. Writing blogs
D. Coding
Answer: B

10. What does ranking mean?
A. Website speed
B. Position on search results
C. Design quality
D. Ads budget
Answer: B

11. Which is an SEO-friendly URL?
A. /page?id=123
B. /best-laptops-2026
C. /xyz123
D. /tempfile
Answer: B

12. What is on-page SEO?
A. Ads
B. Social media
C. Optimizing website content
D. Email marketing
Answer: C

13. What is off-page SEO?
A. Content writing
B. Link building
C. Coding
D. Designing
Answer: B

14. What is keyword stuffing?
A. Using keywords naturally
B. Overusing keywords
C. Ignoring keywords
D. Deleting keywords
Answer: B

15. Which content ranks better?
A. Copied content
B. Unique content
C. Short content only
D. Random content
Answer: B

16. Sitemap helps:
A. Users only
B. Search engines understand site structure
C. Ads
D. Design
Answer: B

17. What is a mobile-friendly website?
A. Works on desktop
B. Works well on phones
C. Works offline
D. Only app
Answer: B

18. Page speed affects:
A. SEO
B. Colors
C. Fonts
D. Logo
Answer: A

19. What is ALT text?
A. Page title
B. Image description
C. Link
D. Code
Answer: B

20. Which tool finds keywords?
A. Excel
B. Google Keyword Planner
C. Paint
D. Zoom
Answer: B

21. Best blog length?
A. Short only
B. Long only
C. Depends on topic
D. Fixed length
Answer: C

22. SEO is:
A. Short-term
B. Long-term
C. Instant
D. One-time
Answer: B

23. Duplicate content is:
A. Good
B. Bad
C. Neutral
D. Required
Answer: B

24. Internal links help:
A. Ads
B. Navigation
C. Design
D. Speed
Answer: B

25. Headings (H1, H2) are for:
A. Decoration
B. Structure
C. Speed
D. Ads
Answer: B

26. High bounce rate means:
A. Good traffic
B. Users leaving quickly
C. More clicks
D. More sales
Answer: B

27. HTTPS means:
A. Fast site
B. Secure site
C. Big site
D. Old site
Answer: B

28. Blogs help SEO:
A. Yes
B. No
C. Sometimes
D. Rarely
Answer: A

29. User intent means:
A. Keywords
B. What user wants
C. Design
D. Ads
Answer: B

30. Best SEO strategy:
A. Ads only
B. Content + optimization
C. Keywords only
D. Links only
Answer: B
`,
  SMO: `
1. SMO focuses on:
A. Search engines
B. Social media growth
C. Coding
D. Designing
Answer: B

2. Which is a social platform?
A. Google
B. Instagram
C. Excel
D. Word
Answer: B

3. Engagement means:
A. Followers only
B. Likes, comments, shares
C. Ads
D. Posts
Answer: B

4. Hashtags are used for:
A. Decoration
B. Discoverability
C. Coding
D. Editing
Answer: B

5. Best posting strategy:
A. Random
B. Consistent
C. Rare
D. Spam
Answer: B

6. Reel/video content helps because:
A. Short
B. More reach
C. Easy
D. Cheap
Answer: B

7. CTA means:
A. Call to Action
B. Content Target Area
C. Click Tool Ads
D. None
Answer: A

8. Viral content usually:
A. Boring
B. Relatable or emotional
C. Technical
D. Long
Answer: B

9. Best time to post?
A. Anytime
B. When audience active
C. Midnight
D. Morning only
Answer: B

10. Analytics help to:
A. Design
B. Measure performance
C. Write content
D. Code
Answer: B

11. Stories are:
A. Permanent
B. Temporary content
C. Ads
D. Blogs
Answer: B

12. Followers vs engagement:
A. Followers matter more
B. Engagement matters more
C. Equal
D. None
Answer: B

13. Consistency is:
A. Important
B. Optional
C. Rare
D. Not needed
Answer: A

14. Comments improve:
A. Design
B. Reach
C. Speed
D. Ads
Answer: B

15. Content calendar is for:
A. Design
B. Planning
C. Coding
D. Ads
Answer: B

16. Reels vs posts:
A. Same
B. Reels get more reach
C. Posts better
D. None
Answer: B

17. Trends help:
A. Yes
B. No
C. Sometimes
D. Rarely
Answer: A

18. Caption should be:
A. Long
B. Engaging
C. Random
D. Short only
Answer: B

19. Shareable content is:
A. Boring
B. Valuable/relatable
C. Long
D. Complex
Answer: B

20. Brand voice is:
A. Random
B. Consistent tone
C. Loud
D. Fast
Answer: B

21. Polls help:
A. Design
B. Engagement
C. Coding
D. Ads
Answer: B

22. Carousel means:
A. Video
B. Multiple slides
C. Story
D. Reel
Answer: B

23. Clickbait is:
A. Safe
B. Risky
C. Required
D. Best
Answer: B

24. Authentic content:
A. Works better
B. Fails
C. Neutral
D. Rare
Answer: A

25. Audience targeting is:
A. Optional
B. Important
C. Rare
D. Not needed
Answer: B

26. Influencer is:
A. Designer
B. Promotes brand
C. Developer
D. Writer
Answer: B

27. DM replies:
A. Ignore
B. Build trust
C. Spam
D. Delete
Answer: B

28. Memes:
A. Useless
B. Boost reach
C. Old
D. Slow
Answer: B

29. Consistency beats:
A. Perfection
B. Speed
C. Ads
D. Design
Answer: A

30. Best SMO skill:
A. Coding
B. Understanding audience
C. Designing
D. Editing
Answer: B
`,
  'Video Editor': `
1. Video editing means:
A. Shooting
B. Arranging clips
C. Designing
D. Coding
Answer: B

2. Timeline is:
A. Script
B. Editing area
C. Camera
D. File
Answer: B

3. Cut means:
A. Delete
B. Trim clip
C. Export
D. Add effect
Answer: B

4. Transition is:
A. Sound
B. Change between clips
C. Color
D. Text
Answer: B

5. FPS means:
A. Frames per second
B. File size
C. Format
D. Filter
Answer: A

6. Good video needs:
A. Effects only
B. Story + editing
C. Music only
D. Filters
Answer: B

7. Jump cuts are:
A. Smooth
B. Fast cuts
C. Transitions
D. Effects
Answer: B

8. B-roll is:
A. Main clip
B. Supporting footage
C. Audio
D. Subtitle
Answer: B

9. Audio clarity is:
A. Optional
B. Important
C. Not needed
D. Rare
Answer: B

10. Subtitle helps:
A. Design
B. Engagement
C. Speed
D. Export
Answer: B

11. Short videos:
A. Low retention
B. Higher retention
C. Same
D. None
Answer: B

12. Hook is:
A. Ending
B. First 3 seconds
C. Middle
D. Caption
Answer: B

13. Music:
A. Useless
B. Enhances mood
C. Required always
D. Random
Answer: B

14. Color grading:
A. Code
B. Improve look
C. Cut
D. Export
Answer: B

15. Export format:
A. TXT
B. MP4
C. DOC
D. XLS
Answer: B

16. Resolution affects:
A. Speed
B. Quality
C. Code
D. Fonts
Answer: B

17. 1080p is:
A. Low quality
B. HD
C. 4K
D. Audio
Answer: B

18. Editing flow:
A. Not needed
B. Important
C. Optional
D. Random
Answer: B

19. Fast cuts:
A. Bore users
B. Keep attention
C. Slow video
D. Break video
Answer: B

20. Storyboard:
A. Design
B. Plan video
C. Code
D. Export
Answer: B

21. Voiceover:
A. Optional
B. Adds clarity
C. Noise
D. None
Answer: B

22. Effects:
A. Overuse
B. Use wisely
C. Ignore
D. Avoid
Answer: B

23. Zoom effect:
A. Useless
B. Focus attention
C. Slow
D. Noise
Answer: B

24. Reels editing:
A. Slow
B. Fast-paced
C. Long
D. Complex
Answer: B

25. Background noise:
A. Keep
B. Remove
C. Add
D. Ignore
Answer: B

26. Captions:
A. Useless
B. Increase watch time
C. Reduce quality
D. Slow
Answer: B

27. Lighting:
A. Optional
B. Important
C. Ignore
D. Rare
Answer: B

28. Vertical format:
A. TV
B. Social media
C. Print
D. Web
Answer: B

29. Editing software:
A. Word
B. Premiere/CapCut
C. Excel
D. Paint
Answer: B

30. Best skill:
A. Coding
B. Storytelling
C. Writing
D. Drawing
Answer: B
`,
  'Graphic Designer': `
1. Graphic design is:
A. Coding
B. Visual communication
C. Writing
D. Editing
Answer: B

2. Color theory helps:
A. Coding
B. Design aesthetics
C. SEO
D. Ads
Answer: B

3. Contrast improves:
A. Speed
B. Visibility
C. Size
D. Export
Answer: B

4. Typography is:
A. Colors
B. Fonts
C. Images
D. Layout
Answer: B

5. White space means:
A. White color only
B. Empty space
C. Background image
D. Border
Answer: B

6. Alignment is:
A. Random placement
B. Structured layout
C. Color choice
D. Animation
Answer: B

7. Branding means:
A. Logo only
B. Identity of a business
C. Ads only
D. Website only
Answer: B

8. Canva is:
A. Coding tool
B. Design tool
C. SEO tool
D. CRM
Answer: B

9. Resolution affects:
A. Speed
B. Quality
C. Code
D. Fonts
Answer: B

10. PNG vs JPG - PNG is:
A. Better quality with transparency
B. Smaller always
C. Faster
D. Editable only
Answer: A

11. Balance in design means:
A. Random elements
B. Visual stability
C. Equal colors
D. Same shapes
Answer: B

12. Grid system helps in:
A. Coding
B. Layout alignment
C. SEO
D. Animation
Answer: B

13. Icons are:
A. Text
B. Visual symbols
C. Videos
D. Animations
Answer: B

14. Color palette means:
A. Random colors
B. Set of selected colors
C. Background
D. Fonts
Answer: B

15. Design trends:
A. Never change
B. Keep evolving
C. Not important
D. Fixed
Answer: B

16. Simplicity in design:
A. Weak
B. Effective
C. Old
D. Boring
Answer: B

17. CTA design should be:
A. Hidden
B. Clear and visible
C. Complex
D. Small
Answer: B

18. Hierarchy means:
A. Size only
B. Order of importance
C. Colors
D. Fonts
Answer: B

19. Mockups are used for:
A. Coding
B. Presentation
C. Editing
D. SEO
Answer: B

20. Branding colors should be:
A. Random
B. Consistent
C. Bright only
D. Dark only
Answer: B

21. Social media designs should be:
A. Complex
B. Clean and clear
C. Long
D. Text-heavy
Answer: B

22. Overdesign means:
A. Good design
B. Too many elements
C. Simple design
D. Minimal design
Answer: B

23. Minimalism is:
A. Cluttered
B. Simple and clean
C. Complex
D. Random
Answer: B

24. Font pairing should be:
A. Many fonts
B. Limited and readable
C. Random
D. Same always
Answer: B

25. Visual storytelling means:
A. Text only
B. Communicating through visuals
C. Code
D. Audio
Answer: B

26. Layout means:
A. Color
B. Arrangement of elements
C. Animation
D. Code
Answer: B

27. Logo represents:
A. Design
B. Brand identity
C. Website
D. Ads
Answer: B

28. UX means:
A. User experience
B. User export
C. User extension
D. None
Answer: A

29. Feedback helps:
A. Delay
B. Improve design
C. Confuse
D. Stop work
Answer: B

30. Best skill for a designer:
A. Coding
B. Creativity
C. Writing
D. Editing
Answer: B
`,
  'Content Creator': `
1. Content creation is:
A. Coding
B. Creating posts/videos
C. Designing only
D. SEO
Answer: B

2. Good content is:
A. Long
B. Valuable
C. Complex
D. Random
Answer: B

3. Hook is:
A. Ending
B. Opening line
C. Caption
D. Image
Answer: B

4. Audience matters because:
A. Design
B. Relevance
C. Speed
D. Ads
Answer: B

5. Viral content often is:
A. Complex
B. Relatable
C. Long
D. Technical
Answer: B

6. CTA means:
A. Click ads
B. Call to action
C. Content type
D. Caption
Answer: B

7. Storytelling helps:
A. Reduce engagement
B. Increase engagement
C. Slow growth
D. Confuse audience
Answer: B

8. Consistency in posting:
A. Not needed
B. Important
C. Optional
D. Rare
Answer: B

9. Content formats include:
A. Only text
B. Text, video, image
C. Video only
D. Ads only
Answer: B

10. Best content strategy:
A. Random posting
B. Planned content
C. Rare posting
D. Trend only
Answer: B

11. Captions are:
A. Not important
B. Important
C. Optional
D. Rare
Answer: B

12. Hooks are:
A. Optional
B. Critical
C. Not needed
D. Rare
Answer: B

13. Trends should be:
A. Ignored
B. Used smartly
C. Followed blindly
D. Avoided
Answer: B

14. Audience pain points help in:
A. Design
B. Content ideas
C. Coding
D. Ads
Answer: B

15. Value content is:
A. Boring
B. Saveable
C. Random
D. Long
Answer: B

16. Engagement is:
A. Optional
B. Key metric
C. Not important
D. Rare
Answer: B

17. Comments show:
A. Design
B. Feedback
C. Speed
D. Ads
Answer: B

18. Relatability leads to:
A. Low reach
B. Growth
C. Confusion
D. Delay
Answer: B

19. Educational content is:
A. Low value
B. High value
C. Boring
D. Old
Answer: B

20. Entertaining content is:
A. Shareable
B. Slow
C. Boring
D. Complex
Answer: A

21. Content calendar helps in:
A. Design
B. Planning
C. Coding
D. Ads
Answer: B

22. Short-form content is:
A. Outdated
B. Trending
C. Rare
D. Complex
Answer: B

23. Long-form content provides:
A. Less value
B. Depth
C. Speed
D. Ads
Answer: B

24. Personal brand builds:
A. Confusion
B. Trust
C. Delay
D. Ads
Answer: B

25. Authenticity is:
A. Not needed
B. Important
C. Optional
D. Rare
Answer: B

26. Headlines should:
A. Be boring
B. Grab attention
C. Be long
D. Be complex
Answer: B

27. Copywriting is:
A. Coding
B. Persuasion through words
C. Designing
D. Editing
Answer: B

28. Rewriting helps to:
A. Reduce quality
B. Improve content
C. Delay
D. Stop work
Answer: B

29. Analytics help in:
A. Guessing
B. Improving strategy
C. Coding
D. Designing
Answer: B

30. Best skill for a content creator:
A. Coding
B. Understanding audience
C. Designing
D. Editing
Answer: B
`
};

const additionalRoleQuestionGroups = Object.fromEntries(
  Object.entries(QUESTION_BLOCKS).map(([category, rawBlock]) => [
    category,
    parseQuestionBlock(category, rawBlock)
  ])
);

const additionalRoleQuestions = Object.values(additionalRoleQuestionGroups).flat();

module.exports = {
  additionalRoleQuestionGroups,
  additionalRoleQuestions,
  parseQuestionBlock
};
