"use client";

import React, { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import Avatar from "@/components/Avatar";
import { userClient } from "@/features/clientIndex";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ProfileAvatarProps {
  name?: string;
  src?: string | null;
  onImageChange?: (file: File) => void;
  className?: string;
}

export function ProfileAvatar({
  name,
  src,
  onImageChange,
  className = "",
}: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleClick = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleSubmit = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await userClient.updateProfileImage(formData);
      toast.success(res.message || "Profile image updated successfully!");

      if (res.data?.user) {
        const newUser = res.data.user;
        const img = (newUser as any).image || newUser.profileImage || null;
        queryClient.setQueryData(["auth", "me"], {
          ...newUser,
          profileImage: img,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      onImageChange?.(file);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSubmit(file);
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative group">
        <Avatar name={name} src={src} size="xl" />

        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          title="Change profile picture"
          className="absolute -bottom-2 -right-2 p-0.5 rounded-full hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Upload profile image"
        >
          {isLoading ? (
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 p-2 rounded-full size-9 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            </div>
          ) : (
            <ImagePlus className="bg-linear-to-r from-purple-600 to-indigo-600 p-1.5 rounded-full size-9 text-white shadow-lg shadow-purple-600/30" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export default ProfileAvatar;
