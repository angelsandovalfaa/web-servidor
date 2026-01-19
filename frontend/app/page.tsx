/**
 * Login Page
 * Entry point of the application
 * Displays the login form for user authentication
 */

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-background p-4">
      <LoginForm />
    </main>
  )
}
