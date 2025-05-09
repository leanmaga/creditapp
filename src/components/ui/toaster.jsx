"use client";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg dark:group-[.toaster]:bg-gray-950 dark:group-[.toaster]:text-gray-100 dark:group-[.toaster]:border-gray-800",
          title: "text-base font-semibold",
          description:
            "group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-400 text-sm",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:hover:bg-blue-700 dark:group-[.toast]:bg-blue-600 dark:group-[.toast]:text-white group-[.toast]:rounded-md group-[.toast]:font-medium group-[.toast]:shadow-sm",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:hover:bg-gray-200 dark:group-[.toast]:bg-gray-800 dark:group-[.toast]:text-gray-300 dark:group-[.toast]:hover:bg-gray-700 group-[.toast]:rounded-md group-[.toast]:font-medium",
          closeButton:
            "group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400 group-[.toast]:hover:bg-gray-100 dark:group-[.toast]:hover:bg-gray-800 group-[.toast]:rounded-md",
          info: "group toast group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200 dark:group-[.toaster]:bg-blue-950/50 dark:group-[.toaster]:text-blue-100 dark:group-[.toaster]:border-blue-900/50",
          success:
            "group toast group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200 dark:group-[.toaster]:bg-green-950/50 dark:group-[.toaster]:text-green-100 dark:group-[.toaster]:border-green-900/50",
          warning:
            "group toast group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-900 group-[.toaster]:border-amber-200 dark:group-[.toaster]:bg-amber-950/50 dark:group-[.toaster]:text-amber-100 dark:group-[.toaster]:border-amber-900/50",
          error:
            "group toast group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200 dark:group-[.toaster]:bg-red-950/50 dark:group-[.toaster]:text-red-100 dark:group-[.toaster]:border-red-900/50",
          loader:
            "group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
