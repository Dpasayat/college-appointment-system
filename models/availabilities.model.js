import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    endtime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//auto calculate the endtime
availabilitySchema.pre("save", function (next) {
  if (this.startTime && this.duration) {
    const [hours, minutes] = this.startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + this.duration;

    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;

    this.endtime = `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  }
  next();
});

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
