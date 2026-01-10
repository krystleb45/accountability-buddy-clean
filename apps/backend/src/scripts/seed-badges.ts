import mongoose from "mongoose"
import { config } from "dotenv"

config()

const MONGODB_URI = process.env.MONGODB_URI || ""

const badgeTypes = [
  // Goal Completion Badges
  {
    name: "Goal Achiever",
    description: "Complete goals to earn this badge",
    conditionToMeet: "goal_completed",
    bronzeAmountRequired: 1,
    silverAmountRequired: 5,
    goldAmountRequired: 10,
    bronzePointsToAward: 10,
    silverPointsToAward: 25,
    goldPointsToAward: 50,
  },
  {
    name: "Goal Master",
    description: "Complete many goals to prove your dedication",
    conditionToMeet: "goal_completed",
    bronzeAmountRequired: 10,
    silverAmountRequired: 25,
    goldAmountRequired: 50,
    bronzePointsToAward: 25,
    silverPointsToAward: 50,
    goldPointsToAward: 100,
  },
  // Consistency Badges
  {
    name: "Consistency Master",
    description: "Maintain your login streak",
    conditionToMeet: "consistency_master",
    bronzeAmountRequired: 3,
    silverAmountRequired: 7,
    goldAmountRequired: 30,
    bronzePointsToAward: 15,
    silverPointsToAward: 35,
    goldPointsToAward: 75,
  },
  {
    name: "Dedicated User",
    description: "Show up every day",
    conditionToMeet: "consistency_master",
    bronzeAmountRequired: 7,
    silverAmountRequired: 14,
    goldAmountRequired: 60,
    bronzePointsToAward: 20,
    silverPointsToAward: 50,
    goldPointsToAward: 100,
  },
  // Point Earner Badges
  {
    name: "Point Collector",
    description: "Earn XP through activities",
    conditionToMeet: "point_earner",
    bronzeAmountRequired: 50,
    silverAmountRequired: 200,
    goldAmountRequired: 500,
    bronzePointsToAward: 10,
    silverPointsToAward: 25,
    goldPointsToAward: 50,
  },
  {
    name: "XP Champion",
    description: "Accumulate massive XP",
    conditionToMeet: "point_earner",
    bronzeAmountRequired: 500,
    silverAmountRequired: 1000,
    goldAmountRequired: 5000,
    bronzePointsToAward: 25,
    silverPointsToAward: 50,
    goldPointsToAward: 150,
  },
]

async function seedBadges() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    const BadgeType = mongoose.model(
      "BadgeType",
      new mongoose.Schema({
        name: { type: String, required: true, unique: true },
        description: { type: String, default: "" },
        conditionToMeet: { type: String, required: true },
        bronzeAmountRequired: { type: Number, default: 1 },
        silverAmountRequired: { type: Number, default: 5 },
        goldAmountRequired: { type: Number, default: 10 },
        bronzePointsToAward: { type: Number, default: 0 },
        silverPointsToAward: { type: Number, default: 0 },
        goldPointsToAward: { type: Number, default: 0 },
        iconKey: { type: String },
      })
    )

    for (const badge of badgeTypes) {
      await BadgeType.findOneAndUpdate(
        { name: badge.name },
        badge,
        { upsert: true, new: true }
      )
      console.log(`✅ Seeded: ${badge.name}`)
    }

    console.log("\n🎉 Badge seeding complete!")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding badges:", error)
    process.exit(1)
  }
}

seedBadges()