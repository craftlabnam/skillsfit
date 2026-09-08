// Every sign-in lands on /dashboard for now. InsForge doesn't bump updatedAt on
// login, so a createdAt/updatedAt proximity check misclassifies existing users as
// new. Route new users to /profile for onboarding once Feature 04/06 land
// (profiles table + is_complete), using that field instead of account timestamps.
export function getPostSignInRedirect(): "/dashboard" {
  return "/dashboard";
}
