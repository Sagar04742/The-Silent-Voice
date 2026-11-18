// Common English words used for fingerspelling suggestions (prefix match, in this order).
const WORDS = `
hello hi help hospital home hungry how here have happy hot house
yes you your yourself young
no not need name nice now night next near
water want where what when who why which with wait wash walk work
thank thanks thirsty thing think time today tomorrow tired train taxi toilet tea
please phone pain police pharmacy price pay people problem place
sorry sleep sick stop slow school shop station sit stay small sugar
food family friend fine feel fever fast far free
doctor doctors drink dinner door drive down
good goodbye give go going gone great
medicine money market morning more my me meet mother meal
father fan fire fruit
bus bank bathroom bag bed bill book bread breakfast buy bye
call car cold come can cannot cost clean close coffee cash card cheap
eat early enough emergency exit expensive evening
love left like lunch late little long look lost
ok open only open our out
ready right rest road room rice repeat
safe say see sit stand start sorry slowly
use up understand until
very visit
yesterday yes
ambulance address allergy again all am an and are at away
bad be because before better big
day deaf dont dizzy do
for from
get glass
he her him his
i if in is it
just
know
may more much must
of on one or other
paper pen pencil
quiet quick
she so some soon
that the their them then there they this to too
up us
was we were will would
`
  .split(/\s+/)
  .filter(Boolean);

export const WORD_LIST = [...new Set(WORDS)];

export function suggest(text, max = 5) {
  const last = text.split(" ").pop().toLowerCase();
  if (!last) return [];
  return WORD_LIST.filter((w) => w.startsWith(last) && w !== last).slice(0, max);
}
