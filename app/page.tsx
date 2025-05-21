import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">GCP Billing Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Masuk untuk melihat informasi billing GCP Anda</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
