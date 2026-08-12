# Decision guide

## Start here

Answer one question: **does a decision about a person depend on the result?**

- **Yes.** Do not use a type instrument. Go to "Choosing a measure for decisions" below.
- **No.** Any of them will do. Go to "Running a session that does not do harm".

Everything else in this file follows from that split.

## Choosing a measure for decisions

| If you need to | Use | Do not use |
| --- | --- | --- |
| Predict job performance | A work-validated inventory such as Hogan, or a Big Five or HEXACO measure, alongside a structured interview and a work sample | MBTI, DISC, Enneagram, any four-letter test |
| Screen for integrity risk | HEXACO for Honesty-Humility, or a purpose-built integrity measure | MBTI, which has no such scale by design |
| Guide a career decision | An interests inventory such as the Strong Interest Inventory | MBTI type alone; the National Research Council review found the evidence insufficient for career counselling |
| Understand emotional stability or stress risk | A Big Five instrument, which includes neuroticism | MBTI, which excludes it |
| Compose a team by capability | Skills inventory and past work | Type mix |
| Explain a conflict between two people | The specific behaviours in the specific situation | Type incompatibility |

## Running a session that does not do harm

Five things to say out loud, early.

1. "This is a questionnaire about preferences. It does not measure ability, intelligence, or
   potential."
2. "Roughly half of people get a different letter on at least one scale if they retake it. If a letter
   feels wrong, it probably is."
3. "The number next to each letter matters more than the letter. A 55% is nearly a coin flip. A 95% is
   not."
4. "Your result is yours. Nothing goes to your manager or into a system."
5. "No type is better. And no type is an excuse."

Two things to avoid.

- Do not put types on a wall chart, a Slack profile, or a team roster. Once type is public it becomes
  a social expectation, which is the mechanism the Chinese social anxiety study picked up.
- Do not use type to allocate the work in the workshop. That is the forbidden use in miniature.

## Reading an MBTI report in 60 seconds

1. **Which instrument?** Form M, Form Q, Global Step I, Global Step II, or a free web test. If it is a
   free web test, it is not the MBTI and the rest of this checklist does not apply.
2. **Find the four indices.** Preference Clarity Index runs 0 to 30, labelled Slight to Very Clear.
   Probability Index runs 50 to 100, labelled Somewhat likely to Very likely.
3. **Flag the soft letters.** Any letter with a Slight clarity or a Somewhat likely probability should
   be treated as undetermined, not as a preference.
4. **Check whether verification happened.** If nobody sat down with the respondent, the process the
   publisher requires was skipped.
5. **For Step II, read the facets before the letters.** Out-of-preference facets are the most
   informative part of the report and they directly undercut the single-letter summary.
6. **Ask what the report is going to be used for.** If the answer touches an employment decision,
   stop.

## Questions to ask a vendor or consultant

Use these verbatim. The answers sort competent practitioners from the rest quickly.

1. Which form and which norm sample will you use, and why that one for our population?
2. Are you certified by The Myers-Briggs Company, and will you follow their code of ethics as
   written, including that participation is voluntary and results go only to the individual?
3. Will the report include the Probability Index or Preference Clarity Index for all four pairs?
4. What is your test-retest evidence for the version you are selling, and at what interval?
5. What predictive validity evidence exists for the outcome we care about?
6. What will you tell participants about how often a letter changes on retest?
7. Who will hold the results afterwards, in what system, for how long, and under what lawful basis?
8. What would you refuse to do with these results if we asked?

Answers that should worry you:

- "It predicts the best role for each person." Contradicts the publisher's own code of ethics.
- "It is 90% accurate." Accuracy against what? There is no external criterion for type.
- "It is scientifically validated." Ask which kind of validity. Internal consistency is good;
  structural and predictive validity are not.
- "We will put the team's types in a dashboard." Privacy and labelling risk, and forbidden use is one
  short step away.
- "We can use it to screen candidates lightly." There is no light version of the forbidden use.

## If your organisation already uses it for the wrong things

A workable sequence, least disruptive first.

1. Stop the decision use immediately. That is the legal exposure and it needs no consultation.
2. Delete or return stored results, or hand them back to individuals. Purpose limitation makes stored
   development data risky the moment anyone considers reusing it.
3. Keep the vocabulary if people like it. Nothing is gained by taking away a language a team finds
   useful, as long as it is decorative.
4. Replace the decision function with validated measures. Say plainly why, and say what the old
   approach could not support. Framing it as a legal and evidence upgrade lands better than framing it
   as "the thing you liked was fake".
5. Add the six-question challenge from [07-use-misuse-and-law.md](07-use-misuse-and-law.md) to your
   decision meetings: which form, what date, what Probability Index.

## For researchers and builders

- Report continuous scores, never only the four letters. Dichotomising costs 26% to 32% of the
  information per scale and cuts shared variance with any outcome by around 60%.
- Say which instrument you used. MBTI Form M, Global Step I, and 16Personalities are three different
  questionnaires and are routinely conflated in datasets.
- Web-scraped type labels are self-reported and skewed toward extreme types. A 2026 review found this
  bias propagates into models trained on them.
- If you are labelling model or agent personas, use continuous traits. Types imply stability the
  systems do not have; the same model in the same study came out ENTJ writing posts and INTP writing
  replies.
- The two study designs the field is missing, per the 2025 synthesis of 193 papers, are **independent
  test-retest** and **structural validity**. Either would be a genuine contribution.
