import cron from "node-cron";
import { createDailyNotifications } from "../services/notification.service";


// Morning – 8 AM
cron.schedule("0 8 * * *", () => {
  createDailyNotifications("morning");
});

// Afternoon – 1 PM
cron.schedule("0 13 * * *", () => {
  createDailyNotifications("afternoon");
});

// Night – 8 PM
cron.schedule("0 20 * * *", () => {
  createDailyNotifications("night");
});
