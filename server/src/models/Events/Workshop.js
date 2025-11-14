import mongoose from 'mongoose';
import { Event } from './Event.js';

const workshopSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  location: {
    type: String,
    enum: ['GUC Cairo', 'GUC Berlin'],
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  requiredBudget: { type: Number, required: true },
  fundraisingSource: { type: String, enum: ['GUC', 'External'], required: true },
  fullAgenda: { type: String, required: true },
  responsibleFaculty: {
    type: String,
    enum: [
      'MET',
      'IET',
      'EMS',
      'Pharma',
      'Business Informatics',
      'Management',
      'Applied Arts',
      'Architecture',
    ],
  },
  professorsParticipating: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Free-text names entered by the creating professor
  professorNames: [{ type: String }],
  extraRequiredResource: { type: String },
  capacity: {type: Number,required: true},
  createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
  editRequest: {type: String,default: null},
  certificatesSent: { type: Boolean, default: false },



}, 
{timestamps: true}
);

export const Workshop = Event.discriminator('workshop', workshopSchema);
