import { useState } from "react"
import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ReviewForm({
  onSubmit,
}: {
  onSubmit: (payload: { rating: number; title: string; review: string }) => void
}) {
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [review, setReview] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ rating, title, review })
    setTitle("")
    setReview("")
    setRating(5)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[1.8rem] border border-border/60 bg-card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Rating</Label>
          <Input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Short headline"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Review</Label>
        <Textarea
          value={review}
          onChange={(event) => setReview(event.target.value)}
          rows={4}
          placeholder="Share your buying experience"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="rounded-full px-5">
          Submit Review
        </Button>
      </div>
    </form>
  )
}
