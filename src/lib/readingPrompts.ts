// 50 short reading passages for the "Story Time" game. The child READS the
// story (no audio), then answers 1-2 questions about it. Each entry is one
// lesson. Answers must appear in their choices.

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

export const READING_PROMPTS: ReadingPrompt[] = [
  {
    title: "The Red Ball",
    passage:
      "Sam has a big red ball. He kicks it in the park with his dog, Rex. Rex runs fast to get the ball.",
    questions: [
      { q: "What color is the ball?", choices: ["Red", "Blue", "Green"], answer: "Red" },
      { q: "Who runs to get the ball?", choices: ["Rex", "Sam", "Mom"], answer: "Rex" },
    ],
  },
  {
    title: "Lily's Garden",
    passage:
      "Lily plants seeds in her garden. She gives them water every day. Soon, yellow flowers grow tall in the sun.",
    questions: [
      { q: "What does Lily give the seeds?", choices: ["Water", "Milk", "Juice"], answer: "Water" },
      { q: "What color are the flowers?", choices: ["Yellow", "Purple", "White"], answer: "Yellow" },
    ],
  },
  {
    title: "A Rainy Day",
    passage:
      "It is raining outside. Max puts on his boots and yellow coat. He jumps in a big puddle and laughs.",
    questions: [
      { q: "What is the weather like?", choices: ["Rainy", "Sunny", "Snowy"], answer: "Rainy" },
      { q: "What does Max jump in?", choices: ["A puddle", "A bed", "A box"], answer: "A puddle" },
    ],
  },
  {
    title: "The Hungry Cat",
    passage:
      "Mimi the cat is hungry. She meows by her bowl. Dad fills it with food, and Mimi eats it all up.",
    questions: [
      { q: "How does Mimi feel?", choices: ["Hungry", "Sleepy", "Sad"], answer: "Hungry" },
      { q: "Who fills the bowl?", choices: ["Dad", "Mom", "Sam"], answer: "Dad" },
    ],
  },
  {
    title: "At the Beach",
    passage:
      "Ava builds a castle in the sand. She uses a bucket and a shovel. A wave comes and washes it away, but Ava just laughs and builds again.",
    questions: [
      { q: "What does Ava build?", choices: ["A castle", "A boat", "A house"], answer: "A castle" },
      { q: "What washes the castle away?", choices: ["A wave", "The wind", "A dog"], answer: "A wave" },
    ],
  },
  {
    title: "The Little Bird",
    passage:
      "A little bird sits in a nest. She is waiting for her mom. Mom flies back with a worm to eat.",
    questions: [
      { q: "Where does the bird sit?", choices: ["In a nest", "In a box", "On a car"], answer: "In a nest" },
      { q: "What does Mom bring?", choices: ["A worm", "A seed", "A stick"], answer: "A worm" },
    ],
  },
  {
    title: "Ben's Bike",
    passage:
      "Ben got a new blue bike. He rides it up and down the street. His helmet keeps his head safe.",
    questions: [
      { q: "What color is the bike?", choices: ["Blue", "Red", "Black"], answer: "Blue" },
      { q: "What keeps Ben safe?", choices: ["His helmet", "His shoes", "His gloves"], answer: "His helmet" },
    ],
  },
  {
    title: "The Snowman",
    passage:
      "Zoe rolls three big snowballs. She stacks them to make a snowman. She gives him a carrot nose and a warm scarf.",
    questions: [
      { q: "How many snowballs does Zoe roll?", choices: ["Three", "Two", "Five"], answer: "Three" },
      { q: "What is the snowman's nose?", choices: ["A carrot", "A rock", "A stick"], answer: "A carrot" },
    ],
  },
  {
    title: "The Busy Bee",
    passage:
      "A bee flies from flower to flower. She drinks the sweet nectar. Then she flies home to the hive to make honey.",
    questions: [
      { q: "What does the bee drink?", choices: ["Nectar", "Water", "Juice"], answer: "Nectar" },
      { q: "What does the bee make?", choices: ["Honey", "Milk", "Bread"], answer: "Honey" },
    ],
  },
  {
    title: "Bedtime",
    passage:
      "It is dark outside now. Emma brushes her teeth and puts on pajamas. Mom reads her a story, and Emma falls asleep.",
    questions: [
      { q: "What does Emma put on?", choices: ["Pajamas", "Boots", "A hat"], answer: "Pajamas" },
      { q: "Who reads the story?", choices: ["Mom", "Dad", "Emma"], answer: "Mom" },
    ],
  },
  {
    title: "The Big Dog",
    passage:
      "Rocky is a big brown dog. He loves to fetch a stick. When he is happy, he wags his tail fast.",
    questions: [
      { q: "What does Rocky like to fetch?", choices: ["A stick", "A ball", "A bone"], answer: "A stick" },
      { q: "What does Rocky do when happy?", choices: ["Wags his tail", "Barks loud", "Hides"], answer: "Wags his tail" },
    ],
  },
  {
    title: "Apple Picking",
    passage:
      "Grace goes to the farm with Grandma. They pick red apples from the trees. They will make a warm apple pie.",
    questions: [
      { q: "Who goes with Grace?", choices: ["Grandma", "Grandpa", "Ben"], answer: "Grandma" },
      { q: "What will they make?", choices: ["Apple pie", "Bread", "Soup"], answer: "Apple pie" },
    ],
  },
  {
    title: "The Frog Pond",
    passage:
      "A green frog sits on a lily pad. He hops into the cool water with a splash. He is looking for a bug to eat.",
    questions: [
      { q: "Where does the frog sit?", choices: ["On a lily pad", "On a rock", "In a tree"], answer: "On a lily pad" },
      { q: "What is the frog looking for?", choices: ["A bug", "A fish", "A friend"], answer: "A bug" },
    ],
  },
  {
    title: "Lost Mitten",
    passage:
      "Noah lost one red mitten in the snow. He looks and looks for it. He finds it under the slide at the park.",
    questions: [
      { q: "What did Noah lose?", choices: ["A mitten", "A boot", "A hat"], answer: "A mitten" },
      { q: "Where did he find it?", choices: ["Under the slide", "In his bag", "On the swing"], answer: "Under the slide" },
    ],
  },
  {
    title: "The Kite",
    passage:
      "It is a windy day. Mia flies her kite high in the sky. The kite dips and dances above the trees.",
    questions: [
      { q: "What is the weather like?", choices: ["Windy", "Rainy", "Hot"], answer: "Windy" },
      { q: "Where does the kite fly?", choices: ["High in the sky", "In the pond", "Under a tree"], answer: "High in the sky" },
    ],
  },
  {
    title: "Baking Cookies",
    passage:
      "Dad and Leo bake cookies together. They mix flour, sugar, and eggs. The kitchen smells sweet and warm.",
    questions: [
      { q: "Who bakes with Leo?", choices: ["Dad", "Mom", "Grandma"], answer: "Dad" },
      { q: "What are they baking?", choices: ["Cookies", "Pizza", "Soup"], answer: "Cookies" },
    ],
  },
  {
    title: "The Turtle",
    passage:
      "A slow turtle walks in the grass. He carries his home on his back. When he is scared, he hides in his shell.",
    questions: [
      { q: "Where does the turtle carry his home?", choices: ["On his back", "In a bag", "In a tree"], answer: "On his back" },
      { q: "What does he do when scared?", choices: ["Hides in his shell", "Runs fast", "Climbs a tree"], answer: "Hides in his shell" },
    ],
  },
  {
    title: "The Yellow Bus",
    passage:
      "The yellow bus stops at the corner. Chloe climbs up the big steps. She waves goodbye to her mom.",
    questions: [
      { q: "What color is the bus?", choices: ["Yellow", "Red", "Green"], answer: "Yellow" },
      { q: "Who does Chloe wave to?", choices: ["Her mom", "Her dog", "Her friend"], answer: "Her mom" },
    ],
  },
  {
    title: "The Farm",
    passage:
      "On the farm, the rooster says cock-a-doodle-doo. The cows eat green grass. The pigs roll in the cool mud.",
    questions: [
      { q: "Who says cock-a-doodle-doo?", choices: ["The rooster", "The cow", "The pig"], answer: "The rooster" },
      { q: "What do the pigs roll in?", choices: ["Mud", "Grass", "Water"], answer: "Mud" },
    ],
  },
  {
    title: "Ice Cream",
    passage:
      "On a hot day, Owen gets ice cream. He picks a chocolate scoop in a cone. He licks it fast before it melts.",
    questions: [
      { q: "What flavor does Owen pick?", choices: ["Chocolate", "Vanilla", "Berry"], answer: "Chocolate" },
      { q: "Why does he lick it fast?", choices: ["It melts", "It is cold", "It is big"], answer: "It melts" },
    ],
  },
  {
    title: "The Moon",
    passage:
      "At night, the moon glows in the sky. Stars twinkle all around it. An owl hoots from a tall tree.",
    questions: [
      { q: "When does the moon glow?", choices: ["At night", "At noon", "In the morning"], answer: "At night" },
      { q: "What hoots from the tree?", choices: ["An owl", "A cat", "A frog"], answer: "An owl" },
    ],
  },
  {
    title: "The Sandbox",
    passage:
      "Ruby digs in the sandbox with a spoon. She makes little hills and roads. Her toy truck drives over them.",
    questions: [
      { q: "What does Ruby dig with?", choices: ["A spoon", "A fork", "A cup"], answer: "A spoon" },
      { q: "What drives over the roads?", choices: ["A toy truck", "A toy plane", "A ball"], answer: "A toy truck" },
    ],
  },
  {
    title: "The New Shoes",
    passage:
      "Jack has new green shoes. They light up when he jumps. He runs around the yard to show his friends.",
    questions: [
      { q: "What color are Jack's shoes?", choices: ["Green", "Red", "Blue"], answer: "Green" },
      { q: "What do the shoes do?", choices: ["Light up", "Make music", "Get wet"], answer: "Light up" },
    ],
  },
  {
    title: "The Duck Family",
    passage:
      "A mother duck swims in the pond. Her five babies follow in a line. They dip their heads to find food.",
    questions: [
      { q: "How many babies follow?", choices: ["Five", "Three", "Two"], answer: "Five" },
      { q: "Where do the ducks swim?", choices: ["In the pond", "In the sea", "In a cup"], answer: "In the pond" },
    ],
  },
  {
    title: "The Library",
    passage:
      "Emma goes to the library. She picks a book about dinosaurs. She reads quietly in a soft, cozy chair.",
    questions: [
      { q: "What is Emma's book about?", choices: ["Dinosaurs", "Cars", "Fish"], answer: "Dinosaurs" },
      { q: "How does Emma read?", choices: ["Quietly", "Loudly", "Fast"], answer: "Quietly" },
    ],
  },
  {
    title: "The Butterfly",
    passage:
      "A tiny egg turns into a caterpillar. The caterpillar eats many leaves and grows. Then it becomes a pretty butterfly.",
    questions: [
      { q: "What does the caterpillar eat?", choices: ["Leaves", "Bugs", "Seeds"], answer: "Leaves" },
      { q: "What does it become?", choices: ["A butterfly", "A bird", "A bee"], answer: "A butterfly" },
    ],
  },
  {
    title: "Helping Mom",
    passage:
      "Liam helps Mom clean up. He puts his toys in the box. Then he sweeps crumbs off the floor.",
    questions: [
      { q: "Where does Liam put his toys?", choices: ["In the box", "Under the bed", "On the chair"], answer: "In the box" },
      { q: "What does he sweep?", choices: ["Crumbs", "Leaves", "Water"], answer: "Crumbs" },
    ],
  },
  {
    title: "The Fire Truck",
    passage:
      "A red fire truck races down the road. Its siren is loud. The firefighters help keep the town safe.",
    questions: [
      { q: "What color is the fire truck?", choices: ["Red", "Yellow", "Blue"], answer: "Red" },
      { q: "Who rides in the truck?", choices: ["Firefighters", "Teachers", "Doctors"], answer: "Firefighters" },
    ],
  },
  {
    title: "The Big Slide",
    passage:
      "Zoe climbs up the tall ladder. She sits at the top of the slide. Then she zooms down with a big smile.",
    questions: [
      { q: "What does Zoe climb?", choices: ["The ladder", "A tree", "A wall"], answer: "The ladder" },
      { q: "How does she feel?", choices: ["Happy", "Sad", "Angry"], answer: "Happy" },
    ],
  },
  {
    title: "The Puppy",
    passage:
      "A small puppy licks Ava's hand. His fur is soft and white. Ava names him Snowy because he looks like snow.",
    questions: [
      { q: "What color is the puppy?", choices: ["White", "Brown", "Black"], answer: "White" },
      { q: "What is the puppy's name?", choices: ["Snowy", "Rex", "Spot"], answer: "Snowy" },
    ],
  },
  {
    title: "Grandpa's Boat",
    passage:
      "Grandpa takes Sam on his little boat. They float on the calm blue lake. Sam sees a fish jump out of the water.",
    questions: [
      { q: "Where do they float?", choices: ["On the lake", "In the sea", "In a pool"], answer: "On the lake" },
      { q: "What jumps out of the water?", choices: ["A fish", "A frog", "A duck"], answer: "A fish" },
    ],
  },
  {
    title: "The Tall Tree",
    passage:
      "A squirrel runs up the tall tree. He hides an acorn in a hole. He will find it again when winter comes.",
    questions: [
      { q: "What does the squirrel hide?", choices: ["An acorn", "A leaf", "A nut cake"], answer: "An acorn" },
      { q: "When will he find it?", choices: ["In winter", "In summer", "At night"], answer: "In winter" },
    ],
  },
  {
    title: "Painting",
    passage:
      "Mia paints a picture of the sun. She uses yellow and orange paint. She hangs it on the fridge to show Dad.",
    questions: [
      { q: "What does Mia paint?", choices: ["The sun", "A cat", "A car"], answer: "The sun" },
      { q: "Where does she hang it?", choices: ["On the fridge", "On the door", "In her room"], answer: "On the fridge" },
    ],
  },
  {
    title: "The Train",
    passage:
      "The long train chugs down the track. It goes chugga-chugga, choo-choo. It carries boxes to the next town.",
    questions: [
      { q: "What sound does the train make?", choices: ["Choo-choo", "Beep-beep", "Ring-ring"], answer: "Choo-choo" },
      { q: "What does the train carry?", choices: ["Boxes", "Cows", "Kids"], answer: "Boxes" },
    ],
  },
  {
    title: "The Umbrella",
    passage:
      "Rain falls on the way to school. Ben opens his big umbrella. He stays warm and dry underneath it.",
    questions: [
      { q: "What does Ben open?", choices: ["An umbrella", "A door", "A box"], answer: "An umbrella" },
      { q: "How does Ben stay?", choices: ["Dry", "Wet", "Cold"], answer: "Dry" },
    ],
  },
  {
    title: "The Garden Snail",
    passage:
      "A snail moves very slowly on a leaf. He leaves a shiny trail behind him. He is in no hurry at all.",
    questions: [
      { q: "How does the snail move?", choices: ["Slowly", "Fast", "By flying"], answer: "Slowly" },
      { q: "What does he leave behind?", choices: ["A shiny trail", "Footprints", "Leaves"], answer: "A shiny trail" },
    ],
  },
  {
    title: "The Birthday Cake",
    passage:
      "Today is Grace's birthday. Her cake has six pink candles. She makes a wish and blows them all out.",
    questions: [
      { q: "How many candles are on the cake?", choices: ["Six", "Four", "Ten"], answer: "Six" },
      { q: "What does Grace do before blowing?", choices: ["Makes a wish", "Sings a song", "Claps"], answer: "Makes a wish" },
    ],
  },
  {
    title: "The Playground",
    passage:
      "Owen swings high on the swing. His friend Leo climbs the monkey bars. They laugh and play until it is time to go.",
    questions: [
      { q: "What does Owen play on?", choices: ["The swing", "The slide", "The seesaw"], answer: "The swing" },
      { q: "What does Leo climb?", choices: ["The monkey bars", "A tree", "A wall"], answer: "The monkey bars" },
    ],
  },
  {
    title: "The Warm Soup",
    passage:
      "It is a cold day. Mom makes warm soup for lunch. Chloe eats it with a big spoon and feels cozy.",
    questions: [
      { q: "What does Mom make?", choices: ["Soup", "Cake", "Toast"], answer: "Soup" },
      { q: "How does Chloe feel?", choices: ["Cozy", "Cold", "Hungry"], answer: "Cozy" },
    ],
  },
  {
    title: "The Spotted Cow",
    passage:
      "A cow with black spots stands in the field. She eats green grass all day. In the evening, she gives milk.",
    questions: [
      { q: "What does the cow eat?", choices: ["Grass", "Corn", "Apples"], answer: "Grass" },
      { q: "What does she give?", choices: ["Milk", "Eggs", "Wool"], answer: "Milk" },
    ],
  },
  {
    title: "The Sailboat",
    passage:
      "A white sailboat glides on the water. The wind pushes it along. Seagulls fly above and call out loud.",
    questions: [
      { q: "What pushes the sailboat?", choices: ["The wind", "A motor", "A paddle"], answer: "The wind" },
      { q: "What flies above?", choices: ["Seagulls", "Bats", "Bees"], answer: "Seagulls" },
    ],
  },
  {
    title: "The Puzzle",
    passage:
      "Liam works on a big puzzle. He finds the corner pieces first. At last, he sees a picture of a lion.",
    questions: [
      { q: "What does Liam find first?", choices: ["Corner pieces", "The box", "A pen"], answer: "Corner pieces" },
      { q: "What is the picture?", choices: ["A lion", "A dog", "A tree"], answer: "A lion" },
    ],
  },
  {
    title: "The Campfire",
    passage:
      "The family sits around the campfire. They roast marshmallows on long sticks. The stars shine bright above them.",
    questions: [
      { q: "What do they roast?", choices: ["Marshmallows", "Corn", "Bread"], answer: "Marshmallows" },
      { q: "What shines above?", choices: ["The stars", "The sun", "A lamp"], answer: "The stars" },
    ],
  },
  {
    title: "The Muddy Puppy",
    passage:
      "Rex the puppy plays in the mud. His paws get brown and dirty. Ava gives him a warm bath to get clean.",
    questions: [
      { q: "Where does Rex play?", choices: ["In the mud", "In the house", "On the bed"], answer: "In the mud" },
      { q: "What does Ava give him?", choices: ["A bath", "A treat", "A toy"], answer: "A bath" },
    ],
  },
  {
    title: "The Snowy Hill",
    passage:
      "Snow covers the big hill. Max and Zoe ride a sled down fast. They tumble into the soft snow and giggle.",
    questions: [
      { q: "What do Max and Zoe ride?", choices: ["A sled", "A bike", "A boat"], answer: "A sled" },
      { q: "What covers the hill?", choices: ["Snow", "Grass", "Leaves"], answer: "Snow" },
    ],
  },
  {
    title: "The Garden Bug",
    passage:
      "A red ladybug crawls on a leaf. She has tiny black spots on her back. She opens her wings and flies away.",
    questions: [
      { q: "What color is the ladybug?", choices: ["Red", "Blue", "Yellow"], answer: "Red" },
      { q: "What does she do at the end?", choices: ["Flies away", "Falls asleep", "Hides"], answer: "Flies away" },
    ],
  },
  {
    title: "Show and Tell",
    passage:
      "Emma brings her seashell to school. She tells the class where she found it. Everyone claps when she is done.",
    questions: [
      { q: "What does Emma bring?", choices: ["A seashell", "A rock", "A toy"], answer: "A seashell" },
      { q: "What does the class do?", choices: ["Claps", "Sleeps", "Runs"], answer: "Claps" },
    ],
  },
  {
    title: "The Rainbow",
    passage:
      "After the rain, the sun comes out. A bright rainbow stretches across the sky. Sam counts all the colors.",
    questions: [
      { q: "What comes out after the rain?", choices: ["The sun", "The moon", "A star"], answer: "The sun" },
      { q: "What does Sam count?", choices: ["The colors", "The clouds", "The birds"], answer: "The colors" },
    ],
  },
  {
    title: "The Lemonade Stand",
    passage:
      "Grace and Leo make a lemonade stand. They sell cold cups for a dime. Many neighbors stop to buy some.",
    questions: [
      { q: "What do they sell?", choices: ["Lemonade", "Cookies", "Toys"], answer: "Lemonade" },
      { q: "Who stops to buy?", choices: ["Neighbors", "Teachers", "Dogs"], answer: "Neighbors" },
    ],
  },
  {
    title: "The Sleepy Bear",
    passage:
      "When winter comes, the bear gets sleepy. He curls up in his warm cave. He will sleep until spring is here.",
    questions: [
      { q: "Where does the bear sleep?", choices: ["In a cave", "In a tree", "In a nest"], answer: "In a cave" },
      { q: "When will he wake up?", choices: ["In spring", "In summer", "At night"], answer: "In spring" },
    ],
  },
];
