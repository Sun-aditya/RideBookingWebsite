export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getGreetingByTime() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getCurrentDateLong() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function parsePrice(price) {
  return Number(String(price).replace(/[^\d]/g, "")) || 0;
}
