"use client"

/**
 * Shutdown Modal Component
 * Displays a dialog requiring the user to type 'apagado' to confirm server shutdown
 */

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { AlertTriangle } from "lucide-react"

interface ShutdownModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  isLoading?: boolean
}

export function ShutdownModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: ShutdownModalProps) {
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState("")

  const handleConfirm = () => {
    if (inputValue.toLowerCase() === "apagado") {
      setError("")
      onConfirm()
      setInputValue("")
    } else {
      setError("Debe escribir 'apagado' para confirmar")
    }
  }

  const handleClose = () => {
    setInputValue("")
    setError("")
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">{description}</AlertDialogDescription>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Para confirmar, escriba <strong>apagado</strong> en el campo a continuación:
            </p>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escriba 'apagado' aquí"
              disabled={isLoading}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel disabled={isLoading} onClick={handleClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || inputValue.toLowerCase() !== "apagado"}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Apagando..." : "Confirmar Apagado"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}