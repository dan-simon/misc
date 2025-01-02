This is mostly for me to look back on/clarify thoughts and expectations. Don't take it that seriously. I don't know much.

See llm_2025_pred.py for next year predictions.

Predictions (for end of 2024):
- Top LLM performance:
  - Current GPT-4 is still near-best: 10%
  - Something noticeably better exists, but by less than the 3.5-4 gap: 30%
  - Something better exists, by roughly the 3.5-4 gap: 40%
  - Something better exists, by slightly more than the 3.5-4 gap: 15%
  - Something better exists, by dramatically more than the 3.5-4 gap: 5%
- Result: I would say we ended up in either "Something better exists, by slightly more than the 3.5-4 gap" or "Something better exists, by roughly the 3.5-4 gap"; it's hard to tell which. I was leaning towards "Something better exists, by slightly more than the 3.5-4 gap", but then to resolve "There are no types of question that most humans can answer but AIs can't", I tried to prompt AI about a small Simple Loop puzzle and, even setting aside geometric issues, I was unhappy with the quality of reasoning in the output. There's not much progress on creative leaps, and I expect most of the progress there is on it is due to more memorization and throwing things at a wall. But I guess that's what humans do a lot so :shrug:. I haven't noticed hallucinations as much but I think people say they still exist, and weird logical errors have in my limited experience been largely replaced by more human-like ignoring of relevant factors.
- Other predictions:
  - Transformative AI (20% unemployment or something with equivalent impact): 2%
  - Result: No. This pretty clearly didn't happen.
  - There are no types of question that most humans can answer but AIs can't: 10%
  - Result: No. I would consider the simple loop puzzle in sloop_prompt.txt to violate this as far as I tested with o1 and 4o. If someone finds a pre-existing model that solves this twice in a row, feel free to let me know and I can look for a harder problem. Note that as presented, this problem involves geometrical reasoning, but I feel like even without the given grid, humans could solve this. There might be issues such as "Humans don't understand what 'zero-indexed' means" but that doesn't seem to have been the obstacle.
  - New type of AI capability: 50%
  - Result: No. This hasn't happened in my opinion, unless you count math. Math is still "getting excellent at problems humans can solve in a day" rather than "proving new results" and I'm not sure which meaning of "if AI made huge progress in math" I meant while defining these. AI coding is still making incremental-feeling improvements, and while AI music is probably more common than a year ago it's nowhere near as common as AI art. Robotics seems to be making progress but again, it isn't commonplace or doing astounding things (and the best tech demos seem to be to be partially set up to seem more impressive than they are).

Other notes:
- o1 could solve https://dp.puzzlehunt.net/puzzle/sleep-talk.html. This has been my puzzle benchmark for the last few years, and o1 being able to do it surprised me, even though its thought process seemed like stumbling around. (https://dan-simon.github.io/puzzles/january_2021/interlocking.html and https://dan-simon.github.io/puzzles/january_2021/inserted.html still stump it, but they also probably stump most non-puzzling-involved humans so :shrug:.)

Simple loop details:
o1 thinks for multiple minutes and fails to get it, though once given a solution it at least agrees it's correct (see https://chatgpt.com/share/6776bfbf-ebc0-800c-9b15-d05590d97e8c). 4o writes code that almost works but goes into an infinite loop, and I think my trying to check that the generation hadn't hit a bug cause the prompt to pause (see https://chatgpt.com/share/6776c14b-1660-800c-a92a-44714c6fa7e4; unfortunately, the code only seems to show up for me, but I copied it into gpt4o_code.py) .Giving the code to 4o in a new conversation gave code that did terminate but did not output the correct solution, despite looking somewhat convincing (see https://chatgpt.com/share/6776c25a-8abc-800c-ac4e-ad2959633b00; one bug is that `len(possible_directions) == 2 and count < 2` is the wrong condition, and should probably be `len(possible_directions) + count <= 2 and count < 2`, and a second bug is that the loop closing early isn't handled well at all). o1-mini, which is said to sometimes be good at reasoning-related stuff, also says it's impossible, and when an error in its logic is corrected it outputs a loop that includes a (4,2) → (4,0) step and has only 25 cells (missing (3, 2), (3, 3), (4, 3), (5, 0), (5, 1)) (see https://chatgpt.com/share/6776c66e-89b0-800c-9302-8e4027f197af).