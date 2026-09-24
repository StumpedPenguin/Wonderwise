import type { Difficulty } from "./types";

// Reading passages for the "Story Time" game, in three difficulty tiers. The
// child READS the story (no audio), then answers questions about it. One story
// is one lesson. Answers must appear in their choices.
//
//   Easy   — 2 sentences,   2 questions
//   Medium — 4-5 sentences, 3-4 questions
//   Hard   — 8-10 sentences, 3-4 questions

export interface ReadingPromptQuestion {
  q: string;
  choices: string[];
  answer: string;
}

export interface ReadingPrompt {
  title: string;
  passage: string;
  questions: ReadingPromptQuestion[];
}

const EASY: ReadingPrompt[] = [
  {
    title: "The Red Ball",
    passage: "Sam has a big red ball. He kicks it to his dog, Rex.",
    questions: [
      { q: "What color is the ball?", choices: ["Red", "Blue", "Green"], answer: "Red" },
      { q: "What is the dog's name?", choices: ["Rex", "Max", "Spot"], answer: "Rex" },
    ],
  },
  {
    title: "Lily's Flowers",
    passage: "Lily gives her seeds water every day. Soon, tall yellow flowers grow.",
    questions: [
      { q: "What does Lily give the seeds?", choices: ["Water", "Milk", "Juice"], answer: "Water" },
      { q: "What color are the flowers?", choices: ["Yellow", "Red", "Pink"], answer: "Yellow" },
    ],
  },
  {
    title: "A Rainy Day",
    passage: "It is raining outside. Max jumps in a big puddle.",
    questions: [
      { q: "What is the weather like?", choices: ["Rainy", "Sunny", "Snowy"], answer: "Rainy" },
      { q: "What does Max jump in?", choices: ["A puddle", "A bed", "A box"], answer: "A puddle" },
    ],
  },
  {
    title: "The Hungry Cat",
    passage: "Mimi the cat is hungry. Dad fills her bowl with food.",
    questions: [
      { q: "How does Mimi feel?", choices: ["Hungry", "Sleepy", "Sad"], answer: "Hungry" },
      { q: "Who fills the bowl?", choices: ["Dad", "Mom", "Sam"], answer: "Dad" },
    ],
  },
  {
    title: "The Nest",
    passage: "A little bird sits in her nest. Her mom brings her a worm.",
    questions: [
      { q: "Where does the bird sit?", choices: ["In a nest", "In a box", "On a car"], answer: "In a nest" },
      { q: "What does mom bring?", choices: ["A worm", "A seed", "A stick"], answer: "A worm" },
    ],
  },
  {
    title: "The Blue Bike",
    passage: "Ben rides his new blue bike. His helmet keeps him safe.",
    questions: [
      { q: "What color is the bike?", choices: ["Blue", "Red", "Black"], answer: "Blue" },
      { q: "What keeps Ben safe?", choices: ["His helmet", "His shoes", "His gloves"], answer: "His helmet" },
    ],
  },
  {
    title: "The Snowman",
    passage: "Zoe makes a snowman from snow. She gives him a carrot nose.",
    questions: [
      { q: "What is the snowman made of?", choices: ["Snow", "Sand", "Mud"], answer: "Snow" },
      { q: "What is the snowman's nose?", choices: ["A carrot", "A rock", "A stick"], answer: "A carrot" },
    ],
  },
  {
    title: "The Busy Bee",
    passage: "A bee drinks nectar from a flower. Then she flies home to make honey.",
    questions: [
      { q: "What does the bee drink?", choices: ["Nectar", "Water", "Juice"], answer: "Nectar" },
      { q: "What does the bee make?", choices: ["Honey", "Milk", "Bread"], answer: "Honey" },
    ],
  },
  {
    title: "Bedtime",
    passage: "Emma puts on her warm pajamas. Mom reads her a bedtime story.",
    questions: [
      { q: "What does Emma put on?", choices: ["Pajamas", "Boots", "A hat"], answer: "Pajamas" },
      { q: "Who reads the story?", choices: ["Mom", "Dad", "Emma"], answer: "Mom" },
    ],
  },
  {
    title: "The Yellow Bus",
    passage: "The yellow bus stops for Chloe. She waves goodbye to her mom.",
    questions: [
      { q: "What color is the bus?", choices: ["Yellow", "Red", "Green"], answer: "Yellow" },
      { q: "Who does Chloe wave to?", choices: ["Her mom", "Her dog", "Her friend"], answer: "Her mom" },
    ],
  },
  {
    title: "Ice Cream",
    passage: "Owen gets a chocolate ice cream cone. He licks it fast before it melts.",
    questions: [
      { q: "What flavor does Owen get?", choices: ["Chocolate", "Vanilla", "Berry"], answer: "Chocolate" },
      { q: "Why does he lick it fast?", choices: ["It melts", "It is cold", "It is big"], answer: "It melts" },
    ],
  },
  {
    title: "The Turtle",
    passage: "A slow turtle walks in the grass. When he is scared, he hides in his shell.",
    questions: [
      { q: "How does the turtle move?", choices: ["Slowly", "Fast", "By flying"], answer: "Slowly" },
      { q: "Where does he hide?", choices: ["In his shell", "In a tree", "In a hole"], answer: "In his shell" },
    ],
  },
  {
    title: "The Kite",
    passage: "Mia flies her kite on a windy day. It goes high above the trees.",
    questions: [
      { q: "What is the weather like?", choices: ["Windy", "Rainy", "Hot"], answer: "Windy" },
      { q: "Where does the kite go?", choices: ["High in the sky", "In the pond", "Under a tree"], answer: "High in the sky" },
    ],
  },
  {
    title: "The Puppy",
    passage: "A soft white puppy licks Ava's hand. She names him Snowy.",
    questions: [
      { q: "What color is the puppy?", choices: ["White", "Brown", "Black"], answer: "White" },
      { q: "What is the puppy's name?", choices: ["Snowy", "Rex", "Spot"], answer: "Snowy" },
    ],
  },
  {
    title: "The Moon",
    passage: "The moon glows brightly at night. An owl hoots from a tall tree.",
    questions: [
      { q: "When does the moon glow?", choices: ["At night", "At noon", "In the morning"], answer: "At night" },
      { q: "What hoots from the tree?", choices: ["An owl", "A cat", "A frog"], answer: "An owl" },
    ],
  },
  {
    title: "Apple Pie",
    passage: "Grace picks red apples with Grandma. They will make a warm apple pie.",
    questions: [
      { q: "Who is with Grace?", choices: ["Grandma", "Grandpa", "Ben"], answer: "Grandma" },
      { q: "What will they make?", choices: ["Apple pie", "Bread", "Soup"], answer: "Apple pie" },
    ],
  },
];

const MEDIUM: ReadingPrompt[] = [
  {
    title: "Beach Day",
    passage:
      "Ava went to the beach with her family. She built a big sandcastle with a bucket and a shovel. A wave rolled in and washed it away. Ava just laughed and started building it again.",
    questions: [
      { q: "Who did Ava go to the beach with?", choices: ["Her family", "Her class", "Her dog"], answer: "Her family" },
      { q: "What did Ava build?", choices: ["A sandcastle", "A boat", "A house"], answer: "A sandcastle" },
      { q: "What washed the castle away?", choices: ["A wave", "The wind", "A dog"], answer: "A wave" },
    ],
  },
  {
    title: "The Lost Mitten",
    passage:
      "Noah lost one red mitten in the snow. He looked all around the playground. He searched by the swings and near the slide. At last, he found it hiding under the slide.",
    questions: [
      { q: "What did Noah lose?", choices: ["A mitten", "A boot", "A hat"], answer: "A mitten" },
      { q: "What color was it?", choices: ["Red", "Blue", "Green"], answer: "Red" },
      { q: "Where did he find it?", choices: ["Under the slide", "In his bag", "On a swing"], answer: "Under the slide" },
    ],
  },
  {
    title: "Baking Cookies",
    passage:
      "Dad and Leo baked cookies on Sunday. They mixed flour, sugar, and eggs in a big bowl. The whole kitchen smelled sweet and warm. When the cookies were done, they shared them with Mom.",
    questions: [
      { q: "What day did they bake?", choices: ["Sunday", "Monday", "Friday"], answer: "Sunday" },
      { q: "What did they mix the batter in?", choices: ["A big bowl", "A cup", "A pan"], answer: "A big bowl" },
      { q: "Who did they share the cookies with?", choices: ["Mom", "Grandpa", "A friend"], answer: "Mom" },
    ],
  },
  {
    title: "The Duck Family",
    passage:
      "A mother duck swam across the pond. Her five babies followed her in a straight line. They dipped their heads down to look for food. Then they climbed onto a rock to rest in the sun.",
    questions: [
      { q: "How many baby ducks were there?", choices: ["Five", "Three", "Two"], answer: "Five" },
      { q: "Where did the ducks swim?", choices: ["In the pond", "In the sea", "In a pool"], answer: "In the pond" },
      { q: "Where did they rest?", choices: ["On a rock", "In a nest", "In a tree"], answer: "On a rock" },
    ],
  },
  {
    title: "Show and Tell",
    passage:
      "Emma brought her seashell to school. She had found it at the beach last summer. She told the class how she could hear the ocean inside it. Everyone clapped when she was done.",
    questions: [
      { q: "What did Emma bring to school?", choices: ["A seashell", "A rock", "A toy"], answer: "A seashell" },
      { q: "Where did she find it?", choices: ["At the beach", "In the park", "At home"], answer: "At the beach" },
      { q: "What did the class do at the end?", choices: ["Clapped", "Went home", "Sang a song"], answer: "Clapped" },
    ],
  },
  {
    title: "The Fire Truck",
    passage:
      "A big red fire truck raced down the road. Its siren was very loud. The firefighters were going to help put out a fire. Everyone moved out of the way so the truck could pass.",
    questions: [
      { q: "What color was the fire truck?", choices: ["Red", "Yellow", "Blue"], answer: "Red" },
      { q: "What was very loud?", choices: ["The siren", "The radio", "The horn"], answer: "The siren" },
      { q: "Who was riding in the truck?", choices: ["Firefighters", "Teachers", "Doctors"], answer: "Firefighters" },
    ],
  },
  {
    title: "Grandpa's Boat",
    passage:
      "Grandpa took Sam out on his little boat. They floated on the calm blue lake. Sam saw a fish jump out of the water. They caught two fish before the sun went down.",
    questions: [
      { q: "Where did they go?", choices: ["On the lake", "In the sea", "In a pool"], answer: "On the lake" },
      { q: "What jumped out of the water?", choices: ["A fish", "A frog", "A duck"], answer: "A fish" },
      { q: "How many fish did they catch?", choices: ["Two", "Five", "Ten"], answer: "Two" },
    ],
  },
  {
    title: "The Rainbow",
    passage:
      "After the rain stopped, the warm sun came out. A bright rainbow stretched across the sky. Sam counted the colors one by one. His favorite was the green stripe.",
    questions: [
      { q: "What came out after the rain?", choices: ["The sun", "The moon", "A star"], answer: "The sun" },
      { q: "What stretched across the sky?", choices: ["A rainbow", "A cloud", "A kite"], answer: "A rainbow" },
      { q: "What was Sam's favorite color?", choices: ["Green", "Red", "Blue"], answer: "Green" },
    ],
  },
  {
    title: "The Snowy Hill",
    passage:
      "Max and Zoe went sledding on the big hill. They zoomed down fast on a red sled. At the bottom, they tumbled into the soft snow. Then they laughed and climbed back up to go again.",
    questions: [
      { q: "What did they ride down the hill?", choices: ["A sled", "A bike", "A boat"], answer: "A sled" },
      { q: "What color was the sled?", choices: ["Red", "Blue", "Green"], answer: "Red" },
      { q: "What did they land in at the bottom?", choices: ["Soft snow", "A pond", "Some leaves"], answer: "Soft snow" },
    ],
  },
  {
    title: "The Library",
    passage:
      "Emma walked to the library with her dad. She picked out a book about dinosaurs. She sat in a cozy chair and read quietly. Then she took the book home to finish it.",
    questions: [
      { q: "Who did Emma go with?", choices: ["Her dad", "Her mom", "Her friend"], answer: "Her dad" },
      { q: "What was her book about?", choices: ["Dinosaurs", "Cars", "Fish"], answer: "Dinosaurs" },
      { q: "How did she read in the library?", choices: ["Quietly", "Loudly", "Very fast"], answer: "Quietly" },
    ],
  },
  {
    title: "The Lemonade Stand",
    passage:
      "Grace and Leo built a lemonade stand. They sold cold cups for one dime each. Many neighbors stopped by to buy a drink. By the end of the day, the pitcher was empty.",
    questions: [
      { q: "What did they sell?", choices: ["Lemonade", "Cookies", "Toys"], answer: "Lemonade" },
      { q: "How much was one cup?", choices: ["A dime", "A dollar", "It was free"], answer: "A dime" },
      { q: "Who stopped to buy drinks?", choices: ["Neighbors", "Teachers", "Firefighters"], answer: "Neighbors" },
    ],
  },
  {
    title: "The Butterfly",
    passage:
      "A tiny egg sat on a green leaf. Out came a hungry caterpillar that ate many leaves. It grew bigger and made a little chrysalis. After a while, a beautiful butterfly came out.",
    questions: [
      { q: "What was on the leaf first?", choices: ["An egg", "A bug", "A seed"], answer: "An egg" },
      { q: "What did the caterpillar eat?", choices: ["Leaves", "Bugs", "Seeds"], answer: "Leaves" },
      { q: "What did it become at the end?", choices: ["A butterfly", "A bird", "A bee"], answer: "A butterfly" },
    ],
  },
];

const HARD: ReadingPrompt[] = [
  {
    title: "The Lost Puppy",
    passage:
      "One sunny morning, a little brown puppy named Scout ran out of the yard. He wanted to chase a yellow butterfly. Scout ran down the street and into the park. Soon he did not know the way back home. He sat down by a big tree and gave a sad little bark. A girl named Mia heard him and came over. She saw the tag on his collar with his address on it. Mia walked Scout all the way back to his house. His family was so happy to see him again.",
    questions: [
      { q: "What was the puppy's name?", choices: ["Scout", "Rex", "Max"], answer: "Scout" },
      { q: "Why did Scout run out of the yard?", choices: ["To chase a butterfly", "To find food", "To play ball"], answer: "To chase a butterfly" },
      { q: "Who found Scout?", choices: ["Mia", "His dad", "A firefighter"], answer: "Mia" },
      { q: "How did Mia know where he lived?", choices: ["His collar tag", "He led the way", "She guessed"], answer: "His collar tag" },
    ],
  },
  {
    title: "The Garden Surprise",
    passage:
      "Grandma gave Leo a packet of seeds in the spring. She showed him how to dig small holes in the dirt. Leo planted each seed and covered it with soil. Every day he gave the seeds water from his little can. He waited and waited, but nothing happened. Then one morning, tiny green sprouts poked out of the ground. Leo was so excited that he jumped up and down. All summer the plants grew taller and taller. By fall, big orange pumpkins sat in the garden.",
    questions: [
      { q: "Who gave Leo the seeds?", choices: ["Grandma", "Grandpa", "His teacher"], answer: "Grandma" },
      { q: "What did Leo give the seeds every day?", choices: ["Water", "Milk", "Sunshine only"], answer: "Water" },
      { q: "What poked out of the ground first?", choices: ["Green sprouts", "Pumpkins", "Flowers"], answer: "Green sprouts" },
      { q: "What grew by fall?", choices: ["Pumpkins", "Apples", "Corn"], answer: "Pumpkins" },
    ],
  },
  {
    title: "A Day at the Zoo",
    passage:
      "Ava and her brother went to the zoo on Saturday. First, they saw the tall giraffes eating leaves from a tree. Next, they watched the monkeys swing from ropes. Ava laughed when a monkey made a funny face. Then they visited the lions, who were sleeping in the shade. Her brother liked the penguins the best. They ate lunch on a bench near the pond. Before they left, they bought a toy elephant at the gift shop.",
    questions: [
      { q: "What day did they go to the zoo?", choices: ["Saturday", "Sunday", "Monday"], answer: "Saturday" },
      { q: "What were the giraffes eating?", choices: ["Leaves", "Grass", "Fruit"], answer: "Leaves" },
      { q: "What were the lions doing?", choices: ["Sleeping", "Running", "Roaring"], answer: "Sleeping" },
      { q: "What did they buy before leaving?", choices: ["A toy elephant", "A balloon", "A hat"], answer: "A toy elephant" },
    ],
  },
  {
    title: "The Big Storm",
    passage:
      "Dark clouds rolled in over the town one afternoon. The wind began to blow the trees back and forth. Soon big drops of rain fell from the sky. Emma and her mom watched the storm from the window. Lightning flashed and thunder boomed very loudly. Emma felt a little scared, so her mom held her close. They read books together until the storm passed. When it was over, the sun came out again. A bright rainbow appeared over the houses.",
    questions: [
      { q: "What rolled in over the town?", choices: ["Dark clouds", "White snow", "Thick fog"], answer: "Dark clouds" },
      { q: "Who watched the storm with Emma?", choices: ["Her mom", "Her dad", "Her brother"], answer: "Her mom" },
      { q: "How did Emma feel during the storm?", choices: ["Scared", "Sleepy", "Angry"], answer: "Scared" },
      { q: "What appeared after the storm?", choices: ["A rainbow", "More rain", "A star"], answer: "A rainbow" },
    ],
  },
  {
    title: "The New Friend",
    passage:
      "It was Sam's first day at a brand new school. He did not know anyone in his class yet. At lunch, he sat by himself at the end of a table. A boy named Ben came over and sat down next to him. Ben shared some of his sweet grapes with Sam. They talked about their favorite games and dinosaurs. After lunch, they played tag together on the playground. By the end of the day, Sam had made a good friend. He could not wait to come back the next morning.",
    questions: [
      { q: "Where was Sam's first day?", choices: ["A new school", "A new park", "A new house"], answer: "A new school" },
      { q: "Where did Sam sit at lunch?", choices: ["By himself", "With his mom", "On the floor"], answer: "By himself" },
      { q: "What did Ben share with Sam?", choices: ["Grapes", "Cookies", "Crackers"], answer: "Grapes" },
      { q: "How did Sam feel by the end of the day?", choices: ["Happy", "Sad", "Bored"], answer: "Happy" },
    ],
  },
  {
    title: "Building a Fort",
    passage:
      "On a rainy day, Zoe and Max could not play outside. They decided to build a fort in the living room. First, they pulled the soft cushions off the couch. Then they draped a big blanket over two chairs. They crawled inside their cozy fort with a flashlight. Zoe brought her favorite books to read. Max brought a bowl of popcorn to share. They pretended the fort was a cave in the mountains. It was the best rainy day ever.",
    questions: [
      { q: "Why couldn't they play outside?", choices: ["It was raining", "It was dark", "It was too hot"], answer: "It was raining" },
      { q: "What did Zoe and Max build?", choices: ["A fort", "A sandcastle", "A boat"], answer: "A fort" },
      { q: "What did Max bring into the fort?", choices: ["Popcorn", "Books", "A pillow"], answer: "Popcorn" },
      { q: "What did they pretend the fort was?", choices: ["A cave", "A ship", "A castle"], answer: "A cave" },
    ],
  },
  {
    title: "The Beach Trip",
    passage:
      "The Lee family drove to the beach early in the morning. The sand was warm under their bare feet. Ava and her dad built a giant sandcastle with four tall towers. Her mom collected pretty shells along the shore. They ate sandwiches and cold watermelon for lunch. In the afternoon, they splashed in the cool waves. A friendly little crab scuttled right by Ava's toes. As the sun went down, they packed up all their things. Everyone was tired but happy on the ride home.",
    questions: [
      { q: "When did they drive to the beach?", choices: ["In the morning", "At night", "At lunch"], answer: "In the morning" },
      { q: "How many towers did the sandcastle have?", choices: ["Four", "Two", "Six"], answer: "Four" },
      { q: "What did Mom collect on the shore?", choices: ["Shells", "Rocks", "Sticks"], answer: "Shells" },
      { q: "What scuttled by Ava's toes?", choices: ["A crab", "A fish", "A frog"], answer: "A crab" },
    ],
  },
  {
    title: "The Birthday Party",
    passage:
      "Today was Grace's sixth birthday party. Her friends came over wearing colorful party hats. They played games and danced to music in the yard. Grace's mom brought out a big chocolate cake. It had six candles glowing brightly on top. Everyone sang the birthday song to Grace. She closed her eyes and made a secret wish. Then she blew out all the candles in one big breath. Her friends cheered and clapped for her.",
    questions: [
      { q: "How old was Grace turning?", choices: ["Six", "Four", "Ten"], answer: "Six" },
      { q: "What kind of cake did Mom bring out?", choices: ["Chocolate", "Vanilla", "Carrot"], answer: "Chocolate" },
      { q: "How many candles were on the cake?", choices: ["Six", "Three", "Eight"], answer: "Six" },
      { q: "What did Grace do before blowing out the candles?", choices: ["Made a wish", "Ate a slice", "Took a nap"], answer: "Made a wish" },
    ],
  },
  {
    title: "The Snow Day",
    passage:
      "When Owen woke up, the whole world was white. Thick snow had fallen all through the night. School was closed, so Owen ran outside to play. He and his sister rolled three big snowballs. They stacked them up to make a tall snowman. They used two sticks for arms and a carrot for the nose. Their mom brought out warm cocoa in red mugs. They drank it while looking at their snowman. It was a perfect snow day.",
    questions: [
      { q: "What color was the world when Owen woke up?", choices: ["White", "Green", "Gray"], answer: "White" },
      { q: "Why was school closed?", choices: ["It snowed", "It was a holiday", "It was raining"], answer: "It snowed" },
      { q: "How many snowballs did they roll?", choices: ["Three", "Two", "Five"], answer: "Three" },
      { q: "What did they use for the snowman's nose?", choices: ["A carrot", "A rock", "A button"], answer: "A carrot" },
    ],
  },
  {
    title: "The Little Boat",
    passage:
      "Grandpa and Liam sailed out on a small blue boat. The lake was calm and shiny in the sun. Grandpa showed Liam how to hold the fishing rod. They waited quietly for a fish to bite. After a while, the rod gave a big tug. Liam pulled and pulled until a silver fish came up. Grandpa helped him take a picture of it. Then they gently let the fish swim back into the water. They sailed home smiling as the sun began to set.",
    questions: [
      { q: "What color was the boat?", choices: ["Blue", "Red", "Green"], answer: "Blue" },
      { q: "What did Grandpa show Liam how to hold?", choices: ["The fishing rod", "The oar", "The net"], answer: "The fishing rod" },
      { q: "What color was the fish?", choices: ["Silver", "Gold", "Gray"], answer: "Silver" },
      { q: "What did they do with the fish after the picture?", choices: ["Let it go", "Cooked it", "Kept it in a bucket"], answer: "Let it go" },
    ],
  },
];

export const READING_PROMPTS: Record<Difficulty, ReadingPrompt[]> = {
  easy: EASY,
  medium: MEDIUM,
  hard: HARD,
};
