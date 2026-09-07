# Break movement sprite generation

Built-in image generation, 2026-09-07. Reference: `art/src/developer-sprites.png`. Output: `art/src/developer-break-sprites.png`, keyed and registered into `src/assets/room/developer-break-sprites.webp`. Existing approved room and working sprites preserved.

## Exact prompt

Create a NEW break-movement sprite sheet for EXACTLY the same developer in the supplied sprite reference: medium brown skin, messy short black hair, rust orange t-shirt, same simple cartoon Rick and Morty inspired linework and proportions. Pure solid #FF00FF magenta background everywhere outside character, no checkerboard. 1536x1024 image with a precise 2x2 grid of 768x512 cells, no drawn grid or labels.
ALL FOUR CELLS must preserve identical body SCALE and seat position. Relative to each cell: center of torso x384, waist cut horizontal y480, hair top around y40, head width about200 pixels, shoulder width about320, matching source working sprite. Same front view seated character, shown waist-up without chair or room. Waist remains anchored at (384,480) even when arms or head move. Draw complete arms.
TOP LEFT frame: preparing a seated shoulder stretch, both elbows bent, hands raised to beside his ears, fingers relaxed, small contented smile, shoulders starting to open.
TOP RIGHT frame: full relaxed seated stretch and lean-back, both hands resting behind his head, elbows wide to left and right, chest open, head tilted slightly back, eyes softly closed, contented smile. Hair and head maintain same scale; elbows must fit within x70..698. Arms are entirely visible inside cell. Waist stays at y480.
BOTTOM LEFT frame: arms down and hands loosely resting near waist, head turned slightly toward viewer's left, eyes looking left as he looks around the room, relaxed expression.
BOTTOM RIGHT frame: identical arms and torso to bottom left, head turned slightly toward viewer's right and eyes looking right, small relaxed smile.
No working/typing poses. These are visibly distinct relaxing poses during a five minute break. Flat fills, bold black outlines, preserve character identity, no new props, no furniture, no mug, no text. Exact equal grid. Keep every sprite completely within its cell and all waist baselines at y480.
