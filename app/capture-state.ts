export type AddRecordState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "saved"; id: string; nonce: number };

export const initialCaptureState: AddRecordState = { status: "idle" };
