import { CheckIcon } from "lucide-react"

interface PasswordRequirementsProps {
  password: string
}

const passwordRules = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8
  },
  {
    label: "At least 1 uppercase letter",
    test: (value: string) => /[A-Z]/.test(value)
  },
  {
    label: "At least 1 lowercase letter",
    test: (value: string) => /[a-z]/.test(value)
  },
  {
    label: "At least 1 number",
    test: (value: string) => /\d/.test(value)
  }
]

export function PasswordRequirements({
  password
}: PasswordRequirementsProps) {
  return (
    <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        Password requirements
      </p>
      <div className="grid gap-2">
        {passwordRules.map(rule => {
          const passed = rule.test(password)

          return (
            <div key={rule.label} className="flex items-center gap-2 text-sm">
              <span
                className={`grid size-4 place-items-center rounded-sm border ${
                  passed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 bg-white text-transparent"
                }`}
              >
                <CheckIcon className="size-3" />
              </span>
              <span className={passed ? "text-slate-700" : "text-slate-500"}>
                {rule.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
