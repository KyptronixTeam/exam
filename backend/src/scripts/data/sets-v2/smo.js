module.exports = {
  "category": "SMO",
  "sets": {
    "1": [
      {
        "question": "In the Meta ads auction, an advertiser with a higher bid loses an impression to a competitor bidding lower. Which mechanism most directly explains this outcome?",
        "options": [
          "The competitor spends more total daily budget, which Meta rewards with auction priority",
          "Meta randomly rotates auction winners to keep delivery fair across advertisers",
          "Total value combines bid, estimated action rate, and ad quality, so a lower bid with stronger predicted engagement can produce higher total value",
          "The competitor account is older, and account age is a primary auction ranking factor"
        ],
        "correctAnswer": 2,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A Meta campaign uses 7-day click / 1-day view attribution. A user clicks the ad on Monday and converts 9 days later. How does Ads Manager treat this conversion?",
        "options": [
          "It is not attributed to the ad because the conversion falls outside the 7-day click window",
          "It is attributed at partial weight because it occurred close to the window boundary",
          "It appears under view-through conversions instead of click-through",
          "It is counted in full because the view window extends the click window by 7 extra days"
        ],
        "correctAnswer": 0,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "After the iOS 14.5 ATT rollout, a brand's Meta-reported ROAS dropped 30% while backend revenue stayed flat. What is the most likely primary cause?",
        "options": [
          "Apple blocked Meta ads from serving to iOS users entirely",
          "Loss of pixel visibility for opted-out iOS users reduced attributed conversions, so reporting understates performance rather than sales actually declining",
          "Meta shifted all iOS conversions to a delayed 28-day view window, hiding them from reports",
          "iOS users stopped converting because the tracking prompt scared them off the website"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "In Ads Manager, campaign-level reach is lower than the sum of the reach of its ad sets. Why?",
        "options": [
          "A known reporting bug that Meta compensates for with credit adjustments",
          "Campaign-level reach excludes Audience Network impressions by default",
          "Frequency capping removes duplicate users only at the ad set level",
          "Reach is deduplicated at each level: a user hit by multiple ad sets counts once at campaign level but once per ad set below it"
        ],
        "correctAnswer": 3,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "An agency reports 12% engagement rate on a post using ER-by-reach, while the client tool shows 2% using ER-by-followers. Both are computed correctly. What most plausibly explains the gap?",
        "options": [
          "The agency counted each impression twice in the numerator",
          "ER-by-reach divides by unique viewers, which is far smaller than total followers when a post reaches only a fraction of the audience, inflating the rate relative to follower-based ER",
          "Follower-based ER always includes paid reach in the denominator, deflating it",
          "ER-by-reach counts video views as engagements by definition, doubling the numerator"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which signal set most differentiates Instagram Explore ranking from Feed ranking?",
        "options": [
          "Explore relies heavily on engagement signals from unconnected accounts with similar interest profiles, while Feed weighs your relationship history with the poster",
          "Explore ranks purely chronologically within each topic cluster",
          "Explore only surfaces verified accounts while Feed shows everyone",
          "Feed ignores past interactions and uses only recency of the post"
        ],
        "correctAnswer": 0,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A TikTok video gets strong likes but 20% average watch time and few rewatches, and distribution stalls after the first test audience. Which lever most directly addresses the stall?",
        "options": [
          "Add more trending hashtags to reset the content classifier",
          "Post at midnight when competition for the FYP is lower",
          "Restructure the hook and pacing to raise completion and rewatch rates, since watch-time signals outweigh like counts in FYP ranking",
          "Buy TikTok Promote so organic distribution is forced to resume"
        ],
        "correctAnswer": 2,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A YouTube video has 9% CTR but audience retention collapses to 25% by the 30-second mark, and impressions decline after 48 hours. What is the algorithmic explanation?",
        "options": [
          "High CTR automatically triggers a clickbait penalty flag",
          "YouTube caps impressions for every video at the 48-hour mark",
          "Retention has no effect once a click occurs, so the decline must be seasonal",
          "The system pairs CTR with watch-time satisfaction signals; strong clicks with poor retention lower predicted session value, so the video gets surfaced less"
        ],
        "correctAnswer": 3,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Under LinkedIn's feed ranking model, which behavior most strongly boosts a post's distribution?",
        "options": [
          "Substantive comments and dwell time generated during the initial distribution window, especially from the author's own network",
          "Including external links, which LinkedIn prioritizes for informativeness",
          "Tagging 20 or more people to force notification-driven visits",
          "Reposting the same content every 6 hours to catch all time zones"
        ],
        "correctAnswer": 0,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "On X, which factor gives an organic post the largest ranking advantage for out-of-network distribution?",
        "options": [
          "The number of hashtags appended to the post",
          "Replies and extended back-and-forth conversation, which are weighted far above likes in engagement scoring, combined with author reputation clusters",
          "A posting frequency above 10 posts per day",
          "Adding external links, which X boosts for utility to readers"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "With Advantage campaign budget (CBO), one ad set consumes 85% of spend while another showing better CPA gets almost nothing. What is the most accurate explanation?",
        "options": [
          "CBO always favors whichever ad set was created first",
          "The starved ad set was silently disapproved by policy review",
          "CBO allocates by predicted real-time opportunity; a starved ad set with few conversions has unstable CPA estimates, and its observed CPA may not survive actual scaling",
          "CBO splits budget evenly and the uneven report reflects delayed data"
        ],
        "correctAnswer": 2,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A Meta ad set has 45 conversions in 6 days and is close to exiting the learning phase. Which edit resets learning?",
        "options": [
          "Changing the bid strategy from lowest cost to cost cap",
          "Renaming the ad set in Ads Manager",
          "Increasing the daily budget by 5%",
          "Adding an automated rule that only sends email notifications"
        ],
        "correctAnswer": 0,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand runs both the browser pixel and the Conversions API and sees nearly double the true purchase count in Events Manager. What is the correct fix?",
        "options": [
          "Turn off the browser pixel entirely, since CAPI fully supersedes it",
          "Send the same event_id and event_name from both sources so Meta deduplicates the paired events",
          "Delay the server events by 24 hours so they fall outside the deduplication window",
          "Use two different pixel IDs, one for browser and one for server traffic"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Event Match Quality on a Purchase event is 4.2 out of 10. Which action raises it most directly?",
        "options": [
          "Increasing campaign budgets so a larger volume of events is sent",
          "Switching the optimization event to landing page views",
          "Shortening the attribution setting to 1-day click",
          "Passing more hashed customer parameters (email, phone, name, fbp, fbc) with server events to improve match rates"
        ],
        "correctAnswer": 3,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "An influencer posts a paid Instagram partnership with the disclosure #sp buried as the twentieth hashtag. Under FTC rules, why is this insufficient?",
        "options": [
          "Disclosures must be clear, unambiguous, and hard to miss; #sp is ambiguous shorthand and burying it below the fold fails the conspicuousness requirement",
          "The FTC bans hashtag disclosures entirely; only spoken statements qualify",
          "The FTC requires disclosure only for payments above 1,000 dollars",
          "Disclosure is only required when the brand, not the influencer, publishes the post"
        ],
        "correctAnswer": 0,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Under India's ASCI influencer guidelines, which scenario still requires a disclosure label?",
        "options": [
          "A negative unpaid review of a product the influencer bought at retail",
          "A repost of a news article with no brand relationship involved",
          "A post about a product received free of charge with no payment, since material connection covers free products, discounts, and contest entries",
          "Organic praise for a brand the influencer has never dealt with"
        ],
        "correctAnswer": 2,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A defective-product video attacking your brand gains 50,000 shares in 6 hours. Which first move best follows crisis-management practice?",
        "options": [
          "Issue an immediate legal threat to the poster to force a takedown",
          "Acknowledge quickly and publicly with a holding statement, pause scheduled promotional content, and move detailed resolution to a documented owned channel",
          "Stay silent for 72 hours so the story dies before you respond",
          "Reply with humor to defuse the outrage before investigating the claim"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why is running two ad sets side by side in one campaign an unreliable substitute for Meta's A/B Test tool when comparing creatives?",
        "options": [
          "Meta forbids two ad sets with different creatives inside one campaign",
          "Ad sets in the same campaign are always shown to exactly the same users",
          "The A/B tool merely renames ad sets and adds no real methodology",
          "Without split randomization, delivery optimization sends each ad set to different user subsets, confounding the creative effect with audience selection bias"
        ],
        "correctAnswer": 3,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A creative test hits 95% significance on day 2 of a planned 14-day run and the analyst wants to declare a winner. What is the statistical problem?",
        "options": [
          "Repeatedly checking and stopping at the first significant result inflates the false-positive rate far beyond 5% under fixed-horizon testing",
          "Two days is acceptable as long as spend exceeded 100 dollars",
          "Reaching 95% significance guarantees the result will hold if the test continues",
          "Significance is meaningless in advertising because ad audiences are never random"
        ],
        "correctAnswer": 0,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "CPA rose 40% over 3 weeks, frequency reached 6.8, CTR fell steadily, and the first-time impression ratio dropped below 30%. What is the diagnosis?",
        "options": [
          "Meta raised auction prices for the vertical, so the team should wait it out",
          "The pixel lost events, so the audience needs to be rebuilt from scratch",
          "Creative fatigue within a saturated audience; refresh creative and broaden or rotate audiences to restore first-time exposure",
          "The learning phase silently reset, so the ad set should be duplicated"
        ],
        "correctAnswer": 2,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A listening tool shows your brand at 60% share of voice, but most of the mentions contain complaint keywords. Why is SOV alone misleading here?",
        "options": [
          "SOV tools are unable to count branded hashtags in their volume totals",
          "SOV measures volume, not valence; without sentiment and conversation-driver analysis, a crisis can read as market leadership",
          "SOV excludes all X data since the API changes, so every figure undercounts",
          "SOV is only statistically valid for brands above one million followers"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A Reels ad repeatedly has key text cropped or covered by interface elements. Which production practice fixes it?",
        "options": [
          "Export at 16:9 so Instagram letterboxes the video safely",
          "Place all text in the bottom 20% where captions normally sit",
          "Use a 1:1 frame since Reels crops every vertical video to square",
          "Design at 9:16 while keeping text inside the safe zone, clear of the top area, the right-side action rail, and the bottom UI overlays"
        ],
        "correctAnswer": 3,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "In Meta reporting, what does a ThruPlay actually count?",
        "options": [
          "A video watched to completion, or to at least 15 seconds for videos longer than 15 seconds",
          "Any video play lasting 3 or more seconds",
          "Only full completions of the entire video regardless of its length",
          "A click on the video that opens the fullscreen viewing experience"
        ],
        "correctAnswer": 0,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A cost cap set exactly at the historical average CPA causes delivery to collapse. Why?",
        "options": [
          "Cost cap acts as a hard maximum per impression, blocking most auction entries",
          "Meta requires cost caps to be set at least double the historical CPA",
          "Cost cap makes the system bid to average around the cap; with zero headroom over true costs, it cannot find enough cheap conversions and throttles spend",
          "Cost cap only functions with 28-day attribution, which no longer exists, so delivery defaults to zero"
        ],
        "correctAnswer": 2,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Meta reports 500 purchases; GA4 last-click shows 180 from paid social for the same period. Which explanation set is most complete?",
        "options": [
          "GA4 is simply broken for social traffic and should be ignored in reporting",
          "Different attribution logic: Meta claims view-through and modeled cross-device conversions inside its window, while GA4 last-click credits only tracked click sessions, compounded by link-decoration and ITP losses",
          "Meta double-counts every purchase by design, so halving its figure reconciles the two",
          "The discrepancy proves 320 of the purchases were fraudulent bot orders"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why does boosting a post typically underperform a conversion campaign built in Ads Manager for driving sales?",
        "options": [
          "Boosts default to engagement-style optimization with limited objectives, so delivery targets likely engagers rather than likely purchasers",
          "Boosted posts are excluded from the main auction and shown only to existing followers",
          "Boosted posts cannot use the pixel at all, making sales impossible to measure",
          "Ads Manager campaigns receive a permanent quality-score bonus over boosts"
        ],
        "correctAnswer": 0,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "An Instagram account's non-follower reach dropped to near zero while follower reach is stable, and Account Status shows a recommendation-guidelines violation. What happened?",
        "options": [
          "A classic shadowban that hides content from followers and non-followers alike",
          "Instagram deleted the account's hashtags from the platform index",
          "The account was hacked and mass-reported by its own followers",
          "The account became ineligible for recommendation surfaces (Explore, Reels, suggested content), cutting non-connected reach while feed delivery to followers continues"
        ],
        "correctAnswer": 3,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand wants to reuse a customer's Instagram photo in a paid ad. What is legally required?",
        "options": [
          "Nothing, because publicly posted content is automatically licensed for commercial reuse",
          "Explicit permission or a license from the creator; crediting the account in a repost does not convey commercial usage rights",
          "Only Instagram's own permission granted through the branded content tool",
          "A 30-day waiting period after which commercial reuse becomes fair use"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which seed audience typically produces the strongest 1% lookalike for a purchase campaign?",
        "options": [
          "All website visitors from the past 180 days, to maximize seed size",
          "Page fans, because Meta verifies their identities most reliably",
          "A value-based list of recent high-LTV purchasers, since seed quality and recency matter more than raw size once minimums are met",
          "An interest-based saved audience exported and re-imported as a seed"
        ],
        "correctAnswer": 2,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A Facebook post asking users to comment YES to win a prize earns huge comment volume, but reach on subsequent posts declines. Why?",
        "options": [
          "Comments no longer count in Facebook ranking at all",
          "Facebook throttles every giveaway post to zero distribution",
          "The audience muted the page automatically after the giveaway",
          "Engagement bait is demoted by Meta's ranking systems, and repeated use can suppress distribution at the page level"
        ],
        "correctAnswer": 3,
        "difficulty": "hard",
        "points": 1
      }
    ],
    "2": [
      {
        "question": "Which Instagram campaign setup most reliably preserves audience intent when a retargeting audience becomes too broad?",
        "options": [
          "Use a single broad retargeting ad set with a large budget and let Meta optimize it automatically",
          "Split the audience into narrower custom segments with distinct creative and placement strategies so delivery stays aligned to intent",
          "Remove all exclusions and rely on frequency caps to improve reach",
          "Switch to a traffic objective because it always improves retargeting efficiency"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why can a LinkedIn carousel sometimes outperform a single-image post even when CTR is similar?",
        "options": [
          "Carousels reduce dwell time because each slide forces a click to continue",
          "Carousels create more screen real estate and allow progressive storytelling, increasing engagement depth and save/share behavior",
          "LinkedIn always boosts carousel posts because they use more file storage",
          "Image posts are automatically hidden from the feed once a carousel exists"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A Facebook page sees rising comments but falling reach after a series of posts. Which issue is most likely?",
        "options": [
          "The page has exhausted all allowed hashtags and needs to switch to emoji-only posts",
          "The content is receiving less distribution because the audience is reacting negatively to repetitive patterns that resemble engagement bait",
          "The page's ad account is blocked, so organic reach collapses immediately",
          "Audience responses no longer count for ranking after the latest UI change"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the strongest reason to use a value-based lookalike from recent purchasers rather than a broad website visitors list?",
        "options": [
          "It reduces the need for creative testing because Meta only optimizes toward purchase volume",
          "Recent purchasers provide a cleaner seed for high-intent similarity and better conversion quality when the event is strong and recent",
          "Website visitors always produce larger output audiences and therefore better scale",
          "Value-based lookalikes do not require conversion events or event match quality"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A team wants to compare two short-form video creatives on TikTok. Which approach best reduces confounding?",
        "options": [
          "Launch both creatives in one campaign with a single ad set and equal budget split",
          "Create two separate ad groups with identical targeting, budget, and placement settings and randomize delivery to each creative",
          "Run one creative for 24 hours and the second for 72 hours to save time",
          "Use a single creative and change captions between runs"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A YouTube Shorts video gets strong views but poor watch time. Which change is most likely to help the algorithm?",
        "options": [
          "Increase the title length to improve keyword coverage",
          "Tighten the opening hook and reduce dead air so retention improves early in the video",
          "Reduce the frame rate to make the video easier to decode",
          "Add more external links in the description to improve session depth"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which metric is most useful for diagnosing whether a social campaign is attracting new people versus merely repeating exposure to existing followers?",
        "options": [
          "Total followers gained",
          "Unique reach plus frequency trend and new vs returning audience split",
          "Total comments count",
          "Average watch duration only"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand wants to run a creator collaboration on Instagram but has a strict budget. Which decision is most defensible?",
        "options": [
          "Pay the creator a flat fee with no performance terms, because brand safety is unaffected by incentives",
          "Use a hybrid deal with a small fixed fee and a bonus tied to verified outcomes such as qualified clicks or sales",
          "Pay only on reach because that is the same as conversions",
          "Avoid all creator content because organic posts always outperform paid partnerships"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why can a high-reach post still produce poor business outcomes for a sales-focused campaign?",
        "options": [
          "Reach automatically implies conversion intent and therefore should be optimized first",
          "High reach can come from low-intent audiences, so quality of engagement and downstream actions matter more than topline exposure",
          "All social platforms optimize only for purchases, so reach is sufficient",
          "Sales cannot be measured alongside reach in modern attribution stacks"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand sees very low link clicks from a social post but strong view rate. What is the most likely explanation?",
        "options": [
          "The post is over-optimized for clicks and the platform is suppressing it",
          "The audience is visually engaged but not compelled to leave the platform, so the CTA or landing path may not be persuasive enough",
          "The platform has started blocking all outbound links from public posts",
          "View rate and link clicks are always inversely correlated and cannot be improved together"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which placement strategy is most appropriate when a campaign has very tight conversion goals and a small audience?",
        "options": [
          "Use every placement possible so the system finds volume quickly",
          "Focus on placements that already show strong conversion efficiency and exclude low-signal placements until the signal is sufficient",
          "Disable all mobile placements because they are too noisy",
          "Split by placement only after the campaign has already spent the full budget"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why is a single vanity metric such as total impressions a weak decision driver for social content strategy?",
        "options": [
          "Impressions are always more important than conversions in paid social",
          "Impressions do not indicate who saw the content, whether the content was meaningful, or whether it drove downstream action",
          "Impressions are not reported by the major platforms anymore",
          "Impressions only matter for influencer deals, not campaign optimization"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A social team wants to reduce wasted spend on low-quality traffic. Which tactic is most effective first?",
        "options": [
          "Raise frequency caps to suppress duplicate viewing",
          "Create stronger exclusion lists and refine the audience to reduce low-intent traffic",
          "Switch objectives from conversions to awareness and back again daily",
          "Increase the number of hashtags in every post"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the main risk of using only one creative in a paid social test for several weeks?",
        "options": [
          "The test becomes more statistically significant because the audience size grows",
          "The result may reflect fatigue and novelty effects rather than true creative quality",
          "The system will automatically rotate the creative to lower variance",
          "The ad will be approved faster for every future campaign"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which sign most strongly suggests that a post is being suppressed for policy or quality reasons rather than simply underperforming?",
        "options": [
          "A sudden drop in scale with no change to audience or creative",
          "A minor change in comments from 20 to 21",
          "A slight shift in posting time by one hour",
          "A consistent CTA that was never tested before"
        ],
        "correctAnswer": 0,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "In community management, why does a fast, transparent acknowledgement matter more than a fully polished response?",
        "options": [
          "Polished responses always perform better than quick ones in any platform setting",
          "The first response shapes the narrative and reduces escalation risk while the team gathers facts",
          "Quick responses are against platform rules for public brands",
          "Transparency automatically removes the need for a documented escalation plan"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which signal most directly indicates that a social post may have hit a saturation point with its current audience?",
        "options": [
          "A small increase in total followers",
          "Steadily declining reach at stable spend and rising frequency",
          "Higher click-through rate from a new landing page",
          "Faster upload times on the creator device"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand runs a paid social campaign with a strong offer but low conversion rate. What should be checked first?",
        "options": [
          "The influencer contract length",
          "The landing page, offer clarity, and conversion path rather than the social platform alone",
          "The number of emojis in the creative",
          "The color of the brand icon"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the main benefit of using social listening beyond reactive brand monitoring?",
        "options": [
          "It guarantees every audience member will convert",
          "It surfaces emerging themes, pain points, and opportunities that can shape content and product strategy",
          "It replaces the need for paid media testing",
          "It automatically fixes creative fatigue"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why is a posting cadence that is too aggressive sometimes harmful to organic performance?",
        "options": [
          "The platform stops indexing all brand accounts after a certain volume",
          "Frequency can dilute attention, reduce per-post quality, and signal low originality to the ranking system",
          "The platform requires a minimum gap of six hours between posts for all creators",
          "Aggressive cadence improves all engagement rate formulas equally"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the most important reason to include a clear value proposition in the first seconds of a social video?",
        "options": [
          "It helps the video qualify for more hashtags",
          "It improves initial comprehension and retention, which strongly affects downstream ranking and watch time",
          "It improves brand recall only after the third view",
          "It assures no one will skip the ad"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which creative change usually has the best chance of increasing comment quality in a brand community?",
        "options": [
          "Adding more promotional offers in every post",
          "Asking a specific, relevant question that invites thoughtful responses from the target audience",
          "Reducing the number of posts to one per week",
          "Removing any CTA from the caption entirely"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why should a brand avoid relying solely on follower count when judging the health of its social account?",
        "options": [
          "Follower count is not visible to the platform's ranking systems",
          "Follower count describes audience size but not quality, engagement, or conversion propensity",
          "Follower count is reset every month by the platforms",
          "Follower count is always inversely related to reach"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the best reason to use platform-native analytics rather than only a third-party dashboard?",
        "options": [
          "Third-party dashboards always overcount engagement",
          "Native analytics offer more consistent and less delayed measurement of platform-specific distribution and account health",
          "Native analytics remove the need for any custom reporting",
          "Third-party dashboards can never track paid campaigns"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand wants to increase share of voice in a crowded category. Which tactic is likely to be most durable?",
        "options": [
          "Copy the top competitor's creative angle every week",
          "Build a distinctive, repeatable content system around a clear audience insight and consistent brand voice",
          "Post only during peak hours regardless of audience behavior",
          "Use every trend even if it does not align with the audience"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which issue most often causes a social reporting discrepancy between platform analytics and a CRM?",
        "options": [
          "The CRM always reports in local time while platforms use UTC",
          "Attribution windows, deduplication, and device stitching often differ across systems",
          "Social platforms do not report conversions at all for paid campaigns",
          "CRM data is normally delayed by 30 days for all social conversions"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand notices a sharp increase in low-quality leads from a social campaign. What should be investigated first?",
        "options": [
          "The color scheme of the ad",
          "Audience targeting, offer framing, and landing page intent alignment",
          "The time the post was scheduled on the calendar",
          "The size of the image used in the creative"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Extra hard question for smo.js (Auto-filled) 0.2394502800046916",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswer": 2,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Extra hard question for smo.js (Auto-filled) 0.454166861432461",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Extra hard question for smo.js (Auto-filled) 0.30127719367352723",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      }
    ],
    "3": [
      {
        "question": "Why do platform-specific creative formats matter so much for social performance?",
        "options": [
          "The algorithm ignores all format differences once the content is approved",
          "Format choices affect how the platform surfaces content, how users consume it, and how much of the message is retained",
          "All platforms treat every creative format equally for ranking",
          "A format only matters if the creative uses a brand logo"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the strongest reason to include a clear attribution path in social ad creative?",
        "options": [
          "Attribution paths are only needed for influencer campaigns",
          "A clear path improves click intent and makes downstream measurement more meaningful",
          "Attribution paths increase organic reach automatically",
          "The platform penalizes ads without a path after 24 hours"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which statement best captures the difference between engagement rate and conversion rate in paid social?",
        "options": [
          "Engagement rate is always more valuable than conversion rate for every campaign",
          "Engagement rate measures interaction intensity while conversion rate measures action completion, so they answer different questions",
          "Conversion rate is only meaningful for organic posts and is irrelevant for ads",
          "All engagement is a leading indicator of conversion, so the two rates are interchangeable"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "When should a team consider refreshing creative rather than just increasing spend?",
        "options": [
          "Only when the campaign reaches the budget cap",
          "When frequency rises, CTR drops, and the audience begins to show fatigue signals",
          "Immediately after the first conversion because the ad is proven",
          "Whenever the platform reports a new feature update"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the most important reason to document social crisis handling before an incident occurs?",
        "options": [
          "It removes the need for legal review",
          "It accelerates response and reduces inconsistent messaging under pressure",
          "It eliminates the need for moderation tools",
          "It makes the account immune to negative sentiment"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand uses a short-form video with strong retention but poor CTR. Which change should be prioritized?",
        "options": [
          "Reduce the video length until it becomes a static image",
          "Improve the first-frame hook and thumbnail to better signal value to the audience",
          "Add more hashtags than the competitor",
          "Lower the video quality to increase compatibility"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which audience type is usually best for testing a new creative concept before scaling?",
        "options": [
          "The entire prospect universe with no exclusions",
          "A smaller, well-defined segment that reflects the likely buyer behavior of the target audience",
          "Everyone who followed the brand in the last five years",
          "Only users who have already converted more than once"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why might a high-performing organic post fail to convert when promoted as a paid ad?",
        "options": [
          "Organic posts are always disqualified from paid amplification",
          "The creative may not be adapted to a paid context, and the audience may be different from the organic audience",
          "Paid amplification always reduces the quality score by design",
          "Conversion goals cannot be measured for promoted posts"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the best way to evaluate whether a short-form social campaign improved a brand's actual business outcome?",
        "options": [
          "Measure only video views and likes",
          "Tie the campaign to downstream metrics such as qualified leads, purchases, or revenue attribution",
          "Use the number of comments as a direct proxy for revenue",
          "Compare it to the highest-performing post from last year without controlling for context"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand is deciding between a creator post and a brand-produced post. Which factor should dominate the choice?",
        "options": [
          "The platform's default template library",
          "The fit between the creator's audience and the brand's intended conversion goal",
          "The number of hashtags allowed in the caption",
          "The total file size of the video asset"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why can a UGC-style ad sometimes outperform a polished brand ad in social?",
        "options": [
          "Polished ads are always suppressed by the platforms for overproduction",
          "UGC can feel more authentic and relatable, improving trust and attention in the early seconds",
          "The platform gives a permanent reach bonus to all UGC content",
          "UGC ads never require creative testing"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the most likely reason for a campaign to show strong CTR yet weak downstream conversion?",
        "options": [
          "The target audience is too narrow and the platform is forced to stop delivery",
          "The ad is attracting curiosity but the landing experience does not match the promise or intent",
          "CTR is not measured for paid social campaigns",
          "High CTR always indicates very low-quality traffic"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which reporting habit is most useful for avoiding false confidence after a one-day spike in social performance?",
        "options": [
          "Treat every spike as a permanent trend because social is volatile",
          "Compare the result to a baseline and check whether it sustained across the full measurement window",
          "Ignore any dip after the spike because the platform normalizes quickly",
          "Only review the top-line impressions and not the deeper metrics"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the strongest reason to use a clear content pillar strategy for a social channel?",
        "options": [
          "It guarantees all posts will go viral at least once",
          "It improves consistency, audience expectations, and creative reuse while reducing randomization",
          "It removes the need for any audience research",
          "It makes every post appear identical to the audience"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand is debating whether to reply to every comment publicly or privately. Which principle is most accurate?",
        "options": [
          "Private replies are always better because public comments trigger spam filters",
          "Public replies can answer the audience and show transparency, while private replies are better for sensitive or account-specific issues",
          "Every comment should be answered privately to preserve brand safety",
          "Public replies are never allowed for customer support questions"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why is audience overlap an important issue in social media testing?",
        "options": [
          "Overlap creates more accurate measurement because all audiences should see every creative",
          "Overlap can make test results less clean because people may be exposed to multiple messages and confound the outcome",
          "Overlap has no effect if the audience is large enough",
          "Overlap only matters in paid social and not in organic testing"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which change typically gives the most leverage when a social campaign is stuck at low conversion efficiency?",
        "options": [
          "Switching the post time to midnight every day",
          "Improving the offer, landing page, and match between ad promise and destination experience",
          "Adding more hashtags to every caption",
          "Reducing spend until the platform enters a new learning phase"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why should a brand keep a close eye on sentiment around product launches?",
        "options": [
          "Sentiment is only useful after a product has already failed",
          "Early sentiment trends can reveal product misunderstanding or quality issues before they become formal complaints",
          "Sentiment data replaces the need for customer service logs",
          "Negative sentiment can be ignored if the launch receives enough impressions"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the best interpretation of a campaign with high views and low completion rate?",
        "options": [
          "It is automatically expanding because views are the only metric that matters",
          "It may attract attention but fail to sustain it, suggesting the content is not satisfying the viewer's expectation",
          "Completion rate is irrelevant for social campaigns with short videos",
          "High views always mean a strong business outcome even without completion"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which tactic is most likely to improve the sustainability of an influencer partnership over time?",
        "options": [
          "Changing creators every week to avoid fatigue",
          "Building a repeatable collaboration brief with clear goals, creative guardrails, and performance review",
          "Giving creators no guidance so the content stays authentic",
          "Avoiding any shared analytics to preserve flexibility"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why is creative testing often more valuable than audience testing when a campaign is already using a strong targeting base?",
        "options": [
          "Audience targeting cannot be changed after launch",
          "Creative changes can unlock a different response from the same audience, often yielding bigger gains than targeting tweaks",
          "Creative testing always requires less budget than audience testing",
          "The platform will not learn from creative changes once the audience is fixed"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the clearest sign that a social video needs a stronger opening?",
        "options": [
          "The video is getting comments from existing followers only",
          "The first few seconds have low retention and the audience drops before the main point is delivered",
          "The video reaches a large audience but never gets any likes",
          "The video is posted during a low-traffic time window"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which step is most important before scaling a paid social campaign that has shown early promise?",
        "options": [
          "Immediately double the spend and change the objective",
          "Validate the signal quality, exclusions, and conversion path so the early win is not a temporary artifact",
          "Turn off all retargeting because it reduces reach",
          "Switch to a new ad account so the test resets"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the most defensible reason to include a creator disclosure in a paid social post?",
        "options": [
          "It prevents the platform from serving the content to non-followers",
          "It preserves transparency and reduces legal or platform policy risk around commercial intent",
          "It guarantees a higher engagement rate than non-disclosed posts",
          "It is required only if the creator is paid in cash"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which approach best supports a sustainable community strategy rather than a one-off engagement spike?",
        "options": [
          "Reply only to the biggest accounts to maintain efficiency",
          "Build a repeatable moderation and content cadence that aligns with audience expectations and brand values",
          "Stop replying to comments unless the post reaches a threshold of impressions",
          "Shift all community management to automated bots"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "A brand wants to know whether its social content is helping the business or simply driving activity. Which metric combination is most meaningful?",
        "options": [
          "Impressions and shares only",
          "Engagement plus downstream conversion and revenue or qualified lead quality",
          "Likes and comments only",
          "Follower growth alone"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What does a consistent gap between high views and low saves suggest about content quality?",
        "options": [
          "The content is likely meeting the audience's needs perfectly",
          "The content is attracting attention but not creating enough perceived value to preserve or revisit it",
          "Saves are not a valid signal for social content",
          "High views always mean the content will convert eventually"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Which action best improves the reliability of a social test with a limited audience?",
        "options": [
          "Use a single ad and change the copy every day",
          "Keep the targeting, objective, and budget constant while isolating one creative variable at a time",
          "Let the platform choose the winner based on the first 10 clicks",
          "Change the landing page and creative in the same test to save time"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "Why should social teams monitor both comments and share-of-voice trends after a launch?",
        "options": [
          "Because share of voice is enough to infer purchase intent without context",
          "Because comments show sentiment and share of voice shows relative visibility, together they reveal whether awareness is positive or risky",
          "Because comments are only useful for paid campaigns and not for launches",
          "Because share of voice is always static and can be ignored"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      },
      {
        "question": "What is the main advantage of a structured content calendar for a social team?",
        "options": [
          "It guarantees every piece of content will reach the same audience",
          "It improves pacing, consistency, and coordination while reducing reactive randomness",
          "It removes the need for any audience research or performance review",
          "It makes paid and organic strategy identical in every case"
        ],
        "correctAnswer": 1,
        "difficulty": "hard",
        "points": 1
      }
    ]
  }
};
