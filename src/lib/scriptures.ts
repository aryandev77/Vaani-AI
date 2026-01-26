export interface ScriptureChapter {
  id: string;
  title: string;
  content: string;
}

export interface Scripture {
  id: string;
  title: string;
  chapters: ScriptureChapter[];
}

export interface Religion {
  name: string;
  scriptures: Scripture[];
}

export const scriptureLibrary: Record<string, Religion> = {
  hinduism: {
    name: 'Hinduism',
    scriptures: [
      {
        id: 'bhagavad-gita',
        title: 'Bhagavad Gita',
        chapters: [
          {
            id: 'ch1',
            title: 'Chapter 1: Observing the Armies',
            content: `
Dhritarashtra said: O Sanjaya, after my sons and the sons of Pandu assembled in the place of pilgrimage at Kurukshetra, desiring to fight, what did they do?

Sanjaya said: On seeing the army of the Pandavas drawn in military array, King Duryodhana then approached his teacher (Drona) and spoke the following words.

O my teacher, behold the great army of the sons of Pandu, so expertly arrayed by your intelligent disciple, the son of Drupada.
        `.trim(),
          },
          {
            id: 'ch2',
            title: 'Chapter 2: The Yoga of Knowledge',
            content: `
Sanjaya said: Seeing Arjuna full of compassion, his mind depressed, his eyes full of tears, Madhusudana, Krishna, spoke the following words.

The Supreme Personality of Godhead said: My dear Arjuna, how have these impurities come upon you? They are not at all befitting a man who knows the value of life. They lead not to higher planets but to infamy.
        `.trim(),
          },
           {
            id: 'ch3',
            title: 'Chapter 3: The Yoga of Action',
            content: `
Arjuna said: O Janardana, O Kesava, why do you want to engage me in this ghastly warfare, if you think that intelligence is better than fruitive work?

My intelligence is bewildered by Your equivocal instructions. Therefore, please tell me decisively which will be most beneficial for me.
        `.trim(),
          }
        ],
      },
    ],
  },
  christianity: {
    name: 'Christianity',
    scriptures: [
        {
            id: 'gospel-of-john',
            title: 'Gospel of John',
            chapters: [
                {
                    id: 'ch1',
                    title: 'Chapter 1: The Word Became Flesh',
                    content: `
In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning. Through him all things were made; without him nothing was made that has been made. In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it.

There was a man sent from God whose name was John. He came as a witness to testify concerning that light, so that through him all might believe. He himself was not the light; he came only as a witness to the light.

The true light that gives light to everyone was coming into the world. He was in the world, and though the world was made through him, the world did not recognize him. He came to that which was his own, but his own did not receive him. Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God— children born not of natural descent, nor of human decision or a husband’s will, but born of God.

The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.
                    `.trim()
                }
            ]
        }
    ]
  },
  islam: {
    name: 'Islam',
    scriptures: [
        {
            id: 'quran',
            title: 'The Holy Quran',
            chapters: [
                {
                    id: 'surah-al-fatiha',
                    title: 'Surah Al-Fatiha (The Opening)',
                    content: `
In the name of Allah, the Entirely Merciful, the Especially Merciful.

[All] praise is [due] to Allah, Lord of the worlds -
The Entirely Merciful, the Especially Merciful,
Sovereign of the Day of Recompense.
It is You we worship and You we ask for help.
Guide us to the straight path -
The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.
                    `.trim()
                }
            ]
        }
    ]
  },
  buddhism: {
    name: 'Buddhism',
    scriptures: [
        {
            id: 'dhammapada',
            title: 'The Dhammapada',
            chapters: [
                {
                    id: 'ch1',
                    title: 'Chapter 1: The Twin Verses',
                    content: `
Mind precedes all mental states. Mind is their chief; they are all mind-wrought. If with an impure mind a person speaks or acts suffering follows him like the wheel that follows the foot of the ox.

Mind precedes all mental states. Mind is their chief; they are all mind-wrought. If with a pure mind a person speaks or acts happiness follows him like his never-departing shadow.

"He abused me, he struck me, he defeated me, he robbed me." In those who harbor such thoughts hatred is not appeased.

"He abused me, he struck me, he defeated me, he robbed me." In those who do not harbor such thoughts hatred is appeased.
                    `.trim()
                }
            ]
        }
    ]
  }
};
