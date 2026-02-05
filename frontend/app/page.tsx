/**
 * Login Page
 * Entry point of the application
 * Displays the login form for user authentication
 */

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <LoginForm />
    </main>
  )
}
