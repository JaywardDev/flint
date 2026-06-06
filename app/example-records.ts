import type { FlintRecordType } from "@/lib/flint-records";

export type ExampleRecord = {
  type: FlintRecordType;
  title: string;
  summary: string;
  when?: string;
  where?: string;
};

/**
 * Cold-start examples. These are not stored records — they are shown only when
 * the user has none, to teach the record style: short, time-anchored,
 * place-aware, and personal. One per type, marked visibly as examples.
 */
export const EXAMPLE_RECORDS: ExampleRecord[] = [
  {
    type: "person",
    title: "Te Puea Hērangi",
    summary:
      "Māori leader who defied colonial authorities during the 1918 flu pandemic, sheltering her people at Tūrangawaewae when hospitals turned them away. Built the marae almost entirely without government support.",
    when: "1883–1952",
    where: "Ngāruawāhia, NZ",
  },
  {
    type: "event",
    title: "The Fall of Constantinople",
    summary:
      "Ottoman forces under Mehmed II breach the Theodosian Walls after 53 days. The end of the Byzantine Empire, and a moment that reshapes the Mediterranean.",
    when: "1453",
    where: "Constantinople",
  },
  {
    type: "object",
    title: "The Rosetta Stone",
    summary:
      "A decree issued in three scripts. Sat unread for centuries until Champollion used it to crack Egyptian hieroglyphics in 1822.",
    when: "196 BC",
    where: "Memphis, Egypt",
  },
  {
    type: "note",
    title: "Trade routes appear before cultural exchange",
    summary:
      "The Silk Road, the Mediterranean grain routes, the Manila Galleon — commerce seems to always precede ideas, not follow them.",
  },
];
