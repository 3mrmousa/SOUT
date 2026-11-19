"use client";

import React, { useState } from "react";
import { SafeUser } from "@/features/clientIndex";
import ChangeEmailForm from "./ChangeEmailForm";
import { ChangeEmailVerifyCurrent } from "./ChangeEmailVerifyCurrent";
import { ChangeEmailVerifyNew } from "./ChangeEmailVerifyNew";

interface ChangeEmailProps {
  user?: SafeUser | null;
  onClose?: () => void;
}

export const ChangeEmail = ({ user, onClose }: ChangeEmailProps) => {
  const [step, setStep] = useState<
    "change-email" | "verify-current" | "verify-new"
  >("change-email");

  const renderStep = () => {
    switch (step) {
      case "change-email":
        return (
          <ChangeEmailForm
            user={user}
            onClose={onClose}
            onSuccess={() => setStep("verify-current")}
          />
        );
      case "verify-current":
        return (
          <ChangeEmailVerifyCurrent
            user={user}
            onClose={onClose}
            onSuccess={() => setStep("verify-new")}
          />
        );
      case "verify-new":
        return <ChangeEmailVerifyNew user={user} onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      {renderStep()}
    </div>
  );
};

export default ChangeEmail;
