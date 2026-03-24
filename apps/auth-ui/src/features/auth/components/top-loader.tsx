export function TopLoader({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-2xl bg-transparent">
      <div className="h-full w-1/3 animate-[loader_1.1s_linear_infinite] bg-sky-600" />
      <style>{"@keyframes loader {0% {transform: translateX(-120%);} 100% {transform: translateX(360%);}}"}</style>
    </div>
  )
}
