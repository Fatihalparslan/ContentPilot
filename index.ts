import dotenv from "dotenv";
dotenv.config();
import { dailyContentBlast } from "./services/scheduler";

const competencies = [
  "Embedded Development (C, C++, Python)",
  "Backend Development (Node.js)"
];

dailyContentBlast(
  ["Embedded Systems development", "Internet of Things"],
  competencies
);
