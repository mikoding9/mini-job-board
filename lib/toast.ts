"use client";

import { addToast } from "@heroui/react";

type ToastOptions = {
  title: string;
  description?: string;
  timeout?: number;
};

const DEFAULT_TIMEOUT = 6000;

export const showSuccessToast = ({
  title,
  description,
  timeout = DEFAULT_TIMEOUT,
}: ToastOptions) => {
  addToast({
    title,
    description,
    color: "success",
    variant: "solid",
    timeout,
    shouldShowTimeoutProgress: true,
  });
};

export const showErrorToast = ({
  title,
  description,
  timeout = DEFAULT_TIMEOUT,
}: ToastOptions) => {
  addToast({
    title,
    description,
    color: "danger",
    variant: "solid",
    timeout,
    shouldShowTimeoutProgress: true,
  });
};

export const showInfoToast = ({
  title,
  description,
  timeout = DEFAULT_TIMEOUT,
}: ToastOptions) => {
  addToast({
    title,
    description,
    color: "primary",
    variant: "flat",
    timeout,
  });
};
