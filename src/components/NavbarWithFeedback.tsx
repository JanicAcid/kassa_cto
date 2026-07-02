'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { FloatingFeedback } from '@/components/FloatingFeedback'

export function NavbarWithFeedback() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  return (
    <>
      <Navbar onOpenFeedback={() => setFeedbackOpen(true)} />
      <FloatingFeedback open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  )
}
