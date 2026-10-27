// In-memory only. Lets a layout confirm before changing session state on logout.
let active: (() => Promise<boolean>) | undefined

export function registerLeaveConfirmation(confirm: () => Promise<boolean>): () => void {
  active = confirm
  return () => {
    if (active === confirm) active = undefined
  }
}

export async function confirmLeavingForm(): Promise<boolean> {
  return active ? active() : true
}
