import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDifficultWord {
  word: string;
  meaning: string;
}

export interface IReading extends Document {
  title: string;
  originalText: string;
  originalLanguage: {
    code: string;
    name: string;
    speechCode?: string;
  };
  explanationLanguage: {
    code: string;
    name: string;
    speechCode?: string;
  };
  explanation: string;
  keyPoints: string[];
  difficultWords: IDifficultWord[];
  sourceType: "ocr" | "text";
  modelUsed?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DifficultWordSchema = new Schema<IDifficultWord>(
  {
    word: { type: String, required: true },
    meaning: { type: String, required: true },
  },
  { _id: false }
);

const ReadingSchema = new Schema<IReading>(
  {
    title: { type: String, required: true },
    originalText: { type: String, required: true },
    originalLanguage: {
      code: { type: String, required: true },
      name: { type: String, required: true },
      speechCode: { type: String },
    },
    explanationLanguage: {
      code: { type: String, required: true },
      name: { type: String, required: true },
      speechCode: { type: String },
    },
    explanation: { type: String, required: true },
    keyPoints: { type: [String], default: [] },
    difficultWords: { type: [DifficultWordSchema], default: [] },
    sourceType: { type: String, enum: ["ocr", "text"], default: "text" },
    modelUsed: { type: String, default: "local" },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compiling model in Next.js development HMR
export const Reading: Model<IReading> =
  mongoose.models.Reading || mongoose.model<IReading>("Reading", ReadingSchema);
