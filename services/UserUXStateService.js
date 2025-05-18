export function getRedirectPath(user) {
  if (!user) return "/sign-up";
  if (!user.commitLevel) return "/user-initial-mindset";
  if (!user.raceGoal) return "/determine-your-goal";
  return "/training-pulse-hub";
}
