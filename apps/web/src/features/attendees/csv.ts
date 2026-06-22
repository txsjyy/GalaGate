import { parse } from "csv-parse/sync";

export type AttendeeCsvRow = {
  fullName: string;
  email: string;
  phone?: string;
  ticketType: string;
  ticketCode?: string;
  lotteryNumber?: number;
  lotteryEligible: boolean;
  notes?: string;
};

type RawCsvRow = Record<string, string | undefined>;

const headerMap: Record<string, keyof AttendeeCsvRow> = {
  name: "fullName",
  fullname: "fullName",
  full_name: "fullName",
  fullName: "fullName",
  email: "email",
  phone: "phone",
  tickettype: "ticketType",
  ticket_type: "ticketType",
  ticketType: "ticketType",
  ticketcode: "ticketCode",
  ticket_code: "ticketCode",
  ticketCode: "ticketCode",
  lotterynumber: "lotteryNumber",
  lottery_number: "lotteryNumber",
  lotteryNumber: "lotteryNumber",
  lotteryeligible: "lotteryEligible",
  lottery_eligible: "lotteryEligible",
  lotteryEligible: "lotteryEligible",
  notes: "notes",
};

function normalizeHeader(header: string) {
  return header.trim().replace(/\s+/g, "_");
}

function getField(row: RawCsvRow, field: keyof AttendeeCsvRow) {
  for (const [header, mappedField] of Object.entries(headerMap)) {
    if (mappedField === field && row[header] != null) {
      return row[header]?.trim();
    }
  }

  return undefined;
}

function parseBoolean(value: string | undefined) {
  if (!value) {
    return true;
  }

  return !["false", "no", "0", "n"].includes(value.toLowerCase());
}

export function parseAttendeeCsv(contents: string): AttendeeCsvRow[] {
  const records = parse(contents, {
    columns: (headers: string[]) => headers.map(normalizeHeader),
    skip_empty_lines: true,
    trim: true,
  }) as RawCsvRow[];

  return records.map((record, index) => {
    const fullName = getField(record, "fullName");
    const email = getField(record, "email")?.toLowerCase();

    if (!fullName || !email) {
      throw new Error(`Row ${index + 2} is missing fullName/name or email.`);
    }

    const lotteryNumberValue = getField(record, "lotteryNumber");
    let lotteryNumber: number | undefined;

    if (lotteryNumberValue) {
      const parsedLotteryNumber = Number(lotteryNumberValue);

      if (!Number.isInteger(parsedLotteryNumber) || parsedLotteryNumber <= 0) {
        throw new Error(`Row ${index + 2} has an invalid lottery number.`);
      }

      lotteryNumber = parsedLotteryNumber;
    }

    return {
      fullName,
      email,
      phone: getField(record, "phone"),
      ticketType: getField(record, "ticketType") || "General",
      ticketCode: getField(record, "ticketCode"),
      lotteryNumber,
      lotteryEligible: parseBoolean(getField(record, "lotteryEligible")),
      notes: getField(record, "notes"),
    };
  });
}

export function toAttendeesCsv(
  attendees: Array<{
    fullName: string;
    email: string | null;
    phone: string | null;
    ticketType: string;
    ticketCode: string | null;
    lotteryNumber: number | null;
    lotteryEligible: boolean;
    notes: string | null;
    source: string;
  }>,
) {
  const headers = [
    "fullName",
    "email",
    "phone",
    "ticketType",
    "ticketCode",
    "lotteryNumber",
    "lotteryEligible",
    "notes",
    "source",
  ];

  const rows = attendees.map((attendee) =>
    headers
      .map((header) => {
        const value = attendee[header as keyof typeof attendee];
        const serialized = value == null ? "" : String(value);
        return `"${serialized.replaceAll('"', '""')}"`;
      })
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}
