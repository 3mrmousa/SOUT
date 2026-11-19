"use client";

import React, { useState } from "react";
import ForgotPasswordEmailModal from "./ForgotPasswordEmailModal";
import ForgotPasswordOTPModal from "./ForgotPasswordOTPModal";
import ForgotPasswordNewPasswordModal from "./ForgotPasswordNewPasswordModal";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export type ForgotPasswordStep = "EMAIL" | "OTP" | "NEW_PASSWORD";

export function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<ForgotPasswordStep>("EMAIL");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("EMAIL");
    setEmail("");
    onClose();
  };

  const handleEmailSuccess = (enteredEmail: string) => {
    setEmail(enteredEmail);
    setStep("OTP");
  };

  const handleOtpSuccess = () => {
    setStep("NEW_PASSWORD");
  };

  const handlePasswordSuccess = () => {
    handleClose();
    onSuccess?.();
  };

  return (
    <>
      <ForgotPasswordEmailModal
        isOpen={step === "EMAIL"}
        onClose={handleClose}
        onSuccess={handleEmailSuccess}
      />
      <ForgotPasswordOTPModal
        isOpen={step === "OTP"}
        email={email}
        onClose={handleClose}
        onSuccess={handleOtpSuccess}
      />
      <ForgotPasswordNewPasswordModal
        isOpen={step === "NEW_PASSWORD"}
        email={email}
        onClose={handleClose}
        onSuccess={handlePasswordSuccess}
      />
    </>
  );
}

export default ForgotPasswordModal;

