export interface ScriptureChapter {
  id: string;
  title: string;
  description: string;
  content: string;
}

export interface Scripture {
  id: string;
  title: string;
  chapters: ScriptureChapter[];
}

export const scriptureLibrary: Scripture[] = [
  {
    id: 'bhagavad-gita',
    title: 'Bhagavad Gita',
    chapters: [
      {
        id: 'ch1',
        title: 'Chapter 1: Observing the Armies on the Battlefield of Kurukshetra',
        description: 'Arjuna\'s despair and refusal to fight.',
        content: `
Dhritarashtra said: O Sanjaya, after my sons and the sons of Pandu assembled in the place of pilgrimage at Kurukshetra, desiring to fight, what did they do?

Sanjaya said: On seeing the army of the Pandavas drawn in military array, King Duryodhana then approached his teacher (Drona) and spoke the following words.

O my teacher, behold the great army of the sons of Pandu, so expertly arrayed by your intelligent disciple, the son of Drupada.

Here in this army are many heroic bowmen equal in fighting to Bhima and Arjuna: great fighters like Yuyudhana, Virata and Drupada.

There are also great, heroic, powerful fighters like Dhrishtaketu, Cekitana, Kasiraja, Purujit, Kuntibhoja and Saibya.
        `.trim(),
      },
      {
        id: 'ch2',
        title: 'Chapter 2: The Yoga of Knowledge',
        description: 'Krishna\'s teachings on the nature of the soul.',
        content: `
Sanjaya said: Seeing Arjuna full of compassion, his mind depressed, his eyes full of tears, Madhusudana, Krishna, spoke the following words.

The Supreme Personality of Godhead said: My dear Arjuna, how have these impurities come upon you? They are not at all befitting a man who knows the value of life. They lead not to higher planets but to infamy.

O son of Pritha, do not yield to this degrading impotence. It does not become you. Give up such petty weakness of heart and arise, O chastiser of the enemy.

Arjuna said: O killer of enemies, O killer of Madhu, how can I counterattack with arrows in battle men like Bhishma and Drona, who are worthy of my worship?
        `.trim(),
      },
       {
        id: 'ch3',
        title: 'Chapter 3: The Yoga of Action',
        description: 'The path of karma yoga, or selfless action.',
        content: `
Arjuna said: O Janardana, O Kesava, why do you want to engage me in this ghastly warfare, if you think that intelligence is better than fruitive work?

My intelligence is bewildered by Your equivocal instructions. Therefore, please tell me decisively which will be most beneficial for me.

The Supreme Personality of Godhead said: O sinless Arjuna, I have already explained that there are two classes of men who try to realize the Self. Some are inclined to understand it by empirical, philosophical speculation, and others by devotional service.

Not by merely abstaining from work can one achieve freedom from reaction, nor by renunciation alone can one attain perfection.
        `.trim(),
      }
    ],
  },
];
